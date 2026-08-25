import Link from "next/link";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContentManager } from "@/components/admin/ContentManager";

export const metadata={title:"Tin tức | BIM4C Admin"};
export default function Page(){return <AdminShell title="Tin tức" description="Quản lý bài viết, sự kiện và các cập nhật của BIM4C." action={<Link className="admin-primary" href="/admin/tin-tuc?create=1"><span>＋</span> Tạo tin tức</Link>}><Suspense><ContentManager contentType="Tin tức"/></Suspense></AdminShell>}
