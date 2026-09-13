"use client";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";
import { AlertTriangle, RotateCcw } from "lucide-react";

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
  const isVi = locale === "vi";

  const defaultTitle = isVi
    ? "Không thể tải nội dung này"
    : "We could not load this content";
  const defaultMessage = isVi
    ? "Đã có sự cố kết nối hoặc nội dung tạm thời không khả dụng. Vui lòng thử lại."
    : "A connection issue occurred or this content is temporarily unavailable. Please try again.";
  const retryLabel = isVi ? "Thử lại" : "Try again";

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
