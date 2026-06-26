from datetime import datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class UserRole(str, Enum):
    TEACHER = "teacher"
    STUDENT = "student"


class Course(str, Enum):
    AP_CSA = "AP_CSA"
    # Reserved for future: AP_CSP = "AP_CSP"


class QuestionType(str, Enum):
    FRQ_CODE = "FRQ_CODE"
    MULTIPLE_CHOICE = "multiple_choice"


class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class SubmissionStatus(str, Enum):
    PENDING = "pending"
    FAILED_COMPILE = "failed_compile"
    PASSED = "passed"
    FAILED = "failed"
    ERROR = "error"


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    password_hash: str
    role: UserRole
    class_id: Optional[int] = Field(default=None, foreign_key="classes.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    school_class: Optional["SchoolClass"] = Relationship(
        back_populates="students",
        sa_relationship_kwargs={"foreign_keys": "User.class_id"},
    )


class SchoolClass(SQLModel, table=True):
    __tablename__ = "classes"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    school_year: str
    teacher_id: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    students: list[User] = Relationship(
        back_populates="school_class",
        sa_relationship_kwargs={"foreign_keys": "User.class_id"},
    )
    assignments: list["Assignment"] = Relationship(back_populates="school_class")


class Question(SQLModel, table=True):
    __tablename__ = "questions"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    course: Course = Course.AP_CSA
    unit: str
    topic: str
    difficulty: Difficulty
    type: QuestionType = QuestionType.FRQ_CODE
    prompt: str
    starter_code: str
    reference_solution: Optional[str] = None
    max_points: int = 0
    skill: Optional[str] = None
    estimated_minutes: int = 10
    source: Optional[str] = None
    is_active: bool = True
    created_by: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    test_cases: list["TestCase"] = Relationship(back_populates="question")
    choices: list["MultipleChoiceChoice"] = Relationship(back_populates="question")


class MultipleChoiceChoice(SQLModel, table=True):
    __tablename__ = "multiple_choice_choices"

    id: Optional[int] = Field(default=None, primary_key=True)
    question_id: int = Field(foreign_key="questions.id")
    label: str
    text: str
    is_correct: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    question: Optional[Question] = Relationship(back_populates="choices")


class TestCase(SQLModel, table=True):
    __tablename__ = "test_cases"

    id: Optional[int] = Field(default=None, primary_key=True)
    question_id: int = Field(foreign_key="questions.id")
    name: str
    input_json: str  # e.g. {"nums": [1, 2, 3]}
    expected_output: str
    is_hidden: bool = False
    points: int = 1
    created_at: datetime = Field(default_factory=datetime.utcnow)

    question: Optional[Question] = Relationship(back_populates="test_cases")


class Assignment(SQLModel, table=True):
    __tablename__ = "assignments"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str = ""
    class_id: int = Field(foreign_key="classes.id")
    created_by: int = Field(foreign_key="users.id")
    due_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    school_class: Optional[SchoolClass] = Relationship(back_populates="assignments")
    assignment_questions: list["AssignmentQuestion"] = Relationship(
        back_populates="assignment"
    )


class AssignmentQuestion(SQLModel, table=True):
    __tablename__ = "assignment_questions"

    id: Optional[int] = Field(default=None, primary_key=True)
    assignment_id: int = Field(foreign_key="assignments.id")
    question_id: int = Field(foreign_key="questions.id")
    order: int = 0
    points: int = 0

    assignment: Optional[Assignment] = Relationship(back_populates="assignment_questions")


class Submission(SQLModel, table=True):
    __tablename__ = "submissions"

    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="users.id")
    assignment_id: int = Field(foreign_key="assignments.id")
    question_id: int = Field(foreign_key="questions.id")
    code: str
    status: SubmissionStatus = SubmissionStatus.PENDING
    score: int = 0
    max_score: int = 0
    feedback_json: str = "{}"
    compile_output: str = ""
    runtime_output: str = ""
    is_final: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
