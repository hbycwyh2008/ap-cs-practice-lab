"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  api,
  AssignmentDetail,
  AssignmentQuestion,
  Submission,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ExamResultStatus = "correct" | "incorrect" | "unanswered" | "error";

interface ExamQuestionResult {
  questionId: number;
  questionOrder: number;
  selectedAnswer: string | null;
  status: ExamResultStatus;
  score: number;
  maxScore: number;
  submissionId?: number;
  errorMessage?: string;
}

interface ExamSubmitSummary {
  totalScore: number;
  totalMaxScore: number;
  correctCount: number;
  totalQuestions: number;
  results: ExamQuestionResult[];
}

function normalizeChoices(
  question: AssignmentQuestion["question"]
): { id: number; label: string; text: string }[] {
  return (
    (question?.choices || [])
      .map((choice) => ({
        id: choice.id,
        label: choice.label.trim().toUpperCase(),
        text: choice.text,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  );
}

export default function StudentAssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>(
    {}
  );
  const [submittingExam, setSubmittingExam] = useState(false);
  const [submitSummary, setSubmitSummary] = useState<ExamSubmitSummary | null>(
    null
  );
  const [examMessage, setExamMessage] = useState("");

  useEffect(() => {
    if (id && user?.role === "student") {
      api
        .getAssignment(Number(id))
        .then((data) => {
          setAssignment(data);
          setCurrentIndex(0);
          setAnswers({});
          setMarkedForReview({});
          setSubmitSummary(null);
          setExamMessage("");
        })
        .catch(console.error);
    }
  }, [id, user]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user || user.role !== "student") return <div className="p-8">Access denied</div>;
  if (!assignment) return <div className="p-8">Loading...</div>;

  const orderedQuestions = [...assignment.questions].sort((a, b) => a.order - b.order);
  const isAllMultipleChoice =
    orderedQuestions.length > 0 &&
    orderedQuestions.every((aq) => aq.question?.type === "multiple_choice");

  if (!isAllMultipleChoice) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">{assignment.title}</h1>
        <p className="text-gray-500 mb-6">{assignment.description}</p>

        <h2 className="text-lg font-semibold mb-4">Questions</h2>
        <div className="space-y-3">
          {orderedQuestions.map((aq) => (
            <Link
              key={aq.id}
              href={`/student/questions/${aq.question_id}?assignmentId=${assignment.id}`}
              className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">
                    {aq.question?.title || `Question #${aq.question_id}`}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {aq.question?.unit} · {aq.question?.difficulty}
                  </p>
                </div>
                <span className="text-sm text-gray-500">{aq.points} pts</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const currentQuestion = orderedQuestions[currentIndex];
  const currentChoices = normalizeChoices(currentQuestion.question);
  const answeredCount = orderedQuestions.filter((aq) => Boolean(answers[aq.question_id])).length;
  const markedCount = orderedQuestions.filter((aq) => markedForReview[aq.question_id]).length;

  const selectAnswer = (questionId: number, choiceLabel: string) => {
    if (submitSummary) return;
    setAnswers((prev) => ({ ...prev, [questionId]: choiceLabel }));
  };

  const toggleMarkForReview = () => {
    if (submitSummary) return;
    const questionId = currentQuestion.question_id;
    setMarkedForReview((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const submitAssignment = async () => {
    if (submitSummary) return;
    setSubmittingExam(true);
    setExamMessage("");
    const results: ExamQuestionResult[] = [];

    for (const aq of orderedQuestions) {
      const selected = answers[aq.question_id] ?? null;
      if (!selected) {
        results.push({
          questionId: aq.question_id,
          questionOrder: aq.order,
          selectedAnswer: null,
          status: "unanswered",
          score: 0,
          maxScore: aq.points,
        });
        continue;
      }

      try {
        const submission: Submission = await api.submitCode({
          question_id: aq.question_id,
          assignment_id: assignment.id,
          code: selected,
        });
        const isCorrect = submission.max_score > 0 && submission.score === submission.max_score;
        results.push({
          questionId: aq.question_id,
          questionOrder: aq.order,
          selectedAnswer: selected,
          status: isCorrect ? "correct" : "incorrect",
          score: submission.score,
          maxScore: submission.max_score,
          submissionId: submission.id,
        });
      } catch (error) {
        results.push({
          questionId: aq.question_id,
          questionOrder: aq.order,
          selectedAnswer: selected,
          status: "error",
          score: 0,
          maxScore: aq.points,
          errorMessage: error instanceof Error ? error.message : "Submission failed",
        });
      }
    }

    const totalScore = results.reduce((sum, item) => sum + item.score, 0);
    const totalMaxScore = results.reduce((sum, item) => sum + item.maxScore, 0);
    const correctCount = results.filter((item) => item.status === "correct").length;
    const summary: ExamSubmitSummary = {
      totalScore,
      totalMaxScore,
      correctCount,
      totalQuestions: orderedQuestions.length,
      results: results.sort((a, b) => a.questionOrder - b.questionOrder),
    };
    setSubmitSummary(summary);
    setExamMessage("Assignment submitted. You can now review your results.");
    setSubmittingExam(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{assignment.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">AP-style practice</Badge>
                <Badge variant="secondary">Multiple Choice</Badge>
                <span>Question {currentIndex + 1} of {orderedQuestions.length}</span>
                <span>·</span>
                <span>Timer: --:-- (placeholder)</span>
              </div>
            </div>
            <Button onClick={submitAssignment} disabled={submittingExam || !!submitSummary}>
              {submittingExam ? "Submitting..." : "Submit Assignment"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="text-sm">
          Choose the best answer. You may mark questions for review. You can
          change answers before submitting. Submit only when finished.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Question Navigator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              {orderedQuestions.map((aq, index) => {
                const answered = Boolean(answers[aq.question_id]);
                const marked = Boolean(markedForReview[aq.question_id]);
                const active = index === currentIndex;
                return (
                  <button
                    key={aq.id}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`h-9 rounded border text-sm font-medium ${
                      active
                        ? "border-blue-600 bg-blue-600 text-white"
                        : answered
                          ? "border-green-300 bg-green-50 text-green-800"
                          : marked
                            ? "border-amber-300 bg-amber-50 text-amber-800"
                            : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Answered: {answeredCount}</p>
              <p>Unanswered: {orderedQuestions.length - answeredCount}</p>
              <p>Marked for review: {markedCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Question {currentIndex + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {currentQuestion.question?.prompt || "Prompt unavailable"}
            </div>

            <div className="space-y-3">
              {currentChoices.map((choice) => {
                const selected = answers[currentQuestion.question_id] === choice.label;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => selectAnswer(currentQuestion.question_id, choice.label)}
                    disabled={Boolean(submitSummary)}
                    className={`w-full text-left rounded-lg border-2 p-4 transition ${
                      selected
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-blue-200"
                    }`}
                  >
                    <div className="flex gap-3">
                      <span className="font-semibold min-w-6">{choice.label}.</span>
                      <span className="text-sm">{choice.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant={markedForReview[currentQuestion.question_id] ? "secondary" : "outline"}
                onClick={toggleMarkForReview}
                disabled={Boolean(submitSummary)}
              >
                {markedForReview[currentQuestion.question_id]
                  ? "Unmark Review"
                  : "Mark for Review"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setCurrentIndex((prev) =>
                    Math.min(orderedQuestions.length - 1, prev + 1)
                  )
                }
                disabled={currentIndex === orderedQuestions.length - 1}
              >
                Next
              </Button>
              <Button
                type="button"
                onClick={submitAssignment}
                disabled={submittingExam || Boolean(submitSummary)}
              >
                {submittingExam ? "Submitting..." : "Submit Assignment"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {examMessage && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription>{examMessage}</AlertDescription>
        </Alert>
      )}

      {submitSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Submission Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded border p-3">
                <p className="text-xs text-muted-foreground">Total Score</p>
                <p className="text-xl font-semibold">
                  {submitSummary.totalScore}/{submitSummary.totalMaxScore}
                </p>
              </div>
              <div className="rounded border p-3">
                <p className="text-xs text-muted-foreground">Correct</p>
                <p className="text-xl font-semibold">
                  {submitSummary.correctCount}/{submitSummary.totalQuestions}
                </p>
              </div>
              <div className="rounded border p-3">
                <p className="text-xs text-muted-foreground">Unanswered</p>
                <p className="text-xl font-semibold">
                  {
                    submitSummary.results.filter((item) => item.status === "unanswered")
                      .length
                  }
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {submitSummary.results.map((result) => (
                <div
                  key={result.questionId}
                  className="flex items-center justify-between rounded border p-3 text-sm"
                >
                  <div className="space-y-1">
                    <p className="font-medium">Question {result.questionOrder}</p>
                    <p className="text-muted-foreground">
                      Selected: {result.selectedAnswer || "Unanswered"}
                    </p>
                    {result.errorMessage && (
                      <p className="text-red-600">{result.errorMessage}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        result.status === "correct"
                          ? "default"
                          : result.status === "unanswered"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {result.status}
                    </Badge>
                    <p className="text-muted-foreground mt-1">
                      {result.score}/{result.maxScore}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
