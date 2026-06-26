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
  - auto-generated assignment accepts a student submission
  - temporary test data (orphan questions, auto assignments) is cleaned up

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

# Seed traversal/easy solutions used by auto-generate smoke test.
AUTO_GENERATE_SOLUTIONS = {
    "Find Maximum Value": CORRECT_SOLUTION,
    "Count Even Numbers": """public class Solution {
    public int solve(int[] nums) {
        int count = 0;
        for (int n : nums) {
            if (n % 2 == 0) count++;
        }
        return count;
    }
}""",
    "Count Negative Numbers": """public class Solution {
    public int solve(int[] nums) {
        int count = 0;
        for (int n : nums) {
            if (n < 0) count++;
        }
        return count;
    }
}""",
}


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
            # Check if response is CSV
            if path.endswith('.csv'):
                return resp.status, raw
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


def _archive_question(teacher_token, question_id):
    status, resp = _request("DELETE", f"/questions/{question_id}", token=teacher_token)
    assert status == 200, (
        f"DELETE /questions/{question_id} failed: {status} {resp}"
    )
    print(f"  [ok] archived temporary question id={question_id}")


def _delete_assignment(teacher_token, assignment_id):
    status, resp = _request(
        "DELETE", f"/assignments/{assignment_id}", token=teacher_token
    )
    assert status == 200, (
        f"DELETE /assignments/{assignment_id} failed: {status} {resp}"
    )
    print(f"  [ok] deleted auto-generated assignment id={assignment_id}")


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

    _archive_question(teacher_token, orphan_id)


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
    generated_id = generated["id"]
    q_count = len(generated.get("questions", []))
    assert q_count >= 1, f"Expected at least 1 question, got {q_count}"
    assert q_count == 2, f"Expected 2 questions, got {q_count}"
    print(f"  [ok] generated assignment id={generated_id} with {q_count} question(s)")

    status, student_assignments = _request("GET", "/assignments", token=student_token)
    assert status == 200, f"Student GET /assignments failed: {status}"
    titles = {a["title"] for a in student_assignments}
    assert "Smoke Test Auto Assignment" in titles, (
        f"Student cannot see auto-generated assignment; titles={titles}"
    )
    print("  [ok] student sees auto-generated assignment")

    status, detail = _request(
        "GET", f"/assignments/{generated_id}", token=student_token
    )
    assert status == 200, (
        f"GET /assignments/{generated_id} failed: {status} {detail}"
    )
    questions = detail.get("questions", [])
    assert questions, "Auto-generated assignment has no questions"
    first = questions[0]
    question_id = first["question_id"]
    question_title = (first.get("question") or {}).get("title", "")
    print(f"  [ok] first question id={question_id} ({question_title})")

    solution = AUTO_GENERATE_SOLUTIONS.get(question_title, CORRECT_SOLUTION)
    status, submission = _request(
        "POST",
        "/submissions/submit",
        token=student_token,
        body={
            "assignment_id": generated_id,
            "question_id": question_id,
            "code": solution,
        },
    )
    assert status == 200, f"submit on auto-generated assignment failed: {status} {submission}"
    assert submission.get("max_score") == 10, (
        f"Expected max_score 10, got {submission.get('max_score')}"
    )
    assert submission.get("status"), "Submission missing status"
    if question_title in AUTO_GENERATE_SOLUTIONS:
        assert submission["score"] == 10, (
            f"Expected score 10 for {question_title}, got {submission['score']}"
        )
    else:
        assert submission["score"] >= 0, (
            f"Expected non-negative score, got {submission['score']}"
        )
    print(
        f"  [ok] student submitted auto-generated question "
        f"{submission['score']}/{submission['max_score']} ({submission['status']})"
    )

    _delete_assignment(teacher_token, generated_id)


def test_question_archive_restore(teacher_token, class_id):
    print("11. Regression: question archive / restore lifecycle")

    status, question = _request(
        "POST",
        "/questions",
        token=teacher_token,
        body={
            "title": "Smoke Test Archive Question",
            "unit": "Array",
            "topic": "Lifecycle",
            "difficulty": "easy",
            "prompt": "Temporary question for archive smoke test.",
            "starter_code": STARTER_CODE,
        },
    )
    assert status == 200, f"POST /questions failed: {status} {question}"
    qid = question["id"]

    status, resp = _request("DELETE", f"/questions/{qid}", token=teacher_token)
    assert status == 200, f"DELETE /questions/{qid} failed: {status} {resp}"
    assert resp.get("archived") is True, f"Expected archived=True, got {resp}"
    print(f"  [ok] archived question id={qid}")

    status, q = _request("GET", f"/questions/{qid}", token=teacher_token)
    assert status == 200, f"GET /questions/{qid} failed: {status} {q}"
    assert q["is_active"] is False, f"Expected is_active=False, got {q['is_active']}"
    print("  [ok] is_active == false after archive")

    status, resp = _request(
        "POST",
        "/assignments",
        token=teacher_token,
        body={
            "title": "Should Fail Assignment",
            "description": "",
            "class_id": class_id,
            "questions": [{"question_id": qid, "order": 1, "points": 10}],
        },
    )
    assert status == 400, (
        f"Expected 400 when adding inactive question to assignment, got {status}: {resp}"
    )
    print("  [ok] inactive question blocked from assignment (400)")

    status, resp = _request(
        "POST", f"/questions/{qid}/restore", token=teacher_token
    )
    assert status == 200, f"POST /questions/{qid}/restore failed: {status} {resp}"
    assert resp.get("restored") is True, f"Expected restored=True, got {resp}"
    print(f"  [ok] restored question id={qid}")

    status, q = _request("GET", f"/questions/{qid}", token=teacher_token)
    assert status == 200, f"GET /questions/{qid} failed: {status} {q}"
    assert q["is_active"] is True, f"Expected is_active=True, got {q['is_active']}"
    print("  [ok] is_active == true after restore")

    status, resp = _request("DELETE", f"/questions/{qid}", token=teacher_token)
    assert status == 200, f"Final archive of question id={qid} failed: {status} {resp}"
    print(f"  [ok] question id={qid} archived (cleanup)")


def test_teacher_analytics(teacher_token):
    print("12. Regression: teacher analytics endpoint")
    
    status, analytics = _request("GET", "/analytics", token=teacher_token)
    assert status == 200, f"GET /analytics failed: {status} {analytics}"
    
    assert "assignment_stats" in analytics, "Missing assignment_stats"
    assert "question_stats" in analytics, "Missing question_stats"
    assert "skill_stats" in analytics, "Missing skill_stats"
    print("  [ok] analytics structure valid")
    
    # Validate assignment stats structure with new fields
    if analytics["assignment_stats"]:
        a_stat = analytics["assignment_stats"][0]
        assert "assignment_id" in a_stat
        assert "title" in a_stat
        assert "total_students" in a_stat
        assert "attempted_students" in a_stat, "Missing attempted_students"
        assert "completed_students" in a_stat, "Missing completed_students"
        assert "attempt_rate" in a_stat, "Missing attempt_rate"
        assert "completion_rate" in a_stat
        assert "not_completed_students" in a_stat, "Missing not_completed_students"
        
        # Validate not_completed_students structure
        if a_stat["not_completed_students"]:
            nc_student = a_stat["not_completed_students"][0]
            assert "id" in nc_student
            assert "display_name" in nc_student
            assert "@" not in nc_student["display_name"], (
                "display_name should not contain email"
            )
        
        print(f"  [ok] assignment stats: {len(analytics['assignment_stats'])} entries, new fields validated")
    
    # Validate question stats structure
    if analytics["question_stats"]:
        q_stat = analytics["question_stats"][0]
        assert "question_id" in q_stat
        assert "title" in q_stat
        assert "submission_count" in q_stat
        assert "avg_score" in q_stat
        assert "pass_rate" in q_stat
        print(f"  [ok] question stats: {len(analytics['question_stats'])} entries")
    
    # Validate skill stats structure
    if analytics["skill_stats"]:
        s_stat = analytics["skill_stats"][0]
        assert "skill" in s_stat
        assert "avg_score" in s_stat
        assert "question_count" in s_stat
        print(f"  [ok] skill stats: {len(analytics['skill_stats'])} entries")


def test_analytics_student_403(student_token):
    print("13. Regression: student cannot access analytics")
    status, resp = _request("GET", "/analytics", token=student_token)
    assert status in (401, 403), (
        f"Expected 401/403 for student accessing analytics, got {status}: {resp}"
    )
    print("  [ok] analytics blocked for student")


def test_csv_export(teacher_token):
    print("14. Regression: CSV export endpoint")
    status, resp = _request("GET", "/analytics/export.csv", token=teacher_token)
    assert status == 200, f"GET /analytics/export.csv failed: {status} {resp}"
    
    # Response should be text, not JSON
    assert isinstance(resp, str), f"Expected CSV text, got {type(resp)}"
    
    # Check CSV structure
    assert "assignment_id" in resp, "CSV missing assignment_id header"
    assert "assignment_title" in resp, "CSV missing assignment_title header"
    assert "completion_rate" in resp, "CSV missing completion_rate header"
    assert "attempted_students" in resp, "CSV missing attempted_students"
    assert "completed_students" in resp, "CSV missing completed_students"
    
    print("  [ok] CSV export structure valid")


def test_bulk_create_students(teacher_token, student_token):
    print("15. Regression: bulk-create anonymized students")
    
    # Teacher creates a temporary class
    status, new_class = _request(
        "POST",
        "/classes",
        token=teacher_token,
        body={
            "name": "Smoke Test Beta Class",
            "school_year": "2026-2027",
        },
    )
    assert status == 200, f"POST /classes failed: {status} {new_class}"
    class_id = new_class["id"]
    print(f"  [ok] created temporary class id={class_id}")
    
    # Teacher bulk-creates 2 students
    status, result = _request(
        "POST",
        f"/classes/{class_id}/students/bulk-create",
        token=teacher_token,
        body={"count": 2, "prefix": "teststu"},
    )
    assert status == 200, f"bulk-create failed: {status} {result}"
    assert "created" in result
    assert "count" in result
    assert result["count"] == 2, f"Expected 2 students, got {result['count']}"
    
    created = result["created"]
    assert len(created) == 2, f"Expected 2 accounts, got {len(created)}"
    
    # Validate account structure
    account1 = created[0]
    assert "id" in account1
    assert "name" in account1
    assert "email" in account1
    assert "temporary_password" in account1
    assert "class_id" in account1
    assert account1["class_id"] == class_id
    assert "@class-" in account1["email"], f"Email should contain @class-: {account1['email']}"
    
    print(f"  [ok] created 2 accounts: {account1['email']}, {created[1]['email']}")
    
    # Try logging in with first new student
    status, login_resp = _request(
        "POST",
        "/auth/login/json",
        body={
            "email": account1["email"],
            "password": account1["temporary_password"],
        },
    )
    assert status == 200, f"Login with new student failed: {status} {login_resp}"
    assert "access_token" in login_resp
    print(f"  [ok] new student login successful")
    
    # Student cannot bulk-create
    status, resp = _request(
        "POST",
        f"/classes/{class_id}/students/bulk-create",
        token=student_token,
        body={"count": 1},
    )
    assert status in (401, 403), (
        f"Expected 401/403 for student bulk-create, got {status}: {resp}"
    )
    print("  [ok] student bulk-create blocked")
    
    # Teacher exports student CSV
    status, csv_resp = _request(
        "GET",
        f"/classes/{class_id}/students/export.csv",
        token=teacher_token,
    )
    assert status == 200, f"CSV export failed: {status} {csv_resp}"
    assert isinstance(csv_resp, str), f"Expected CSV text, got {type(csv_resp)}"
    assert "student_id,name,email,class_id" in csv_resp, (
        "CSV missing required headers"
    )
    assert account1["email"] in csv_resp, "CSV missing created student"
    assert "temporary_password" not in csv_resp, "CSV should not contain passwords"
    print("  [ok] student CSV export valid")


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

    status, classes = _request("GET", "/classes", token=teacher_token)
    assert status == 200 and classes, f"GET /classes failed: {status} {classes}"
    test_question_archive_restore(teacher_token, classes[0]["id"])

    test_teacher_analytics(teacher_token)

    test_analytics_student_403(student_token)

    test_csv_export(teacher_token)

    test_bulk_create_students(teacher_token, student_token)

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
