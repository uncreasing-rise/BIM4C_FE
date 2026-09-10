"use client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "We could not load this content",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <Alert variant="destructive" className="px-6 py-12 text-center">
      <AlertTitle className="text-xl">{title}</AlertTitle>
      <AlertDescription className="my-3">{message}</AlertDescription>
      {onRetry && (
        <Button type="button" onClick={onRetry}>
          Try again
        </Button>
      )}
    </Alert>
  );
}
