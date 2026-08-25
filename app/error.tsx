"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="page-shell"><ErrorState message="Nội dung tạm thời chưa thể tải. Vui lòng thử lại." onRetry={reset}/></main>;
}

