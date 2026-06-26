"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api, DashboardStats, TeacherAnalytics } from "@/lib/api";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<TeacherAnalytics | null>(null);

  useEffect(() => {
    if (!user) return;
    api.getDashboard().then(setStats).catch(console.error);
    if (user.role === "teacher") {
      api.getAnalytics().then(setAnalytics).catch(console.error);
    }
  }, [user]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <div className="p-8 text-center">Please <Link href="/login" className="text-blue-600">login</Link></div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome, {user.name}!</p>
      </div>

      {user.role === "teacher" && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Classes" value={stats.class_count} href="/teacher/classes" />
            <StatCard label="Questions" value={stats.question_count} href="/teacher/questions" />
            <StatCard label="Assignments" value={stats.assignment_count} href="/teacher/assignments" />
          </div>

          {analytics && (
            <>
              {/* Assignment Completion */}
              {analytics.assignment_stats.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-4">Assignment Completion Rates</h2>
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-3 font-medium text-gray-700">Assignment</th>
                          <th className="text-center p-3 font-medium text-gray-700">Students</th>
                          <th className="text-center p-3 font-medium text-gray-700">Submitted</th>
                          <th className="text-center p-3 font-medium text-gray-700">Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {analytics.assignment_stats.map((stat) => (
                          <tr key={stat.assignment_id} className="hover:bg-gray-50">
                            <td className="p-3">
                              <Link href={`/teacher/assignments`} className="text-blue-600 hover:underline">
                                {stat.title}
                              </Link>
                            </td>
                            <td className="text-center p-3">{stat.total_students}</td>
                            <td className="text-center p-3">{stat.submitted_students}</td>
                            <td className="text-center p-3">
                              <span className={`font-medium ${
                                stat.completion_rate >= 80 ? "text-green-600" :
                                stat.completion_rate >= 50 ? "text-yellow-600" :
                                "text-red-600"
                              }`}>
                                {stat.completion_rate}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Question Performance */}
              {analytics.question_stats.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-4">Question Performance</h2>
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-3 font-medium text-gray-700">Question</th>
                          <th className="text-center p-3 font-medium text-gray-700">Unit</th>
                          <th className="text-center p-3 font-medium text-gray-700">Skill</th>
                          <th className="text-center p-3 font-medium text-gray-700">Submissions</th>
                          <th className="text-center p-3 font-medium text-gray-700">Avg Score</th>
                          <th className="text-center p-3 font-medium text-gray-700">Pass Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {analytics.question_stats
                          .filter((q) => q.submission_count > 0)
                          .map((stat) => (
                            <tr key={stat.question_id} className="hover:bg-gray-50">
                              <td className="p-3">
                                <Link href={`/teacher/questions/${stat.question_id}`} className="text-blue-600 hover:underline">
                                  {stat.title}
                                </Link>
                              </td>
                              <td className="text-center p-3 text-gray-600">{stat.unit}</td>
                              <td className="text-center p-3 text-gray-600">{stat.skill || "—"}</td>
                              <td className="text-center p-3">{stat.submission_count}</td>
                              <td className="text-center p-3">
                                <span className={`font-medium ${
                                  stat.avg_score >= 80 ? "text-green-600" :
                                  stat.avg_score >= 60 ? "text-yellow-600" :
                                  "text-red-600"
                                }`}>
                                  {stat.avg_score}%
                                </span>
                              </td>
                              <td className="text-center p-3">
                                <span className={`font-medium ${
                                  stat.pass_rate >= 80 ? "text-green-600" :
                                  stat.pass_rate >= 50 ? "text-yellow-600" :
                                  "text-red-600"
                                }`}>
                                  {stat.pass_rate}%
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Skill Aggregation */}
              {analytics.skill_stats.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-4">Performance by Skill</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analytics.skill_stats.map((stat) => (
                      <div key={stat.skill} className="bg-white rounded-lg shadow p-4">
                        <h3 className="font-medium text-gray-900 mb-2">{stat.skill}</h3>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-2xl font-bold text-blue-600">{stat.avg_score}%</p>
                            <p className="text-xs text-gray-500">Average Score</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-700">{stat.question_count}</p>
                            <p className="text-xs text-gray-500">Questions</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </>
      )}

      {user.role === "student" && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
