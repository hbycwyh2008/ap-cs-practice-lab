from fastapi import APIRouter, Depends, HTTPException
import random
from sqlmodel import Session, select

from app.auth import get_current_user, require_teacher
from app.database import get_session
from app.models import (
    Assignment,
    AssignmentQuestion,
    Question,
    QuestionType,
    SchoolClass,
    Submission,
    User,
    UserRole,
)
from app.schemas import (
    AssignmentCreate,
    AssignmentDetail,
    AssignmentGenerateRequest,
    AssignmentQuestionInput,
    AssignmentQuestionRead,
    AssignmentRead,
    AssignmentUpdate,
    QuestionRead,
)

router = APIRouter(prefix="/assignments", tags=["assignments"])


def _validate_teacher_questions(
    session: Session,
    current_user: User,
    question_inputs: list[AssignmentQuestionInput],
) -> None:
    for q_input in question_inputs:
        question = session.get(Question, q_input.question_id)
        if not question:
            raise HTTPException(
                status_code=404,
                detail=f"Question {q_input.question_id} not found",
            )
        if question.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        if not question.is_active:
            raise HTTPException(status_code=400, detail="Question is inactive")


def _question_read_for_user(question: Question, current_user: User) -> QuestionRead:
    question_read = QuestionRead.model_validate(question)
    if current_user.role == UserRole.STUDENT:
        # Never expose teacher reference solutions in student-facing payloads.
        return question_read.model_copy(update={"reference_solution": None})
    return question_read


def _build_assignment_detail(
    session: Session, assignment: Assignment, current_user: User
) -> AssignmentDetail:
    aqs = session.exec(
        select(AssignmentQuestion)
        .where(AssignmentQuestion.assignment_id == assignment.id)
        .order_by(AssignmentQuestion.order)
    ).all()

    questions = []
    for aq in aqs:
        q = session.get(Question, aq.question_id)
        questions.append(
            AssignmentQuestionRead(
                id=aq.id,
                assignment_id=aq.assignment_id,
                question_id=aq.question_id,
                order=aq.order,
                points=aq.points,
                question=_question_read_for_user(q, current_user) if q else None,
            )
        )

    return AssignmentDetail(
        id=assignment.id,
        title=assignment.title,
        description=assignment.description,
        class_id=assignment.class_id,
        created_by=assignment.created_by,
        due_at=assignment.due_at,
        created_at=assignment.created_at,
        questions=questions,
    )


@router.get("", response_model=list[AssignmentRead])
def list_assignments(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == UserRole.TEACHER:
        stmt = select(Assignment).where(Assignment.created_by == current_user.id)
    else:
        if not current_user.class_id:
            return []
        stmt = select(Assignment).where(Assignment.class_id == current_user.class_id)
    assignments = session.exec(stmt.order_by(Assignment.created_at.desc())).all()
    if not assignments:
        return []

    assignment_ids = [assignment.id for assignment in assignments if assignment.id is not None]
    counts: dict[int, int] = {assignment_id: 0 for assignment_id in assignment_ids}
    if assignment_ids:
        links = session.exec(
            select(AssignmentQuestion).where(
                AssignmentQuestion.assignment_id.in_(assignment_ids)
            )
        ).all()
        for link in links:
            counts[link.assignment_id] = counts.get(link.assignment_id, 0) + 1

    return [
        AssignmentRead(
            id=assignment.id,
            title=assignment.title,
            description=assignment.description,
            class_id=assignment.class_id,
            created_by=assignment.created_by,
            due_at=assignment.due_at,
            created_at=assignment.created_at,
            question_count=counts.get(assignment.id, 0) if assignment.id else 0,
        )
        for assignment in assignments
    ]


@router.post("", response_model=AssignmentDetail)
def create_assignment(
    data: AssignmentCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_teacher),
):
    school_class = session.get(SchoolClass, data.class_id)
    if not school_class:
        raise HTTPException(status_code=404, detail="Class not found")
    if school_class.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    _validate_teacher_questions(session, current_user, data.questions)

    assignment = Assignment(
        title=data.title,
        description=data.description,
        class_id=data.class_id,
        created_by=current_user.id,
        due_at=data.due_at,
    )
    session.add(assignment)
    session.commit()
    session.refresh(assignment)

    for q in data.questions:
        aq = AssignmentQuestion(
            assignment_id=assignment.id,
            question_id=q.question_id,
            order=q.order,
            points=q.points,
        )
        session.add(aq)
    session.commit()

    return _build_assignment_detail(session, assignment, current_user)


@router.post("/generate", response_model=AssignmentDetail)
def generate_assignment(
    data: AssignmentGenerateRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_teacher),
):
    school_class = session.get(SchoolClass, data.class_id)
    if not school_class:
        raise HTTPException(status_code=404, detail="Class not found")
    if school_class.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    stmt = select(Question).where(
        Question.created_by == current_user.id,
        Question.is_active == True,
        Question.course == data.course,
    )
    if data.question_types:
        stmt = stmt.where(Question.type.in_(data.question_types))
    else:
        stmt = stmt.where(Question.type == QuestionType.FRQ_CODE)
    if data.units:
        stmt = stmt.where(Question.unit.in_(data.units))
    if data.topics:
        stmt = stmt.where(Question.topic.in_(data.topics))
    if data.question_types:
        stmt = stmt.where(Question.type.in_(data.question_types))
    if data.difficulties:
        stmt = stmt.where(Question.difficulty.in_(data.difficulties))
    if data.skills:
        stmt = stmt.where(Question.skill.in_(data.skills))

    candidates = list(session.exec(stmt).all())

    if not data.include_recent_questions:
        teacher_assignments = session.exec(
            select(Assignment).where(Assignment.created_by == current_user.id)
        ).all()
        assignment_ids = [a.id for a in teacher_assignments]
        if assignment_ids:
            used_rows = session.exec(
                select(AssignmentQuestion).where(
                    AssignmentQuestion.assignment_id.in_(assignment_ids)
                )
            ).all()
            used_ids = {row.question_id for row in used_rows}
            candidates = [q for q in candidates if q.id not in used_ids]

    random.shuffle(candidates)
    selected = candidates[: data.question_count]
    selected_count = len(selected)

    description = data.description
    note = (
        f"[Auto-generated: selected {selected_count} of "
        f"{data.question_count} requested question(s).]"
    )
    description = f"{description}\n\n{note}".strip() if description else note

    assignment = Assignment(
        title=data.title,
        description=description,
        class_id=data.class_id,
        created_by=current_user.id,
        due_at=data.due_at,
    )
    session.add(assignment)
    session.commit()
    session.refresh(assignment)

    for i, q in enumerate(selected):
        points = q.max_points if q.max_points > 0 else 10
        aq = AssignmentQuestion(
            assignment_id=assignment.id,
            question_id=q.id,
            order=i + 1,
            points=points,
        )
        session.add(aq)
    session.commit()

    return _build_assignment_detail(session, assignment, current_user)


@router.get("/{assignment_id}", response_model=AssignmentDetail)
def get_assignment(
    assignment_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    assignment = session.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    if current_user.role == UserRole.TEACHER:
        if assignment.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.class_id != assignment.class_id:
        raise HTTPException(status_code=403, detail="Access denied")

    return _build_assignment_detail(session, assignment, current_user)


@router.put("/{assignment_id}", response_model=AssignmentDetail)
def update_assignment(
    assignment_id: int,
    data: AssignmentUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_teacher),
):
    assignment = session.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if assignment.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    for key, value in data.model_dump(exclude_unset=True, exclude={"questions"}).items():
        setattr(assignment, key, value)
    session.add(assignment)

    if data.questions is not None:
        _validate_teacher_questions(session, current_user, data.questions)

        existing = session.exec(
            select(AssignmentQuestion).where(
                AssignmentQuestion.assignment_id == assignment_id
            )
        ).all()
        for aq in existing:
            session.delete(aq)
        session.commit()

        for q in data.questions:
            aq = AssignmentQuestion(
                assignment_id=assignment_id,
                question_id=q.question_id,
                order=q.order,
                points=q.points,
            )
            session.add(aq)

    session.commit()
    session.refresh(assignment)
    return _build_assignment_detail(session, assignment, current_user)


@router.delete("/{assignment_id}")
def delete_assignment(
    assignment_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_teacher),
):
    assignment = session.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if assignment.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    submissions = session.exec(
        select(Submission).where(Submission.assignment_id == assignment_id)
    ).all()
    for submission in submissions:
        session.delete(submission)

    assignment_questions = session.exec(
        select(AssignmentQuestion).where(AssignmentQuestion.assignment_id == assignment_id)
    ).all()
    for aq in assignment_questions:
        session.delete(aq)

    session.delete(assignment)
    session.commit()
    return {"ok": True}
