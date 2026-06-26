"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, Assignment } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { FileCheck, Plus } from "lucide-react";

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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <PageHeader
        title="Assignments"
        description="Teacher / Assignments"
        action={
          <Button asChild>
            <Link href="/teacher/assignments/new">
              <Plus className="w-4 h-4 mr-2" />
              New Assignment
            </Link>
          </Button>
        }
      />
      {assignments.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="No assignments yet"
          description="Create your first assignment to start classroom practice."
          action={
            <Button asChild>
              <Link href="/teacher/assignments/new">Create Assignment</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <Card key={a.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{a.title}</h3>
                    <p className="text-sm text-gray-500">{a.description || "No description"}</p>
                    <p className="text-xs text-gray-400">
                      Due: {a.due_at ? new Date(a.due_at).toLocaleDateString() : "No due date"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/teacher/submissions">View Submissions</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
