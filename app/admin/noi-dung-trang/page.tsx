import { AdminShell } from "@/components/admin/AdminShell";
import { PageContentManager } from "@/components/admin/PageContentManager";

export default function Page() {
  return (
    <AdminShell
      title="Nội dung trang"
      description="Chữ hiển thị trên trang chủ, giới thiệu, dịch vụ, đào tạo và liên hệ."
    >
      <PageContentManager />
    </AdminShell>
  );
}
