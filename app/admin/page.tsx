import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Dashboard } from "@/components/admin/Dashboard";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Tổng quan | BIM4C Admin" };

export default function AdminDashboard() {
  return (
    <AdminShell
      title="Tổng quan"
      description="Tình trạng nội dung và yêu cầu khách hàng cần xử lý."
      action={
        <>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/du-an?create=1">
              <Plus className="size-4" />
              Thêm dự án
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/tin-tuc?create=1">
              <Plus className="size-4" />
              Viết bài mới
            </Link>
          </Button>
        </>
      }
    >
      <Dashboard />
    </AdminShell>
  );
}
