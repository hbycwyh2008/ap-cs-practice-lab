"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, Assignment } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function StudentAssignmentsPage() {
  const { user, loading } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    if (user?.role === "student") {
      api.getAssignments().then(setAssignments).catch(console.error);
    }
  }, [user]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user || user.role !== "student") return <div className="p-8">Access denied</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Assignments</h1>
      <div className="space-y-3">
        {assignments.map((a) => (
          <Link key={a.id} href={`/student/assignments/${a.id}`} className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition">
            <h3 className="font-semibold">{a.title}</h3>
            <p className="text-sm text-gray-500">{a.description}</p>
            {a.due_at && <p className="text-xs text-orange-500 mt-1">Due: {new Date(a.due_at).toLocaleDateString()}</p>}
          </Link>
        ))}
        {assignments.length === 0 && <p className="text-gray-400 text-center py-8">No assignments yet.</p>}
      </div>
    </div>
  );
}
