import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusType =
  | "passed"
  | "failed"
  | "failed_compile"
  | "runtime_error"
  | "timeout"
  | "pending"
  | "active"
  | "archived"
  | "completed"
  | "in_progress";

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants: Record<
    string,
    { variant: "default" | "secondary" | "destructive" | "outline"; label: string }
  > = {
    passed: { variant: "default", label: "Passed" },
    failed: { variant: "destructive", label: "Failed" },
    failed_compile: { variant: "destructive", label: "Compile Error" },
    runtime_error: { variant: "destructive", label: "Runtime Error" },
    timeout: { variant: "destructive", label: "Timeout" },
    pending: { variant: "outline", label: "Pending" },
    active: { variant: "default", label: "Active" },
    archived: { variant: "secondary", label: "Archived" },
    completed: { variant: "default", label: "Completed" },
    in_progress: { variant: "outline", label: "In Progress" },
  };

  const config = variants[status.toLowerCase()] || {
    variant: "outline" as const,
    label: status,
  };

  return (
    <Badge variant={config.variant} className={cn("capitalize", className)}>
      {config.label}
    </Badge>
  );
}
