"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, Question, SchoolClass } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

type Mode = "manual" | "auto";

export default function NewAssignmentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("manual");
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [manualForm, setManualForm] = useState({
    title: "",
    description: "",
    class_id: 0,
    due_at: "",
    selectedQuestions: [] as number[],
  });
  const [autoForm, setAutoForm] = useState({
    title: "",
    description: "",
    class_id: 0,
    due_at: "",
    unit: "Array",
    topic: "all",
    question_type: "FRQ_CODE",
    difficulty: "easy",
    skill: "traversal",
    question_count: 2,
    include_recent_questions: true,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const activeQuestions = questions.filter((q) => q.is_active !== false);
  const [manualFilters, setManualFilters] = useState({
    unit: "all",
    topic: "all",
    skill: "all",
    type: "all",
    difficulty: "all",
  });
  const unitOptions = Array.from(
    new Set(activeQuestions.map((q) => q.unit).filter((unit): unit is string => Boolean(unit)))
  ).sort();
  const topicOptions = Array.from(
    new Set(activeQuestions.map((q) => q.topic).filter((topic): topic is string => Boolean(topic)))
  ).sort();
  const skillOptions = Array.from(
    new Set(
      activeQuestions.map((q) => q.skill).filter((skill): skill is string => Boolean(skill))
    )
  ).sort();
  const typeOptions = Array.from(new Set(activeQuestions.map((q) => q.type))).sort();
  const difficultyOptions = Array.from(
    new Set(activeQuestions.map((q) => q.difficulty))
  ).sort();

  const filteredManualQuestions = activeQuestions.filter((q) => {
    if (manualFilters.unit !== "all" && q.unit !== manualFilters.unit) return false;
    if (manualFilters.topic !== "all" && q.topic !== manualFilters.topic) return false;
    if (manualFilters.skill !== "all" && q.skill !== manualFilters.skill) return false;
    if (manualFilters.type !== "all" && q.type !== manualFilters.type) return false;
    if (manualFilters.difficulty !== "all" && q.difficulty !== manualFilters.difficulty) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    if (user?.role === "teacher") {
      api.getClasses().then((c) => {
        setClasses(c);
        if (c.length > 0) {
          setManualForm((f) => ({ ...f, class_id: c[0].id }));
          setAutoForm((f) => ({ ...f, class_id: c[0].id }));
        }
      });
      api.getQuestions().then(setQuestions);
    }
  }, [user]);

  useEffect(() => {
    if (
      unitOptions.length > 0 &&
      autoForm.unit !== "all" &&
      !unitOptions.includes(autoForm.unit)
    ) {
      setAutoForm((f) => ({ ...f, unit: unitOptions[0] }));
    }
    if (
      skillOptions.length > 0 &&
      autoForm.skill !== "all" &&
      !skillOptions.includes(autoForm.skill)
    ) {
      setAutoForm((f) => ({ ...f, skill: skillOptions[0] }));
    }
    if (
      topicOptions.length > 0 &&
      autoForm.topic !== "all" &&
      !topicOptions.includes(autoForm.topic)
    ) {
      setAutoForm((f) => ({ ...f, topic: "all" }));
    }
    if (
      typeOptions.length > 0 &&
      autoForm.question_type !== "all" &&
      !typeOptions.includes(autoForm.question_type)
    ) {
      setAutoForm((f) => ({ ...f, question_type: "all" }));
    }
  }, [
    unitOptions,
    topicOptions,
    skillOptions,
    typeOptions,
    autoForm.unit,
    autoForm.topic,
    autoForm.skill,
    autoForm.question_type,
  ]);

  const toggleQuestion = (qid: number) => {
    setManualForm((f) => ({
      ...f,
      selectedQuestions: f.selectedQuestions.includes(qid)
        ? f.selectedQuestions.filter((id) => id !== qid)
        : [...f.selectedQuestions, qid],
    }));
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualForm.selectedQuestions.length === 0) {
      setError("Select at least one question");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.createAssignment({
        title: manualForm.title,
        description: manualForm.description,
        class_id: manualForm.class_id,
        due_at: manualForm.due_at || undefined,
        questions: manualForm.selectedQuestions.map((qid, i) => {
          const q = questions.find((q) => q.id === qid);
          return { question_id: qid, order: i + 1, points: q?.max_points || 10 };
        }),
      });
      router.push("/teacher/assignments");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAutoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.generateAssignment({
        title: autoForm.title,
        description: autoForm.description,
        class_id: autoForm.class_id,
        due_at: autoForm.due_at || undefined,
        course: "AP_CSA",
        units: autoForm.unit === "all" ? [] : [autoForm.unit],
        topics: autoForm.topic === "all" ? [] : [autoForm.topic],
        question_types:
          autoForm.question_type === "all" ? [] : [autoForm.question_type],
        difficulties: autoForm.difficulty === "all" ? [] : [autoForm.difficulty],
        skills: autoForm.skill === "all" ? [] : [autoForm.skill],
        question_count: autoForm.question_count,
        include_recent_questions: autoForm.include_recent_questions,
      });
      router.push(`/teacher/assignments`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user || user.role !== "teacher") return <div className="p-8">Access denied</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <PageHeader
        title="Create Assignment"
        description="Teacher / Assignments / New Assignment"
        action={
          <Button variant="outline" asChild>
            <Link href="/teacher/assignments">Back to Assignments</Link>
          </Button>
        }
      />

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`px-4 py-2 rounded-md text-sm ${
            mode === "manual" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
          }`}
        >
          Manual
        </button>
        <button
          type="button"
          onClick={() => setMode("auto")}
          className={`px-4 py-2 rounded-md text-sm ${
            mode === "auto" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
          }`}
        >
          Auto-generate
        </button>
      </div>

      {mode === "manual" ? (
        <form onSubmit={handleManualSubmit} className="space-y-4 bg-white rounded-lg shadow p-6">
          <Field label="Title" value={manualForm.title} onChange={(v) => setManualForm({ ...manualForm, title: v })} required />
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={manualForm.description} onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })} rows={3} className="w-full border rounded-md px-3 py-2" />
          </div>
          <ClassSelect classes={classes} value={manualForm.class_id} onChange={(id) => setManualForm({ ...manualForm, class_id: id })} />
          <DueDate value={manualForm.due_at} onChange={(v) => setManualForm({ ...manualForm, due_at: v })} />
          <div>
            <label className="block text-sm font-medium mb-2">Questions</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
              <SimpleFilterSelect
                label="Unit"
                value={manualFilters.unit}
                options={unitOptions}
                onChange={(value) =>
                  setManualFilters((prev) => ({ ...prev, unit: value }))
                }
              />
              <SimpleFilterSelect
                label="Topic"
                value={manualFilters.topic}
                options={topicOptions}
                onChange={(value) =>
                  setManualFilters((prev) => ({ ...prev, topic: value }))
                }
              />
              <SimpleFilterSelect
                label="Skill"
                value={manualFilters.skill}
                options={skillOptions}
                onChange={(value) =>
                  setManualFilters((prev) => ({ ...prev, skill: value }))
                }
              />
              <SimpleFilterSelect
                label="Type"
                value={manualFilters.type}
                options={typeOptions}
                onChange={(value) =>
                  setManualFilters((prev) => ({ ...prev, type: value }))
                }
              />
              <SimpleFilterSelect
                label="Difficulty"
                value={manualFilters.difficulty}
                options={difficultyOptions}
                onChange={(value) =>
                  setManualFilters((prev) => ({ ...prev, difficulty: value }))
                }
              />
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto border rounded p-3">
              {activeQuestions.length === 0 && (
                <p className="text-amber-700 text-sm">Create active questions before creating assignments.</p>
              )}
              {filteredManualQuestions.map((q) => (
                <label key={q.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={manualForm.selectedQuestions.includes(q.id)} onChange={() => toggleQuestion(q.id)} />
                  {q.title} ({q.unit}, {q.skill}, {q.difficulty}) — {q.max_points} pts
                </label>
              ))}
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Creating..." : "Create Assignment"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleAutoSubmit} className="space-y-4 bg-white rounded-lg shadow p-6">
          {activeQuestions.length === 0 ? (
            <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-sm">
              Create tagged questions before auto-generating assignments.
            </p>
          ) : null}
          <Field label="Title" value={autoForm.title} onChange={(v) => setAutoForm({ ...autoForm, title: v })} required />
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={autoForm.description} onChange={(e) => setAutoForm({ ...autoForm, description: e.target.value })} rows={3} className="w-full border rounded-md px-3 py-2" />
          </div>
          <ClassSelect classes={classes} value={autoForm.class_id} onChange={(id) => setAutoForm({ ...autoForm, class_id: id })} />
          <DueDate value={autoForm.due_at} onChange={(v) => setAutoForm({ ...autoForm, due_at: v })} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <select
                value={autoForm.unit}
                onChange={(e) => setAutoForm({ ...autoForm, unit: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
                required
                disabled={unitOptions.length === 0}
              >
                <option value="all">All</option>
                {unitOptions.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Topic</label>
              <select
                value={autoForm.topic}
                onChange={(e) => setAutoForm({ ...autoForm, topic: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
                disabled={topicOptions.length === 0}
              >
                <option value="all">All</option>
                {topicOptions.map((topic) => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Question Type</label>
              <select
                value={autoForm.question_type}
                onChange={(e) =>
                  setAutoForm({ ...autoForm, question_type: e.target.value })
                }
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="all">All</option>
                {typeOptions.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <select
                value={autoForm.difficulty}
                onChange={(e) => setAutoForm({ ...autoForm, difficulty: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="all">All</option>
                {difficultyOptions.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Skill</label>
              <select
                value={autoForm.skill}
                onChange={(e) => setAutoForm({ ...autoForm, skill: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
                required
                disabled={skillOptions.length === 0}
              >
                <option value="all">All</option>
                {skillOptions.map((skill) => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Question Count</label>
              <input type="number" min={1} value={autoForm.question_count} onChange={(e) => setAutoForm({ ...autoForm, question_count: Number(e.target.value) })} className="w-full border rounded-md px-3 py-2" required />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={autoForm.include_recent_questions} onChange={(e) => setAutoForm({ ...autoForm, include_recent_questions: e.target.checked })} />
            Include questions used in recent assignments
          </label>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={saving || activeQuestions.length === 0} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50">
            {saving ? "Generating..." : "Generate Assignment"}
          </button>
        </form>
      )}
    </div>
  );
}

function Field({ label, value, onChange, required }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full border rounded-md px-3 py-2" required={required} />
    </div>
  );
}

function ClassSelect({ classes, value, onChange }: {
  classes: SchoolClass[]; value: number; onChange: (id: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">Class</label>
      <select value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full border rounded-md px-3 py-2">
        {classes.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.school_year})</option>)}
      </select>
    </div>
  );
}

function DueDate({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">Due Date</label>
      <input type="datetime-local" value={value} onChange={(e) => onChange(e.target.value)} className="w-full border rounded-md px-3 py-2" />
    </div>
  );
}

function SimpleFilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-md px-3 py-2"
      >
        <option value="all">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
