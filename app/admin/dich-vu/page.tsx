import Link from "next/link";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContentManager } from "@/components/admin/ContentManager";

export const metadata = { title: "Dịch vụ | BIM4C Admin" };
export default function Page() {
  return (
    <AdminShell
      title="Dịch vụ"
      description="Quản lý danh mục và nội dung các dịch vụ BIM4C."
      action={
        <Link
          className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded bg-primary px-[18px] text-xs font-semibold text-white transition hover:bg-primary"
          href="/admin/dich-vu?create=1"
          prefetch={false}
        >
          <span>＋</span> Tạo dịch vụ
        </Link>
      }
    >
      <Suspense>
        <ContentManager contentType="Dịch vụ" />
      </Suspense>
    </AdminShell>
  );
}
