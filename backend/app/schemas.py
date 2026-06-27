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

PRACTICE_TYPES = {
    "MCQ_TRACE_OUTPUT",
    "MCQ_CONCEPT_CHECK",
    "MCQ_ERROR_ANALYSIS",
    "MCQ_CODE_COMPLETION",
    "MCQ_DESIGN_REASONING",
    "FRQ_SMALL_FUNCTION",
    "FRQ_FULL_RESPONSE",
    "DEBUGGING_DRILL",
    "EDGE_CASE_DRILL",
}

FRQ_TYPES = {
    "FRQ_Q1_METHOD_CONTROL",
    "FRQ_Q2_CLASS",
    "FRQ_Q3_ARRAYLIST",
    "FRQ_Q4_2D_ARRAY",
    "NONE",
}

ERROR_PATTERNS = {
    "OFF_BY_ONE",
    "ASSIGNMENT_VS_EQUALITY",
    "INTEGER_DIVISION",
    "STRING_COMPARISON",
    "ARRAY_INDEX_OUT_OF_BOUNDS",
    "ARRAYLIST_REMOVE_SHIFT",
    "NULL_REFERENCE",
    "SCOPE_ERROR",
    "MISSING_RETURN",
    "WRONG_INITIAL_VALUE",
    "LOOP_CONDITION_ERROR",
    "HIDDEN_EDGE_CASE_FAILED",
}

RECOMMENDED_USES = {
    "FIRST_PRACTICE",
    "WARM_UP",
    "HOMEWORK",
    "QUIZ",
    "EXAM_REVIEW",
    "FRQ_DRILL",
    "REMEDIATION",
    "CHALLENGE",
}

SOURCE_TYPES = {
    "TEACHER_CREATED",
    "SYNTHETIC",
    "LICENSED_PRIVATE",
    "PUBLIC_DOMAIN",
    "OFFICIAL_REFERENCE_ONLY",
}

VISIBILITY_TYPES = {
    "PUBLIC_SAMPLE",
    "PRIVATE_CLASSROOM",
    "INTERNAL_REVIEW",
}


def _validate_enum_text(
    value: Optional[str],
    allowed: set[str],
    field_name: str,
) -> Optional[str]:
    if value is None:
        return None
    normalized = value.strip().upper()
    if not normalized:
        return None
    if normalized not in allowed:
        raise ValueError(
            f"{field_name} must be one of: {', '.join(sorted(allowed))}"
        )
    return normalized


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
    practice_type: Optional[str] = None
    frq_type: str = "NONE"
    error_pattern: Optional[str] = None
    recommended_use: Optional[str] = None
    source_type: str = "TEACHER_CREATED"
    visibility: str = "PRIVATE_CLASSROOM"
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
    practice_type: Optional[str] = None
    frq_type: Optional[str] = None
    error_pattern: Optional[str] = None
    recommended_use: Optional[str] = None
    source_type: Optional[str] = None
    visibility: Optional[str] = None
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
    practice_type: Optional[str]
    frq_type: str
    error_pattern: Optional[str]
    recommended_use: Optional[str]
    source_type: str
    visibility: str
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
    practice_type: Optional[str] = None
    frq_type: str = "NONE"
    error_pattern: Optional[str] = None
    recommended_use: Optional[str] = None
    source_type: str = "TEACHER_CREATED"
    visibility: str = "PRIVATE_CLASSROOM"
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

    @field_validator("practice_type")
    @classmethod
    def validate_practice_type(cls, value: Optional[str]) -> Optional[str]:
        return _validate_enum_text(value, PRACTICE_TYPES, "practice_type")

    @field_validator("frq_type")
    @classmethod
    def validate_frq_type(cls, value: str) -> str:
        normalized = _validate_enum_text(value, FRQ_TYPES, "frq_type")
        return normalized or "NONE"

    @field_validator("error_pattern")
    @classmethod
    def validate_error_pattern(cls, value: Optional[str]) -> Optional[str]:
        return _validate_enum_text(value, ERROR_PATTERNS, "error_pattern")

    @field_validator("recommended_use")
    @classmethod
    def validate_recommended_use(cls, value: Optional[str]) -> Optional[str]:
        return _validate_enum_text(value, RECOMMENDED_USES, "recommended_use")

    @field_validator("source_type")
    @classmethod
    def validate_source_type(cls, value: str) -> str:
        normalized = _validate_enum_text(value, SOURCE_TYPES, "source_type")
        return normalized or "TEACHER_CREATED"

    @field_validator("visibility")
    @classmethod
    def validate_visibility(cls, value: str) -> str:
        normalized = _validate_enum_text(value, VISIBILITY_TYPES, "visibility")
        return normalized or "PRIVATE_CLASSROOM"


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
    unit: Optional[str] = None
    topic: Optional[str] = None
    skill: Optional[str] = None
    difficulty: Optional[str] = None
    practice_type: Optional[str] = None
    error_pattern: Optional[str] = None
    recommended_use: Optional[str] = None
    source_type: Optional[str] = None
    visibility: Optional[str] = None

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

    @field_validator("practice_type")
    @classmethod
    def validate_practice_type(cls, value: Optional[str]) -> Optional[str]:
        return _validate_enum_text(value, PRACTICE_TYPES, "practice_type")

    @field_validator("error_pattern")
    @classmethod
    def validate_error_pattern(cls, value: Optional[str]) -> Optional[str]:
        return _validate_enum_text(value, ERROR_PATTERNS, "error_pattern")

    @field_validator("recommended_use")
    @classmethod
    def validate_recommended_use(cls, value: Optional[str]) -> Optional[str]:
        return _validate_enum_text(value, RECOMMENDED_USES, "recommended_use")

    @field_validator("source_type")
    @classmethod
    def validate_source_type(cls, value: Optional[str]) -> Optional[str]:
        return _validate_enum_text(value, SOURCE_TYPES, "source_type")

    @field_validator("visibility")
    @classmethod
    def validate_visibility(cls, value: Optional[str]) -> Optional[str]:
        return _validate_enum_text(value, VISIBILITY_TYPES, "visibility")


class ImportedMCQBank(BaseModel):
    title: str
    section: Optional[str] = None
    question_count: Optional[int] = None
    questions: list[ImportedMCQQuestion]
    course: str = "AP_CSA"
    unit: str = "Uncategorized"
    topic: str = "Multiple Choice"
    skill: str = "AP CSA MCQ Practice"
    difficulty: str = "medium"
    practice_type: str = "MCQ_CONCEPT_CHECK"
    frq_type: str = "NONE"
    error_pattern: Optional[str] = None
    recommended_use: Optional[str] = None
    source_type: str = "TEACHER_CREATED"
    visibility: str = "PRIVATE_CLASSROOM"
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

    @field_validator("practice_type")
    @classmethod
    def validate_practice_type(cls, value: str) -> str:
        normalized = _validate_enum_text(value, PRACTICE_TYPES, "practice_type")
        return normalized or "MCQ_CONCEPT_CHECK"

    @field_validator("frq_type")
    @classmethod
    def validate_frq_type(cls, value: str) -> str:
        normalized = _validate_enum_text(value, FRQ_TYPES, "frq_type")
        return normalized or "NONE"

    @field_validator("error_pattern")
    @classmethod
    def validate_error_pattern(cls, value: Optional[str]) -> Optional[str]:
        return _validate_enum_text(value, ERROR_PATTERNS, "error_pattern")

    @field_validator("recommended_use")
    @classmethod
    def validate_recommended_use(cls, value: Optional[str]) -> Optional[str]:
        return _validate_enum_text(value, RECOMMENDED_USES, "recommended_use")

    @field_validator("source_type")
    @classmethod
    def validate_source_type(cls, value: str) -> str:
        normalized = _validate_enum_text(value, SOURCE_TYPES, "source_type")
        return normalized or "TEACHER_CREATED"

    @field_validator("visibility")
    @classmethod
    def validate_visibility(cls, value: str) -> str:
        normalized = _validate_enum_text(value, VISIBILITY_TYPES, "visibility")
        return normalized or "PRIVATE_CLASSROOM"


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
    question_count: int = 0

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
    topics: list[str] = []
    question_types: list[QuestionType] = []
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

