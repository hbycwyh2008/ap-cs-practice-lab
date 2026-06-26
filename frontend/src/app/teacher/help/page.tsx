"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeacherHelpPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "teacher")) {
      router.push("/dashboard");
    }
  }, [loading, router, user]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user || user.role !== "teacher") return <div className="p-8">Access denied</div>;

  const workflows = [
    {
      title: "Class setup workflow",
      steps: [
        { href: "/teacher/classes/new", text: "Create class" },
        { href: "/teacher/classes", text: "Open class and bulk create students" },
        { href: "/teacher/classes", text: "Export student list CSV" },
      ],
    },
    {
      title: "Question and assignment workflow",
      steps: [
        { href: "/teacher/questions/import", text: "Import FRQ questions" },
        { href: "/teacher/questions/import-mcq", text: "Import MCQ questions" },
        { href: "/teacher/assignments/new", text: "Create assignment" },
      ],
    },
    {
      title: "Review workflow",
      steps: [
        { href: "/teacher/submissions", text: "View submissions" },
        { href: "/teacher/analytics", text: "Open analytics" },
      ],
    },
  ];

  return (
    <div className="container max-w-5xl mx-auto p-6 space-y-6">
      <PageHeader
        title="Help & Docs"
        description="Teacher / Help / Docs"
      />
      <div className="grid gap-4 md:grid-cols-2">
        {workflows.map((workflow) => (
          <Card key={workflow.title}>
            <CardHeader>
              <CardTitle className="text-lg">{workflow.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {workflow.steps.map((step) => (
                <Link
                  key={`${workflow.title}-${step.href}-${step.text}`}
                  href={step.href}
                  className="block rounded border p-3 text-sm hover:bg-slate-50"
                >
                  {step.text}
                </Link>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Navigation map</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          See `docs/TEACHER_NAVIGATION_MAP.md` for the full route map and role boundaries.
        </CardContent>
      </Card>
    </div>
  );
}
