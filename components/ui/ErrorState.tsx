"use client";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Không thể tải dữ liệu", message, onRetry }: ErrorStateProps) {
  return <div className="border border-[#dbe7e5] bg-white px-6 py-16 text-center" role="alert"><strong className="text-2xl text-[#063f46]">{title}</strong><p className="my-3 text-[#667775]">{message}</p>{onRetry && <button className="button-primary" type="button" onClick={onRetry}>Thử lại</button>}</div>;
}
