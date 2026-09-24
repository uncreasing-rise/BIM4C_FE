import { AdminShell } from "@/components/admin/AdminShell";
import { RecordsManager } from "@/components/admin/RecordsManager";
export default function Page() {
  return (
    <AdminShell
      title="Đăng ký khóa học"
      description="Học viên đăng ký khóa học từ website."
    >
      <RecordsManager kind="course-registrations" />
    </AdminShell>
  );
}
