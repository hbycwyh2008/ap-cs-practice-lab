import React from "react";
import Link from "next/link";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BetaNoticeCardProps {
  variant?: "default" | "destructive";
  showLink?: boolean;
}

export function BetaNoticeCard({
  variant = "default",
  showLink = true,
}: BetaNoticeCardProps) {
  return (
    <Alert variant={variant} className="bg-amber-50 border-amber-200">
      <AlertTitle className="flex items-center gap-2">
        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
          Beta Trial
        </Badge>
        Privacy Notice
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p className="text-sm">
          This platform is in beta. Use demo or anonymized student accounts only.
          Do not display real student data in screenshots or public demos.
        </p>
        {showLink && (
          <Button variant="link" size="sm" className="h-auto p-0" asChild>
            <Link href="/beta-notice">View full privacy policy →</Link>
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
