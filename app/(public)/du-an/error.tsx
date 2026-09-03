"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function ProjectsError({ retry }: { retry: () => void }) {
  return (
    <main className="mx-auto my-16 w-[calc(100%_-_32px)] max-w-[1200px] md:w-[calc(100%_-_48px)]">
      <ErrorState
        message="Danh sách dự án tạm thời chưa thể tải. Vui lòng thử lại."
        onRetry={retry}
      />
    </main>
  );
}
