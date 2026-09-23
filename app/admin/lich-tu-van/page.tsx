import { AdminShell } from "@/components/admin/AdminShell";
import { AppointmentsManager } from "@/components/admin/AppointmentsManager";
export default function Page() { return <AdminShell title="Lịch tư vấn" description="Quản lý khung giờ và các cuộc hẹn từ website."><AppointmentsManager /></AdminShell>; }
