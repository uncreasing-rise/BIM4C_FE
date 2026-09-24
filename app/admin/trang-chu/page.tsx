import { HomepageManager } from "@/components/admin/HomepageManager";
import { AdminShell } from "@/components/admin/AdminShell";
export default function Page() {
  return (
    <AdminShell
      title="Trang chủ & đối tác"
      description="Logo đối tác, chủ đầu tư và đơn vị đồng hành hiển thị trên trang chủ."
    >
      <HomepageManager />
    </AdminShell>
  );
}
