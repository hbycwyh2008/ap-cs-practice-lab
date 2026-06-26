#!/usr/bin/env python3
"""
Smoke test for the AP CS Practice Lab core API flow.

Verifies the full MVP path:
  teacher login -> student login -> student opens assignment ->
  student submits correct Java solution -> score 10/10 ->
  teacher sees the final submission.

Regression checks:
  - public run scores 4/10 (public tests only, full max_score)
  - student test-cases omit hidden tests and expected_output
  - student cannot submit a question outside the assignment (403)
  - teacher can auto-generate assignment from question tags

Usage:
    python scripts/smoke_test.py
    BASE_URL=http://localhost:8000 python scripts/smoke_test.py

Uses only the Python standard library (no external deps).
"""

import json
import os
import sys
import urllib.error
import urllib.request

BASE_URL = os.environ.get("BASE_URL", "http://localhost:8000")

TEACHER = {"email": "teacher@example.com", "password": "password123"}
STUDENT = {"email": "student@example.com", "password": "password123"}

CORRECT_SOLUTION = """public class Solution {
    public int solve(int[] nums) {
        int max = nums[0];
        for (int n : nums) {
            if (n > max) max = n;
        }
        return max;
    }
}"""

STARTER_CODE = """public class Solution {
    public int solve(int[] nums) {
        // Write your code here
        return 0;
    }
}"""


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
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            parsed = raw
        return e.code, parsed


def login(creds):
    status, data = _request("POST", "/auth/login/json", body=creds)
    assert status == 200, f"Login failed for {creds['email']}: {status} {data}"
    token = data["access_token"]
    print(f"  [ok] logged in as {creds['email']}")
    return token


def test_public_run(student_token, assignment_id, question_id):
    print("5. Regression: public run scores 4/10")
    status, result = _request(
        "POST",
        "/submissions/run",
        token=student_token,
        body={
            "assignment_id": assignment_id,
            "question_id": question_id,
            "code": CORRECT_SOLUTION,
            "public_only": True,
        },
    )
    assert status == 200, f"POST /submissions/run failed: {status} {result}"
    assert result["score"] == 4, f"Expected public run score 4, got {result['score']}"
    assert result["max_score"] == 10, (
        f"Expected public run max_score 10, got {result['max_score']}"
    )
    print(f"  [ok] public run scored {result['score']}/{result['max_score']}")


def test_student_test_cases(student_token, question_id):
    print("6. Regression: student test-cases are public-only, no expected_output")
    status, cases = _request(
        "GET", f"/questions/{question_id}/test-cases", token=student_token
    )
    assert status == 200, f"GET test-cases failed: {status} {cases}"
    assert cases, "Expected at least one public test case"
    assert all(not tc.get("is_hidden") for tc in cases), (
        "Student should not receive hidden test cases"
    )
    assert all("expected_output" not in tc for tc in cases), (
        "Student test cases must not include expected_output"
    )
    print(f"  [ok] received {len(cases)} public test case(s), no expected_output")


def test_unassigned_question_forbidden(
    teacher_token, student_token, assignment_id
):
    print("9. Regression: student cannot submit unassigned question (403)")
    status, question = _request(
        "POST",
        "/questions",
        token=teacher_token,
        body={
            "title": "Smoke Test Orphan Question",
            "unit": "Array",
            "topic": "Regression",
            "difficulty": "easy",
            "prompt": "Orphan question for access-control smoke test.",
            "starter_code": STARTER_CODE,
        },
    )
    assert status == 200, f"POST /questions failed: {status} {question}"
    orphan_id = question["id"]

    status, resp = _request(
        "POST",
        "/submissions/submit",
        token=student_token,
        body={
            "assignment_id": assignment_id,
            "question_id": orphan_id,
            "code": CORRECT_SOLUTION,
        },
    )
    assert status == 403, (
        f"Expected 403 for unassigned question, got {status}: {resp}"
    )
    print(f"  [ok] submit blocked for orphan question id={orphan_id}")


def test_auto_generate(teacher_token, student_token):
    print("10. Regression: teacher auto-generates assignment")
    status, classes = _request("GET", "/classes", token=teacher_token)
    assert status == 200 and classes, f"GET /classes failed: {status} {classes}"
    class_id = classes[0]["id"]

    status, generated = _request(
        "POST",
        "/assignments/generate",
        token=teacher_token,
        body={
            "title": "Smoke Test Auto Assignment",
            "description": "Auto-generated for smoke test.",
            "class_id": class_id,
            "course": "AP_CSA",
            "units": ["Array"],
            "difficulties": ["easy"],
            "skills": ["traversal"],
            "question_count": 2,
            "include_recent_questions": True,
        },
    )
    assert status == 200, f"POST /assignments/generate failed: {status} {generated}"
    q_count = len(generated.get("questions", []))
    assert q_count >= 1, f"Expected at least 1 question, got {q_count}"
    assert q_count == 2, f"Expected 2 questions, got {q_count}"
    print(f"  [ok] generated assignment id={generated['id']} with {q_count} question(s)")

    status, student_assignments = _request("GET", "/assignments", token=student_token)
    assert status == 200, f"Student GET /assignments failed: {status}"
    titles = {a["title"] for a in student_assignments}
    assert "Smoke Test Auto Assignment" in titles, (
        f"Student cannot see auto-generated assignment; titles={titles}"
    )
    print("  [ok] student sees auto-generated assignment")


def _find_seed_assignment(assignments):
    for a in assignments:
        if a.get("title") == "Array Traversal Practice":
            return a
    return assignments[0]


def main():
    print(f"Running smoke test against {BASE_URL}")

    print("1. Login teacher")
    teacher_token = login(TEACHER)

    print("2. Login student")
    student_token = login(STUDENT)

    print("3. Student fetches assignments")
    status, assignments = _request("GET", "/assignments", token=student_token)
    assert status == 200, f"GET /assignments failed: {status} {assignments}"
    assert assignments, "Student has no assignments (did you run seed.py?)"
    assignment = _find_seed_assignment(assignments)
    assignment_id = assignment["id"]
    print(f"  [ok] found assignment id={assignment_id} ({assignment['title']})")

    print("4. Student fetches assignment detail")
    status, detail = _request(
        "GET", f"/assignments/{assignment_id}", token=student_token
    )
    assert status == 200, f"GET /assignments/{assignment_id} failed: {status} {detail}"
    questions = detail.get("questions", [])
    assert questions, "Assignment has no questions"
    question_id = questions[0]["question_id"]
    print(f"  [ok] found question id={question_id}")

    test_public_run(student_token, assignment_id, question_id)
    test_student_test_cases(student_token, question_id)

    print("7. Student submits correct solution (final)")
    status, submission = _request(
        "POST",
        "/submissions/submit",
        token=student_token,
        body={
            "assignment_id": assignment_id,
            "question_id": question_id,
            "code": CORRECT_SOLUTION,
        },
    )
    assert status == 200, f"submit failed: {status} {submission}"
    score = submission["score"]
    max_score = submission["max_score"]
    print(f"  [ok] submission scored {score}/{max_score}")
    assert score == 10, f"Expected score 10, got {score}"
    assert max_score == 10, f"Expected max_score 10, got {max_score}"
    submission_id = submission["id"]

    print("8. Teacher fetches final submissions")
    status, subs = _request(
        "GET", "/submissions?final_only=true", token=teacher_token
    )
    assert status == 200, f"GET /submissions failed: {status} {subs}"
    ids = {s["id"] for s in subs}
    assert submission_id in ids, (
        f"Teacher cannot see submission {submission_id}; got ids {ids}"
    )
    print(f"  [ok] teacher sees submission id={submission_id}")

    test_unassigned_question_forbidden(teacher_token, student_token, assignment_id)

    test_auto_generate(teacher_token, student_token)

    print("\nSMOKE TEST PASSED")


if __name__ == "__main__":
    try:
        main()
    except AssertionError as e:
        print(f"\nSMOKE TEST FAILED: {e}")
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"\nSMOKE TEST FAILED: cannot reach {BASE_URL} ({e})")
        sys.exit(1)
