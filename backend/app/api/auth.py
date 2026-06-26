from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from app.auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    get_password_hash,
    get_user_by_email,
)
from app.database import get_session
from app.models import User
from app.schemas import Token, UserLogin, UserRead, UserRegister

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead)
def register(data: UserRegister, session: Session = Depends(get_session)):
    if get_user_by_email(session, data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=data.name,
        email=data.email,
        password_hash=get_password_hash(data.password),
        role=data.role,
        class_id=data.class_id,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    user = authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_access_token(data={"sub": user.email})
    return Token(access_token=token)


@router.post("/login/json", response_model=Token)
def login_json(data: UserLogin, session: Session = Depends(get_session)):
    user = authenticate_user(session, data.email, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_access_token(data={"sub": user.email})
    return Token(access_token=token)


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)):
    return current_user
