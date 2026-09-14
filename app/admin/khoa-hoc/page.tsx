import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContentManager } from "@/components/admin/ContentManager";

export const metadata = { title: "Khóa học | BIM4C Admin" };

export default function Page() {
  return (
    <AdminShell
      title="Khóa học & Đào tạo"
      description="Quản lý chương trình học viện, giáo trình chi tiết và thông số đào tạo chuyên môn."
    >
      <Suspense fallback={<div className="p-12 text-center text-xs text-muted-foreground">Đang tải danh sách khóa học...</div>}>
        <ContentManager contentType="Khóa học" />
      </Suspense>
    </AdminShell>
  );
}
