"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Question, SchoolClass } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function NewAssignmentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    class_id: 0,
    due_at: "",
    selectedQuestions: [] as number[],
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.role === "teacher") {
      api.getClasses().then((c) => {
        setClasses(c);
        if (c.length > 0) setForm((f) => ({ ...f, class_id: c[0].id }));
      });
      api.getQuestions().then(setQuestions);
    }
  }, [user]);

  const toggleQuestion = (qid: number) => {
    setForm((f) => ({
      ...f,
      selectedQuestions: f.selectedQuestions.includes(qid)
        ? f.selectedQuestions.filter((id) => id !== qid)
        : [...f.selectedQuestions, qid],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.selectedQuestions.length === 0) {
      setError("Select at least one question");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.createAssignment({
        title: form.title,
        description: form.description,
        class_id: form.class_id,
        due_at: form.due_at || undefined,
        questions: form.selectedQuestions.map((qid, i) => {
          const q = questions.find((q) => q.id === qid);
          return { question_id: qid, order: i + 1, points: q?.max_points || 0 };
        }),
      });
      router.push("/teacher/assignments");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user || user.role !== "teacher") return <div className="p-8">Access denied</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Assignment</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg shadow p-6">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border rounded-md px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Class</label>
          <select value={form.class_id} onChange={(e) => setForm({ ...form, class_id: Number(e.target.value) })} className="w-full border rounded-md px-3 py-2">
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.school_year})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <input type="datetime-local" value={form.due_at} onChange={(e) => setForm({ ...form, due_at: e.target.value })} className="w-full border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Questions</label>
          <div className="space-y-2 max-h-60 overflow-y-auto border rounded p-3">
            {questions.map((q) => (
              <label key={q.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.selectedQuestions.includes(q.id)} onChange={() => toggleQuestion(q.id)} />
                {q.title} ({q.max_points} pts)
              </label>
            ))}
          </div>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {saving ? "Creating..." : "Create Assignment"}
        </button>
      </form>
    </div>
  );
}
