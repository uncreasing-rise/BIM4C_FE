import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return <div className="border border-[#dbe7e5] bg-white px-6 py-20 text-center"><strong className="text-2xl text-[#063f46]">{title}</strong>{description && <p className="mt-3 text-[#667775]">{description}</p>}{action}</div>;
}
