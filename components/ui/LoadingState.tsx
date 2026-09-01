export function LoadingState({
  label = "Đang tải dữ liệu",
}: {
  label?: string;
}) {
  return (
    <div
      className="flex min-h-48 items-center justify-center gap-3 text-sm text-[#667775]"
      role="status"
      aria-live="polite"
    >
      <span
        className="size-5 animate-spin rounded-full border-2 border-[#dbe7e5] border-t-[#09a7a5]"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}
