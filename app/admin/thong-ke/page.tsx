import { AdminShell } from "@/components/admin/AdminShell";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
export default function Page() {
  return (
    <AdminShell
      title="Thống kê truy cập"
      description="Lượt xem, khách truy cập, nội dung được quan tâm, nguồn truy cập và khách hàng tiềm năng."
    >
      <AnalyticsDashboard />
    </AdminShell>
  );
}
