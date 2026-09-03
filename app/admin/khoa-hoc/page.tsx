import Link from "next/link";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContentManager } from "@/components/admin/ContentManager";

export const metadata = { title: "Khóa học | BIM4C Admin" };
export default function Page() {
  return (
    <AdminShell
      title="Khóa học"
      description="Quản lý chương trình, nội dung và thông tin khóa học."
      action={
        <Link
          className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded bg-primary px-[18px] text-xs font-semibold text-white transition hover:bg-primary"
          href="/admin/khoa-hoc?create=1"
          prefetch={false}
        >
          <span>＋</span> Tạo khóa học
        </Link>
      }
    >
      <Suspense>
        <ContentManager contentType="Khóa học" />
      </Suspense>
    </AdminShell>
  );
}
