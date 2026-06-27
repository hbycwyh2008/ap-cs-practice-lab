#!/usr/bin/env python3
"""
Lightweight smoke test for MCQ exam mode hardening.

Usage:
    python scripts/mcq_smoke_test.py
    BASE_URL=http://localhost:8000 python scripts/mcq_smoke_test.py
"""

import json
import os
import sys
import urllib.error
import urllib.request

BASE_URL = os.environ.get("BASE_URL", "http://localhost:8000")

TEACHER = {"email": "teacher@example.com", "password": "password123"}
STUDENT = {"email": "student@example.com", "password": "password123"}


def _request(method, path, token=None, body=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read().decode()
            return resp.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode()
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            parsed = raw
        return exc.code, parsed


def login(creds):
    status, data = _request("POST", "/auth/login/json", body=creds)
    assert status == 200, f"Login failed for {creds['email']}: {status} {data}"
    print(f"  [ok] logged in as {creds['email']}")
    return data["access_token"]


def _delete_assignment(teacher_token, assignment_id):
    status, resp = _request(
        "DELETE", f"/assignments/{assignment_id}", token=teacher_token
    )
    assert status == 200, (
        f"DELETE /assignments/{assignment_id} failed: {status} {resp}"
    )


def _archive_question(teacher_token, question_id):
    status, resp = _request("DELETE", f"/questions/{question_id}", token=teacher_token)
    assert status == 200, f"DELETE /questions/{question_id} failed: {status} {resp}"


def main():
    print(f"Running MCQ smoke test against {BASE_URL}")

    print("1. Login teacher")
    teacher_token = login(TEACHER)

    print("2. Login student")
    student_token = login(STUDENT)

    print("3. Get teacher class")
    status, classes = _request("GET", "/classes", token=teacher_token)
    assert status == 200 and classes, f"GET /classes failed: {status} {classes}"
    class_id = classes[0]["id"]
    print(f"  [ok] class id={class_id}")

    print("4. Import small MCQ bank")
    status, imported = _request(
        "POST",
        "/questions/import-mcq",
        token=teacher_token,
        body={
            "title": "MCQ Smoke Test Bank",
            "questions": [
                {
                    "id": 1,
                    "type": "multiple_choice",
                    "prompt": "What does 2 + 2 evaluate to?",
                    "choices": [
                        {"label": "A", "text": "4"},
                        {"label": "B", "text": "22"},
                        {"label": "C", "text": "2"},
                        {"label": "D", "text": "0"},
                    ],
                    "answer": {"label": "A"},
                },
                {
                    "id": 2,
                    "type": "multiple_choice",
                    "prompt": "Which loop can iterate over array elements directly in Java?",
                    "choices": [
                        {"label": "A", "text": "for (int i=0; i<10; i++)"},
                        {"label": "B", "text": "for (int n : nums)"},
                        {"label": "C", "text": "loop nums"},
                        {"label": "D", "text": "repeat(nums)"},
                    ],
                    "answer": {"label": "B"},
                },
            ],
        },
    )
    assert status == 200, f"POST /questions/import-mcq failed: {status} {imported}"
    question_ids = imported["question_ids"]
    assert len(question_ids) == 2, (
        f"Expected 2 imported MCQs, got {len(question_ids)}"
    )
    print(f"  [ok] imported MCQ question ids={question_ids}")

    print("5. Create MCQ-only assignment")
    status, assignment = _request(
        "POST",
        "/assignments",
        token=teacher_token,
        body={
            "title": "MCQ Smoke Assignment",
            "description": "Temporary assignment for MCQ smoke test.",
            "class_id": class_id,
            "questions": [
                {"question_id": question_ids[0], "order": 1, "points": 1},
                {"question_id": question_ids[1], "order": 2, "points": 1},
            ],
        },
    )
    assert status == 200, f"POST /assignments failed: {status} {assignment}"
    assignment_id = assignment["id"]
    print(f"  [ok] created assignment id={assignment_id}")

    print("6. Student list assignments contains question_count")
    status, student_assignments = _request("GET", "/assignments", token=student_token)
    assert status == 200, f"GET /assignments failed: {status} {student_assignments}"
    student_assignment = next(
        (a for a in student_assignments if a["id"] == assignment_id), None
    )
    assert student_assignment, "Student cannot see MCQ smoke assignment"
    assert "question_count" in student_assignment, "Missing question_count in assignment list"
    assert student_assignment["question_count"] == 2, (
        f"Expected question_count=2, got {student_assignment['question_count']}"
    )
    assert "completed" not in student_assignment, "Unexpected fake progress field exposed"
    print("  [ok] assignment list has question_count and no fake progress fields")

    print("7. Student assignment detail does not expose answer key fields")
    status, detail = _request("GET", f"/assignments/{assignment_id}", token=student_token)
    assert status == 200, f"GET /assignments/{assignment_id} failed: {status} {detail}"
    questions = detail.get("questions", [])
    assert len(questions) == 2, f"Expected 2 questions, got {len(questions)}"
    for q in questions:
        payload_question = q.get("question") or {}
        assert payload_question.get("type") == "multiple_choice"
        assert payload_question.get("reference_solution") is None, (
            "Student payload must not expose reference_solution"
        )
        for choice in payload_question.get("choices", []):
            assert "is_correct" not in choice, "Student payload must not expose is_correct"
    print("  [ok] student assignment detail is sanitized")

    print("8. Student question detail does not expose reference_solution")
    status, single_question = _request(
        "GET", f"/questions/{question_ids[0]}", token=student_token
    )
    assert status == 200, f"GET /questions/{question_ids[0]} failed: {status} {single_question}"
    assert single_question.get("reference_solution") is None, (
        "Student /questions/{id} must not expose reference_solution"
    )
    print("  [ok] student question detail is sanitized")

    print("9. Student submits an MCQ answer and receives score")
    status, submission = _request(
        "POST",
        "/submissions/submit",
        token=student_token,
        body={
            "assignment_id": assignment_id,
            "question_id": question_ids[0],
            "code": "A",
        },
    )
    assert status == 200, f"POST /submissions/submit failed: {status} {submission}"
    assert submission["max_score"] == 1, (
        f"Expected max_score=1 for MCQ, got {submission['max_score']}"
    )
    assert submission["score"] == 1, f"Expected score=1 for correct MCQ, got {submission['score']}"
    print("  [ok] MCQ submission scored correctly")

    print("10. Teacher can see final MCQ submission")
    status, teacher_subs = _request(
        "GET",
        f"/submissions?final_only=true&assignment_id={assignment_id}",
        token=teacher_token,
    )
    assert status == 200, f"GET /submissions failed: {status} {teacher_subs}"
    assert any(sub["id"] == submission["id"] for sub in teacher_subs), (
        "Teacher cannot find MCQ final submission"
    )
    print("  [ok] teacher review sees MCQ submission")

    print("11. Cleanup")
    _delete_assignment(teacher_token, assignment_id)
    for question_id in question_ids:
        _archive_question(teacher_token, question_id)
    print("  [ok] cleaned up temporary assignment and questions")

    print("\nMCQ SMOKE TEST PASSED")


if __name__ == "__main__":
    try:
        main()
    except AssertionError as exc:
        print(f"\nMCQ SMOKE TEST FAILED: {exc}")
        sys.exit(1)
    except urllib.error.URLError as exc:
        print(f"\nMCQ SMOKE TEST FAILED: cannot reach {BASE_URL} ({exc})")
        sys.exit(1)
