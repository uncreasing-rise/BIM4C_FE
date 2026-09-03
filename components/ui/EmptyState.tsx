import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="shadow-none"><CardContent className="px-6 py-20 text-center">
      <strong className="text-2xl text-foreground">{title}</strong>
      {description && <p className="mt-3 text-muted-foreground">{description}</p>}
      {action}
    </CardContent></Card>
  );
}
