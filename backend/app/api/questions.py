from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.auth import get_current_user, require_teacher
from app.database import get_session
from app.models import Question, TestCase, User, UserRole
from app.schemas import QuestionCreate, QuestionRead, QuestionUpdate

router = APIRouter(prefix="/questions", tags=["questions"])


@router.get("", response_model=list[QuestionRead])
def list_questions(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == UserRole.TEACHER:
        stmt = select(Question).where(Question.created_by == current_user.id)
    else:
        stmt = select(Question)
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
