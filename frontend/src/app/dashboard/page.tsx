"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, SchoolClass, Assignment, TeacherAnalytics, DashboardStats } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Users,
  BookOpen,
  FileCheck,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Download,
} from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [analytics, setAnalytics] = useState<TeacherAnalytics | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const handleExportCSV = async () => {
    try {
      const blob = await api.exportAnalyticsCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("CSV export failed:", error);
      alert("Failed to export CSV");
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (user && user.role === "teacher") {
      Promise.all([
        api.getClasses(),
        api.getAssignments(),
        api.getDashboard(),
        api.getAnalytics()
      ])
        .then(([c, a, ds, an]) => {
          setClasses(c);
          setAssignments(a);
          setDashboardStats(ds);
          setAnalytics(an);
        })
        .finally(() => setLoadingData(false));
    } else if (user && user.role === "student") {
      api.getAssignments()
        .then((a) => {
          setAssignments(a);
        })
        .finally(() => setLoadingData(false));
    }
  }, [user, loading, router]);

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  const isTeacher = user.role === "teacher";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold text-slate-900">
                  {isTeacher ? "Teacher Dashboard" : "Student Dashboard"}
                </h1>
                <Badge className="bg-blue-600">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Beta
                </Badge>
              </div>
              <p className="text-lg text-slate-600">
                Welcome back, <span className="font-semibold">{user.email}</span>
              </p>
            </div>
            {isTeacher && (
              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <Link href="/teacher/questions">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Questions
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/teacher/assignments/new">
                    <FileCheck className="w-4 h-4 mr-2" />
                    New Assignment
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Teacher Dashboard */}
          {isTeacher && (
            <>
              {/* Stat Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-2 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-blue-700">
                        Total Classes
                      </CardTitle>
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-blue-900">
                      {dashboardStats?.class_count ?? classes.length}
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      {classes.reduce((sum, c) => sum + (c.student_count || 0), 0)}{" "}
                      students enrolled
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-green-700">
                        Active Assignments
                      </CardTitle>
                      <FileCheck className="w-5 h-5 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-green-900">
                      {dashboardStats?.assignment_count ?? assignments.length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-purple-700">
                        Platform Status
                      </CardTitle>
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-purple-600" />
                      <span className="text-2xl font-bold text-purple-900">
                        All Systems Go
                      </span>
                    </div>
                    <p className="text-xs text-purple-600 mt-2">
                      Auto-grading active
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Beta Demo Flow Card */}
              <Card className="border-2 shadow-xl bg-gradient-to-br from-amber-50 to-amber-100">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-amber-600" />
                    <CardTitle className="text-xl">Beta Demo Quick Start</CardTitle>
                  </div>
                  <CardDescription className="text-amber-700">
                    Follow these steps to explore the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        num: 1,
                        title: "View Classes",
                        desc: "Check your existing classes",
                        href: "/teacher/classes",
                      },
                      {
                        num: 2,
                        title: "Browse Questions",
                        desc: "Explore the question bank",
                        href: "/teacher/questions",
                      },
                      {
                        num: 3,
                        title: "Create Assignment",
                        desc: "Auto-generate or manual",
                        href: "/teacher/assignments/new",
                      },
                      {
                        num: 4,
                        title: "View Submissions",
                        desc: "Track student progress",
                        href: "/teacher/submissions",
                      },
                    ].map((step) => (
                      <Link
                        key={step.num}
                        href={step.href}
                        className="block p-4 bg-white rounded-lg border-2 border-amber-200 hover:border-amber-400 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold">
                            {step.num}
                          </div>
                          <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-1">
                          {step.title}
                        </h3>
                        <p className="text-xs text-slate-600">{step.desc}</p>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Classes and Assignments Grid */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Classes List */}
                <Card className="border-2 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <CardTitle>Your Classes</CardTitle>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/teacher/classes">View All</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {classes.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>No classes yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {classes.slice(0, 5).map((c) => (
                          <Link
                            key={c.id}
                            href={`/teacher/classes/${c.id}`}
                            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border transition-colors group"
                          >
                            <div>
                              <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">
                                {c.name}
                              </h3>
                              <p className="text-sm text-slate-500">
                                {c.student_count || 0} students
                              </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Assignments */}
                <Card className="border-2 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-green-600" />
                        <CardTitle>Recent Assignments</CardTitle>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/teacher/assignments">View All</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {assignments.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <FileCheck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>No assignments yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {assignments.slice(0, 5).map((a) => (
                          <Link
                            key={a.id}
                            href={`/teacher/assignments/${a.id}`}
                            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border transition-colors group"
                          >
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900 group-hover:text-green-600">
                                {a.title}
                              </h3>
                              <p className="text-sm text-slate-500">
                                Due {a.due_at ? new Date(a.due_at).toLocaleDateString() : "No due date"}
                              </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Analytics Section */}
              {analytics && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-indigo-600" />
                      <h2 className="text-2xl font-bold text-slate-900">
                        Teacher Analytics
                      </h2>
                    </div>
                    <Button onClick={handleExportCSV} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>

                  {/* Assignment Completion Stats */}
                  <Card className="border-2 shadow-lg">
                    <CardHeader>
                      <CardTitle>Assignment Completion</CardTitle>
                      <CardDescription>
                        Track completion rates across assignments
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {analytics.assignment_stats.length === 0 ? (
                        <p className="text-slate-500 text-center py-4">
                          No assignment data yet
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Assignment</TableHead>
                              <TableHead>Enrolled</TableHead>
                              <TableHead>Completed</TableHead>
                              <TableHead>Rate</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {analytics.assignment_stats.map((stat) => (
                              <TableRow key={stat.assignment_id}>
                                <TableCell className="font-medium">
                                  {stat.title}
                                </TableCell>
                                <TableCell>{stat.total_students}</TableCell>
                                <TableCell>{stat.completed_students}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      stat.completion_rate >= 80
                                        ? "default"
                                        : stat.completion_rate >= 50
                                        ? "secondary"
                                        : "destructive"
                                    }
                                  >
                                    {stat.completion_rate}%
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>

                  {/* Question Performance Stats */}
                  <Card className="border-2 shadow-lg">
                    <CardHeader>
                      <CardTitle>Question Performance</CardTitle>
                      <CardDescription>
                        View which questions students find most challenging
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {analytics.question_stats.length === 0 ? (
                        <p className="text-slate-500 text-center py-4">
                          No question data yet
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Question</TableHead>
                              <TableHead>Attempts</TableHead>
                              <TableHead>Pass Rate</TableHead>
                              <TableHead>Avg Score</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {analytics.question_stats.map((stat) => (
                              <TableRow key={stat.question_id}>
                                <TableCell className="font-medium">
                                  {stat.title}
                                </TableCell>
                                <TableCell>{stat.submission_count}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      stat.pass_rate >= 70
                                        ? "default"
                                        : stat.pass_rate >= 40
                                        ? "secondary"
                                        : "destructive"
                                    }
                                  >
                                    {stat.pass_rate}%
                                  </Badge>
                                </TableCell>
                                <TableCell>{stat.avg_score}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>

                  {/* Skill Performance Stats */}
                  <Card className="border-2 shadow-lg">
                    <CardHeader>
                      <CardTitle>Skill Performance</CardTitle>
                      <CardDescription>
                        Identify which AP CSA skills need more practice
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {analytics.skill_stats.length === 0 ? (
                        <p className="text-slate-500 text-center py-4">
                          No skill data yet
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Skill</TableHead>
                              <TableHead>Questions</TableHead>
                              <TableHead>Avg Score</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {analytics.skill_stats.map((stat) => (
                              <TableRow key={stat.skill}>
                                <TableCell className="font-medium">
                                  {stat.skill}
                                </TableCell>
                                <TableCell>{stat.question_count}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      stat.avg_score >= 70
                                        ? "default"
                                        : stat.avg_score >= 40
                                        ? "secondary"
                                        : "destructive"
                                    }
                                  >
                                    {stat.avg_score}%
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}

          {/* Student Dashboard */}
          {!isTeacher && (
            <>
              {/* Student Stats */}
              <div className="grid sm:grid-cols-2 gap-6">
                <Card className="border-2 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-green-700">
                        My Assignments
                      </CardTitle>
                      <FileCheck className="w-5 h-5 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-green-900">
                      {assignments.length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-blue-700">
                        Assignments
                      </CardTitle>
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-blue-900">
                      {assignments.length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Assignments List */}
              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-green-600" />
                    <CardTitle>Your Assignments</CardTitle>
                  </div>
                  <CardDescription>
                    Click on an assignment to start practicing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {assignments.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <FileCheck className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                      <p className="text-lg font-medium">No assignments yet</p>
                      <p className="text-sm">
                        Your teacher will assign practice problems soon
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {assignments.map((a) => {
                        const isOverdue = a.due_at ? new Date(a.due_at) < new Date() : false;

                        return (
                          <Link
                            key={a.id}
                            href={`/student/assignments/${a.id}`}
                            className="block p-6 bg-slate-50 hover:bg-slate-100 rounded-lg border-2 hover:border-blue-300 transition-all group"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600">
                                  {a.title}
                                </h3>
                              </div>
                              <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge variant={isOverdue ? "destructive" : "secondary"}>
                                Due {a.due_at ? new Date(a.due_at).toLocaleDateString() : "No due date"}
                              </Badge>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Beta Notice for All */}
          <Alert className="bg-blue-50 border-blue-200">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-900 font-semibold">
              Beta Platform Notice
            </AlertTitle>
            <AlertDescription className="text-blue-800">
              This is a beta product for evaluation purposes. Use demo accounts
              only. See{" "}
              <Link
                href="/beta-notice"
                className="underline font-semibold hover:text-blue-900"
              >
                Beta Notice
              </Link>{" "}
              for full details.
            </AlertDescription>
          </Alert>
        </div>
      </div>
  );
}
