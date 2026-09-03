import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { Dashboard } from "@/components/admin/Dashboard";
export const metadata = { title: "Tổng quan | BIM4C Admin" };
export default function AdminDashboard() {
  return (
    <AdminShell
      title="Tổng quan"
      description="Dữ liệu quản trị trực tiếp từ PostgreSQL."
      action={
        <Link
          className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded bg-primary px-[18px] text-xs font-semibold text-white transition hover:bg-primary"
          href="/admin/tin-tuc?create=1"
          prefetch={false}
        >
          <span>＋</span> Tạo tin tức
        </Link>
      }
    >
      <Dashboard />
    </AdminShell>
  );
}
