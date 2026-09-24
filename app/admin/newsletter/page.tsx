import { AdminShell } from "@/components/admin/AdminShell";
import { RecordsManager } from "@/components/admin/RecordsManager";
export default function Page() {
  return (
    <AdminShell title="Bản tin" description="Danh sách email đăng ký nhận tin (newsletter).">
      <RecordsManager kind="newsletter/subscriptions" />
    </AdminShell>
  );
}
