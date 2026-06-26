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
  const [filters, setFilters] = useState({
    unit: "all",
    topic: "all",
    skill: "all",
    type: "all",
    difficulty: "all",
    practice_type: "all",
    frq_type: "all",
    error_pattern: "all",
    visibility: "all",
  });

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

  const options = {
    units: Array.from(new Set(questions.map((q) => q.unit))).sort(),
    topics: Array.from(new Set(questions.map((q) => q.topic))).sort(),
    skills: Array.from(
      new Set(questions.map((q) => q.skill).filter(Boolean))
    ).sort() as string[],
    types: Array.from(new Set(questions.map((q) => q.type))).sort(),
    difficulties: Array.from(new Set(questions.map((q) => q.difficulty))).sort(),
    practiceTypes: Array.from(
      new Set(questions.map((q) => q.practice_type).filter(Boolean))
    ).sort() as string[],
    frqTypes: Array.from(
      new Set(questions.map((q) => q.frq_type).filter(Boolean))
    ).sort() as string[],
    errorPatterns: Array.from(
      new Set(questions.map((q) => q.error_pattern).filter(Boolean))
    ).sort() as string[],
    visibilityTypes: Array.from(
      new Set(questions.map((q) => q.visibility).filter(Boolean))
    ).sort() as string[],
  };

  const filteredQuestions = questions.filter((q) => {
    if (filters.unit !== "all" && q.unit !== filters.unit) return false;
    if (filters.topic !== "all" && q.topic !== filters.topic) return false;
    if (filters.skill !== "all" && q.skill !== filters.skill) return false;
    if (filters.type !== "all" && q.type !== filters.type) return false;
    if (filters.difficulty !== "all" && q.difficulty !== filters.difficulty) {
      return false;
    }
    if (
      filters.practice_type !== "all" &&
      (q.practice_type || "none") !== filters.practice_type
    ) {
      return false;
    }
    if (filters.frq_type !== "all" && (q.frq_type || "none") !== filters.frq_type) {
      return false;
    }
    if (
      filters.error_pattern !== "all" &&
      (q.error_pattern || "none") !== filters.error_pattern
    ) {
      return false;
    }
    if (
      filters.visibility !== "all" &&
      (q.visibility || "none") !== filters.visibility
    ) {
      return false;
    }
    return true;
  });

  const activeQuestions = filteredQuestions.filter((q) => q.is_active !== false);
  const archivedQuestions = filteredQuestions.filter((q) => q.is_active === false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PageHeader
          title="Question Bank"
          description="Teacher / Question Bank"
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
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Point Filters</CardTitle>
                <CardDescription>
                  Filter by unit/topic/skill/type/difficulty and optional taxonomy
                  tags.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <FilterSelect
                  label="Unit"
                  value={filters.unit}
                  options={options.units}
                  onChange={(value) => setFilters((prev) => ({ ...prev, unit: value }))}
                />
                <FilterSelect
                  label="Topic"
                  value={filters.topic}
                  options={options.topics}
                  onChange={(value) => setFilters((prev) => ({ ...prev, topic: value }))}
                />
                <FilterSelect
                  label="Skill"
                  value={filters.skill}
                  options={options.skills}
                  onChange={(value) => setFilters((prev) => ({ ...prev, skill: value }))}
                />
                <FilterSelect
                  label="Question Type"
                  value={filters.type}
                  options={options.types}
                  onChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}
                />
                <FilterSelect
                  label="Difficulty"
                  value={filters.difficulty}
                  options={options.difficulties}
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, difficulty: value }))
                  }
                />
                <FilterSelect
                  label="Practice Type"
                  value={filters.practice_type}
                  options={options.practiceTypes}
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, practice_type: value }))
                  }
                />
                <FilterSelect
                  label="FRQ Type"
                  value={filters.frq_type}
                  options={options.frqTypes}
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, frq_type: value }))
                  }
                />
                <FilterSelect
                  label="Error Pattern"
                  value={filters.error_pattern}
                  options={options.errorPatterns}
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, error_pattern: value }))
                  }
                />
                <FilterSelect
                  label="Visibility"
                  value={filters.visibility}
                  options={options.visibilityTypes}
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, visibility: value }))
                  }
                />
              </CardContent>
            </Card>

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
                            <div className="mt-3 flex flex-wrap gap-2">
                              {q.skill ? <Badge variant="outline">{q.skill}</Badge> : null}
                              <Badge variant="outline">{q.type}</Badge>
                              {q.practice_type ? (
                                <Badge variant="outline">{q.practice_type}</Badge>
                              ) : null}
                              {q.visibility ? (
                                <Badge variant="outline">{q.visibility}</Badge>
                              ) : null}
                            </div>
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
                            <div className="mt-3 flex flex-wrap gap-2">
                              {q.skill ? <Badge variant="outline">{q.skill}</Badge> : null}
                              <Badge variant="outline">{q.type}</Badge>
                              {q.practice_type ? (
                                <Badge variant="outline">{q.practice_type}</Badge>
                              ) : null}
                              {q.visibility ? (
                                <Badge variant="outline">{q.visibility}</Badge>
                              ) : null}
                            </div>
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

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
      >
        <option value="all">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
