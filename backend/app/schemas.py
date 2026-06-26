from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, EmailStr, StrictBool, field_validator

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


class BulkCreateStudentsRequest(BaseModel):
    count: int
    prefix: str = "student"


class StudentAccountInfo(BaseModel):
    id: int
    name: str
    email: str
    temporary_password: str
    class_id: int


class BulkCreateStudentsResponse(BaseModel):
    created: list[StudentAccountInfo]
    count: int


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


class MultipleChoiceChoiceRead(BaseModel):
    id: int
    question_id: int
    label: str
    text: str

    class Config:
        from_attributes = True


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
    choices: list[MultipleChoiceChoiceRead] = []

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


class ImportedTestCase(BaseModel):
    name: str
    input_json: str
    expected_output: str
    points: int
    hidden: StrictBool

    @field_validator("name", "input_json", "expected_output")
    @classmethod
    def required_text(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("field is required")
        return value

    @field_validator("points")
    @classmethod
    def positive_points(cls, value: int) -> int:
        if value <= 0:
            raise ValueError("points must be positive")
        return value


class ImportedQuestion(BaseModel):
    title: str
    description: str
    course: str = "AP_CSA"
    unit: str
    topic: Optional[str] = None
    skill: Optional[str] = None
    difficulty: str
    starter_code: str
    method_signature: str
    estimated_minutes: int = 10
    source: Optional[str] = "structured-import"
    reference_solution: Optional[str] = None
    test_cases: list[ImportedTestCase]

    @field_validator(
        "title",
        "description",
        "unit",
        "difficulty",
        "starter_code",
        "method_signature",
    )
    @classmethod
    def required_text(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("field is required")
        return value

    @field_validator("estimated_minutes")
    @classmethod
    def positive_estimated_minutes(cls, value: int) -> int:
        if value <= 0:
            raise ValueError("estimated_minutes must be positive")
        return value

    @field_validator("test_cases")
    @classmethod
    def require_test_cases(cls, value: list[ImportedTestCase]) -> list[ImportedTestCase]:
        if not value:
            raise ValueError("at least one test case is required")
        return value


class QuestionImportResponse(BaseModel):
    imported_count: int
    question_ids: list[int]


class ImportedMCQChoice(BaseModel):
    label: str
    text: str

    @field_validator("label", "text")
    @classmethod
    def required_text(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("field is required")
        return value


class ImportedMCQAnswer(BaseModel):
    label: str
    text: Optional[str] = None

    @field_validator("label")
    @classmethod
    def required_label(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("answer label is required")
        return value


class ImportedMCQQuestion(BaseModel):
    id: int | str
    section: Optional[str] = None
    type: str
    prompt: str
    choices: list[ImportedMCQChoice]
    answer: ImportedMCQAnswer

    @field_validator("prompt", "type")
    @classmethod
    def required_text(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("field is required")
        return value

    @field_validator("choices")
    @classmethod
    def require_choices(
        cls, value: list[ImportedMCQChoice]
    ) -> list[ImportedMCQChoice]:
        if len(value) < 2:
            raise ValueError("at least two choices are required")
        return value


class ImportedMCQBank(BaseModel):
    title: str
    section: Optional[str] = None
    question_count: Optional[int] = None
    questions: list[ImportedMCQQuestion]
    course: str = "AP_CSA"
    unit: str = "Multiple Choice"
    topic: str = "Multiple Choice"
    skill: str = "AP CSA multiple choice"
    difficulty: str = "medium"
    estimated_minutes: int = 2
    source: Optional[str] = None
    max_points: int = 1

    @field_validator("title")
    @classmethod
    def required_title(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("title is required")
        return value

    @field_validator("questions")
    @classmethod
    def require_questions(
        cls, value: list[ImportedMCQQuestion]
    ) -> list[ImportedMCQQuestion]:
        if not value:
            raise ValueError("questions array is required")
        return value

    @field_validator("estimated_minutes", "max_points")
    @classmethod
    def positive_number(cls, value: int) -> int:
        if value <= 0:
            raise ValueError("value must be positive")
        return value


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
class StudentLite(BaseModel):
    id: int
    display_name: str


class AssignmentCompletionStats(BaseModel):
    assignment_id: int
    title: str
    total_students: int
    attempted_students: int
    completed_students: int
    attempt_rate: float
    completion_rate: float
    not_completed_students: list[StudentLite] = []


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

