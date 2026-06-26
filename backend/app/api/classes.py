from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select, func
import secrets
import string
import io

from app.auth import get_current_user, require_teacher, get_password_hash
from app.database import get_session
from app.models import SchoolClass, User, UserRole
from app.schemas import (
    BulkCreateStudentsRequest,
    BulkCreateStudentsResponse,
    ClassCreate,
    ClassDetail,
    ClassRead,
    StudentAccountInfo,
)

router = APIRouter(prefix="/classes", tags=["classes"])


@router.get("", response_model=list[ClassRead])
def list_classes(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == UserRole.TEACHER:
        stmt = select(SchoolClass).where(SchoolClass.teacher_id == current_user.id)
    else:
        if current_user.class_id:
            stmt = select(SchoolClass).where(SchoolClass.id == current_user.class_id)
        else:
            return []
    return session.exec(stmt).all()


@router.post("", response_model=ClassRead)
def create_class(
    data: ClassCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_teacher),
):
    school_class = SchoolClass(
        name=data.name,
        school_year=data.school_year,
        teacher_id=current_user.id,
    )
    session.add(school_class)
    session.commit()
    session.refresh(school_class)
    return school_class


@router.get("/{class_id}", response_model=ClassDetail)
def get_class(
    class_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    school_class = session.get(SchoolClass, class_id)
    if not school_class:
        raise HTTPException(status_code=404, detail="Class not found")

    if current_user.role == UserRole.TEACHER and school_class.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user.role == UserRole.STUDENT and current_user.class_id != class_id:
        raise HTTPException(status_code=403, detail="Access denied")

    student_count = session.exec(
        select(func.count()).select_from(User).where(User.class_id == class_id)
    ).one()

    return ClassDetail(
        id=school_class.id,
        name=school_class.name,
        school_year=school_class.school_year,
        teacher_id=school_class.teacher_id,
        created_at=school_class.created_at,
        student_count=student_count,
    )


def _generate_password(length: int = 8) -> str:
    """Generate a random temporary password."""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


@router.post("/{class_id}/students/bulk-create", response_model=BulkCreateStudentsResponse)
def bulk_create_students(
    class_id: int,
    data: BulkCreateStudentsRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_teacher),
):
    """Bulk create anonymized student accounts for beta trial."""
    school_class = session.get(SchoolClass, class_id)
    if not school_class:
        raise HTTPException(status_code=404, detail="Class not found")
    
    if school_class.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if data.count < 1 or data.count > 100:
        raise HTTPException(status_code=400, detail="Count must be between 1 and 100")
    
    # Get current max student number in this class to continue numbering
    existing_students = session.exec(
        select(User).where(User.class_id == class_id, User.role == UserRole.STUDENT)
    ).all()
    start_num = len(existing_students) + 1
    
    created_accounts = []
    
    for i in range(data.count):
        student_num = start_num + i
        temp_password = _generate_password()
        
        student = User(
            name=f"Student #{student_num}",
            email=f"{data.prefix}-{student_num:03d}@class-{class_id}.demo",
            password_hash=get_password_hash(temp_password),
            role=UserRole.STUDENT,
            class_id=class_id,
        )
        session.add(student)
        session.flush()  # Get the ID
        
        created_accounts.append(
            StudentAccountInfo(
                id=student.id,
                name=student.name,
                email=student.email,
                temporary_password=temp_password,
                class_id=class_id,
            )
        )
    
    session.commit()
    
    return BulkCreateStudentsResponse(
        created=created_accounts,
        count=len(created_accounts),
    )


@router.get("/{class_id}/students/export.csv")
def export_students_csv(
    class_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_teacher),
):
    """Export student list for a class as CSV (no passwords)."""
    school_class = session.get(SchoolClass, class_id)
    if not school_class:
        raise HTTPException(status_code=404, detail="Class not found")
    
    if school_class.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    students = session.exec(
        select(User).where(User.class_id == class_id, User.role == UserRole.STUDENT)
    ).all()
    
    csv_lines = ["student_id,name,email,class_id"]
    
    for student in students:
        # Escape fields for CSV
        name_escaped = student.name.replace('"', '""')
        email_escaped = student.email.replace('"', '""')
        csv_lines.append(
            f'{student.id},"{name_escaped}","{email_escaped}",{class_id}'
        )
    
    csv_content = "\n".join(csv_lines)
    
    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=class_{class_id}_students.csv"},
    )
