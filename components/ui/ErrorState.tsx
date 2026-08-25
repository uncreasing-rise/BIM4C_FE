"use client";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Không thể tải dữ liệu", message, onRetry }: ErrorStateProps) {
  return <div className="empty-projects" role="alert"><strong>{title}</strong><p>{message}</p>{onRetry && <button className="button button-primary" type="button" onClick={onRetry}>Thử lại</button>}</div>;
}

