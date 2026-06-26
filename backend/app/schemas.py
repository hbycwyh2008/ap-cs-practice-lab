from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, EmailStr

from app.models import (
    Course,
    Difficulty,
    QuestionType,
    SubmissionStatus,
    UserRole,
)


# Auth
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole
    class_id: Optional[int] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserRead(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    class_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


# Classes
class ClassCreate(BaseModel):
    name: str
    school_year: str


class ClassRead(BaseModel):
    id: int
    name: str
    school_year: str
    teacher_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ClassDetail(ClassRead):
    student_count: int = 0


# Questions
class QuestionCreate(BaseModel):
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
    skill: Optional[str] = "traversal"
    estimated_minutes: int = 10
    source: Optional[str] = "teacher-created"
    is_active: bool = True


class QuestionUpdate(BaseModel):
    title: Optional[str] = None
    unit: Optional[str] = None
    topic: Optional[str] = None
    difficulty: Optional[Difficulty] = None
    prompt: Optional[str] = None
    starter_code: Optional[str] = None
    reference_solution: Optional[str] = None
    max_points: Optional[int] = None
    skill: Optional[str] = None
    estimated_minutes: Optional[int] = None
    source: Optional[str] = None
    is_active: Optional[bool] = None


class QuestionRead(BaseModel):
    id: int
    title: str
    course: Course
    unit: str
    topic: str
    difficulty: Difficulty
    type: QuestionType
    prompt: str
    starter_code: str
    reference_solution: Optional[str]
    max_points: int
    skill: Optional[str]
    estimated_minutes: int
    source: Optional[str]
    is_active: bool
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True


# Test cases
class TestCaseCreate(BaseModel):
    name: str
    input_json: str
    expected_output: str
    is_hidden: bool = False
    points: int = 1


class TestCaseUpdate(BaseModel):
    name: Optional[str] = None
    input_json: Optional[str] = None
    expected_output: Optional[str] = None
    is_hidden: Optional[bool] = None
    points: Optional[int] = None


class TestCaseRead(BaseModel):
    id: int
    question_id: int
    name: str
    input_json: str
    expected_output: str
    is_hidden: bool
    points: int
    created_at: datetime

    class Config:
        from_attributes = True


class TestCaseStudentRead(BaseModel):
    id: int
    question_id: int
    name: str
    input_json: str
    is_hidden: bool
    points: int
    created_at: datetime

    class Config:
        from_attributes = True


# Assignments
class AssignmentQuestionInput(BaseModel):
    question_id: int
    order: int = 0
    points: int = 0


class AssignmentCreate(BaseModel):
    title: str
    description: str = ""
    class_id: int
    due_at: Optional[datetime] = None
    questions: list[AssignmentQuestionInput]


class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_at: Optional[datetime] = None
    questions: Optional[list[AssignmentQuestionInput]] = None


class AssignmentQuestionRead(BaseModel):
    id: int
    assignment_id: int
    question_id: int
    order: int
    points: int
    question: Optional[QuestionRead] = None

    class Config:
        from_attributes = True


class AssignmentRead(BaseModel):
    id: int
    title: str
    description: str
    class_id: int
    created_by: int
    due_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class AssignmentDetail(AssignmentRead):
    questions: list[AssignmentQuestionRead] = []


class AssignmentGenerateRequest(BaseModel):
    title: str
    description: str = ""
    class_id: int
    due_at: Optional[datetime] = None
    course: Course = Course.AP_CSA
    units: list[str] = []
    difficulties: list[Difficulty] = []
    skills: list[str] = []
    question_count: int
    include_recent_questions: bool = True


# Submissions
class SubmissionRunRequest(BaseModel):
    question_id: int
    assignment_id: int
    code: str
    public_only: bool = True


class SubmissionSubmitRequest(BaseModel):
    question_id: int
    assignment_id: int
    code: str


class TestResultItem(BaseModel):
    name: str
    hidden: bool
    passed: bool
    points: int
    message: str
    expected_output: Optional[str] = None  # teacher only


class FeedbackJson(BaseModel):
    compiled: bool
    total_tests: int
    passed_tests: int
    score: int
    max_score: int
    tests: list[TestResultItem]


class SubmissionRead(BaseModel):
    id: int
    student_id: int
    assignment_id: int
    question_id: int
    code: str
    status: SubmissionStatus
    score: int
    max_score: int
    feedback_json: str
    compile_output: str
    runtime_output: str
    is_final: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SubmissionDetail(SubmissionRead):
    student_name: Optional[str] = None
    question_title: Optional[str] = None
    feedback: Optional[FeedbackJson] = None


class RunResult(BaseModel):
    status: SubmissionStatus
    score: int
    max_score: int
    feedback: FeedbackJson
    compile_output: str
    runtime_output: str


# Dashboard
class DashboardStats(BaseModel):
    class_count: int = 0
    question_count: int = 0
    assignment_count: int = 0
    recent_submissions: list[SubmissionDetail] = []
    my_assignments: list[AssignmentRead] = []
    average_score: Optional[float] = None


# Analytics
class AssignmentCompletionStats(BaseModel):
    assignment_id: int
    title: str
    total_students: int
    submitted_students: int
    completion_rate: float


class QuestionStats(BaseModel):
    question_id: int
    title: str
    unit: str
    skill: Optional[str]
    submission_count: int
    avg_score: float
    pass_rate: float


class SkillStats(BaseModel):
    skill: str
    avg_score: float
    question_count: int


class TeacherAnalytics(BaseModel):
    assignment_stats: list[AssignmentCompletionStats] = []
    question_stats: list[QuestionStats] = []
    skill_stats: list[SkillStats] = []

