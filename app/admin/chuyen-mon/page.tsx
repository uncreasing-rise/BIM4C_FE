import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContentManager } from "@/components/admin/ContentManager";

export const metadata = { title: "Chuyên môn BIM | BIM4C Admin" };

export default function Page() {
  return (
    <AdminShell
      title="Chuyên môn BIM"
      description="Bài viết chuyên sâu: Scan-to-BIM, ISO 19650, Revit API, MEP, Digital Twin."
    >
      <Suspense fallback={<div className="p-12 text-center text-xs text-muted-foreground">Đang tải danh sách bài viết chuyên môn...</div>}>
        <ContentManager contentType="Chuyên môn" />
      </Suspense>
    </AdminShell>
  );
}
