from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.auth import get_current_user, require_teacher
from app.database import get_session
from app.models import (
    Assignment,
    AssignmentQuestion,
    Question,
    SchoolClass,
    User,
    UserRole,
)
from app.schemas import (
    AssignmentCreate,
    AssignmentDetail,
    AssignmentQuestionRead,
    AssignmentRead,
    AssignmentUpdate,
    QuestionRead,
)

router = APIRouter(prefix="/assignments", tags=["assignments"])


def _build_assignment_detail(session: Session, assignment: Assignment) -> AssignmentDetail:
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
                question=QuestionRead.model_validate(q) if q else None,
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
    return session.exec(stmt.order_by(Assignment.created_at.desc())).all()


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

    return _build_assignment_detail(session, assignment)


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

    return _build_assignment_detail(session, assignment)


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
    return _build_assignment_detail(session, assignment)


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
    session.delete(assignment)
    session.commit()
    return {"ok": True}
