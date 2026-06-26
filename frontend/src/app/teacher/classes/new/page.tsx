"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function NewClassPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [schoolYear, setSchoolYear] = useState("2026-2027");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const created = await api.createClass({ name, school_year: schoolYear });
      router.push(`/teacher/classes/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create class");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user || user.role !== "teacher") return <div className="p-8">Access denied</div>;

  return (
    <div className="container max-w-3xl mx-auto p-6 space-y-6">
      <PageHeader
        title="Create Class"
        description="Teacher / Classes / New Class"
        action={
          <Button variant="outline" asChild>
            <Link href="/teacher/classes">Back to Classes</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="class-name">Class Name</Label>
              <Input
                id="class-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="AP CSA Period 1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school-year">School Year</Label>
              <Input
                id="school-year"
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Class"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
