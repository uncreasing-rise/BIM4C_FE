import { HomepageManager } from "@/components/admin/HomepageManager";
import { AdminShell } from "@/components/admin/AdminShell";
export default function Page() {
  return (
    <AdminShell
      title="Đối tác & Khách hàng"
      description="Quản lý danh sách logo đối tác chiến lược, chủ đầu tư và đơn vị đồng hành."
    >
      <HomepageManager />
    </AdminShell>
  );
}
