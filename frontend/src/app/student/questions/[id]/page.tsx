"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, Question, Feedback } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/status-badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

function QuestionSolver() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const assignmentId = Number(searchParams.get("assignmentId"));
  const { user, loading } = useAuth();

  const [question, setQuestion] = useState<Question | null>(null);
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [compileOutput, setCompileOutput] = useState("");
  const [runtimeOutput, setRuntimeOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [latestStatus, setLatestStatus] = useState("");
  const [activeTab, setActiveTab] = useState<string>("problem");
  const [selectedChoice, setSelectedChoice] = useState("");

  useEffect(() => {
    if (id && user) {
      api
        .getQuestion(Number(id))
        .then((q) => {
          setQuestion(q);
          setCode(q.starter_code);
          setSelectedChoice("");
        })
        .catch(console.error);
    }
  }, [id, user]);

  const handleRun = async () => {
    if (!assignmentId) {
      setMessage("Missing assignment ID");
      return;
    }
    setRunning(true);
    setMessage("");
    setFeedback(null);
    setLatestStatus("");
    try {
      const result = await api.runCode({
        question_id: Number(id),
        assignment_id: assignmentId,
        code,
      });
      setFeedback(result.feedback);
      setCompileOutput(result.compile_output || "");
      setRuntimeOutput(result.runtime_output || "");
      setLatestStatus(result.status);
      setMessage(
        `Public tests: ${result.feedback.passed_tests}/${result.feedback.total_tests} passed (${result.score}/${result.max_score} pts)`
      );
      setActiveTab("results");
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Run failed");
      setActiveTab("results");
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!assignmentId) {
      setMessage("Missing assignment ID");
      return;
    }
    setSubmitting(true);
    setMessage("");
    setFeedback(null);
    setLatestStatus("");
    try {
      const submittedCode =
        question?.type === "multiple_choice" ? selectedChoice : code;
      if (question?.type === "multiple_choice" && !submittedCode) {
        setMessage("Select an answer before submitting.");
        return;
      }
      const result = await api.submitCode({
        question_id: Number(id),
        assignment_id: assignmentId,
        code: submittedCode,
      });
      if (result.feedback) {
        setFeedback(result.feedback);
      } else {
        try {
          setFeedback(JSON.parse(result.feedback_json));
        } catch {
          /* ignore */
        }
      }
      setCompileOutput(result.compile_output || "");
      setRuntimeOutput(result.runtime_output || "");
      setLatestStatus(result.status);
      setMessage(
        `Submitted! Final Score: ${result.score}/${result.max_score} (${result.status})`
      );
      setActiveTab("results");
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Submit failed");
      setActiveTab("results");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  if (!user)
    return (
      <div className="container p-6">
        <Alert>
          <AlertDescription>Please login to continue</AlertDescription>
        </Alert>
      </div>
    );
  if (!question)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading question...</p>
      </div>
    );

  if (question.type === "multiple_choice") {
    return (
      <div className="container max-w-5xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/student/assignments/${assignmentId}`}>← Back</Link>
          </Button>
          <h1 className="text-3xl font-bold">{question.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{question.unit}</Badge>
            <span>·</span>
            <span>{question.topic}</span>
            <span>·</span>
            <Badge>{question.max_points} points</Badge>
          </div>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-sm">
            Select one answer and submit when ready. The correct answer is not
            shown before submission.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Question</CardTitle>
              <CardDescription>
                Read the prompt and choose one answer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {question.prompt}
              </p>
              <Separator />
              <div className="space-y-3">
                {(question.choices || []).map((choice) => (
                  <label
                    key={choice.id}
                    className={`block rounded-lg border-2 p-4 cursor-pointer transition ${
                      selectedChoice === choice.label
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-blue-200"
                    }`}
                  >
                    <div className="flex gap-3">
                      <input
                        type="radio"
                        name="choice"
                        value={choice.label}
                        checked={selectedChoice === choice.label}
                        onChange={() => setSelectedChoice(choice.label)}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-semibold">{choice.label}</div>
                        <div className="text-sm text-slate-700">
                          {choice.text}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !selectedChoice}
                className="w-full"
              >
                {submitting ? "Submitting..." : "Submit Final Answer"}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {message && (
              <Alert
                className={
                  feedback?.score === feedback?.max_score
                    ? "border-green-200 bg-green-50"
                    : "border-blue-200 bg-blue-50"
                }
              >
                <AlertDescription className="font-medium">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {feedback ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Result</CardTitle>
                      <CardDescription>
                        Score: {feedback.score}/{feedback.max_score}
                      </CardDescription>
                    </div>
                    <StatusBadge
                      status={
                        feedback.score === feedback.max_score
                          ? "passed"
                          : "failed"
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Your selected answer was submitted. Ask your teacher if you
                    want to review the correct answer after practice.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p>No submission yet</p>
                  <p className="text-sm mt-2">
                    Choose one answer and submit to see your score.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/student/assignments/${assignmentId}`}>
                ← Back
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold">{question.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{question.unit}</Badge>
            <span>·</span>
            <span>{question.topic}</span>
            <span>·</span>
            <Badge>{question.max_points} points</Badge>
          </div>
        </div>
      </div>

      {/* Test Policy Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="text-sm">
          <strong>Test Policy:</strong> Public tests are visible during practice
          runs. Hidden tests are used for final scoring only. Run public tests as
          many times as needed before submitting.
        </AlertDescription>
      </Alert>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Problem and Results Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="problem" className="flex-1">
              Problem
            </TabsTrigger>
            <TabsTrigger value="results" className="flex-1">
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="problem" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Problem Statement</CardTitle>
                <CardDescription>
                  Read the requirements carefully
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {question.prompt}
                  </p>
                </div>
                <Separator />
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Method Signature:
                  </Label>
                  <pre className="bg-muted p-3 rounded-md text-xs font-mono">
                    public int solve(int[] nums)
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {/* Status Message */}
            {message && (
              <Alert
                className={
                  feedback?.compiled === false
                    ? "border-red-200 bg-red-50"
                    : "border-blue-200 bg-blue-50"
                }
              >
                <AlertDescription className="font-medium">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {/* Compile/Runtime Output */}
            {compileOutput && (
              <Alert variant="destructive">
                <AlertTitle>Compilation Error</AlertTitle>
                <AlertDescription>
                  <pre className="text-xs font-mono whitespace-pre-wrap mt-2 p-3 bg-destructive/10 rounded">
                    {compileOutput}
                  </pre>
                </AlertDescription>
              </Alert>
            )}

            {latestStatus === "failed_compile" && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-base text-red-900">
                    How to read this compile error
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-red-900">
                    <li>Look at the line number first.</li>
                    <li>Check for missing semicolons.</li>
                    <li>
                      Check parentheses in <code>for</code> loops and{" "}
                      <code>if</code> statements.
                    </li>
                    <li>
                      Java for-each syntax is{" "}
                      <code>for (int num : nums)</code>, not{" "}
                      <code>for num in nums</code>.
                    </li>
                    <li>Fix one error, then run public tests again.</li>
                  </ul>
                </CardContent>
              </Card>
            )}

            {runtimeOutput && !compileOutput && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTitle className="text-yellow-800">
                  Runtime Output
                </AlertTitle>
                <AlertDescription>
                  <pre className="text-xs font-mono whitespace-pre-wrap mt-2 p-3 bg-yellow-100/50 rounded text-yellow-900">
                    {runtimeOutput}
                  </pre>
                </AlertDescription>
              </Alert>
            )}

            {/* Test Results */}
            {feedback ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Test Results</CardTitle>
                      <CardDescription>
                        {feedback.passed_tests}/{feedback.total_tests} tests
                        passed
                        {!feedback.compiled && (
                          <span className="ml-2 text-destructive font-semibold">
                            (Compilation failed)
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        feedback.passed_tests === feedback.total_tests
                          ? "default"
                          : "destructive"
                      }
                      className="text-base px-4 py-1"
                    >
                      {feedback.passed_tests === feedback.total_tests
                        ? "All Passed"
                        : `${feedback.passed_tests}/${feedback.total_tests}`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {feedback.tests.map((t, i) => (
                      <div
                        key={i}
                        className={`flex items-start justify-between p-4 rounded-lg border-2 ${
                          t.passed
                            ? "bg-green-50 border-green-200"
                            : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">
                              {t.name}
                            </span>
                            {t.hidden && (
                              <Badge variant="outline" className="text-xs">
                                Hidden
                              </Badge>
                            )}
                          </div>
                          <p
                            className={`text-sm ${
                              t.passed ? "text-green-700" : "text-red-700"
                            }`}
                          >
                            {t.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold">
                            {t.passed ? (
                              <span className="text-green-600">
                                +{t.points}
                              </span>
                            ) : (
                              <span className="text-red-600">0</span>
                            )}{" "}
                            pts
                          </span>
                          <StatusBadge status={t.passed ? "passed" : "failed"} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p>No test results yet</p>
                  <p className="text-sm mt-2">
                    Run public tests or submit your solution to see results
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Right: Code Editor */}
        <div className="space-y-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-base text-blue-900">
                Java Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 text-sm text-blue-900">
                <li>Do not change the required class name or method signature.</li>
                <li>
                  End Java statements with a semicolon <code>;</code>.
                </li>
                <li>
                  To loop over an <code>int[]</code>, use:{" "}
                  <code>for (int num : nums) {"{ ... }"}</code>
                </li>
                <li>
                  For max/min array problems, consider starting from{" "}
                  <code>nums[0]</code> instead of <code>0</code>.
                </li>
                <li>
                  Public tests are only visible checks. Hidden tests may check
                  edge cases.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Solution</CardTitle>
              <CardDescription>Write your Java code below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={18}
                  className="font-mono text-sm bg-slate-950 text-green-400 border-slate-700 focus-visible:ring-blue-500"
                  spellCheck={false}
                  placeholder="// Write your code here..."
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleRun}
                  disabled={running || submitting}
                  variant="secondary"
                  className="flex-1"
                >
                  {running ? "Running..." : "Run Public Tests"}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || running}
                  className="flex-1"
                >
                  {submitting ? "Submitting..." : "Submit Final Answer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function StudentQuestionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <QuestionSolver />
    </Suspense>
  );
}
