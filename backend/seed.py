"""Seed database with sample teacher, student, class, question, assignment."""

import json
import sys
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


def seed():
    create_db_and_tables()

    with Session(engine) as session:
        # Check if already seeded
        existing = session.exec(
            select(User).where(User.email == "teacher@example.com")
        ).first()
        if existing:
            print("Database already seeded. Skipping.")
            return

        teacher = User(
            name="Demo Teacher",
            email="teacher@example.com",
            password_hash=get_password_hash("password123"),
            role=UserRole.TEACHER,
        )
        session.add(teacher)
        session.commit()
        session.refresh(teacher)

        school_class = SchoolClass(
            name="AP CSA Period 1",
            school_year="2026-2027",
            teacher_id=teacher.id,
        )
        session.add(school_class)
        session.commit()
        session.refresh(school_class)

        student = User(
            name="Demo Student",
            email="student@example.com",
            password_hash=get_password_hash("password123"),
            role=UserRole.STUDENT,
            class_id=school_class.id,
        )
        session.add(student)
        session.commit()
        session.refresh(student)

        starter_code = """public class Solution {
    public int solve(int[] nums) {
        // Write your code here
        return 0;
    }
}"""

        question = Question(
            title="Find Maximum Value",
            unit="Array",
            topic="Traversing arrays",
            difficulty=Difficulty.EASY,
            prompt=(
                "Write the method solve that returns the largest value in the "
                "integer array nums. You may assume nums has at least one element."
            ),
            starter_code=starter_code,
            reference_solution="""public class Solution {
    public int solve(int[] nums) {
        int max = nums[0];
        for (int n : nums) {
            if (n > max) max = n;
        }
        return max;
    }
}""",
            max_points=10,
            created_by=teacher.id,
        )
        session.add(question)
        session.commit()
        session.refresh(question)

        test_cases_data = [
            ("basic positive numbers", {"nums": [1, 2, 3]}, "3", False, 2),
            ("mixed positive numbers", {"nums": [5, 1, 4]}, "5", False, 2),
            ("negative numbers", {"nums": [-3, -1, -7]}, "-1", True, 3),
            ("single element", {"nums": [42]}, "42", True, 3),
        ]

        for name, inp, expected, hidden, points in test_cases_data:
            tc = TestCase(
                question_id=question.id,
                name=name,
                input_json=json.dumps(inp),
                expected_output=expected,
                is_hidden=hidden,
                points=points,
            )
            session.add(tc)
        session.commit()

        assignment = Assignment(
            title="Array Traversal Practice",
            description="Practice traversing arrays with FRQ problems.",
            class_id=school_class.id,
            created_by=teacher.id,
            due_at=datetime.utcnow() + timedelta(days=7),
        )
        session.add(assignment)
        session.commit()
        session.refresh(assignment)

        aq = AssignmentQuestion(
            assignment_id=assignment.id,
            question_id=question.id,
            order=1,
            points=10,
        )
        session.add(aq)
        session.commit()

        print("Seed completed successfully!")
        print(f"  Teacher: teacher@example.com / password123")
        print(f"  Student: student@example.com / password123")
        print(f"  Class: {school_class.name}")
        print(f"  Question: {question.title}")
        print(f"  Assignment: {assignment.title}")


if __name__ == "__main__":
    seed()
