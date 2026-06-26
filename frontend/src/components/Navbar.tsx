"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="font-bold text-blue-600 text-lg">
          AP CS Practice Lab
        </Link>
        {user.role === "teacher" && (
          <>
            <Link href="/teacher/questions" className="text-sm text-gray-600 hover:text-blue-600">
              Questions
            </Link>
            <Link href="/teacher/assignments" className="text-sm text-gray-600 hover:text-blue-600">
              Assignments
            </Link>
            <Link href="/teacher/submissions" className="text-sm text-gray-600 hover:text-blue-600">
              Submissions
            </Link>
          </>
        )}
        {user.role === "student" && (
          <Link href="/student/assignments" className="text-sm text-gray-600 hover:text-blue-600">
            My Assignments
          </Link>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          {user.name} ({user.role})
        </span>
        <button
          onClick={logout}
          className="text-sm text-red-500 hover:text-red-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
