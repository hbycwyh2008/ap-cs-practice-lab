from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.auth import get_current_user, require_teacher
from app.database import get_session
from app.models import (
    Assignment,
    AssignmentQuestion,
    Course,
    Difficulty,
    Question,
    TestCase,
    User,
    UserRole,
)
from app.schemas import (
    ImportedQuestion,
    QuestionCreate,
    QuestionImportResponse,
    QuestionRead,
    QuestionUpdate,
)

router = APIRouter(prefix="/questions", tags=["questions"])


def _normalize_course(value: str) -> Course:
    normalized = value.strip().upper().replace(" ", "_")
    if normalized in {"AP_CSA", "APCSA"}:
        return Course.AP_CSA
    raise ValueError("course must be AP_CSA or AP CSA")


def _normalize_difficulty(value: str) -> Difficulty:
    normalized = value.strip().lower()
    try:
        return Difficulty(normalized)
    except ValueError as exc:
        allowed = ", ".join(d.value for d in Difficulty)
        raise ValueError(f"difficulty must be one of: {allowed}") from exc


def _prompt_with_signature(description: str, method_signature: str) -> str:
    return (
        f"{description.strip()}\n\n"
        f"Required method signature:\n{method_signature.strip()}"
    )


def _validate_import_batch(data: list[ImportedQuestion]) -> list[dict]:
    if not data:
        raise HTTPException(
            status_code=400,
            detail=["Import requires at least one question"],
        )

    errors: list[str] = []
    normalized: list[dict] = []
    for index, item in enumerate(data):
        label = f"question {index + 1}"
        try:
            course = _normalize_course(item.course)
        except ValueError as exc:
            errors.append(f"{label}: {exc}")
            course = Course.AP_CSA

        try:
            difficulty = _normalize_difficulty(item.difficulty)
        except ValueError as exc:
            errors.append(f"{label}: {exc}")
            difficulty = Difficulty.EASY

        topic = (item.topic or item.skill or item.unit).strip()
        max_points = sum(test_case.points for test_case in item.test_cases)
        normalized.append(
            {
                "question": item,
                "course": course,
                "difficulty": difficulty,
                "topic": topic,
                "max_points": max_points,
            }
        )

    if errors:
        raise HTTPException(status_code=400, detail=errors)

    return normalized


def _student_assigned_question_ids(session: Session, user: User) -> set[int]:
    if not user.class_id:
        return set()
    assignments = session.exec(
        select(Assignment).where(Assignment.class_id == user.class_id)
    ).all()
    if not assignments:
        return set()
    assignment_ids = [a.id for a in assignments]
    rows = session.exec(
        select(AssignmentQuestion).where(
            AssignmentQuestion.assignment_id.in_(assignment_ids)
        )
    ).all()
    return {row.question_id for row in rows}


def _ensure_student_can_access_question(
    session: Session, user: User, question_id: int
) -> None:
    allowed = _student_assigned_question_ids(session, user)
    if question_id not in allowed:
        raise HTTPException(status_code=403, detail="Question not in your assignments")


@router.get("", response_model=list[QuestionRead])
def list_questions(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == UserRole.TEACHER:
        stmt = select(Question).where(Question.created_by == current_user.id)
        return session.exec(stmt.order_by(Question.created_at.desc())).all()

    allowed_ids = _student_assigned_question_ids(session, current_user)
    if not allowed_ids:
        return []
    stmt = select(Question).where(Question.id.in_(allowed_ids))
    return session.exec(stmt.order_by(Question.created_at.desc())).all()


@router.post("", response_model=QuestionRead)
def create_question(
    data: QuestionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_teacher),
):
    question = Question(**data.model_dump(), created_by=current_user.id)
    session.add(question)
    session.commit()
    session.refresh(question)
    return question


@router.post("/import", response_model=QuestionImportResponse)
def import_questions(
    data: list[ImportedQuestion],
    session: Session = Depends(get_session),
    current_user: User = Depends(require_teacher),
):
    normalized_questions = _validate_import_batch(data)
    created_questions: list[Question] = []

    try:
        for normalized in normalized_questions:
            item: ImportedQuestion = normalized["question"]
            question = Question(
                title=item.title.strip(),
                course=normalized["course"],
                unit=item.unit.strip(),
                topic=normalized["topic"],
                difficulty=normalized["difficulty"],
                prompt=_prompt_with_signature(
                    item.description,
                    item.method_signature,
                ),
                starter_code=item.starter_code,
                reference_solution=item.reference_solution,
                max_points=normalized["max_points"],
                skill=item.skill,
                estimated_minutes=item.estimated_minutes,
                source=item.source,
                created_by=current_user.id,
            )
            session.add(question)
            session.flush()

            for imported_case in item.test_cases:
                test_case = TestCase(
                    question_id=question.id,
                    name=imported_case.name.strip(),
                    input_json=imported_case.input_json,
                    expected_output=imported_case.expected_output,
                    is_hidden=imported_case.hidden,
                    points=imported_case.points,
                )
                session.add(test_case)

            created_questions.append(question)

        session.commit()
    except Exception:
        session.rollback()
        raise

    question_ids: list[int] = []
    for question in created_questions:
        session.refresh(question)
        if question.id is not None:
            question_ids.append(question.id)

    return QuestionImportResponse(
        imported_count=len(question_ids),
        question_ids=question_ids,
    )


@router.get("/{question_id}", response_model=QuestionRead)
def get_question(
    question_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    question = session.get(Question, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    if current_user.role == UserRole.STUDENT:
        _ensure_student_can_access_question(session, current_user, question_id)
    return question


@router.put("/{question_id}", response_model=QuestionRead)
def update_question(
    question_id: int,
    data: QuestionUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_teacher),
):
    question = session.get(Question, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    if question.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(question, key, value)
    session.add(question)
    session.commit()
    session.refresh(question)
    return question


@router.delete("/{question_id}")
def archive_question(
    question_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_teacher),
):
    question = session.get(Question, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    if question.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    question.is_active = False
    session.add(question)
    session.commit()
    return {"ok": True, "archived": True, "question_id": question_id}


@router.post("/{question_id}/restore")
def restore_question(
    question_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_teacher),
):
    question = session.get(Question, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    if question.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    question.is_active = True
    session.add(question)
    session.commit()
    return {"ok": True, "restored": True, "question_id": question_id}
