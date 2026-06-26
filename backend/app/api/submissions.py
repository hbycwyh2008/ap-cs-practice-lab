import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.auth import get_current_user, require_teacher
from app.database import get_session
from app.models import (
    Assignment,
    AssignmentQuestion,
    MultipleChoiceChoice,
    Question,
    QuestionType,
    Submission,
    SubmissionStatus,
    TestCase,
    User,
    UserRole,
)
from app.schemas import (
    FeedbackJson,
    RunResult,
    SubmissionDetail,
    SubmissionRead,
    SubmissionRunRequest,
    SubmissionSubmitRequest,
    TestResultItem,
)
from app.services.java_runner import determine_status, run_tests

router = APIRouter(prefix="/submissions", tags=["submissions"])


def _ensure_question_in_assignment(
    session: Session, assignment_id: int, question_id: int
) -> None:
    link = session.exec(
        select(AssignmentQuestion).where(
            AssignmentQuestion.assignment_id == assignment_id,
            AssignmentQuestion.question_id == question_id,
        )
    ).first()
    if not link:
        raise HTTPException(
            status_code=403, detail="Question is not part of this assignment"
        )


def _sanitize_feedback_for_student(feedback: FeedbackJson) -> FeedbackJson:
    tests = []
    for t in feedback.tests:
        if t.hidden:
            tests.append(
                t.model_copy(
                    update={
                        "expected_output": None,
                        "message": "Passed" if t.passed else "Hidden test failed",
                    }
                )
            )
        else:
            tests.append(t)
    return feedback.model_copy(update={"tests": tests})


def _submission_to_detail(
    session: Session,
    sub: Submission,
    show_hidden_details: bool = False,
) -> SubmissionDetail:
    student = session.get(User, sub.student_id)
    question = session.get(Question, sub.question_id)
    feedback = None
    try:
        raw = json.loads(sub.feedback_json)
        feedback = FeedbackJson(**raw)
        if not show_hidden_details:
            feedback = _sanitize_feedback_for_student(feedback)
    except (json.JSONDecodeError, ValueError):
        pass

    return SubmissionDetail(
        id=sub.id,
        student_id=sub.student_id,
        assignment_id=sub.assignment_id,
        question_id=sub.question_id,
        code=sub.code,
        status=sub.status,
        score=sub.score,
        max_score=sub.max_score,
        feedback_json=sub.feedback_json,
        compile_output=sub.compile_output,
        runtime_output=sub.runtime_output,
        is_final=sub.is_final,
        created_at=sub.created_at,
        student_name=student.name if student else None,
        question_title=question.title if question else None,
        feedback=feedback,
    )


def _grade_multiple_choice(
    session: Session,
    question: Question,
    selected_label: str,
) -> FeedbackJson:
    choices = session.exec(
        select(MultipleChoiceChoice).where(
            MultipleChoiceChoice.question_id == question.id
        )
    ).all()
    if not choices:
        raise HTTPException(
            status_code=400,
            detail="Multiple-choice question has no choices",
        )

    normalized_label = selected_label.strip().upper()
    valid_labels = {choice.label.strip().upper() for choice in choices}
    if normalized_label not in valid_labels:
        raise HTTPException(
            status_code=400,
            detail="Selected answer must match one of the choices",
        )

    correct = next((choice for choice in choices if choice.is_correct), None)
    if not correct:
        raise HTTPException(
            status_code=400,
            detail="Multiple-choice question has no correct answer configured",
        )

    max_score = question.max_points or 1
    is_correct = normalized_label == correct.label.strip().upper()
    score = max_score if is_correct else 0
    message = "Correct" if is_correct else "Submitted"

    return FeedbackJson(
        compiled=True,
        total_tests=1,
        passed_tests=1 if is_correct else 0,
        score=score,
        max_score=max_score,
        tests=[
            TestResultItem(
                name="Selected answer",
                hidden=False,
                passed=is_correct,
                points=score,
                message=message,
                expected_output=None,
            )
        ],
    )


@router.post("/run", response_model=RunResult)
def run_submission(
    data: SubmissionRunRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    question = session.get(Question, data.question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    assignment = session.get(Assignment, data.assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    if current_user.role == UserRole.STUDENT:
        if current_user.class_id != assignment.class_id:
            raise HTTPException(status_code=403, detail="Access denied")

    _ensure_question_in_assignment(session, data.assignment_id, data.question_id)

    if question.type == QuestionType.MULTIPLE_CHOICE:
        raise HTTPException(
            status_code=400,
            detail="Multiple-choice questions can be submitted directly.",
        )

    # Always load ALL test cases so max_score reflects the full question.
    # run_tests only executes public tests when include_hidden=False.
    test_cases = session.exec(
        select(TestCase).where(TestCase.question_id == data.question_id)
    ).all()

    is_teacher = current_user.role == UserRole.TEACHER
    feedback, compile_output, runtime_output = run_tests(
        data.code,
        test_cases,
        include_hidden=not data.public_only,
        show_expected_for_teacher=is_teacher,
    )

    status = determine_status(feedback)

    # Save as draft run (not final)
    submission = Submission(
        student_id=current_user.id,
        assignment_id=data.assignment_id,
        question_id=data.question_id,
        code=data.code,
        status=SubmissionStatus(status),
        score=feedback.score,
        max_score=feedback.max_score,
        feedback_json=feedback.model_dump_json(),
        compile_output=compile_output,
        runtime_output=runtime_output,
        is_final=False,
    )
    session.add(submission)
    session.commit()

    display_feedback = feedback if is_teacher else _sanitize_feedback_for_student(feedback)

    return RunResult(
        status=SubmissionStatus(status),
        score=feedback.score,
        max_score=feedback.max_score,
        feedback=display_feedback,
        compile_output=compile_output,
        runtime_output=runtime_output,
    )


@router.post("/submit", response_model=SubmissionDetail)
def submit_final(
    data: SubmissionSubmitRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    question = session.get(Question, data.question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    assignment = session.get(Assignment, data.assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    if current_user.role == UserRole.STUDENT:
        if current_user.class_id != assignment.class_id:
            raise HTTPException(status_code=403, detail="Access denied")

    _ensure_question_in_assignment(session, data.assignment_id, data.question_id)

    if question.type == QuestionType.MULTIPLE_CHOICE:
        feedback = _grade_multiple_choice(session, question, data.code)
        status = (
            SubmissionStatus.PASSED
            if feedback.score == feedback.max_score
            else SubmissionStatus.FAILED
        )
        submission = Submission(
            student_id=current_user.id,
            assignment_id=data.assignment_id,
            question_id=data.question_id,
            code=data.code.strip().upper(),
            status=status,
            score=feedback.score,
            max_score=feedback.max_score,
            feedback_json=feedback.model_dump_json(),
            compile_output="",
            runtime_output="",
            is_final=True,
        )
        session.add(submission)
        session.commit()
        session.refresh(submission)
        return _submission_to_detail(
            session,
            submission,
            show_hidden_details=current_user.role == UserRole.TEACHER,
        )

    test_cases = session.exec(
        select(TestCase).where(TestCase.question_id == data.question_id)
    ).all()

    is_teacher = current_user.role == UserRole.TEACHER
    feedback, compile_output, runtime_output = run_tests(
        data.code,
        test_cases,
        include_hidden=True,
        show_expected_for_teacher=is_teacher,
    )

    status = determine_status(feedback)

    submission = Submission(
        student_id=current_user.id,
        assignment_id=data.assignment_id,
        question_id=data.question_id,
        code=data.code,
        status=SubmissionStatus(status),
        score=feedback.score,
        max_score=feedback.max_score,
        feedback_json=feedback.model_dump_json(),
        compile_output=compile_output,
        runtime_output=runtime_output,
        is_final=True,
    )
    session.add(submission)
    session.commit()
    session.refresh(submission)

    return _submission_to_detail(session, submission, show_hidden_details=is_teacher)


@router.get("", response_model=list[SubmissionDetail])
def list_submissions(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    class_id: Optional[int] = Query(None),
    assignment_id: Optional[int] = Query(None),
    student_id: Optional[int] = Query(None),
    question_id: Optional[int] = Query(None),
    final_only: bool = Query(False),
):
    stmt = select(Submission)

    if current_user.role == UserRole.STUDENT:
        stmt = stmt.where(Submission.student_id == current_user.id)
    elif current_user.role == UserRole.TEACHER:
        # Teachers see submissions for their classes
        teacher_assignments = session.exec(
            select(Assignment).where(Assignment.created_by == current_user.id)
        ).all()
        assignment_ids = [a.id for a in teacher_assignments]
        if assignment_ids:
            stmt = stmt.where(Submission.assignment_id.in_(assignment_ids))
        else:
            return []

    if assignment_id:
        stmt = stmt.where(Submission.assignment_id == assignment_id)
    if student_id and current_user.role == UserRole.TEACHER:
        stmt = stmt.where(Submission.student_id == student_id)
    if question_id:
        stmt = stmt.where(Submission.question_id == question_id)
    if final_only:
        stmt = stmt.where(Submission.is_final == True)

    if class_id and current_user.role == UserRole.TEACHER:
        class_assignments = session.exec(
            select(Assignment).where(Assignment.class_id == class_id)
        ).all()
        ids = [a.id for a in class_assignments]
        if ids:
            stmt = stmt.where(Submission.assignment_id.in_(ids))

    subs = session.exec(stmt.order_by(Submission.created_at.desc()).limit(100)).all()
    is_teacher = current_user.role == UserRole.TEACHER
    return [_submission_to_detail(session, s, show_hidden_details=is_teacher) for s in subs]


@router.get("/{submission_id}", response_model=SubmissionDetail)
def get_submission(
    submission_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    sub = session.get(Submission, submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    if current_user.role == UserRole.STUDENT and sub.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    if current_user.role == UserRole.TEACHER:
        assignment = session.get(Assignment, sub.assignment_id)
        if assignment and assignment.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")

    is_teacher = current_user.role == UserRole.TEACHER
    return _submission_to_detail(session, sub, show_hidden_details=is_teacher)
