"use client";

import { useEffect, useState } from "react";
import { api, SchoolClass } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function TeacherClassesPage() {
  const { user, loading } = useAuth();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", school_year: "2026-2027" });

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

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user || user.role !== "teacher") return <div className="p-8">Access denied</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Classes</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-md">
          + New Class
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-4 mb-6 space-y-3">
          <input placeholder="Class name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2" required />
          <input placeholder="School year" value={form.school_year} onChange={(e) => setForm({ ...form, school_year: e.target.value })} className="w-full border rounded px-3 py-2" required />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">Create</button>
        </form>
      )}
      <div className="space-y-3">
        {classes.map((c) => (
          <div key={c.id} className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold">{c.name}</h3>
            <p className="text-sm text-gray-500">{c.school_year}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
