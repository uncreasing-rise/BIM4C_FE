import { AdminShell } from "@/components/admin/AdminShell";
import { SettingsManager } from "@/components/admin/SettingsManager";
export default function Page() {
  return (
    <AdminShell
      title="Cài đặt"
      description="Thông tin doanh nghiệp và SEO mặc định."
    >
      <SettingsManager />
    </AdminShell>
  );
}
