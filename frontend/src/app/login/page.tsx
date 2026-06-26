"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DemoAccountCard } from "@/components/demo-account-card";
import { BetaNoticeCard } from "@/components/beta-notice-card";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            AP CS Practice Lab
          </h1>
          <p className="text-muted-foreground">
            Sign in to access your assignments and analytics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Login Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Sign in with your account credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                  Need access?{" "}
                  <Link href="/beta-notice" className="text-primary hover:underline">
                    Learn about beta trial
                  </Link>
                </p>
              </CardFooter>
            </Card>

            <BetaNoticeCard showLink={true} />
          </div>

          {/* Demo Accounts */}
          <div>
            <DemoAccountCard
              accounts={[
                {
                  role: "Teacher Demo",
                  email: "teacher@example.com",
                  password: "password123",
                },
                {
                  role: "Student Demo",
                  email: "student@example.com",
                  password: "password123",
                },
              ]}
            />
            
            <Card className="mt-6 border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                    Beta
                  </Badge>
                  Demo Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    Teacher: Create classes & assignments
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    Student: Practice & submit solutions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    Auto-grading with Java sandbox
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    Analytics & CSV export
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
