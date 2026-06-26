"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

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
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Question</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg shadow p-6">
        <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Unit" value={form.unit} onChange={(v) => setForm({ ...form, unit: v })} required />
          <Field label="Topic" value={form.topic} onChange={(v) => setForm({ ...form, topic: v })} required />
        </div>
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
