import Link from "next/link";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContentManager } from "@/components/admin/ContentManager";

export const metadata={title:"Dịch vụ | BIM4C Admin"};
export default function Page(){return <AdminShell title="Dịch vụ" description="Quản lý danh mục và nội dung các dịch vụ BIM4C." action={<Link className="admin-primary" href="/admin/dich-vu?create=1"><span>＋</span> Tạo dịch vụ</Link>}><Suspense><ContentManager contentType="Dịch vụ"/></Suspense></AdminShell>}
