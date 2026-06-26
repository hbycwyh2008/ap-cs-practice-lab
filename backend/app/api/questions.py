from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.auth import get_current_user, require_teacher
from app.database import get_session
from app.models import Assignment, AssignmentQuestion, Question, User, UserRole
from app.schemas import QuestionCreate, QuestionRead, QuestionUpdate

router = APIRouter(prefix="/questions", tags=["questions"])


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
def delete_question(
    question_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_teacher),
):
    question = session.get(Question, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    if question.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    session.delete(question)
    session.commit()
    return {"ok": True}
