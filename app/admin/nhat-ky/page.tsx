import { AdminShell } from "@/components/admin/AdminShell";
import { AuditLogManager } from "@/components/admin/AuditLogManager";
export default function Page() {
  return (
    <AdminShell
      title="Nhật ký kiểm toán"
      description="Lịch sử thao tác quan trọng, chỉ đọc."
    >
      <AuditLogManager />
    </AdminShell>
  );
}
