"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="mx-auto my-16 w-[calc(100%_-_32px)] max-w-[1220px]"><ErrorState message="Nội dung tạm thời chưa thể tải. Vui lòng thử lại." onRetry={reset}/></main>;
}
