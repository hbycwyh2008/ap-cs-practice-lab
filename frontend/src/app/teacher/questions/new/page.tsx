"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

const DEFAULT_STARTER = `public class Solution {
    public int solve(int[] nums) {
        // Write your code here
        return 0;
    }
}`;

export default function NewQuestionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    unit: "Array",
    topic: "",
    difficulty: "easy",
    skill: "traversal",
    practice_type: "FRQ_SMALL_FUNCTION",
    frq_type: "NONE",
    error_pattern: "",
    recommended_use: "HOMEWORK",
    source_type: "TEACHER_CREATED",
    visibility: "PRIVATE_CLASSROOM",
    estimated_minutes: 10,
    source: "teacher-created",
    is_active: true,
    prompt: "",
    starter_code: DEFAULT_STARTER,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const q = await api.createQuestion(form);
      router.push(`/teacher/questions/${q.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create question");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user || user.role !== "teacher") return <div className="p-8">Access denied</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <PageHeader
        title="Create New Question"
        description="Teacher / Question Bank / New Question"
        action={
          <Button variant="outline" asChild>
            <Link href="/teacher/questions">Back to Question Bank</Link>
          </Button>
        }
      />
      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg shadow p-6">
        <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Unit" value={form.unit} onChange={(v) => setForm({ ...form, unit: v })} required />
          <Field label="Topic" value={form.topic} onChange={(v) => setForm({ ...form, topic: v })} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Difficulty</label>
            <select
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <Field label="Skill" value={form.skill} onChange={(v) => setForm({ ...form, skill: v })} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Practice Type</label>
            <select
              value={form.practice_type}
              onChange={(e) => setForm({ ...form, practice_type: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="MCQ_TRACE_OUTPUT">MCQ_TRACE_OUTPUT</option>
              <option value="MCQ_CONCEPT_CHECK">MCQ_CONCEPT_CHECK</option>
              <option value="MCQ_ERROR_ANALYSIS">MCQ_ERROR_ANALYSIS</option>
              <option value="MCQ_CODE_COMPLETION">MCQ_CODE_COMPLETION</option>
              <option value="MCQ_DESIGN_REASONING">MCQ_DESIGN_REASONING</option>
              <option value="FRQ_SMALL_FUNCTION">FRQ_SMALL_FUNCTION</option>
              <option value="FRQ_FULL_RESPONSE">FRQ_FULL_RESPONSE</option>
              <option value="DEBUGGING_DRILL">DEBUGGING_DRILL</option>
              <option value="EDGE_CASE_DRILL">EDGE_CASE_DRILL</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">FRQ Type</label>
            <select
              value={form.frq_type}
              onChange={(e) => setForm({ ...form, frq_type: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="NONE">NONE</option>
              <option value="FRQ_Q1_METHOD_CONTROL">FRQ_Q1_METHOD_CONTROL</option>
              <option value="FRQ_Q2_CLASS">FRQ_Q2_CLASS</option>
              <option value="FRQ_Q3_ARRAYLIST">FRQ_Q3_ARRAYLIST</option>
              <option value="FRQ_Q4_2D_ARRAY">FRQ_Q4_2D_ARRAY</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Error Pattern"
            value={form.error_pattern}
            onChange={(v) => setForm({ ...form, error_pattern: v })}
          />
          <div>
            <label className="block text-sm font-medium mb-1">Recommended Use</label>
            <select
              value={form.recommended_use}
              onChange={(e) => setForm({ ...form, recommended_use: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="FIRST_PRACTICE">FIRST_PRACTICE</option>
              <option value="WARM_UP">WARM_UP</option>
              <option value="HOMEWORK">HOMEWORK</option>
              <option value="QUIZ">QUIZ</option>
              <option value="EXAM_REVIEW">EXAM_REVIEW</option>
              <option value="FRQ_DRILL">FRQ_DRILL</option>
              <option value="REMEDIATION">REMEDIATION</option>
              <option value="CHALLENGE">CHALLENGE</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Estimated Minutes</label>
            <input
              type="number"
              min={1}
              value={form.estimated_minutes}
              onChange={(e) => setForm({ ...form, estimated_minutes: Number(e.target.value) })}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>
          <Field label="Source" value={form.source} onChange={(v) => setForm({ ...form, source: v })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Source Type</label>
            <select
              value={form.source_type}
              onChange={(e) => setForm({ ...form, source_type: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="TEACHER_CREATED">TEACHER_CREATED</option>
              <option value="SYNTHETIC">SYNTHETIC</option>
              <option value="LICENSED_PRIVATE">LICENSED_PRIVATE</option>
              <option value="PUBLIC_DOMAIN">PUBLIC_DOMAIN</option>
              <option value="OFFICIAL_REFERENCE_ONLY">OFFICIAL_REFERENCE_ONLY</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Visibility</label>
            <select
              value={form.visibility}
              onChange={(e) => setForm({ ...form, visibility: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="PRIVATE_CLASSROOM">PRIVATE_CLASSROOM</option>
              <option value="INTERNAL_REVIEW">INTERNAL_REVIEW</option>
              <option value="PUBLIC_SAMPLE">PUBLIC_SAMPLE</option>
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          Active (available for auto-generated assignments)
        </label>
        <div>
          <label className="block text-sm font-medium mb-1">Prompt</label>
          <textarea
            value={form.prompt}
            onChange={(e) => setForm({ ...form, prompt: e.target.value })}
            rows={4}
            className="w-full border rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Starter Code</label>
          <textarea
            value={form.starter_code}
            onChange={(e) => setForm({ ...form, starter_code: e.target.value })}
            rows={8}
            className="w-full border rounded-md px-3 py-2 font-mono text-sm"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create Question"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, required }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-md px-3 py-2"
        required={required}
      />
    </div>
  );
}
