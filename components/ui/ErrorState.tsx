"use client";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { ui } from "@/lib/i18n/ui";
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title,
  message,
  onRetry,
}: ErrorStateProps) {
  const { locale } = useLanguage();

  const defaultTitle = ui(locale).errorState.weCouldNotLoadThis;
  const defaultMessage = ui(locale).errorState.aConnectionIssueOccurredOr;
  const retryLabel = ui(locale).errorState.tryAgain;

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center shadow-xs">
      <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </div>
      <h3 className="text-xl font-bold text-foreground">{title || defaultTitle}</h3>
      <p className="my-3 text-sm leading-relaxed text-muted-foreground">
        {message || defaultMessage}
      </p>
      {onRetry && (
        <Button
          type="button"
          onClick={onRetry}
          variant="outline"
          className="mt-2 inline-flex items-center gap-2 rounded-lg border-destructive/30 hover:bg-destructive/10"
        >
          <RotateCcw className="size-4" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
