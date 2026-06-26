from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.auth import get_current_user, require_teacher
from app.database import get_session
from app.models import (
    Assignment,
    AssignmentQuestion,
    Question,
    TestCase,
    User,
    UserRole,
)
from app.schemas import TestCaseCreate, TestCaseRead, TestCaseStudentRead, TestCaseUpdate

router = APIRouter(tags=["test-cases"])


def _student_can_access_question(
    session: Session, user: User, question_id: int
) -> bool:
    if not user.class_id:
        return False
    assignment_ids = [
        a.id
        for a in session.exec(
            select(Assignment).where(Assignment.class_id == user.class_id)
        ).all()
    ]
    if not assignment_ids:
        return False
    link = session.exec(
        select(AssignmentQuestion).where(
            AssignmentQuestion.assignment_id.in_(assignment_ids),
            AssignmentQuestion.question_id == question_id,
        )
    ).first()
    return link is not None


@router.get("/questions/{question_id}/test-cases")
def list_test_cases(
    question_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    question = session.get(Question, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    if current_user.role == UserRole.TEACHER:
        if question.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        cases = session.exec(
            select(TestCase).where(TestCase.question_id == question_id)
        ).all()
        return [TestCaseRead.model_validate(tc) for tc in cases]

    # Student: only public tests of questions in their own assignments.
    if not _student_can_access_question(session, current_user, question_id):
        raise HTTPException(
            status_code=403, detail="Question not in your assignments"
        )
    cases = session.exec(
        select(TestCase).where(
            TestCase.question_id == question_id,
            TestCase.is_hidden == False,
        )
    ).all()
    return [TestCaseStudentRead.model_validate(tc) for tc in cases]


@router.post("/questions/{question_id}/test-cases", response_model=TestCaseRead)
def create_test_case(
    question_id: int,
    data: TestCaseCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_teacher),
):
    question = session.get(Question, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    if question.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    tc = TestCase(question_id=question_id, **data.model_dump())
    session.add(tc)
    session.commit()
    session.refresh(tc)

    # Update question max_points
    all_cases = session.exec(
        select(TestCase).where(TestCase.question_id == question_id)
    ).all()
    question.max_points = sum(c.points for c in all_cases)
    session.add(question)
    session.commit()

    return tc


@router.put("/test-cases/{test_case_id}", response_model=TestCaseRead)
def update_test_case(
    test_case_id: int,
    data: TestCaseUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_teacher),
):
    tc = session.get(TestCase, test_case_id)
    if not tc:
        raise HTTPException(status_code=404, detail="Test case not found")

    question = session.get(Question, tc.question_id)
    if question and question.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(tc, key, value)
    session.add(tc)
    session.commit()
    session.refresh(tc)
    return tc


@router.delete("/test-cases/{test_case_id}")
def delete_test_case(
    test_case_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_teacher),
):
    tc = session.get(TestCase, test_case_id)
    if not tc:
        raise HTTPException(status_code=404, detail="Test case not found")
    question_id = tc.question_id
    session.delete(tc)
    session.commit()

    question = session.get(Question, question_id)
    if question:
        all_cases = session.exec(
            select(TestCase).where(TestCase.question_id == question_id)
        ).all()
        question.max_points = sum(c.points for c in all_cases)
        session.add(question)
        session.commit()

    return {"ok": True}
