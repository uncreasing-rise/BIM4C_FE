import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContentManager } from "@/components/admin/ContentManager";

export const metadata = { title: "Dự án | BIM4C Admin" };

export default function Page() {
  return (
    <AdminShell
      title="Dự án & Hồ sơ Năng lực"
      description="Quản lý thông tin dự án tiêu biểu, mô hình OpenBIM và hình ảnh thực tế."
    >
      <Suspense fallback={<div className="p-12 text-center text-xs text-muted-foreground">Đang tải danh sách dự án...</div>}>
        <ContentManager contentType="Dự án" />
      </Suspense>
    </AdminShell>
  );
}
