export function LoadingState({ label = "Đang tải dữ liệu" }: { label?: string }) {
  return <div className="loading-state" role="status" aria-live="polite"><span aria-hidden="true"/><span>{label}</span></div>;
}

