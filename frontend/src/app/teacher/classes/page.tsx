"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, SchoolClass } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, ArrowRight, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

export default function ClassesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "teacher")) {
      router.push("/dashboard");
    }
    if (user && user.role === "teacher") {
      api
        .getClasses()
        .then(setClasses)
        .finally(() => setLoadingData(false));
    }
  }, [user, loading, router]);

  if (loading || loadingData) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading classes...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <PageHeader
            title="Your Classes"
            description="Manage your classes and student rosters"
            icon={Users}
            action={
              <Button asChild>
                <Link href="/teacher/classes/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Class
                </Link>
              </Button>
            }
          />

          {classes.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No classes yet"
              description="Create your first class to start managing students and assignments"
              action={
                <Button asChild>
                  <Link href="/teacher/classes/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Class
                  </Link>
                </Button>
              }
            />
          ) : (
            <>
              {/* Stats Overview */}
              <div className="grid sm:grid-cols-3 gap-6">
                <Card className="border-2 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-blue-700">
                        Total Classes
                      </CardTitle>
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-blue-900">
                      {classes.length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-green-700">
                        Total Students
                      </CardTitle>
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-green-900">
                      {classes.reduce((sum, c) => sum + (c.student_count || 0), 0)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-purple-700">
                        Average Class Size
                      </CardTitle>
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-purple-900">
                      {classes.length > 0
                        ? Math.round(
                            classes.reduce((sum, c) => sum + (c.student_count || 0), 0) /
                              classes.length
                          )
                        : 0}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Classes Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((c) => (
                  <Card
                    key={c.id}
                    className="border-2 shadow-lg hover:shadow-xl transition-all group"
                  >
                    <CardHeader className="bg-gradient-to-br from-slate-50 to-blue-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                            {c.name}
                          </CardTitle>
                          <CardDescription className="mt-2 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {c.student_count || 0} students
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <Button asChild className="w-full group">
                        <Link href={`/teacher/classes/${c.id}`}>
                          View Class Details
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
