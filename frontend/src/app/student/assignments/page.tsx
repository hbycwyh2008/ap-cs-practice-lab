"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, Assignment } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileCheck,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

export default function StudentAssignmentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "student")) {
      router.push("/dashboard");
    }
    if (user && user.role === "student") {
      api
        .getStudentAssignments()
        .then(setAssignments)
        .finally(() => setLoadingData(false));
    }
  }, [user, loading, router]);

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading assignments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <PageHeader
            title="My Assignments"
            description="Practice AP CSA Free Response Questions"
            icon={FileCheck}
          />

          {assignments.length === 0 ? (
            <EmptyState
              icon={FileCheck}
              title="No assignments yet"
              description="Your teacher will assign practice problems soon. Check back later!"
              action={
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {assignments.map((a) => {
                const completed =
                  a.questions?.filter((q) => q.score !== null).length || 0;
                const total = a.questions?.length || 0;
                const completionRate = total > 0 ? (completed / total) * 100 : 0;
                const isOverdue = new Date(a.due_at) < new Date();
                const isComplete = completionRate === 100;

                return (
                  <Card
                    key={a.id}
                    className="border-2 shadow-lg hover:shadow-xl transition-all group"
                  >
                    <CardHeader className="bg-gradient-to-br from-slate-50 to-blue-50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-2xl group-hover:text-blue-600 transition-colors">
                              {a.title}
                            </CardTitle>
                            {isComplete && (
                              <Badge className="bg-green-600">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Complete
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="text-base">
                            {a.description || "Click to view questions and start practicing"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            {isComplete ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : isOverdue ? (
                              <AlertCircle className="w-5 h-5 text-red-600" />
                            ) : (
                              <Clock className="w-5 h-5 text-amber-600" />
                            )}
                            <span className="text-lg font-semibold text-slate-700">
                              {completed}/{total} completed
                            </span>
                          </div>
                          <Badge
                            variant={isOverdue ? "destructive" : "secondary"}
                            className="text-sm"
                          >
                            Due {new Date(a.due_at).toLocaleDateString()}
                          </Badge>
                        </div>
                        <Button asChild className="w-full sm:w-auto group">
                          <Link href={`/student/assignments/${a.id}`}>
                            {isComplete ? "Review" : "Start Practice"}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </div>
                      {total > 0 && (
                        <div className="mt-4">
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                completionRate === 100
                                  ? "bg-green-600"
                                  : "bg-blue-600"
                              }`}
                              style={{ width: `${completionRate}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
  );
}
