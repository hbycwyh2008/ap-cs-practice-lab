import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="container max-w-6xl mx-auto px-6 pt-16 pb-12">
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm">
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
              Beta
            </Badge>
            <span className="text-sm text-blue-700 font-medium">
              AP CSA Java FRQ Practice Platform
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            AP CS Practice Lab
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Auto-grading platform for AP Computer Science A with teacher analytics,
            anonymized student accounts, and secure Docker-based code execution.
          </p>
          
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" asChild>
              <Link href="/login">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/beta-notice">Beta Information</Link>
            </Button>
          </div>
        </div>

        {/* Feature Preview Card */}
        <Card className="max-w-4xl mx-auto border-2 shadow-lg">
          <CardHeader>
            <CardTitle>Core Features</CardTitle>
            <CardDescription>
              Everything you need for AP CSA practice and assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureItem
                title="Auto-Grading"
                description="Docker-sandboxed Java execution with public and hidden test cases"
              />
              <FeatureItem
                title="Teacher Analytics"
                description="Track completion rates, question performance, and skill mastery"
              />
              <FeatureItem
                title="Question Bank"
                description="Create and manage AP CSA FRQ practice problems with test cases"
              />
              <FeatureItem
                title="Auto-Generate"
                description="Generate assignments by unit, difficulty, and skill filters"
              />
              <FeatureItem
                title="CSV Export"
                description="Export analytics and student data for external reporting"
              />
              <FeatureItem
                title="Anonymized Accounts"
                description="Bulk-create student accounts with temporary passwords for beta trials"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Beta Scope Section */}
      <section className="container max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Currently Supported
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-white">AP CSA</Badge>
                  <span>AP Computer Science A only</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-white">FRQ</Badge>
                  <span>Free Response Questions (coding)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-white font-mono text-xs">int[] nums</Badge>
                  <span>Array traversal methods</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-white">Beta</Badge>
                  <span>Anonymized student accounts</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-amber-600">○</span>
                Coming Later
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• AP Computer Science Principles (CSP)</li>
                <li>• AI-powered feedback and hints</li>
                <li>• Rubric-based scoring beyond test cases</li>
                <li>• Multiple Java method signatures</li>
                <li>• OAuth/SSO authentication</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="container max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground">Simple workflow for teachers and students</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Teachers */}
          <Card>
            <CardHeader>
              <Badge className="w-fit mb-2">For Teachers</Badge>
              <CardTitle>Setup & Monitor</CardTitle>
              <CardDescription>Manage classes and track student progress</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs">
                    1
                  </span>
                  <span>Create a class and bulk-create anonymized student accounts</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs">
                    2
                  </span>
                  <span>Create questions or auto-generate assignments by skill</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs">
                    3
                  </span>
                  <span>Students practice with public tests and submit final answers</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs">
                    4
                  </span>
                  <span>Review analytics dashboard and export CSV reports</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Students */}
          <Card>
            <CardHeader>
              <Badge className="w-fit mb-2" variant="secondary">For Students</Badge>
              <CardTitle>Practice & Submit</CardTitle>
              <CardDescription>Write code, test, and improve</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs">
                    1
                  </span>
                  <span>Login and open assigned AP CSA practice questions</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs">
                    2
                  </span>
                  <span>Write Java code using method signatures provided</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs">
                    3
                  </span>
                  <span>Run public tests multiple times to debug solutions</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs">
                    4
                  </span>
                  <span>Submit final answer for full scoring with hidden tests</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="container max-w-6xl mx-auto px-6 py-12">
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="space-y-3">
            <div>
              <p className="font-semibold text-blue-900 mb-2">Privacy-First Beta Trial</p>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>✓ Use demo or anonymized student accounts during beta</li>
                <li>✓ No unnecessary personal information collected</li>
                <li>✓ Student identifiers use numeric IDs in analytics</li>
                <li>✓ Transparent data handling and privacy policy</li>
              </ul>
            </div>
            <Button variant="link" className="h-auto p-0 text-blue-700" asChild>
              <Link href="/beta-notice">Read full privacy policy →</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </section>

      {/* CTA Section */}
      <section className="container max-w-6xl mx-auto px-6 py-12">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6 text-center space-y-4">
            <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Login with demo credentials to explore the platform, or contact us
              about participating in the beta trial.
            </p>
            <div className="flex gap-4 justify-center pt-2">
              <Button size="lg" asChild>
                <Link href="/login">Login Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/beta-notice">Learn More</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container max-w-6xl mx-auto px-6 py-8">
        <Separator className="mb-6" />
        <div className="text-center text-sm text-muted-foreground">
          <p>AP CS Practice Lab · Beta Version</p>
          <p className="mt-1">For demo and evaluation purposes</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2" />
      <div>
        <h3 className="font-semibold text-sm mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
