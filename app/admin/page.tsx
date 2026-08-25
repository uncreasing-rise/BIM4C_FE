import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { Dashboard } from "@/components/admin/Dashboard";
export const metadata = { title: "Tổng quan | BIM4C Admin" };
export default function AdminDashboard() { return <AdminShell title="Tổng quan" description="Dữ liệu quản trị trực tiếp từ PostgreSQL." action={<Link className="admin-primary" href="/admin/tin-tuc?create=1"><span>＋</span> Tạo tin tức</Link>}><Dashboard/></AdminShell>; }
