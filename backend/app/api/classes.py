from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func

from app.auth import get_current_user, require_teacher
from app.database import get_session
from app.models import SchoolClass, User, UserRole
from app.schemas import ClassCreate, ClassDetail, ClassRead

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
