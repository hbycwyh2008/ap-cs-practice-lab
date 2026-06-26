"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { api, ImportedQuestion } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

const SAMPLE_IMPORT: ImportedQuestion[] = [
  {
    title: "Find Maximum Value",
    description:
      "Write a method that returns the largest value in the array nums. You may assume nums has at least one element.",
    course: "AP_CSA",
    unit: "Array",
    topic: "Array traversal",
    skill: "Traversing arrays",
    difficulty: "easy",
    practice_type: "FRQ_SMALL_FUNCTION",
    frq_type: "FRQ_Q1_METHOD_CONTROL",
    error_pattern: "WRONG_INITIAL_VALUE",
    recommended_use: "HOMEWORK",
    source_type: "TEACHER_CREATED",
    visibility: "PRIVATE_CLASSROOM",
    starter_code:
      "public class Solution {\n    public int solve(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}",
    method_signature: "public int solve(int[] nums)",
    estimated_minutes: 10,
    source: "Teacher-created AP CSA practice",
    test_cases: [
      {
        name: "public positive values",
        input_json: "{\"nums\":[1,2,3]}",
        expected_output: "3",
        points: 2,
        hidden: false,
      },
      {
        name: "public max in middle",
        input_json: "{\"nums\":[4,9,2,5]}",
        expected_output: "9",
        points: 2,
        hidden: false,
      },
      {
        name: "hidden negative values",
        input_json: "{\"nums\":[-5,-2,-9]}",
        expected_output: "-2",
        points: 3,
        hidden: true,
      },
      {
        name: "hidden single value",
        input_json: "{\"nums\":[42]}",
        expected_output: "42",
        points: 3,
        hidden: true,
      },
    ],
  },
  {
    title: "Sum Positive Numbers",
    description:
      "Write a method that returns the sum of all positive values in the array nums. Ignore zero and negative values.",
    course: "AP_CSA",
    unit: "Array",
    topic: "Array traversal",
    skill: "Accumulating values",
    difficulty: "easy",
    practice_type: "FRQ_SMALL_FUNCTION",
    frq_type: "FRQ_Q1_METHOD_CONTROL",
    error_pattern: "LOOP_CONDITION_ERROR",
    recommended_use: "WARM_UP",
    source_type: "TEACHER_CREATED",
    visibility: "PRIVATE_CLASSROOM",
    starter_code:
      "public class Solution {\n    public int solve(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}",
    method_signature: "public int solve(int[] nums)",
    estimated_minutes: 10,
    source: "Teacher-created AP CSA practice",
    test_cases: [
      {
        name: "public mixed values",
        input_json: "{\"nums\":[1,-2,3,0]}",
        expected_output: "4",
        points: 2,
        hidden: false,
      },
      {
        name: "public all positive",
        input_json: "{\"nums\":[2,4,6]}",
        expected_output: "12",
        points: 2,
        hidden: false,
      },
      {
        name: "hidden no positives",
        input_json: "{\"nums\":[0,-1,-7]}",
        expected_output: "0",
        points: 3,
        hidden: true,
      },
      {
        name: "hidden single positive",
        input_json: "{\"nums\":[-3,8,-2]}",
        expected_output: "8",
        points: 3,
        hidden: true,
      },
    ],
  },
  {
    title: "Count Even Numbers",
    description:
      "Write a method that returns the number of even values in the array nums. Zero should be counted as even.",
    course: "AP_CSA",
    unit: "Array",
    topic: "Array traversal",
    skill: "Counting with conditions",
    difficulty: "easy",
    practice_type: "DEBUGGING_DRILL",
    frq_type: "FRQ_Q1_METHOD_CONTROL",
    error_pattern: "OFF_BY_ONE",
    recommended_use: "REMEDIATION",
    source_type: "TEACHER_CREATED",
    visibility: "PRIVATE_CLASSROOM",
    starter_code:
      "public class Solution {\n    public int solve(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}",
    method_signature: "public int solve(int[] nums)",
    estimated_minutes: 10,
    source: "Teacher-created AP CSA practice",
    test_cases: [
      {
        name: "public mixed parity",
        input_json: "{\"nums\":[1,2,3,4]}",
        expected_output: "2",
        points: 2,
        hidden: false,
      },
      {
        name: "public includes zero",
        input_json: "{\"nums\":[0,5,8]}",
        expected_output: "2",
        points: 2,
        hidden: false,
      },
      {
        name: "hidden all odd",
        input_json: "{\"nums\":[1,3,5,7]}",
        expected_output: "0",
        points: 3,
        hidden: true,
      },
      {
        name: "hidden negative evens",
        input_json: "{\"nums\":[-4,-3,-2,-1]}",
        expected_output: "2",
        points: 3,
        hidden: true,
      },
    ],
  },
];

function validateImportedQuestions(value: unknown): ImportedQuestion[] {
  if (!Array.isArray(value)) {
    throw new Error("JSON must be an array of questions.");
  }
  if (value.length === 0) {
    throw new Error("Import requires at least one question.");
  }

  value.forEach((question, index) => {
    if (!question || typeof question !== "object") {
      throw new Error(`Question ${index + 1} must be an object.`);
    }
    const item = question as Partial<ImportedQuestion>;
    const requiredTextFields: (keyof ImportedQuestion)[] = [
      "title",
      "description",
      "unit",
      "difficulty",
      "starter_code",
      "method_signature",
    ];
    requiredTextFields.forEach((field) => {
      if (typeof item[field] !== "string" || !item[field]?.trim()) {
        throw new Error(`Question ${index + 1}: ${field} is required.`);
      }
    });
    if (!Array.isArray(item.test_cases) || item.test_cases.length === 0) {
      throw new Error(`Question ${index + 1}: at least one test case is required.`);
    }
    item.test_cases.forEach((testCase, caseIndex) => {
      const label = `Question ${index + 1}, test case ${caseIndex + 1}`;
      if (!testCase.name?.trim()) throw new Error(`${label}: name is required.`);
      if (!testCase.input_json?.trim()) {
        throw new Error(`${label}: input_json is required.`);
      }
      if (!testCase.expected_output?.trim()) {
        throw new Error(`${label}: expected_output is required.`);
      }
      if (typeof testCase.points !== "number" || testCase.points <= 0) {
        throw new Error(`${label}: points must be positive.`);
      }
      if (typeof testCase.hidden !== "boolean") {
        throw new Error(`${label}: hidden must be true or false.`);
      }
    });
  });

  return value as ImportedQuestion[];
}

export default function ImportQuestionsPage() {
  const sampleJson = useMemo(
    () => JSON.stringify(SAMPLE_IMPORT, null, 2),
    []
  );
  const [jsonText, setJsonText] = useState(sampleJson);
  const [validatedQuestions, setValidatedQuestions] = useState<
    ImportedQuestion[] | null
  >(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [importing, setImporting] = useState(false);

  const handleValidate = () => {
    setError("");
    setSuccess("");
    try {
      const parsed = JSON.parse(jsonText);
      const questions = validateImportedQuestions(parsed);
      setValidatedQuestions(questions);
      setSuccess(`JSON is valid. ${questions.length} question(s) ready to import.`);
    } catch (err) {
      setValidatedQuestions(null);
      setError(err instanceof Error ? err.message : "Invalid JSON.");
    }
  };

  const handleImport = async () => {
    setError("");
    setSuccess("");
    setImporting(true);
    try {
      const parsed = JSON.parse(jsonText);
      const questions = validateImportedQuestions(parsed);
      const result = await api.importQuestions(questions);
      setValidatedQuestions(questions);
      setSuccess(
        `Imported ${result.imported_count} question(s): ${result.question_ids.join(", ")}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Import Questions</h1>
            <Badge variant="outline">Structured JSON</Badge>
          </div>
          <p className="text-muted-foreground mt-2">
            Teacher / Question Bank / Import FRQ
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/teacher/questions">Back to Question Bank</Link>
        </Button>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertTitle>Import workflow</AlertTitle>
        <AlertDescription>
          Prepare content outside the platform, convert it to the structured
          JSON format, validate it here, then import it into the existing
          question bank. This page does not perform PDF OCR or AI generation.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Question JSON</CardTitle>
          <CardDescription>
            The top-level value must be an array. Each question must include at
            least one test case.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={jsonText}
            onChange={(event) => {
              setJsonText(event.target.value);
              setValidatedQuestions(null);
              setSuccess("");
              setError("");
            }}
            rows={24}
            className="font-mono text-sm"
            spellCheck={false}
          />

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Import issue</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertTitle className="text-green-900">Ready</AlertTitle>
              <AlertDescription className="text-green-900">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="button" variant="outline" onClick={handleValidate}>
              Validate JSON
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={importing}
            >
              {importing ? "Importing..." : "Import"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setJsonText(sampleJson);
                setValidatedQuestions(null);
                setError("");
                setSuccess("");
              }}
            >
              Reset Sample
            </Button>
          </div>

          {validatedQuestions && (
            <p className="text-sm text-muted-foreground">
              Validated {validatedQuestions.length} question(s). Import will
              create questions and test cases in one batch.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sample JSON</CardTitle>
          <CardDescription>
            Use teacher-created placeholder content in prompts and examples.
            Do not commit copyrighted AP content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
            {sampleJson}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
