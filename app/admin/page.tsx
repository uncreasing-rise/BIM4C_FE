import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { Dashboard } from "@/components/admin/Dashboard";
import { Plus, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Tổng quan | BIM4C Admin" };

export default function AdminDashboard() {
  return (
    <AdminShell
      title="Bảng điều khiển Trung tâm"
      description="Tổng quan hệ sinh thái dữ liệu, chỉ số tăng trưởng và yêu cầu liên hệ."
      action={
        <div className="flex items-center gap-2">
          <Link href="/admin/tin-tuc?create=1">
            <Button size="sm" className="gap-1.5 text-xs font-semibold bg-primary text-white">
              <Plus className="size-3.5" />
              <span>Viết bài mới</span>
            </Button>
          </Link>
          <Link href="/admin/du-an?create=1">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs font-semibold">
              <Plus className="size-3.5" />
              <span>Thêm dự án</span>
            </Button>
          </Link>
        </div>
      }
    >
      <Dashboard />
    </AdminShell>
  );
}
