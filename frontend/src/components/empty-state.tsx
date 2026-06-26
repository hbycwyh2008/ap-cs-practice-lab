import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?:
    | React.ReactNode
    | {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  icon?: React.ReactNode | React.ElementType;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === "function" || typeof icon === "object") {
      const IconComponent = icon as React.ElementType;
      return <IconComponent className="w-8 h-8" />;
    }
    return null;
  };

  const renderAction = () => {
    if (!action) return null;
    if (React.isValidElement(action)) {
      return action;
    }
    if (typeof action !== "object" || !("label" in action)) {
      return null;
    }
    return (
      <Button onClick={action.onClick} asChild={!!action.href}>
        {action.href ? <a href={action.href}>{action.label}</a> : action.label}
      </Button>
    );
  };

  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {icon && <div className="mb-4 text-muted-foreground">{renderIcon()}</div>}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            {description}
          </p>
        )}
        {action && renderAction()}
      </CardContent>
    </Card>
  );
}
