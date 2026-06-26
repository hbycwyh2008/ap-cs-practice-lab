"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api, DashboardStats } from "@/lib/api";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (!user) return;
    api.getDashboard().then(setStats).catch(console.error);
  }, [user]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <div className="p-8 text-center">Please <Link href="/login" className="text-blue-600">login</Link></div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome, {user.name}!</p>

      {user.role === "teacher" && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard label="Classes" value={stats.class_count} href="/teacher/classes" />
          <StatCard label="Questions" value={stats.question_count} href="/teacher/questions" />
          <StatCard label="Assignments" value={stats.assignment_count} href="/teacher/assignments" />
        </div>
      )}

      {user.role === "student" && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <StatCard label="Assignments" value={stats.assignment_count} href="/student/assignments" />
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Average Score</p>
            <p className="text-3xl font-bold text-blue-600">
              {stats.average_score !== null ? `${stats.average_score}%` : "N/A"}
            </p>
          </div>
        </div>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-4">Recent Submissions</h2>
        {stats?.recent_submissions.length === 0 && (
          <p className="text-gray-400">No submissions yet.</p>
        )}
        <div className="space-y-2">
          {stats?.recent_submissions.map((sub) => (
            <div key={sub.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{sub.question_title || `Question #${sub.question_id}`}</p>
                <p className="text-sm text-gray-500">
                  {sub.student_name && `${sub.student_name} · `}
                  {new Date(sub.created_at).toLocaleString()}
                  {sub.is_final ? " · Final" : " · Practice run"}
                </p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  sub.status === "passed" ? "bg-green-100 text-green-700" :
                  sub.status === "failed_compile" ? "bg-red-100 text-red-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {sub.status}
                </span>
                <p className="text-sm mt-1">{sub.score}/{sub.max_score} pts</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-blue-600">{value}</p>
    </Link>
  );
}
