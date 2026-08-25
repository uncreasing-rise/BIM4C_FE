import Link from "next/link";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContentManager } from "@/components/admin/ContentManager";

export const metadata={title:"Khóa học | BIM4C Admin"};
export default function Page(){return <AdminShell title="Khóa học" description="Quản lý chương trình, nội dung và thông tin khóa học." action={<Link className="admin-primary" href="/admin/khoa-hoc?create=1"><span>＋</span> Tạo khóa học</Link>}><Suspense><ContentManager contentType="Khóa học"/></Suspense></AdminShell>}
