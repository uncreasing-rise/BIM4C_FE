import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContentManager } from "@/components/admin/ContentManager";

export const metadata = { title: "Kiến thức Chuyên môn BIM | BIM4C Admin" };

export default function Page() {
  return (
    <AdminShell
      title="Kiến thức & Bài viết Chuyên môn BIM"
      description="Quản lý các bài nghiên cứu học thuật, hướng dẫn Scan-to-BIM, ISO 19650, Revit API, MEP và Digital Twin của BIM4C."
    >
      <Suspense fallback={<div className="p-12 text-center text-xs text-muted-foreground">Đang tải danh sách bài viết chuyên môn...</div>}>
        <ContentManager contentType="Chuyên môn" />
      </Suspense>
    </AdminShell>
  );
}
