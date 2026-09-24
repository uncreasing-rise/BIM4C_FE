import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContentManager } from "@/components/admin/ContentManager";

export const metadata = { title: "Khóa học | BIM4C Admin" };

export default function Page() {
  return (
    <AdminShell
      title="Khóa học"
      description="Chương trình đào tạo, giáo trình và thông tin khóa học."
    >
      <Suspense fallback={<div className="p-12 text-center text-xs text-muted-foreground">Đang tải danh sách khóa học...</div>}>
        <ContentManager contentType="Khóa học" />
      </Suspense>
    </AdminShell>
  );
}
