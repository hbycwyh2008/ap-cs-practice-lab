import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface DemoAccountCardProps {
  accounts: Array<{
    role: string;
    email: string;
    password: string;
  }>;
}

export function DemoAccountCard({ accounts }: DemoAccountCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Demo Accounts</CardTitle>
          <Badge variant="secondary">Beta</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {accounts.map((account, index) => (
          <div key={index} className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {account.role}:
            </p>
            <div className="rounded-md bg-muted p-3 font-mono text-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email:</span>
                <code className="text-foreground">{account.email}</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Password:</span>
                <code className="text-foreground">{account.password}</code>
              </div>
            </div>
          </div>
        ))}
        <Alert>
          <AlertDescription className="text-xs">
            These credentials are for demo purposes only. Do not use in
            production.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
