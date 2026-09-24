import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContentManager } from "@/components/admin/ContentManager";

export const metadata = { title: "Dịch vụ | BIM4C Admin" };

export default function Page() {
  return (
    <AdminShell
      title="Dịch vụ"
      description="Các dịch vụ tư vấn BIM, chuyển giao công nghệ và giải pháp số."
    >
      <Suspense fallback={<div className="p-12 text-center text-xs text-muted-foreground">Đang tải danh sách dịch vụ...</div>}>
        <ContentManager contentType="Dịch vụ" />
      </Suspense>
    </AdminShell>
  );
}
