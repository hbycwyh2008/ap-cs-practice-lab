"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { api, ImportedMCQBank } from "@/lib/api";
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

const SAMPLE_MCQ_IMPORT: ImportedMCQBank = {
  title: "AP Computer Science A Practice Question Bank",
  section: "I — Multiple Choice",
  question_count: 2,
  questions: [
    {
      id: 1,
      section: "I",
      type: "multiple_choice",
      prompt: "What is the value of result after this code runs?\n\nint result = 0;\nfor (int num : nums) {\n    if (num > 0) {\n        result += num;\n    }\n}",
      choices: [
        { label: "A", text: "The number of positive values in nums" },
        { label: "B", text: "The sum of positive values in nums" },
        { label: "C", text: "The largest value in nums" },
        { label: "D", text: "The sum of all values in nums" },
      ],
      answer: {
        label: "B",
        text: "The sum of positive values in nums",
      },
    },
    {
      id: 2,
      section: "I",
      type: "multiple_choice",
      prompt: "Which expression is true when n is even?",
      choices: [
        { label: "A", text: "n / 2 == 0" },
        { label: "B", text: "n % 2 == 0" },
        { label: "C", text: "n % 2 == 1" },
        { label: "D", text: "n == 2" },
      ],
      answer: {
        label: "B",
        text: "n % 2 == 0",
      },
    },
  ],
};

function validateMCQImport(value: unknown): ImportedMCQBank {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("JSON must be an object with a questions array.");
  }
  const bank = value as Partial<ImportedMCQBank>;
  if (!bank.title?.trim()) {
    throw new Error("Top-level title is required.");
  }
  if (!Array.isArray(bank.questions) || bank.questions.length === 0) {
    throw new Error("Top-level questions array is required.");
  }

  bank.questions.forEach((question, index) => {
    const label = `Question ${index + 1}`;
    if (!question.prompt?.trim()) {
      throw new Error(`${label}: prompt is required.`);
    }
    if (question.type !== "multiple_choice") {
      throw new Error(`${label}: type must be multiple_choice.`);
    }
    if (!Array.isArray(question.choices) || question.choices.length < 2) {
      throw new Error(`${label}: at least two choices are required.`);
    }
    const choiceLabels = new Set<string>();
    question.choices.forEach((choice, choiceIndex) => {
      const choiceLabel = `${label}, choice ${choiceIndex + 1}`;
      if (!choice.label?.trim()) {
        throw new Error(`${choiceLabel}: label is required.`);
      }
      if (!choice.text?.trim()) {
        throw new Error(`${choiceLabel}: text is required.`);
      }
      choiceLabels.add(choice.label.trim().toUpperCase());
    });
    const answerLabel = question.answer?.label?.trim().toUpperCase();
    if (!answerLabel) {
      throw new Error(`${label}: answer.label is required.`);
    }
    if (!choiceLabels.has(answerLabel)) {
      throw new Error(`${label}: answer.label must match one choice label.`);
    }
  });

  return value as ImportedMCQBank;
}

export default function ImportMCQPage() {
  const sampleJson = useMemo(
    () => JSON.stringify(SAMPLE_MCQ_IMPORT, null, 2),
    []
  );
  const [jsonText, setJsonText] = useState(sampleJson);
  const [validatedBank, setValidatedBank] = useState<ImportedMCQBank | null>(
    null
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [importing, setImporting] = useState(false);

  const handleValidate = () => {
    setError("");
    setSuccess("");
    try {
      const parsed = JSON.parse(jsonText);
      const bank = validateMCQImport(parsed);
      setValidatedBank(bank);
      setSuccess(
        `JSON is valid. ${bank.questions.length} multiple-choice question(s) ready to import.`
      );
    } catch (err) {
      setValidatedBank(null);
      setError(err instanceof Error ? err.message : "Invalid JSON.");
    }
  };

  const handleImport = async () => {
    setError("");
    setSuccess("");
    setImporting(true);
    try {
      const parsed = JSON.parse(jsonText);
      const bank = validateMCQImport(parsed);
      const result = await api.importMultipleChoiceQuestions(bank);
      setValidatedBank(bank);
      setSuccess(
        `Imported ${result.imported_count} multiple-choice question(s): ${result.question_ids.join(", ")}`
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
            <h1 className="text-3xl font-bold">
              Import Multiple Choice Questions
            </h1>
            <Badge variant="outline">MCQ JSON</Badge>
          </div>
          <p className="text-muted-foreground mt-2">
            Paste a multiple-choice question bank JSON object. Correct answers
            are stored server-side and are not shown to students.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/teacher/questions">Back to Question Bank</Link>
        </Button>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertTitle>Separate from FRQ import</AlertTitle>
        <AlertDescription>
          Use this page only for multiple-choice questions. Java FRQ coding
          questions should still use the structured FRQ import page.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Multiple Choice JSON</CardTitle>
          <CardDescription>
            The top-level value must be an object with a `questions` array.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={jsonText}
            onChange={(event) => {
              setJsonText(event.target.value);
              setValidatedBank(null);
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
                setValidatedBank(null);
                setError("");
                setSuccess("");
              }}
            >
              Reset Sample
            </Button>
          </div>

          {validatedBank && (
            <p className="text-sm text-muted-foreground">
              Validated {validatedBank.questions.length} multiple-choice
              question(s). Import will create question records and answer
              choices in one batch.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
