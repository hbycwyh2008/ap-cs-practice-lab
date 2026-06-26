"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Shield,
  Zap,
  CheckCircle2,
  Lock,
  Mail,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { access_token } = await api.login(email, password);
      localStorage.setItem("token", access_token);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Value Proposition */}
      <div className="hidden lg:flex flex-col justify-center px-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-grid-white/5"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/20"></div>

        <div className="relative z-10 space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-2xl">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-2xl leading-tight">
                AP CSA Lab
              </span>
              <span className="text-sm text-blue-100 leading-tight">
                Practice Platform
              </span>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Free Beta Access
            </div>
            <h1 className="text-5xl font-bold leading-tight">
              Master AP CSA
              <br />
              <span className="text-blue-200">with Confidence</span>
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed max-w-lg">
              Auto-graded Java practice platform built specifically for AP
              Computer Science A teachers and students.
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-4">
            {[
              {
                icon: Zap,
                title: "Instant Auto-Grading",
                description: "Public and hidden test cases with detailed feedback",
              },
              {
                icon: CheckCircle2,
                title: "Real AP Environment",
                description: "Practice FRQs in a production-like workflow",
              },
              {
                icon: Shield,
                title: "Privacy-First Beta",
                description: "Anonymized accounts, no real student data",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-lg"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                    <p className="text-sm text-blue-100">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Beta Notice */}
          <Alert className="bg-amber-500/20 border-amber-300/30 backdrop-blur-sm">
            <AlertTriangle className="h-4 w-4 text-amber-200" />
            <AlertDescription className="text-amber-50 text-sm">
              <strong>Beta Product:</strong> This platform is for practice and
              evaluation only. Use demo accounts provided below.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="w-full max-w-md mx-auto space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl leading-tight text-slate-900">
                AP CSA Lab
              </span>
              <span className="text-sm text-slate-500 leading-tight">
                Practice Platform
              </span>
            </div>
          </div>

          {/* Login Card */}
          <Card className="shadow-2xl border-2">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
                <Badge variant="outline" className="bg-blue-50 border-blue-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Beta
                </Badge>
              </div>
              <CardDescription>
                Use a demo account below to explore the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-500" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  className="w-full h-11 text-base"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo Accounts */}
          <Card className="shadow-xl border-2 bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Demo Accounts
              </CardTitle>
              <CardDescription>
                Quick access for beta trial - click to copy credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-white rounded-lg border-2 border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-600">Teacher</Badge>
                  <span className="text-xs text-slate-500">Full Access</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <code className="text-sm font-mono text-slate-700">
                      teacher@example.com
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <code className="text-sm font-mono text-slate-700">
                      password123
                    </code>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white rounded-lg border-2 border-green-200 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Student</Badge>
                  <span className="text-xs text-slate-500">Practice Mode</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <code className="text-sm font-mono text-slate-700">
                      student@example.com
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <code className="text-sm font-mono text-slate-700">
                      password123
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <Alert className="bg-amber-50 border-amber-200">
            <Shield className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-800">
              <strong>Privacy Note:</strong> This beta uses demo accounts only.
              No real student data is collected. See{" "}
              <Link
                href="/beta-notice"
                className="underline font-semibold hover:text-amber-900"
              >
                Beta Notice
              </Link>{" "}
              for details.
            </AlertDescription>
          </Alert>

          {/* Back to Home */}
          <div className="text-center">
            <Button variant="ghost" asChild>
              <Link href="/" className="text-slate-600">
                ← Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
