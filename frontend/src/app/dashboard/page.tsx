"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api, DashboardStats, TeacherAnalytics } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/status-badge";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<TeacherAnalytics | null>(null);

  useEffect(() => {
    if (!user) return;
    api.getDashboard().then(setStats).catch(console.error);
    if (user.role === "teacher") {
      api.getAnalytics().then(setAnalytics).catch(console.error);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <Alert>
          <AlertDescription>
            Please{" "}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              login
            </Link>{" "}
            to view your dashboard
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-8">
      <PageHeader
        title="Dashboard"
        description={
          user.role === "teacher"
            ? "Monitor AP CSA practice activity, completion rates, and student progress"
            : "View your assignments and track your progress"
        }
        badge={user.role === "teacher" ? "Teacher" : "Student"}
        action={
          <Button variant="outline" asChild>
            <Link href="/beta-notice">Beta Notice</Link>
          </Button>
        }
      />

      {user.role === "teacher" && stats && (
        <>
          {/* Beta Demo Flow */}
          <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <AlertTitle className="text-lg font-semibold">
              Beta Demo Flow
            </AlertTitle>
            <AlertDescription className="mt-3 space-y-3">
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">1</Badge>
                  <span>Create or open a class</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">2</Badge>
                  <span>Bulk-create anonymized students</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">3</Badge>
                  <span>Create or auto-generate an assignment</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">4</Badge>
                  <span>Ask students to run public tests and submit final answers</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">5</Badge>
                  <span>Review analytics and export CSV</span>
                </li>
              </ol>
              <div className="flex gap-3 flex-wrap pt-2">
                <Button asChild>
                  <Link href="/teacher/classes">Manage Classes</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/teacher/assignments">Create Assignment</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/teacher/questions">Question Bank</Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              label="Classes"
              value={stats.class_count}
              description="Active teaching classes"
              href="/teacher/classes"
            />
            <StatCard
              label="Questions"
              value={stats.question_count}
              description="Questions in your bank"
              href="/teacher/questions"
            />
            <StatCard
              label="Assignments"
              value={stats.assignment_count}
              description="Published assignments"
              href="/teacher/assignments"
            />
          </div>

          {analytics && (
            <>
              {/* Assignment Completion */}
              {analytics.assignment_stats.length > 0 ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Assignment Completion Rates</CardTitle>
                        <CardDescription>
                          Track student progress across assignments
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const token =
                            typeof window !== "undefined"
                              ? localStorage.getItem("token")
                              : null;
                          if (token) {
                            fetch(
                              `${
                                process.env.NEXT_PUBLIC_API_URL ||
                                "http://localhost:8000"
                              }/analytics/export.csv`,
                              {
                                headers: { Authorization: `Bearer ${token}` },
                              }
                            )
                              .then((res) => res.blob())
                              .then((blob) => {
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = "analytics_export.csv";
                                a.click();
                              });
                          }
                        }}
                      >
                        Export CSV
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Assignment</TableHead>
                          <TableHead className="text-center">Total</TableHead>
                          <TableHead className="text-center">Attempted</TableHead>
                          <TableHead className="text-center">Completed</TableHead>
                          <TableHead className="text-center">Attempt %</TableHead>
                          <TableHead className="text-center">Complete %</TableHead>
                          <TableHead className="text-center">Not Completed</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analytics.assignment_stats.map((stat) => (
                          <TableRow key={stat.assignment_id}>
                            <TableCell className="font-medium">
                              <Link
                                href="/teacher/assignments"
                                className="text-primary hover:underline"
                              >
                                {stat.title}
                              </Link>
                            </TableCell>
                            <TableCell className="text-center">
                              {stat.total_students}
                            </TableCell>
                            <TableCell className="text-center">
                              {stat.attempted_students}
                            </TableCell>
                            <TableCell className="text-center">
                              {stat.completed_students}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={
                                  stat.attempt_rate >= 80
                                    ? "default"
                                    : stat.attempt_rate >= 50
                                    ? "outline"
                                    : "destructive"
                                }
                              >
                                {stat.attempt_rate}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={
                                  stat.completion_rate >= 80
                                    ? "default"
                                    : stat.completion_rate >= 50
                                    ? "outline"
                                    : "destructive"
                                }
                              >
                                {stat.completion_rate}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center text-sm">
                              {stat.not_completed_students.length === 0 ? (
                                <Badge variant="default">All completed</Badge>
                              ) : (
                                <span
                                  className="text-muted-foreground"
                                  title={stat.not_completed_students
                                    .map((s) => s.display_name)
                                    .join(", ")}
                                >
                                  {stat.not_completed_students
                                    .slice(0, 3)
                                    .map((s) => s.display_name)
                                    .join(", ")}
                                  {stat.not_completed_students.length > 3 &&
                                    ` +${
                                      stat.not_completed_students.length - 3
                                    } more`}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : null}

              {/* Question Performance */}
              {analytics.question_stats.length > 0 &&
              analytics.question_stats.some((q) => q.submission_count > 0) ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Question Performance</CardTitle>
                    <CardDescription>
                      Average scores and pass rates by question
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Question</TableHead>
                          <TableHead className="text-center">Unit</TableHead>
                          <TableHead className="text-center">Skill</TableHead>
                          <TableHead className="text-center">Submissions</TableHead>
                          <TableHead className="text-center">Avg Score</TableHead>
                          <TableHead className="text-center">Pass Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analytics.question_stats
                          .filter((q) => q.submission_count > 0)
                          .map((stat) => (
                            <TableRow key={stat.question_id}>
                              <TableCell className="font-medium">
                                {stat.title}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline">{stat.unit}</Badge>
                              </TableCell>
                              <TableCell className="text-center text-muted-foreground">
                                {stat.skill || "—"}
                              </TableCell>
                              <TableCell className="text-center">
                                {stat.submission_count}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge
                                  variant={
                                    stat.avg_score >= 80
                                      ? "default"
                                      : stat.avg_score >= 60
                                      ? "outline"
                                      : "destructive"
                                  }
                                >
                                  {stat.avg_score}%
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge
                                  variant={
                                    stat.pass_rate >= 80
                                      ? "default"
                                      : stat.pass_rate >= 50
                                      ? "outline"
                                      : "destructive"
                                  }
                                >
                                  {stat.pass_rate}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : null}

              {/* Skill Aggregation */}
              {analytics.skill_stats.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Performance by Skill</CardTitle>
                    <CardDescription>
                      Average scores grouped by skill category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {analytics.skill_stats.map((stat) => (
                        <Card key={stat.skill} className="border-2">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="font-semibold text-lg">
                                {stat.skill}
                              </h3>
                              <Badge variant="outline">
                                {stat.question_count} Q
                              </Badge>
                            </div>
                            <div className="text-3xl font-bold text-primary">
                              {stat.avg_score}%
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Average Score
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}

      {user.role === "student" && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            label="Assignments"
            value={stats.assignment_count}
            description="Available practice assignments"
            href="/student/assignments"
          />
          <StatCard
            label="Average Score"
            value={
              stats.average_score !== null ? `${stats.average_score}%` : "N/A"
            }
            description="Across all submissions"
          />
        </div>
      )}

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>
            Latest practice runs and final submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!stats || stats.recent_submissions.length === 0 ? (
            <EmptyState
              title="No submissions yet"
              description={
                user.role === "teacher"
                  ? "Student submissions will appear here once they start practicing"
                  : "Your submissions will appear here after you start practicing"
              }
            />
          ) : (
            <div className="space-y-3">
              {stats.recent_submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {sub.question_title || `Question #${sub.question_id}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {sub.student_name && `${sub.student_name} · `}
                      {new Date(sub.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {sub.score}/{sub.max_score}
                      </p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={sub.status} />
                      {sub.is_final ? (
                        <Badge variant="default">Final</Badge>
                      ) : (
                        <Badge variant="outline">Practice</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
