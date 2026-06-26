"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, Question } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function TeacherQuestionsPage() {
  const { user, loading } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [busy, setBusy] = useState<number | null>(null);

  const refresh = () => {
    if (user?.role === "teacher") {
      api.getQuestions().then(setQuestions).catch(console.error);
    }
  };

  useEffect(() => {
    refresh();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleArchive = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    if (!confirm("Archive this question? It will be hidden from new assignments.")) return;
    setBusy(id);
    try {
      await api.archiveQuestion(id);
      refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to archive");
    } finally {
      setBusy(null);
    }
  };

  const handleRestore = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    setBusy(id);
    try {
      await api.restoreQuestion(id);
      refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to restore");
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user || user.role !== "teacher") return <div className="p-8">Access denied</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Question Bank</h1>
        <Link
          href="/teacher/questions/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + New Question
        </Link>
      </div>

      <div className="space-y-3">
        {questions.map((q) => {
          const archived = q.is_active === false;
          return (
            <div
              key={q.id}
              className={`bg-white rounded-lg shadow p-4 ${archived ? "opacity-60" : ""}`}
            >
              <div className="flex justify-between gap-4">
                <Link href={`/teacher/questions/${q.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-semibold ${archived ? "text-gray-400" : ""}`}>
                      {q.title}
                    </h3>
                    {archived ? (
                      <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500">
                        Archived
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {q.unit} · {q.topic} · skill: {q.skill || "—"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {q.estimated_minutes} min · source: {q.source || "—"}
                  </p>
                </Link>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      q.difficulty === "easy" ? "bg-green-100 text-green-700" :
                      q.difficulty === "medium" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {q.difficulty}
                    </span>
                    <span className="text-sm text-gray-500">{q.max_points} pts</span>
                  </div>

                  {archived ? (
                    <button
                      onClick={(e) => handleRestore(e, q.id)}
                      disabled={busy === q.id}
                      className="text-xs px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50"
                    >
                      {busy === q.id ? "…" : "Restore"}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleArchive(e, q.id)}
                      disabled={busy === q.id}
                      className="text-xs px-3 py-1 rounded bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-50"
                    >
                      {busy === q.id ? "…" : "Archive"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {questions.length === 0 && (
          <p className="text-gray-400 text-center py-8">No questions yet. Create your first one!</p>
        )}
      </div>
    </div>
  );
}
