"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, SchoolClass, StudentAccountInfo } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function TeacherClassesPage() {
  const { user, loading } = useAuth();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", school_year: "2026-2027" });
  const [expandedClass, setExpandedClass] = useState<number | null>(null);
  const [bulkCount, setBulkCount] = useState(10);
  const [createdAccounts, setCreatedAccounts] = useState<StudentAccountInfo[] | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => api.getClasses().then(setClasses).catch(console.error);

  useEffect(() => {
    if (user?.role === "teacher") load();
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createClass(form);
    setShowForm(false);
    load();
  };

  const handleBulkCreate = async (classId: number) => {
    setBusy(true);
    setCreatedAccounts(null);
    try {
      const result = await api.bulkCreateStudents(classId, { count: bulkCount });
      setCreatedAccounts(result.created);
      load(); // Refresh to update student_count
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create students");
    } finally {
      setBusy(false);
    }
  };

  const downloadCSV = (classId: number) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/classes/${classId}/students/export.csv`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `class_${classId}_students.csv`;
          a.click();
        });
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user || user.role !== "teacher") return <div className="p-8">Access denied</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Classes</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-md">
          + New Class
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-amber-800">
          <strong>Beta Trial Tip:</strong> Use anonymized student accounts for testing. 
          Bulk-create generates demo accounts like <code>student-001@class-1.demo</code> with temporary passwords.
          <Link href="/beta-notice" className="ml-2 text-blue-600 hover:underline">Learn more</Link>
        </p>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-4 mb-6 space-y-3">
          <input placeholder="Class name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2" required />
          <input placeholder="School year" value={form.school_year} onChange={(e) => setForm({ ...form, school_year: e.target.value })} className="w-full border rounded px-3 py-2" required />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">Create</button>
        </form>
      )}

      <div className="space-y-4">
        {classes.map((c) => (
          <div key={c.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg">{c.name}</h3>
                <p className="text-sm text-gray-500">{c.school_year} · {c.student_count || 0} students</p>
              </div>
              <button
                onClick={() => setExpandedClass(expandedClass === c.id ? null : c.id)}
                className="text-sm text-blue-600 hover:underline"
              >
                {expandedClass === c.id ? "Hide" : "Manage Students"}
              </button>
            </div>

            {expandedClass === c.id && (
              <div className="mt-4 pt-4 border-t space-y-4">
                <div className="flex gap-3 items-end">
                  <div>
                    <label className="block text-sm font-medium mb-1">Student Count</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={bulkCount}
                      onChange={(e) => setBulkCount(Number(e.target.value))}
                      className="border rounded px-3 py-2 w-24"
                    />
                  </div>
                  <button
                    onClick={() => handleBulkCreate(c.id)}
                    disabled={busy}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {busy ? "Creating..." : "Bulk Create Students"}
                  </button>
                  <button
                    onClick={() => downloadCSV(c.id)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    Download Student CSV
                  </button>
                </div>

                {createdAccounts && createdAccounts.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="font-medium mb-2">✅ Created {createdAccounts.length} accounts. Copy these credentials now (they won't be shown again):</p>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {createdAccounts.map((acc) => (
                        <div key={acc.id} className="bg-white rounded p-2 text-sm font-mono">
                          <div><strong>Name:</strong> {acc.name}</div>
                          <div><strong>Email:</strong> {acc.email}</div>
                          <div><strong>Password:</strong> {acc.temporary_password}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
