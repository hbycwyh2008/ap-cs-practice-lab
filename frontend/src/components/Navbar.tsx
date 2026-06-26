"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, LogOut, Sparkles } from "lucide-react";

interface NavLinkItem {
  href: string;
  label: string;
  isActive: (pathname: string) => boolean;
}

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) return null;

  const isTeacher = user.role === "teacher";

  const teacherLinks: NavLinkItem[] = [
    {
      href: "/dashboard",
      label: "Dashboard",
      isActive: (path) => path === "/dashboard",
    },
    {
      href: "/teacher/classes",
      label: "Classes & Students",
      isActive: (path) =>
        path === "/teacher/classes" ||
        path.startsWith("/teacher/classes/"),
    },
    {
      href: "/teacher/questions",
      label: "Question Bank",
      isActive: (path) =>
        path === "/teacher/questions" ||
        path === "/teacher/questions/new" ||
        path.startsWith("/teacher/questions/") &&
          !path.startsWith("/teacher/questions/import"),
    },
    {
      href: "/teacher/questions/import",
      label: "Import FRQ",
      isActive: (path) => path === "/teacher/questions/import",
    },
    {
      href: "/teacher/questions/import-mcq",
      label: "Import MCQ",
      isActive: (path) => path === "/teacher/questions/import-mcq",
    },
    {
      href: "/teacher/assignments",
      label: "Assignments",
      isActive: (path) =>
        path === "/teacher/assignments" ||
        path.startsWith("/teacher/assignments/"),
    },
    {
      href: "/teacher/submissions",
      label: "Submissions",
      isActive: (path) =>
        path === "/teacher/submissions" ||
        path.startsWith("/teacher/submissions/"),
    },
    {
      href: "/teacher/analytics",
      label: "Analytics",
      isActive: (path) =>
        path === "/teacher/analytics" || path.startsWith("/teacher/analytics/"),
    },
    {
      href: "/teacher/help",
      label: "Help / Docs",
      isActive: (path) => path === "/teacher/help" || path.startsWith("/teacher/help/"),
    },
  ];

  const studentLinks: NavLinkItem[] = [
    {
      href: "/dashboard",
      label: "Dashboard",
      isActive: (path) => path === "/dashboard",
    },
    {
      href: "/student/assignments",
      label: "Assignments",
      isActive: (path) =>
        path === "/student/assignments" || path.startsWith("/student/assignments/"),
    },
    {
      href: "/student/practice",
      label: "Practice",
      isActive: (path) => path === "/student/practice",
    },
  ];

  const links = isTeacher ? teacherLinks : studentLinks;

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-900 leading-tight">
                AP CSA Lab
              </span>
              <span className="text-xs text-slate-500 leading-tight">
                Practice Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const isActive = link.isActive(pathname);
              return (
                <Button
                  key={link.href}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  asChild
                  className={
                    isActive
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "hover:bg-slate-100"
                  }
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              );
            })}
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 border-blue-200">
                <Sparkles className="w-3 h-3 mr-1" />
                Beta
              </Badge>
              <Badge
                variant={isTeacher ? "default" : "secondary"}
                className="capitalize"
              >
                {user.role}
              </Badge>
            </div>
            <div className="hidden sm:block text-sm text-slate-700 font-medium">
              {user.email}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
        <div className="md:hidden pb-3 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {links.map((link) => {
              const isActive = link.isActive(pathname);
              return (
                <Button
                  key={link.href}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  asChild
                  className={
                    isActive
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "hover:bg-slate-100"
                  }
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
