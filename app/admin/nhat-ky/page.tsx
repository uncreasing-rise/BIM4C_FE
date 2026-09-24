import { AdminShell } from "@/components/admin/AdminShell";
import { AuditLogManager } from "@/components/admin/AuditLogManager";
export default function Page() {
  return (
    <AdminShell
      title="Nhật ký hoạt động"
      description="Lịch sử thao tác của quản trị viên. Chỉ đọc, không thể chỉnh sửa."
    >
      <AuditLogManager />
    </AdminShell>
  );
}
