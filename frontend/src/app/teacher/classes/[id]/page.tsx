"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api, BulkCreateStudentsResponse, SchoolClass } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TeacherClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const classId = Number(id);
  const { user, loading } = useAuth();
  const router = useRouter();

  const [schoolClass, setSchoolClass] = useState<SchoolClass | null>(null);
  const [count, setCount] = useState(10);
  const [prefix, setPrefix] = useState("student");
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<BulkCreateStudentsResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "teacher")) {
      router.push("/dashboard");
      return;
    }
    if (user?.role === "teacher" && Number.isFinite(classId)) {
      api.getClass(classId).then(setSchoolClass).catch(console.error);
    }
  }, [classId, loading, router, user]);

  const handleBulkCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    setError("");
    try {
      const created = await api.bulkCreateStudents(classId, { count, prefix });
      setResult(created);
      const refreshed = await api.getClass(classId);
      setSchoolClass(refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create students");
    } finally {
      setCreating(false);
    }
  };

  const handleExportCSV = async () => {
    const blob = await api.exportClassStudentsCSV(classId);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `class_${classId}_students.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user || user.role !== "teacher") return <div className="p-8">Access denied</div>;
  if (!schoolClass) return <div className="p-8">Loading class...</div>;

  return (
    <div className="container max-w-5xl mx-auto p-6 space-y-6">
      <PageHeader
        title={schoolClass.name}
        description="Teacher / Classes / Bulk Create Students"
        action={
          <Button variant="outline" asChild>
            <Link href="/teacher/classes">Back to Classes</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Class Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-3 text-sm">
          <div className="rounded border p-3">
            <p className="text-muted-foreground">School year</p>
            <p className="font-semibold">{schoolClass.school_year}</p>
          </div>
          <div className="rounded border p-3">
            <p className="text-muted-foreground">Students</p>
            <p className="font-semibold">{schoolClass.student_count ?? 0}</p>
          </div>
          <div className="rounded border p-3">
            <p className="text-muted-foreground">Class ID</p>
            <p className="font-semibold">{schoolClass.id}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bulk Create Student Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleBulkCreate}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="count">Account count</Label>
                <Input
                  id="count"
                  type="number"
                  min={1}
                  max={100}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prefix">Email prefix</Label>
                <Input
                  id="prefix"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  required
                />
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex gap-3">
              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Bulk Create Students"}
              </Button>
              <Button type="button" variant="outline" onClick={handleExportCSV}>
                Export Student CSV
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>New Credentials ({result.count})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.created.map((student) => (
              <div key={student.id} className="rounded border p-3 text-sm">
                <p className="font-medium">{student.name}</p>
                <p className="text-muted-foreground">{student.email}</p>
                <p className="font-mono text-xs mt-1">
                  temporary password: {student.temporary_password}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
