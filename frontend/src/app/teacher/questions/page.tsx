"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, Question } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function TeacherQuestionsPage() {
  const { user, loading } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (user?.role === "teacher") {
      api.getQuestions().then(setQuestions).catch(console.error);
    }
  }, [user]);

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
        {questions.map((q) => (
          <Link
            key={q.id}
            href={`/teacher/questions/${q.id}`}
            className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition"
          >
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold">{q.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {q.unit} · {q.topic} · skill: {q.skill || "—"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {q.estimated_minutes} min · source: {q.source || "—"}
                  {!q.is_active && (
                    <span className="ml-2 text-orange-600">inactive</span>
                  )}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className={`px-2 py-1 rounded text-xs ${
                  q.difficulty === "easy" ? "bg-green-100 text-green-700" :
                  q.difficulty === "medium" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {q.difficulty}
                </span>
                <p className="text-sm text-gray-500 mt-1">{q.max_points} pts</p>
              </div>
            </div>
          </Link>
        ))}
        {questions.length === 0 && (
          <p className="text-gray-400 text-center py-8">No questions yet. Create your first one!</p>
        )}
      </div>
    </div>
  );
}
