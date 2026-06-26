"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, Assignment, SchoolClass, Submission } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TeacherSubmissionsPage() {
  const { user, loading } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filters, setFilters] = useState({ class_id: "", assignment_id: "", final_only: true });

  const loadSubmissions = () => {
    const params: Record<string, string | number | boolean> = {};
    if (filters.class_id) params.class_id = Number(filters.class_id);
    if (filters.assignment_id) params.assignment_id = Number(filters.assignment_id);
    if (filters.final_only) params.final_only = true;
    api.getSubmissions(params).then(setSubmissions).catch(console.error);
  };

  useEffect(() => {
    if (user?.role === "teacher") {
      api.getClasses().then(setClasses);
      api.getAssignments().then(setAssignments);
      loadSubmissions();
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === "teacher") loadSubmissions();
  }, [filters]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user || user.role !== "teacher") return <div className="p-8">Access denied</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <PageHeader
        title="Submissions"
        description="Teacher / Submissions"
        action={
          <Button variant="outline" asChild>
            <Link href="/teacher/analytics">Open Analytics</Link>
          </Button>
        }
      />

      <div className="flex flex-wrap gap-4">
        <select value={filters.class_id} onChange={(e) => setFilters({ ...filters, class_id: e.target.value })} className="border rounded px-3 py-2 text-sm">
          <option value="">All Classes</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filters.assignment_id} onChange={(e) => setFilters({ ...filters, assignment_id: e.target.value })} className="border rounded px-3 py-2 text-sm">
          <option value="">All Assignments</option>
          {assignments.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {submissions.map((s) => (
          <Card key={s.id}>
            <CardContent className="pt-6">
            <div className="flex justify-between mb-2">
              <div>
                <p className="font-medium">{s.question_title}</p>
                <p className="text-sm text-gray-500">{s.student_name} · {new Date(s.created_at).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs ${
                  s.status === "passed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>{s.status}</span>
                <p className="text-sm mt-1 font-semibold">{s.score}/{s.max_score}</p>
              </div>
            </div>
            {s.feedback?.tests && (
              <div className="mt-2 space-y-1">
                {s.feedback.tests.map((t, i) => (
                  <div key={i} className={`text-xs px-2 py-1 rounded ${t.passed ? "bg-green-50" : "bg-red-50"}`}>
                    {t.name}: {t.message} {t.hidden && "(hidden)"}
                    {t.expected_output && ` [expected: ${t.expected_output}]`}
                  </div>
                ))}
              </div>
            )}
            </CardContent>
          </Card>
        ))}
        {submissions.length === 0 && <p className="text-gray-400 text-center py-8">No submissions found.</p>}
      </div>
    </div>
  );
}
