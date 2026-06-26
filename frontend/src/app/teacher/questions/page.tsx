"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, Question } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookOpen,
  Plus,
  Archive,
  ArchiveRestore,
  Clock,
  Award,
  Tag,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";

export default function TeacherQuestionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [busy, setBusy] = useState<number | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const refresh = () => {
    if (user?.role === "teacher") {
      api
        .getQuestions()
        .then(setQuestions)
        .catch(console.error)
        .finally(() => setLoadingData(false));
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
    if (
      !confirm("Archive this question? It will be hidden from new assignments.")
    )
      return;
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
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </>
    );
  }

  const activeQuestions = questions.filter((q) => q.is_active !== false);
  const archivedQuestions = questions.filter((q) => q.is_active === false);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <PageHeader
            title="Question Bank"
            description="Manage your AP CSA Free Response Questions"
            icon={BookOpen}
            action={
              <Button asChild>
                <Link href="/teacher/questions/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Question
                </Link>
              </Button>
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
            <>
              {/* Stats Overview */}
              <div className="grid sm:grid-cols-4 gap-6">
                <Card className="border-2 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-blue-700">
                      Total Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-blue-900">
                      {questions.length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-green-700">
                      Active
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-green-900">
                      {activeQuestions.length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-amber-700">
                      Archived
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-amber-900">
                      {archivedQuestions.length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-purple-700">
                      Total Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-purple-900">
                      {questions.reduce((sum, q) => sum + (q.max_points || 0), 0)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Active Questions */}
              {activeQuestions.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-green-600" />
                    Active Questions
                  </h2>
                  <div className="grid gap-4">
                    {activeQuestions.map((q) => (
                      <Card
                        key={q.id}
                        className="border-2 shadow-md hover:shadow-lg transition-shadow"
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between gap-4">
                            <Link
                              href={`/teacher/questions/${q.id}`}
                              className="flex-1 group"
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                                  {q.title}
                                </CardTitle>
                                <StatusBadge status="active" />
                              </div>
                              <CardDescription className="flex flex-wrap items-center gap-3 text-sm">
                                <span className="flex items-center gap-1">
                                  <Tag className="w-3 h-3" />
                                  {q.unit}
                                </span>
                                <span>•</span>
                                <span>{q.topic}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                 
