import { AdminShell } from "@/components/admin/AdminShell";
import { RecordsManager } from "@/components/admin/RecordsManager";
export default function Page() {
  return (
    <AdminShell
      title="Liên hệ"
      description="Yêu cầu tư vấn gửi từ form liên hệ trên website."
    >
      <RecordsManager kind="contacts" />
    </AdminShell>
  );
}
