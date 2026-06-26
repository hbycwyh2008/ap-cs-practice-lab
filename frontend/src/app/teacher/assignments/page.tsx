"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, Assignment } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function TeacherAssignmentsPage() {
  const { user, loading } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    if (user?.role === "teacher") {
      api.getAssignments().then(setAssignments).catch(console.error);
    }
  }, [user]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user || user.role !== "teacher") return <div className="p-8">Access denied</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assignments</h1>
        <Link href="/teacher/assignments/new" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          + New Assignment
        </Link>
      </div>
      <div className="space-y-3">
        {assignments.map((a) => (
          <div key={a.id} className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold">{a.title}</h3>
            <p className="text-sm text-gray-500">{a.description}</p>
            {a.due_at && <p className="text-xs text-gray-400 mt-1">Due: {new Date(a.due_at).toLocaleDateString()}</p>}
          </div>
        ))}
        {assignments.length === 0 && <p className="text-gray-400 text-center py-8">No assignments yet.</p>}
      </div>
    </div>
  );
}
