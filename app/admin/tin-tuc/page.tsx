import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContentManager } from "@/components/admin/ContentManager";

export const metadata = { title: "Tin tức | BIM4C Admin" };

export default function Page() {
  return (
    <AdminShell
      title="Tin tức & Hoạt động Công ty"
      description="Quản lý tin tức doanh nghiệp, sự kiện hợp tác chiến lược, thông cáo báo chí và hoạt động văn hóa của BIM4C."
    >
      <Suspense fallback={<div className="p-12 text-center text-xs text-muted-foreground">Đang tải danh sách bài viết...</div>}>
        <ContentManager contentType="Tin tức" />
      </Suspense>
    </AdminShell>
  );
}
