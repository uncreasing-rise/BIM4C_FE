import { AdminShell } from "@/components/admin/AdminShell";
import { AppointmentsManager } from "@/components/admin/AppointmentsManager";
export default function Page() { return <AdminShell title="Lịch tư vấn" description="Khung giờ nhận tư vấn và lịch hẹn khách đặt từ website."><AppointmentsManager /></AdminShell>; }
