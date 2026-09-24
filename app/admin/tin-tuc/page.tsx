import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContentManager } from "@/components/admin/ContentManager";

export const metadata = { title: "Tin tức | BIM4C Admin" };

export default function Page() {
  return (
    <AdminShell
      title="Tin tức & sự kiện"
      description="Tin doanh nghiệp, sự kiện, thông cáo báo chí và hoạt động của BIM4C."
    >
      <Suspense fallback={<div className="p-12 text-center text-xs text-muted-foreground">Đang tải danh sách bài viết...</div>}>
        <ContentManager contentType="Tin tức" />
      </Suspense>
    </AdminShell>
  );
}
