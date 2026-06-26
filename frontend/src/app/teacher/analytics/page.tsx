"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, TeacherAnalytics } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeacherAnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<TeacherAnalytics | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== "teacher")) {
      router.push("/dashboard");
      return;
    }
    if (user?.role === "teacher") {
      api.getAnalytics().then(setAnalytics).catch(console.error);
    }
  }, [loading, router, user]);

  const handleExportCSV = async () => {
    const blob = await api.exportAnalyticsCSV();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user || user.role !== "teacher") return <div className="p-8">Access denied</div>;

  return (
    <div className="container max-w-5xl mx-auto p-6 space-y-6">
      <PageHeader
        title="Analytics"
        description="Teacher / Analytics"
        action={
          <Button onClick={handleExportCSV} variant="outline">
            Export CSV
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Analytics overview</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-3">
          <div className="rounded border p-3">
            <p className="text-xs text-muted-foreground">Assignment stats</p>
            <p className="text-2xl font-semibold">{analytics?.assignment_stats.length ?? 0}</p>
          </div>
          <div className="rounded border p-3">
            <p className="text-xs text-muted-foreground">Question stats</p>
            <p className="text-2xl font-semibold">{analytics?.question_stats.length ?? 0}</p>
          </div>
          <div className="rounded border p-3">
            <p className="text-xs text-muted-foreground">Skill stats</p>
            <p className="text-2xl font-semibold">{analytics?.skill_stats.length ?? 0}</p>
          </div>
        </CardContent>
      </Card>
      <Button asChild variant="outline">
        <Link href="/dashboard#analytics">Back to Dashboard Analytics</Link>
      </Button>
    </div>
  );
}
