import Link from "next/link";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContentManager } from "@/components/admin/ContentManager";

export const metadata={title:"Tin tức | BIM4C Admin"};
export default function Page(){return <AdminShell title="Tin tức" description="Quản lý bài viết, sự kiện và các cập nhật của BIM4C." action={<Link className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded bg-[#087f7d] px-[18px] text-xs font-semibold text-white transition hover:bg-[#087f7d]" href="/admin/tin-tuc?create=1"><span>＋</span> Tạo tin tức</Link>}><Suspense><ContentManager contentType="Tin tức"/></Suspense></AdminShell>}
