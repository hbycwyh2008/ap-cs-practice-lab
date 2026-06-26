"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, Question } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Archive, ArchiveRestore, Upload } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

export default function TeacherQuestionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [busy, setBusy] = useState<number | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const refresh = () => {
    if (user?.role === "teacher") {
      api.getQuestions().then(setQuestions).catch(console.error).finally(() => setLoadingData(false));
    }
  };

  useEffect(() => {
    if (!loading && (!user || user.role !== "teacher")) {
      router.push("/dashboard");
    }
    if (user && user.role === "teacher") {
      refresh();
    }
  }, [user, loading, router]);

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

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading questions...</p>
      </div>
    );
  }

  const activeQuestions = questions.filter((q) => q.is_active !== false);
  const archivedQuestions = questions.filter((q) => q.is_active === false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PageHeader
          title="Question Bank"
          description="Manage your AP CSA Free Response Questions"
          icon={BookOpen}
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href="/teacher/questions/import">
                  <Upload className="w-4 h-4 mr-2" />
                  Import FRQ Questions
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/teacher/questions/import-mcq">
                  <Upload className="w-4 h-4 mr-2" />
                  Import MCQ Questions
                </Link>
              </Button>
              <Button asChild>
                <Link href="/teacher/questions/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Question
                </Link>
              </Button>
            </div>
          }
        />

        {questions.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No questions yet"
            description="Create your first AP CSA question to start building assignments"
            action={
              <Button asChild>
                <Link href="/teacher/questions/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Question
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-6">
            {activeQuestions.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">Active Questions</h2>
                <div className="space-y-3">
                  {activeQuestions.map((q) => (
                    <Card key={q.id} className="border-2 hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <Link href={`/teacher/questions/${q.id}`} className="flex-1">
                            <CardTitle className="text-lg hover:text-blue-600 transition-colors">
                              {q.title}
                            </CardTitle>
                            <CardDescription className="mt-2">
                              {q.unit} · {q.topic} · {q.estimated_minutes} min · {q.max_points} pts
                            </CardDescription>
                          </Link>
                          <div className="flex items-center gap-2">
                            <Badge variant={q.difficulty === "easy" ? "default" : q.difficulty === "medium" ? "secondary" : "destructive"}>
                              {q.difficulty}
                            </Badge>
                            <Button variant="outline" size="sm" onClick={(e) => handleArchive(e, q.id)} disabled={busy === q.id}>
                              <Archive className="w-4 h-4 mr-1" />
                              Archive
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {archivedQuestions.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">Archived Questions</h2>
                <div className="space-y-3">
                  {archivedQuestions.map((q) => (
                    <Card key={q.id} className="border-2 border-dashed opacity-75">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <Link href={`/teacher/questions/${q.id}`} className="flex-1">
                            <CardTitle className="text-lg text-slate-500">
                              {q.title}
                            </CardTitle>
                            <CardDescription className="mt-2">
                              {q.unit} · {q.topic} · {q.estimated_minutes} min · {q.max_points} pts
                            </CardDescription>
                          </Link>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{q.difficulty}</Badge>
                            <Button variant="secondary" size="sm" onClick={(e) => handleRestore(e, q.id)} disabled={busy === q.id}>
                              <ArchiveRestore className="w-4 h-4 mr-1" />
                              Restore
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
