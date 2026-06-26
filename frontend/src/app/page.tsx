"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  GraduationCap,
  Code,
  CheckCircle2,
  BarChart3,
  Shield,
  Zap,
  Users,
  BookOpen,
  Award,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
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
            </div>
            <Button asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Two Column */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Value Prop */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Free Beta - Limited Seats
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              Master AP CSA
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                with Instant Feedback
              </span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Auto-grading Java practice platform for AP Computer Science A.
              Real test cases, instant scoring, detailed analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link href="/login">
                  Start Practicing
                  <Zap className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8"
                asChild
              >
                <Link href="/beta-notice">Learn More</Link>
              </Button>
            </div>
            <Alert className="bg-amber-50 border-amber-200">
              <Shield className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-800">
                <strong>Privacy-First Beta:</strong> Demo accounts only. No
                real student data collected.
              </AlertDescription>
            </Alert>
          </div>

          {/* Right: Mock Dashboard Preview */}
          <div className="space-y-6">
            <Card className="shadow-2xl border-2">
              <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Teacher Dashboard</CardTitle>
                    <CardDescription>Real-time class analytics</CardDescription>
                  </div>
                  <Badge className="bg-green-500">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-700 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">Classes</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-900">3</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-green-700 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">Students</span>
                    </div>
                    <p className="text-3xl font-bold text-green-900">24</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 text-purple-700 mb-1">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-sm font-medium">Assignments</span>
                    </div>
                    <p className="text-3xl font-bold text-purple-900">6</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2 text-amber-700 mb-1">
                      <Award className="w-4 h-4" />
                      <span className="text-sm font-medium">Completion</span>
                    </div>
                    <p className="text-3xl font-bold text-amber-900">82%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-2">
              <CardHeader className="bg-gradient-to-br from-slate-50 to-slate-100">
                <CardTitle className="text-base">
                  Student Code Submission
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="bg-slate-950 text-green-400 p-3 rounded font-mono text-xs">
                  <div>public int findMax(int[] arr) {"{"}</div>
                  <div className="ml-4">int max = arr[0];</div>
                  <div className="ml-4">// ...</div>
                  <div>{"}"}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="flex-1">
                    Run Public Tests
                  </Button>
                  <Button size="sm" className="flex-1">
                    Final Submit
                  </Button>
                </div>
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 text-sm font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    4/5 tests passed (8/10 pts)
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Grid with Icons */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white/50 rounded-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Everything You Need to Excel
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Built specifically for AP CSA teachers and students preparing for
            the Free Response Questions
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Code,
              title: "Auto-Grading Engine",
              description:
                "Instant feedback with public and hidden test cases. Docker-sandboxed Java execution.",
              bgColor: "bg-blue-100",
              textColor: "text-blue-600",
            },
            {
              icon: BarChart3,
              title: "Teacher Analytics",
              description:
                "Track class progress, completion rates, and individual student performance at a glance.",
              bgColor: "bg-green-100",
              textColor: "text-green-600",
            },
            {
              icon: Shield,
              title: "Privacy-First Beta",
              description:
                "Anonymized student accounts. No real emails, phone numbers, or personal data required.",
              bgColor: "bg-purple-100",
              textColor: "text-purple-600",
            },
            {
              icon: Zap,
              title: "Quick Setup",
              description:
                "Bulk-create anonymous student accounts. Generate typed assignments. CSV export.",
              bgColor: "bg-amber-100",
              textColor: "text-amber-600",
            },
            {
              icon: BookOpen,
              title: "AP CSA Question Bank",
              description:
                "Curated FRQ practice problems with tags, difficulty levels, and starter code.",
              bgColor: "bg-indigo-100",
              textColor: "text-indigo-600",
            },
            {
              icon: Award,
              title: "Real Test Environment",
              description:
                "Practice with the same constraints and feedback as the actual AP exam workflow.",
              bgColor: "bg-red-100",
              textColor: "text-red-600",
            },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Card
                key={i}
                className="border-2 hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-3`}
                  >
                    <Icon
                      className={`w-6 h-6 ${feature.textColor}`}
                    />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0 shadow-2xl">
          <CardContent className="py-12 text-center space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to Try It Out?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Free beta access. Demo accounts included. Start practicing AP CSA
              FRQs in under 2 minutes.
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
              <Link href="/login">
                Get Started Now
                <Zap className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-600 text-sm">
          <p>
            AP CSA Practice Lab - Beta v1.0 |{" "}
            <Link href="/beta-notice" className="text-blue-600 hover:underline">
              Privacy & Beta Notice
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
