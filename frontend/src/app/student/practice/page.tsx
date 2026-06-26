"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

export default function StudentPracticePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "student")) {
      router.push("/dashboard");
    }
  }, [loading, router, user]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user || user.role !== "student") return <div className="p-8">Access denied</div>;

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <PageHeader
        title="Practice"
        description="Student / Practice"
      />
      <Card>
        <CardHeader>
          <CardTitle>Start AP-style practice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Open your assignments to practice FRQ coding questions and multiple-choice sets.
          </p>
          <Button asChild>
            <Link href="/student/assignments">Go to Assignments</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
