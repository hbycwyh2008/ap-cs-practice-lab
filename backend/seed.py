"""Seed database with sample teacher, student, class, questions, assignment."""

import json
from datetime import datetime, timedelta

from sqlmodel import Session, select

from app.auth import get_password_hash
from app.database import create_db_and_tables, engine
from app.models import (
    Assignment,
    AssignmentQuestion,
    Question,
    SchoolClass,
    TestCase,
    User,
    UserRole,
    Difficulty,
)

STARTER_CODE = """public class Solution {
    public int solve(int[] nums) {
        // Write your code here
        return 0;
    }
}"""

TEACHER_NAME = "Demo Teacher"
TEACHER_EMAIL = "teacher@example.com"
TEACHER_PASSWORD = "password123"
STUDENT_NAME = "Demo Student"
STUDENT_EMAIL = "student@example.com"
STUDENT_PASSWORD = "password123"
DEFAULT_CLASS_NAME = "AP CSA Period 1"
DEFAULT_SCHOOL_YEAR = "2026-2027"
DEFAULT_ASSIGNMENT_TITLE = "Array Traversal Practice"

DEFAULT_TEST_CASES = [
    ("basic case A", {"nums": [1, 2, 3]}, "0", False, 2),
    ("basic case B", {"nums": [5, 1, 4]}, "0", False, 2),
    ("hidden case A", {"nums": [-3, -1, -7]}, "0", True, 3),
    ("hidden case B", {"nums": [42]}, "0", True, 3),
]

QUESTIONS = [
    {
        "title": "Find Maximum Value",
        "unit": "Array",
        "topic": "Traversing arrays",
        "skill": "traversal",
        "difficulty": Difficulty.EASY,
        "prompt": (
            "Write the method solve that returns the largest value in the "
            "integer array nums. You may assume nums has at least one element."
        ),
        "reference_solution": """public class Solution {
    public int solve(int[] nums) {
        int max = nums[0];
        for (int n : nums) {
            if (n > max) max = n;
        }
        return max;
    }
}""",
        "test_cases": [
            ("basic positive numbers", {"nums": [1, 2, 3]}, "3", False, 2),
            ("mixed positive numbers", {"nums": [5, 1, 4]}, "5", False, 2),
            ("negative numbers", {"nums": [-3, -1, -7]}, "-1", True, 3),
            ("single element", {"nums": [42]}, "42", True, 3),
        ],
    },
    {
        "title": "Count Even Numbers",
        "unit": "Array",
        "topic": "Counting with arrays",
        "skill": "traversal",
        "difficulty": Difficulty.EASY,
        "prompt": "Return how many even integers are in nums.",
        "reference_solution": """public class Solution {
    public int solve(int[] nums) {
        int count = 0;
        for (int n : nums) {
            if (n % 2 == 0) count++;
        }
        return count;
    }
}""",
        "test_cases": [
            ("two evens", {"nums": [1, 2, 3, 4]}, "2", False, 2),
            ("no evens", {"nums": [1, 3, 5]}, "0", False, 2),
            ("all evens", {"nums": [2, 4, 6]}, "3", True, 3),
            ("single even", {"nums": [8]}, "1", True, 3),
        ],
    },
    {
        "title": "Sum Positive Numbers",
        "unit": "Array",
        "topic": "Conditional array processing",
        "skill": "selection",
        "difficulty": Difficulty.EASY,
        "prompt": "Return the sum of all positive values in nums.",
        "reference_solution": """public class Solution {
    public int solve(int[] nums) {
        int sum = 0;
        for (int n : nums) {
            if (n > 0) sum += n;
        }
        return sum;
    }
}""",
        "test_cases": [
            ("mixed signs", {"nums": [1, -2, 3, -4, 5]}, "9", False, 2),
            ("all negative", {"nums": [-1, -2, -3]}, "0", False, 2),
            ("all positive", {"nums": [2, 3, 4]}, "9", True, 3),
            ("single positive", {"nums": [7]}, "7", True, 3),
        ],
    },
    {
        "title": "Count Values Greater Than Threshold",
        "unit": "Array",
        "topic": "Selection with threshold",
        "skill": "selection",
        "difficulty": Difficulty.MEDIUM,
        "prompt": (
            "nums[0] is a threshold. Count how many values in the rest of "
            "the array are strictly greater than the threshold."
        ),
        "reference_solution": """public class Solution {
    public int solve(int[] nums) {
        int threshold = nums[0];
        int count = 0;
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] > threshold) count++;
        }
        return count;
    }
}""",
        "test_cases": [
            ("threshold 3", {"nums": [3, 1, 4, 5, 2]}, "2", False, 2),
            ("threshold 10", {"nums": [10, 11, 9, 12]}, "2", False, 2),
            ("none greater", {"nums": [5, 1, 2, 3]}, "0", True, 3),
            ("all greater", {"nums": [1, 2, 3, 4]}, "3", True, 3),
        ],
    },
    {
        "title": "Find Index of First Target",
        "unit": "Array",
        "topic": "Searching arrays",
        "skill": "traversal",
        "difficulty": Difficulty.MEDIUM,
        "prompt": (
            "nums[0] is a target value. Return the index of the first "
            "occurrence of target in nums[1..], or -1 if not found."
        ),
        "reference_solution": """public class Solution {
    public int solve(int[] nums) {
        int target = nums[0];
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] == target) return i - 1;
        }
        return -1;
    }
}""",
        "test_cases": [
            ("found at index 1", {"nums": [4, 4, 2, 3]}, "0", False, 2),
            ("found at index 0", {"nums": [7, 7, 1, 2]}, "0", False, 2),
            ("not found", {"nums": [9, 1, 2, 3]}, "-1", True, 3),
            ("single search space", {"nums": [5, 5]}, "0", True, 3),
        ],
    },
    {
        "title": "Count Negative Numbers",
        "unit": "Array",
        "topic": "Traversing arrays",
        "skill": "traversal",
        "difficulty": Difficulty.EASY,
        "prompt": "Return how many negative integers are in nums.",
        "reference_solution": """public class Solution {
    public int solve(int[] nums) {
        int count = 0;
        for (int n : nums) {
            if (n < 0) count++;
        }
        return count;
    }
}""",
        "test_cases": [
            ("two negatives", {"nums": [-1, 2, -3, 4]}, "2", False, 2),
            ("no negatives", {"nums": [1, 2, 3]}, "0", False, 2),
            ("all negatives", {"nums": [-1, -2, -3]}, "3", True, 3),
            ("single negative", {"nums": [-5]}, "1", True, 3),
        ],
    },
]


def _sync_test_cases(session, question_id, test_cases):
    existing_test_cases = session.exec(
        select(TestCase).where(TestCase.question_id == question_id)
    ).all()
    for tc in existing_test_cases:
        session.delete(tc)
    session.commit()

    created = 0
    for name, inp, expected, hidden, points in test_cases:
        tc = TestCase(
            question_id=question_id,
            name=name,
            input_json=json.dumps(inp),
            expected_output=expected,
            is_hidden=hidden,
            points=points,
        )
        session.add(tc)
        created += 1
    session.commit()
    return created


def _upsert_question(session, teacher_id, spec):
    question = session.exec(
        select(Question).where(
            Question.created_by == teacher_id,
            Question.title == spec["title"],
        )
    ).first()
    if not question:
        question = Question(
            title=spec["title"],
            unit=spec["unit"],
            topic=spec["topic"],
            skill=spec["skill"],
            difficulty=spec["difficulty"],
            prompt=spec["prompt"],
            starter_code=STARTER_CODE,
            reference_solution=spec["reference_solution"],
            max_points=10,
            estimated_minutes=10,
            source="original",
            is_active=True,
            created_by=teacher_id,
        )
    else:
        question.unit = spec["unit"]
        question.topic = spec["topic"]
        question.skill = spec["skill"]
        question.difficulty = spec["difficulty"]
        question.prompt = spec["prompt"]
        question.starter_code = STARTER_CODE
        question.reference_solution = spec["reference_solution"]
        question.max_points = 10
        question.estimated_minutes = 10
        question.source = "original"
        question.is_active = True
    session.add(question)
    session.commit()
    session.refresh(question)

    _sync_test_cases(session, question.id, spec["test_cases"])
    return question


def seed():
    create_db_and_tables()

    with Session(engine) as session:
        teacher = session.exec(select(User).where(User.email == TEACHER_EMAIL)).first()
        if not teacher:
            teacher = User(
                name=TEACHER_NAME,
                email=TEACHER_EMAIL,
                password_hash=get_password_hash(TEACHER_PASSWORD),
                role=UserRole.TEACHER,
            )
        else:
            teacher.name = TEACHER_NAME
            teacher.role = UserRole.TEACHER
            teacher.password_hash = get_password_hash(TEACHER_PASSWORD)
            teacher.class_id = None
        session.add(teacher)
        session.commit()
        session.refresh(teacher)

        school_class = session.exec(
            select(SchoolClass).where(
                SchoolClass.teacher_id == teacher.id,
                SchoolClass.name == DEFAULT_CLASS_NAME,
            )
        ).first()
        if not school_class:
            school_class = SchoolClass(
                name=DEFAULT_CLASS_NAME,
                school_year=DEFAULT_SCHOOL_YEAR,
                teacher_id=teacher.id,
            )
        else:
            school_class.school_year = DEFAULT_SCHOOL_YEAR
        session.add(school_class)
        session.commit()
        session.refresh(school_class)

        student = session.exec(select(User).where(User.email == STUDENT_EMAIL)).first()
        if not student:
            student = User(
                name=STUDENT_NAME,
                email=STUDENT_EMAIL,
                password_hash=get_password_hash(STUDENT_PASSWORD),
                role=UserRole.STUDENT,
                class_id=school_class.id,
            )
        else:
            student.name = STUDENT_NAME
            student.role = UserRole.STUDENT
            student.class_id = school_class.id
            student.password_hash = get_password_hash(STUDENT_PASSWORD)
        session.add(student)
        session.commit()
        session.refresh(student)

        questions = [_upsert_question(session, teacher.id, spec) for spec in QUESTIONS]
        first_question = questions[0]

        assignment = session.exec(
            select(Assignment).where(
                Assignment.created_by == teacher.id,
                Assignment.class_id == school_class.id,
                Assignment.title == DEFAULT_ASSIGNMENT_TITLE,
            )
        ).first()
        if not assignment:
            assignment = Assignment(
                title=DEFAULT_ASSIGNMENT_TITLE,
                description="Practice traversing arrays with FRQ problems.",
                class_id=school_class.id,
                created_by=teacher.id,
                due_at=datetime.utcnow() + timedelta(days=7),
            )
        else:
            assignment.description = "Practice traversing arrays with FRQ problems."
            assignment.due_at = datetime.utcnow() + timedelta(days=7)
        session.add(assignment)
        session.commit()
        session.refresh(assignment)

        assignment_link = session.exec(
            select(AssignmentQuestion).where(
                AssignmentQuestion.assignment_id == assignment.id,
                AssignmentQuestion.question_id == first_question.id,
            )
        ).first()
        if not assignment_link:
            assignment_link = AssignmentQuestion(
                assignment_id=assignment.id,
                question_id=first_question.id,
                order=1,
                points=10,
            )
        else:
            assignment_link.order = 1
            assignment_link.points = 10
        session.add(assignment_link)
        session.commit()

        print("Seed completed successfully!")
        print(f"  Teacher: {TEACHER_EMAIL} / {TEACHER_PASSWORD}")
        print(f"  Student: {STUDENT_EMAIL} / {STUDENT_PASSWORD}")
        print(f"  Class: {school_class.name}")
        print(f"  Questions: {len(questions)}")
        print(f"  Assignment: {assignment.title}")


if __name__ == "__main__":
    seed()
