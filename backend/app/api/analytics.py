from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select, func
from typing import Optional
import io

from app.auth import get_current_user, require_teacher
from app.database import get_session
from app.models import (
    Assignment,
    AssignmentQuestion,
    Question,
    SchoolClass,
    Submission,
    User,
    UserRole,
)
from app.schemas import (
    AssignmentCompletionStats,
    QuestionStats,
    SkillStats,
    StudentLite,
    TeacherAnalytics,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("", response_model=TeacherAnalytics)
def get_teacher_analytics(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_teacher),
):
    """Get comprehensive analytics for teacher's assignments and questions."""
    
    # Get all teacher's classes to count students
    classes = session.exec(
        select(SchoolClass).where(SchoolClass.teacher_id == current_user.id)
    ).all()
    
    # Get all teacher's assignments
    assignments = session.exec(
        select(Assignment).where(Assignment.created_by == current_user.id)
    ).all()
    
    assignment_stats = []
    for assignment in assignments:
        # Get student count for this assignment's class
        student_count = session.exec(
            select(func.count())
            .select_from(User)
            .where(
                User.class_id == assignment.class_id,
                User.role == UserRole.STUDENT,
            )
        ).one()
        
        # Get unique students who have ANY submission (attempted)
        attempted_students = session.exec(
            select(func.count(func.distinct(Submission.student_id)))
            .where(Submission.assignment_id == assignment.id)
        ).one()
        
        # Get unique students who have final submission (completed)
        completed_students = session.exec(
            select(func.count(func.distinct(Submission.student_id)))
            .where(
                Submission.assignment_id == assignment.id,
                Submission.is_final == True,
            )
        ).one()
        
        attempt_rate = (
            round(attempted_students / student_count * 100, 1)
            if student_count > 0
            else 0.0
        )
        
        completion_rate = (
            round(completed_students / student_count * 100, 1)
            if student_count > 0
            else 0.0
        )
        
        # Get students who haven't completed (no final submission)
        completed_student_ids = set(
            session.exec(
                select(Submission.student_id)
                .where(
                    Submission.assignment_id == assignment.id,
                    Submission.is_final == True,
                )
                .distinct()
            ).all()
        )
        
        all_students = session.exec(
            select(User).where(
                User.class_id == assignment.class_id,
                User.role == UserRole.STUDENT,
            )
        ).all()
        
        not_completed = [
            StudentLite(
                id=student.id,
                display_name=f"Student #{student.id}",
            )
            for student in all_students
            if student.id not in completed_student_ids
        ]
        
        assignment_stats.append(
            AssignmentCompletionStats(
                assignment_id=assignment.id,
                title=assignment.title,
                total_students=student_count,
                attempted_students=attempted_students,
                completed_students=completed_students,
                attempt_rate=attempt_rate,
                completion_rate=completion_rate,
                not_completed_students=not_completed,
            )
        )
    
    # Get all teacher's questions
    questions = session.exec(
        select(Question).where(Question.created_by == current_user.id)
    ).all()
    
    question_stats = []
    for question in questions:
        # Get final submissions for this question
        final_subs = session.exec(
            select(Submission).where(
                Submission.question_id == question.id,
                Submission.is_final == True,
            )
        ).all()
        
        submission_count = len(final_subs)
        if submission_count > 0:
            total_score = sum(s.score for s in final_subs)
            total_max = sum(s.max_score for s in final_subs if s.max_score > 0)
            avg_score = round(total_score / total_max * 100, 1) if total_max > 0 else 0.0
            
            passed_count = sum(1 for s in final_subs if s.score == s.max_score and s.max_score > 0)
            pass_rate = round(passed_count / submission_count * 100, 1)
        else:
            avg_score = 0.0
            pass_rate = 0.0
        
        question_stats.append(
            QuestionStats(
                question_id=question.id,
                title=question.title,
                unit=question.unit,
                skill=question.skill,
                submission_count=submission_count,
                avg_score=avg_score,
                pass_rate=pass_rate,
            )
        )
    
    # Aggregate by skill
    skill_data = {}
    for q_stat in question_stats:
        if q_stat.skill and q_stat.submission_count > 0:
            if q_stat.skill not in skill_data:
                skill_data[q_stat.skill] = {
                    "total_score": 0.0,
                    "count": 0,
                    "questions": 0,
                }
            skill_data[q_stat.skill]["total_score"] += q_stat.avg_score
            skill_data[q_stat.skill]["count"] += 1
            skill_data[q_stat.skill]["questions"] += 1
    
    skill_stats = [
        SkillStats(
            skill=skill,
            avg_score=round(data["total_score"] / data["count"], 1),
            question_count=data["questions"],
        )
        for skill, data in skill_data.items()
    ]
    
    return TeacherAnalytics(
        assignment_stats=assignment_stats,
        question_stats=question_stats,
        skill_stats=skill_stats,
    )


@router.get("/export.csv")
def export_analytics_csv(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_teacher),
):
    """Export assignment completion analytics as CSV."""
    
    # Get all teacher's assignments
    assignments = session.exec(
        select(Assignment).where(Assignment.created_by == current_user.id)
    ).all()
    
    csv_lines = [
        "assignment_id,assignment_title,total_students,attempted_students,completed_students,attempt_rate,completion_rate,not_completed_count"
    ]
    
    for assignment in assignments:
        # Get student count
        student_count = session.exec(
            select(func.count())
            .select_from(User)
            .where(
                User.class_id == assignment.class_id,
                User.role == UserRole.STUDENT,
            )
        ).one()
        
        # Attempted students
        attempted_students = session.exec(
            select(func.count(func.distinct(Submission.student_id)))
            .where(Submission.assignment_id == assignment.id)
        ).one()
        
        # Completed students (final submission)
        completed_students = session.exec(
            select(func.count(func.distinct(Submission.student_id)))
            .where(
                Submission.assignment_id == assignment.id,
                Submission.is_final == True,
            )
        ).one()
        
        attempt_rate = (
            round(attempted_students / student_count * 100, 1)
            if student_count > 0
            else 0.0
        )
        
        completion_rate = (
            round(completed_students / student_count * 100, 1)
            if student_count > 0
            else 0.0
        )
        
        not_completed_count = student_count - completed_students
        
        # Escape title for CSV
        title_escaped = assignment.title.replace('"', '""')
        
        csv_lines.append(
            f'{assignment.id},"{title_escaped}",{student_count},{attempted_students},{completed_students},{attempt_rate},{completion_rate},{not_completed_count}'
        )
    
    csv_content = "\n".join(csv_lines)
    
    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=analytics_export.csv"},
    )
