"""
Java code runner using Docker sandbox.

Supports method signature: public int solve(int[] nums)

Extension points (not yet implemented):
- String, ArrayList, 2D array signatures
- Static analysis
- Rubric-based scoring
"""

import json
import os
import shutil
import subprocess
import tempfile
import uuid
from dataclasses import dataclass
from typing import Any

from app.config import settings
from app.models import TestCase
from app.schemas import FeedbackJson, TestResultItem


@dataclass
class RunOutput:
    compiled: bool
    compile_output: str
    runtime_output: str
    return_value: int | None
    error: str | None


def _parse_input(input_json: str) -> list[int]:
    data = json.loads(input_json)
    if "nums" not in data:
        raise ValueError('input_json must contain "nums" array')
    return data["nums"]


def _format_java_array(nums: list[int]) -> str:
    return "{" + ", ".join(str(n) for n in nums) + "}"


def generate_main_java(test_case: TestCase) -> str:
    """Generate Main.java that calls Solution.solve(int[] nums)."""
    nums = _parse_input(test_case.input_json)
    array_literal = _format_java_array(nums)

    return f"""public class Main {{
    public static void main(String[] args) {{
        Solution s = new Solution();
        int[] nums = {array_literal};
        int result = s.solve(nums);
        System.out.println(result);
    }}
}}
"""


def _run_docker_command(work_dir: str, shell_cmd: str, timeout: int) -> tuple[int, str, str]:
    """Run a command inside the Java runner Docker container."""
    abs_work_dir = os.path.abspath(work_dir)
    cmd = [
        "docker",
        "run",
        "--rm",
        "--network",
        "none",
        "--memory",
        settings.java_runner_memory,
        "--cpus",
        settings.java_runner_cpus,
        "-v",
        f"{abs_work_dir}:/workspace:rw",
        "-w",
        "/workspace",
        settings.java_runner_image,
        shell_cmd,
    ]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout + 10,
        )
        return result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return -1, "", "Execution timed out (container limit exceeded)"
    except FileNotFoundError:
        return -1, "", "Docker not found. Ensure Docker is installed and running."


def compile_java(work_dir: str) -> tuple[bool, str]:
    timeout = settings.java_runner_timeout
    returncode, stdout, stderr = _run_docker_command(
        work_dir,
        "javac Solution.java Main.java 2>&1",
        timeout,
    )
    output = (stdout + stderr).strip()
    return returncode == 0, output


def run_java(work_dir: str) -> RunOutput:
    timeout = settings.java_runner_timeout
    returncode, stdout, stderr = _run_docker_command(
        work_dir,
        "java Main 2>&1",
        timeout,
    )
    output = (stdout + stderr).strip()

    if returncode != 0:
        return RunOutput(
            compiled=True,
            compile_output="",
            runtime_output=output,
            return_value=None,
            error=output or "Runtime error",
        )

    lines = output.strip().splitlines()
    if not lines:
        return RunOutput(
            compiled=True,
            compile_output="",
            runtime_output=output,
            return_value=None,
            error="No output from program",
        )

    try:
        return_value = int(lines[-1].strip())
        return RunOutput(
            compiled=True,
            compile_output="",
            runtime_output=output,
            return_value=return_value,
            error=None,
        )
    except ValueError:
        return RunOutput(
            compiled=True,
            compile_output="",
            runtime_output=output,
            return_value=None,
            error=f"Expected integer output, got: {lines[-1]}",
        )


def run_tests(
    code: str,
    test_cases: list[TestCase],
    include_hidden: bool = False,
    show_expected_for_teacher: bool = False,
) -> FeedbackJson:
    """
    Run student code against test cases in an isolated Docker sandbox.

    Each test case gets its own temp directory that is cleaned up after execution.
    """
    if not test_cases:
        return FeedbackJson(
            compiled=True,
            total_tests=0,
            passed_tests=0,
            score=0,
            max_score=0,
            tests=[],
        )

    cases_to_run = test_cases if include_hidden else [tc for tc in test_cases if not tc.is_hidden]
    max_score = sum(tc.points for tc in test_cases)

    # Use configured tmp dir or system temp
    base_tmp = settings.java_runner_tmp_dir
    os.makedirs(base_tmp, exist_ok=True)

    run_id = str(uuid.uuid4())
    work_dir = os.path.join(base_tmp, run_id)

    results: list[TestResultItem] = []
    total_score = 0
    passed_count = 0
    compile_output = ""
    runtime_output = ""
    compiled = True

    try:
        os.makedirs(work_dir, exist_ok=True)

        # Write student solution once
        solution_path = os.path.join(work_dir, "Solution.java")
        with open(solution_path, "w", encoding="utf-8") as f:
            f.write(code)

        # Compile check with first test's Main.java
        first_main = os.path.join(work_dir, "Main.java")
        with open(first_main, "w", encoding="utf-8") as f:
            f.write(generate_main_java(test_cases[0]))

        ok, compile_output = compile_java(work_dir)
        if not ok:
            return FeedbackJson(
                compiled=False,
                total_tests=len(cases_to_run),
                passed_tests=0,
                score=0,
                max_score=max_score,
                tests=[
                    TestResultItem(
                        name=tc.name,
                        hidden=tc.is_hidden,
                        passed=False,
                        points=0,
                        message="Compilation failed",
                        expected_output=tc.expected_output if show_expected_for_teacher else None,
                    )
                    for tc in cases_to_run
                ],
            )

        for tc in cases_to_run:
            # Regenerate Main.java for each test case
            with open(first_main, "w", encoding="utf-8") as f:
                f.write(generate_main_java(tc))

            # Recompile Main (Solution already compiled)
            ok, recompile_out = compile_java(work_dir)
            if not ok:
                results.append(
                    TestResultItem(
                        name=tc.name,
                        hidden=tc.is_hidden,
                        passed=False,
                        points=0,
                        message=f"Main generation error: {recompile_out}",
                        expected_output=tc.expected_output if show_expected_for_teacher else None,
                    )
                )
                continue

            run_result = run_java(work_dir)
            runtime_output = run_result.runtime_output

            if run_result.error:
                results.append(
                    TestResultItem(
                        name=tc.name,
                        hidden=tc.is_hidden,
                        passed=False,
                        points=0,
                        message=run_result.error,
                        expected_output=tc.expected_output if show_expected_for_teacher else None,
                    )
                )
                continue

            expected = int(tc.expected_output.strip())
            actual = run_result.return_value

            if actual == expected:
                passed_count += 1
                total_score += tc.points
                results.append(
                    TestResultItem(
                        name=tc.name,
                        hidden=tc.is_hidden,
                        passed=True,
                        points=tc.points,
                        message="Passed",
                        expected_output=tc.expected_output if show_expected_for_teacher else None,
                    )
                )
            else:
                if tc.is_hidden and not show_expected_for_teacher:
                    message = "Hidden test failed"
                else:
                    message = f"Expected {expected} but got {actual}"
                results.append(
                    TestResultItem(
                        name=tc.name,
                        hidden=tc.is_hidden,
                        passed=False,
                        points=0,
                        message=message,
                        expected_output=tc.expected_output if show_expected_for_teacher else None,
                    )
                )

    finally:
        if os.path.exists(work_dir):
            shutil.rmtree(work_dir, ignore_errors=True)

    return FeedbackJson(
        compiled=compiled,
        total_tests=len(cases_to_run),
        passed_tests=passed_count,
        score=total_score,
        max_score=max_score,
        tests=results,
    )


def determine_status(feedback: FeedbackJson, is_final: bool = False) -> str:
    from app.models import SubmissionStatus

    if not feedback.compiled:
        return SubmissionStatus.FAILED_COMPILE
    if feedback.passed_tests == feedback.total_tests and feedback.total_tests > 0:
        return SubmissionStatus.PASSED
    if feedback.passed_tests > 0:
        return SubmissionStatus.FAILED
    return SubmissionStatus.FAILED
