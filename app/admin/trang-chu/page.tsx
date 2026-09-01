import { HomepageManager } from "@/components/admin/HomepageManager";
import { AdminShell } from "@/components/admin/AdminShell";
export default function Page() {
  return (
    <AdminShell
      title="Trang chủ"
      description="Quản lý slide và đối tác chiến lược."
    >
      <HomepageManager />
    </AdminShell>
  );
}
