#!/usr/bin/env python3
"""
Smoke test for the AP CS Practice Lab core API flow.

Verifies the full MVP path:
  teacher login -> student login -> student opens assignment ->
  student submits correct Java solution -> score 10/10 ->
  teacher sees the final submission.

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
    assignment_id = assignments[0]["id"]
    print(f"  [ok] found assignment id={assignment_id}")

    print("4. Student fetches assignment detail")
    status, detail = _request(
        "GET", f"/assignments/{assignment_id}", token=student_token
    )
    assert status == 200, f"GET /assignments/{assignment_id} failed: {status} {detail}"
    questions = detail.get("questions", [])
    assert questions, "Assignment has no questions"
    question_id = questions[0]["question_id"]
    print(f"  [ok] found question id={question_id}")

    print("5. Student submits correct solution")
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

    print("6. Teacher fetches final submissions")
    status, subs = _request(
        "GET", "/submissions?final_only=true", token=teacher_token
    )
    assert status == 200, f"GET /submissions failed: {status} {subs}"
    ids = {s["id"] for s in subs}
    assert submission_id in ids, (
        f"Teacher cannot see submission {submission_id}; got ids {ids}"
    )
    print(f"  [ok] teacher sees submission id={submission_id}")

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
