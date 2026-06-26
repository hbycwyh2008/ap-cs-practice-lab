from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func

from app.auth import get_current_user
from app.database import get_session
from app.models import (
    Assignment,
    Question,
    SchoolClass,
    Submission,
    User,
    UserRole,
)
from app.schemas import AssignmentRead, DashboardStats, SubmissionDetail
from app.api.submissions import _submission_to_detail

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardStats)
def get_dashboard(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    stats = DashboardStats()

    if current_user.role == UserRole.TEACHER:
        stats.class_count = session.exec(
            select(func.count())
            .select_from(SchoolClass)
            .where(SchoolClass.teacher_id == current_user.id)
        ).one()
        stats.question_count = session.exec(
            select(func.count())
            .select_from(Question)
            .where(Question.created_by == current_user.id)
        ).one()
        stats.assignment_count = session.exec(
            select(func.count())
            .select_from(Assignment)
            .where(Assignment.created_by == current_user.id)
        ).one()

        teacher_assignments = session.exec(
            select(Assignment).where(Assignment.created_by == current_user.id)
        ).all()
        assignment_ids = [a.id for a in teacher_assignments]

        if assignment_ids:
            recent = session.exec(
                select(Submission)
                .where(Submission.assignment_id.in_(assignment_ids))
                .order_by(Submission.created_at.desc())
                .limit(10)
            ).all()
            stats.recent_submissions = [
                _submission_to_detail(session, s, show_hidden_details=True)
                for s in recent
            ]
    else:
        if current_user.class_id:
            assignments = session.exec(
                select(Assignment).where(
                    Assignment.class_id == current_user.class_id
                )
            ).all()
            stats.my_assignments = [
                AssignmentRead.model_validate(a) for a in assignments
            ]
            stats.assignment_count = len(assignments)

        recent = session.exec(
            select(Submission)
            .where(Submission.student_id == current_user.id)
            .order_by(Submission.created_at.desc())
            .limit(10)
        ).all()
        stats.recent_submissions = [
            _submission_to_detail(session, s, show_hidden_details=False)
            for s in recent
        ]

        final_subs = session.exec(
            select(Submission).where(
                Submission.student_id == current_user.id,
                Submission.is_final == True,
            )
        ).all()
        if final_subs:
            total = sum(s.score for s in final_subs)
            max_total = sum(s.max_score for s in final_subs if s.max_score > 0)
            if max_total > 0:
                stats.average_score = round(total / max_total * 100, 1)

    return stats
