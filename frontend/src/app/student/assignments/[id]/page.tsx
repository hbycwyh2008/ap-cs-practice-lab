"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, AssignmentDetail } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function StudentAssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);

  useEffect(() => {
    if (id && user?.role === "student") {
      api.getAssignment(Number(id)).then(setAssignment).catch(console.error);
    }
  }, [id, user]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user || user.role !== "student") return <div className="p-8">Access denied</div>;
  if (!assignment) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{assignment.title}</h1>
      <p className="text-gray-500 mb-6">{assignment.description}</p>

      <h2 className="text-lg font-semibold mb-4">Questions</h2>
      <div className="space-y-3">
        {assignment.questions.map((aq) => (
          <Link
            key={aq.id}
            href={`/student/questions/${aq.question_id}?assignmentId=${assignment.id}`}
            className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition"
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{aq.question?.title || `Question #${aq.question_id}`}</h3>
                <p className="text-sm text-gray-500">{aq.question?.unit} · {aq.question?.difficulty}</p>
              </div>
              <span className="text-sm text-gray-500">{aq.points} pts</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
