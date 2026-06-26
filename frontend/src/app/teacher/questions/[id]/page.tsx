"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, Question, TestCase, Submission } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function TeacherQuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showAddTC, setShowAddTC] = useState(false);
  const [tcForm, setTcForm] = useState({
    name: "", input_json: '{"nums": [1, 2, 3]}', expected_output: "3", is_hidden: false, points: 1,
  });

  useEffect(() => {
    if (!id || user?.role !== "teacher") return;
    api.getQuestion(Number(id)).then(setQuestion).catch(console.error);
    api.getTestCases(Number(id)).then(setTestCases).catch(console.error);
    api.getSubmissions({ question_id: Number(id), final_only: true }).then(setSubmissions).catch(console.error);
  }, [id, user]);

  const addTestCase = async () => {
    await api.createTestCase(Number(id), tcForm);
    const tcs = await api.getTestCases(Number(id));
    setTestCases(tcs);
    setShowAddTC(false);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user || user.role !== "teacher") return <div className="p-8">Access denied</div>;
  if (!question) return <div className="p-8">Loading question...</div>;
  const isMultipleChoice = question.type === "multiple_choice";

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{question.title}</h1>
      <p className="text-gray-500 mb-6">{question.unit} · {question.topic} · {question.difficulty}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-3">Prompt</h2>
          <p className="whitespace-pre-wrap text-sm">{question.prompt}</p>
          {isMultipleChoice ? (
            <>
              <h2 className="font-semibold mt-4 mb-3">Choices</h2>
              <div className="space-y-2">
                {(question.choices || []).map((choice) => (
                  <div key={choice.id} className="border rounded p-3 text-sm">
                    <span className="font-semibold">{choice.label}.</span>{" "}
                    {choice.text}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="font-semibold mt-4 mb-3">Starter Code</h2>
              <pre className="bg-gray-50 p-3 rounded text-sm font-mono overflow-x-auto">{question.starter_code}</pre>
            </>
          )}
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">
              {isMultipleChoice ? "Answer Choices" : `Test Cases (${testCases.length})`}
            </h2>
            {!isMultipleChoice && (
              <button onClick={() => setShowAddTC(!showAddTC)} className="text-sm text-blue-600 hover:underline">
                + Add
              </button>
            )}
          </div>
          {!isMultipleChoice && showAddTC && (
            <div className="border rounded p-3 mb-3 space-y-2">
              <input placeholder="Name" value={tcForm.name} onChange={(e) => setTcForm({ ...tcForm, name: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" />
              <input placeholder='Input JSON' value={tcForm.input_json} onChange={(e) => setTcForm({ ...tcForm, input_json: e.target.value })} className="w-full border rounded px-2 py-1 text-sm font-mono" />
              <input placeholder="Expected output" value={tcForm.expected_output} onChange={(e) => setTcForm({ ...tcForm, expected_output: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={tcForm.is_hidden} onChange={(e) => setTcForm({ ...tcForm, is_hidden: e.target.checked })} />
                Hidden
              </label>
              <input type="number" placeholder="Points" value={tcForm.points} onChange={(e) => setTcForm({ ...tcForm, points: Number(e.target.value) })} className="w-full border rounded px-2 py-1 text-sm" />
              <button onClick={addTestCase} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Save</button>
            </div>
          )}
          {isMultipleChoice ? (
            <p className="text-sm text-gray-500">
              Correct answers are stored server-side and are not shown to students.
              Review the imported source JSON if you need to audit the answer key.
            </p>
          ) : (
            <div className="space-y-2">
              {testCases.map((tc) => (
                <div key={tc.id} className="border rounded p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">{tc.name}</span>
                    <span>{tc.points} pts {tc.is_hidden && "(hidden)"}</span>
                  </div>
                  <p className="text-gray-500 font-mono">in: {tc.input_json} → {tc.expected_output}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold mb-3">Student Submissions ({submissions.length})</h2>
        {submissions.length === 0 ? (
          <p className="text-gray-400">No submissions yet.</p>
        ) : (
          <div className="space-y-2">
            {submissions.map((s) => (
              <div key={s.id} className="border rounded p-3 flex justify-between">
                <span>{s.student_name} · {new Date(s.created_at).toLocaleString()}</span>
                <span>{s.score}/{s.max_score} · {s.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
