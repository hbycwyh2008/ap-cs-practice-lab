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

  const docs = [
    {
      title: "Teacher Navigation Map",
      path: "docs/TEACHER_NAVIGATION_MAP.md",
      note: "Role-aware routes and workflow map.",
    },
    {
      title: "Classroom Pilot Checklist",
      path: "docs/CLASSROOM_PILOT_CHECKLIST.md",
      note: "Before/during/after class operation checklist.",
    },
    {
      title: "Student Quickstart",
      path: "docs/STUDENT_QUICKSTART.md",
      note: "Student login and submission guide.",
    },
    {
      title: "Structured Question Import",
      path: "docs/STRUCTURED_QUESTION_IMPORT.md",
      note: "FRQ JSON import format and validation.",
    },
    {
      title: "Multiple Choice Import",
      path: "docs/MULTIPLE_CHOICE_IMPORT.md",
      note: "MCQ import format and answer visibility rules.",
    },
    {
      title: "AP CSA Knowledge Taxonomy",
      path: "docs/AP_CSA_KNOWLEDGE_TAXONOMY.md",
      note: "Unit/topic/skill/type taxonomy definitions.",
    },
    {
      title: "Content Safety Policy",
      path: "docs/CONTENT_SAFETY_AND_PUBLICATION_POLICY.md",
      note: "What can and cannot be committed publicly.",
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
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Core Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {docs.map((doc) => (
            <div
              key={doc.path}
              className="rounded border p-3"
            >
              <div>
                <p className="font-medium text-sm">{doc.title}</p>
                <p className="text-xs text-muted-foreground">{doc.note}</p>
                <p className="text-xs font-mono mt-1">{doc.path}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
