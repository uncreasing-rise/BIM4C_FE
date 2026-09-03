import Link from "next/link";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContentManager } from "@/components/admin/ContentManager";

export const metadata = { title: "Dự án | BIM4C Admin" };
export default function Page() {
  return (
    <AdminShell
      title="Dự án"
      description="Quản lý hồ sơ và thông tin các dự án BIM4C."
      action={
        <Link
          className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded bg-primary px-[18px] text-xs font-semibold text-white transition hover:bg-primary"
          href="/admin/du-an?create=1"
          prefetch={false}
        >
          <span>＋</span> Tạo dự án
        </Link>
      }
    >
      <Suspense>
        <ContentManager contentType="Dự án" />
      </Suspense>
    </AdminShell>
  );
}
