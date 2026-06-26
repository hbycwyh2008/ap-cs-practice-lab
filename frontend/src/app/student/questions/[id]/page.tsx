"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { api, Question, Feedback } from "@/lib/api";
import { useAuth } from "@/lib/auth";

function QuestionSolver() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const assignmentId = Number(searchParams.get("assignmentId"));
  const { user, loading } = useAuth();

  const [question, setQuestion] = useState<Question | null>(null);
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (id && user) {
      api.getQuestion(Number(id)).then((q) => {
        setQuestion(q);
        setCode(q.starter_code);
      }).catch(console.error);
    }
  }, [id, user]);

  const handleRun = async () => {
    if (!assignmentId) { setMessage("Missing assignment ID"); return; }
    setRunning(true);
    setMessage("");
    try {
      const result = await api.runCode({
        question_id: Number(id),
        assignment_id: assignmentId,
        code,
      });
      setFeedback(result.feedback);
      setMessage(`Public tests: ${result.feedback.passed_tests}/${result.feedback.total_tests} passed (${result.score}/${result.max_score} pts)`);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Run failed");
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!assignmentId) { setMessage("Missing assignment ID"); return; }
    setSubmitting(true);
    setMessage("");
    try {
      const result = await api.submitCode({
        question_id: Number(id),
        assignment_id: assignmentId,
        code,
      });
      if (result.feedback) {
        setFeedback(result.feedback);
      } else {
        try { setFeedback(JSON.parse(result.feedback_json)); } catch { /* ignore */ }
      }
      setMessage(`Submitted! Score: ${result.score}/${result.max_score} (${result.status})`);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <div className="p-8">Please login</div>;
  if (!question) return <div className="p-8">Loading question...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{question.title}</h1>
      <p className="text-gray-500 mb-4">{question.unit} · {question.topic} · {question.max_points} pts</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-3">Problem</h2>
          <p className="text-sm whitespace-pre-wrap mb-4">{question.prompt}</p>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Method signature:</h3>
          <pre className="bg-gray-50 p-2 rounded text-xs font-mono">public int solve(int[] nums)</pre>
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-3">Your Code</h2>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={16}
            className="w-full border rounded-md p-3 font-mono text-sm bg-gray-900 text-green-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            spellCheck={false}
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleRun}
              disabled={running}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
            >
              {running ? "Running..." : "Run Public Tests"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Final Answer"}
            </button>
          </div>
        </section>
      </div>

      {message && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">{message}</div>
      )}

      {feedback && (
        <section className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-3">
            Test Results — {feedback.passed_tests}/{feedback.total_tests} passed
            {!feedback.compiled && <span className="text-red-500 ml-2">(Compilation failed)</span>}
          </h2>
          <div className="space-y-2">
            {feedback.tests.map((t, i) => (
              <div key={i} className={`flex justify-between items-center p-3 rounded text-sm ${
                t.passed ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
              }`}>
                <div>
                  <span className="font-medium">{t.name}</span>
                  {t.hidden && <span className="ml-2 text-xs text-gray-400">(hidden)</span>}
                  <p className="text-gray-600 mt-1">{t.message}</p>
                </div>
                <span className="font-medium">{t.passed ? `+${t.points}` : "0"} pts</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function StudentQuestionPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <QuestionSolver />
    </Suspense>
  );
}
