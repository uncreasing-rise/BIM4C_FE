import { AdminShell } from "@/components/admin/AdminShell";
import { RecordsManager } from "@/components/admin/RecordsManager";
export default function Page() {
  return (
    <AdminShell
      title="Đăng ký khóa học"
      description="Quản lý học viên đăng ký từ website."
    >
      <RecordsManager kind="course-registrations" />
    </AdminShell>
  );
}
