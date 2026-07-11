"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, Assignment } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileCheck,
  ArrowRight,
  Clock,
  AlertCircle,
  ListChecks,
} from "lucide-react";

function formatDueDate(dueAt: string | null) {
  if (!dueAt) {
    return "No due date";
  }

  return `Due ${new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dueAt))}`;
}

function isAssignmentOverdue(assignment: Assignment) {
  return assignment.due_at ? new Date(assignment.due_at) < new Date() : false;
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-blue-200/70 bg-gradient-to-r from-blue-900 to-blue-600 p-6 shadow-xl shadow-blue-900/10 sm:p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-9 w-72 rounded-lg bg-white/30" />
            <div className="h-5 w-full max-w-xl rounded-lg bg-white/20" />
            <div className="h-20 w-full max-w-sm rounded-2xl bg-white/15 sm:ml-auto" />
          </div>
        </section>

        <section className="mt-6 space-y-4" aria-label="Loading assignments">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-lg shadow-slate-900/5 sm:p-6"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-200" />
                  <div className="flex-1 space-y-4">
                    <div className="h-7 w-72 max-w-full rounded-lg bg-slate-200" />
                    <div className="h-4 w-full max-w-lg rounded-lg bg-slate-200" />
                    <div className="flex flex-wrap gap-3">
                      <div className="h-7 w-28 rounded-full bg-slate-200" />
                      <div className="h-7 w-32 rounded-full bg-slate-200" />
                      <div className="h-7 w-24 rounded-full bg-slate-200" />
                    </div>
                  </div>
                </div>
                <div className="h-11 w-full rounded-xl bg-blue-100 sm:w-44" />
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

interface AssignmentCardProps {
  assignment: Assignment;
}

function AssignmentCard({ assignment }: AssignmentCardProps) {
  const overdue = isAssignmentOverdue(assignment);
  const questionCount = assignment.question_count ?? 0;
  const dueLabel = formatDueDate(assignment.due_at);
  const statusLabel = overdue ? "Overdue" : assignment.due_at ? "Upcoming" : "Open ended";

  return (
    <article
      className={`group overflow-hidden rounded-2xl border bg-white/95 shadow-lg shadow-slate-900/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-900/10 ${
        overdue ? "border-red-200" : "border-slate-200/80 hover:border-blue-200"
      }`}
    >
      <div
        className={`h-1.5 w-full ${
          overdue
            ? "bg-gradient-to-r from-red-500 to-amber-400"
            : "bg-gradient-to-r from-blue-500 to-indigo-500"
        }`}
      />
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 flex-1 gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
              overdue
                ? "border-red-100 bg-red-50 text-red-600"
                : "border-blue-100 bg-blue-50 text-blue-700"
            }`}
            aria-hidden="true"
          >
            <FileCheck className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950 transition-colors group-hover:text-blue-700 sm:text-2xl">
                {assignment.title}
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                {assignment.description || "Open this assignment to view the assigned practice questions."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-sm">
              <Badge
                variant="secondary"
                className={`gap-1.5 rounded-full border px-3 py-1 font-medium ${
                  overdue
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-blue-100 bg-blue-50 text-blue-700"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                {dueLabel}
              </Badge>
              <Badge
                variant="secondary"
                className="gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-medium text-slate-700"
              >
                <ListChecks className="h-3.5 w-3.5 text-blue-600" />
                {questionCount} question{questionCount === 1 ? "" : "s"}
              </Badge>
              <Badge
                variant={overdue ? "destructive" : "secondary"}
                className={`rounded-full px-3 py-1 font-medium ${
                  overdue
                    ? "bg-red-600 text-white"
                    : assignment.due_at
                      ? "border border-blue-100 bg-blue-50 text-blue-700"
                      : "border border-emerald-100 bg-emerald-50 text-emerald-700"
                }`}
              >
                {statusLabel}
              </Badge>
            </div>
          </div>
        </div>

        <Button
          asChild
          className="h-11 w-full shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 px-5 font-semibold shadow-lg shadow-blue-700/20 transition-all hover:from-blue-700 hover:to-blue-900 sm:w-auto sm:min-w-[172px]"
        >
          <Link href={`/student/assignments/${assignment.id}`}>
            Start Practice
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

interface EmptyPanelProps {
  type: "empty" | "error";
  title: string;
  description: string;
  onRetry?: () => void;
}

function StatePanel({ type, title, description, onRetry }: EmptyPanelProps) {
  const isError = type === "error";

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 text-center shadow-xl shadow-slate-900/5 sm:p-12">
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border ${
          isError
            ? "border-red-100 bg-red-50 text-red-600"
            : "border-blue-100 bg-blue-50 text-blue-700"
        }`}
        aria-hidden="true"
      >
        {isError ? <AlertCircle className="h-8 w-8" /> : <FileCheck className="h-8 w-8" />}
      </div>
      <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600 sm:text-base">
        {description}
      </p>
      <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {isError && onRetry ? (
          <Button
            onClick={onRetry}
            className="h-11 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 px-6 font-semibold shadow-lg shadow-blue-700/20 sm:w-auto"
          >
            Retry
          </Button>
        ) : null}
        <Button
          variant="outline"
          asChild
          className="h-11 w-full rounded-xl border-slate-200 bg-white px-6 font-semibold text-slate-700 sm:w-auto"
        >
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </section>
  );
}

export default function StudentAssignmentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadAssignments = useCallback(async () => {
    setLoadingData(true);
    setLoadError("");
    try {
      const data = await api.getAssignments();
      setAssignments(data);
    } catch (error) {
      console.error("Failed to load assignments:", error);
      setLoadError("Unable to load assignments right now. Please try again.");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && (!user || user.role !== "student")) {
      router.push("/dashboard");
    }
    if (user && user.role === "student") {
      loadAssignments();
    }
  }, [user, loading, router, loadAssignments]);

  const summary = useMemo(() => {
    const overdueCount = assignments.filter(isAssignmentOverdue).length;
    const questionCount = assignments.reduce(
      (total, assignment) => total + (assignment.question_count ?? 0),
      0,
    );

    return {
      totalAssignments: assignments.length,
      overdueCount,
      questionCount,
    };
  }, [assignments]);

  if (loading || loadingData) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-blue-200/70 bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 p-6 text-white shadow-xl shadow-blue-900/10 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
                Student Practice
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                My Assignments
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">
                Clear daily practice flow. Choose one assignment card and start immediately.
              </p>
            </div>

            <div className="rounded-2xl border border-white/25 bg-white/15 p-5 shadow-inner shadow-white/10 backdrop-blur-sm lg:min-w-[330px]">
              <p className="text-sm font-semibold text-white">Today Snapshot</p>
              <dl className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-white/10 p-3">
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-blue-100">
                    Sets
                  </dt>
                  <dd className="mt-1 text-2xl font-bold text-white">{summary.totalAssignments}</dd>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-blue-100">
                    Questions
                  </dt>
                  <dd className="mt-1 text-2xl font-bold text-white">{summary.questionCount}</dd>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-blue-100">
                    Overdue
                  </dt>
                  <dd className="mt-1 text-2xl font-bold text-white">{summary.overdueCount}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="mt-6" aria-live="polite">
          {loadError ? (
            <StatePanel
              type="error"
              title="Couldn't load assignments"
              description={loadError}
              onRetry={loadAssignments}
            />
          ) : assignments.length === 0 ? (
            <StatePanel
              type="empty"
              title="No assignments yet"
              description="Your teacher has not assigned practice yet. Check back after class instructions."
            />
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
