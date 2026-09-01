import { AdminShell } from "@/components/admin/AdminShell";
import { RecordsManager } from "@/components/admin/RecordsManager";
export default function Page() {
  return (
    <AdminShell title="Newsletter" description="Quản lý danh sách nhận tin.">
      <RecordsManager kind="newsletter/subscriptions" />
    </AdminShell>
  );
}
