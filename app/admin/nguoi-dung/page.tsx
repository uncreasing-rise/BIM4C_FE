import { AdminShell } from "@/components/admin/AdminShell";
import { UsersManager } from "@/components/admin/UsersManager";
export default function Page() {
  return (
    <AdminShell
      title="Người dùng"
      description="Tài khoản quản trị, vai trò và trạng thái truy cập."
    >
      <UsersManager />
    </AdminShell>
  );
}
