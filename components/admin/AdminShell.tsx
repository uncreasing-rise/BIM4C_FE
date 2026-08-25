"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { can, currentAdmin, type AdminIdentity } from "@/features/admin/auth";

const navigation=[
  {href:"/admin",label:"Tổng quan",icon:"⌂"},{href:"/admin/trang-chu",label:"Trang chủ",icon:"◦"},{href:"/admin/tin-tuc",label:"Tin tức",icon:"▤"},{href:"/admin/du-an",label:"Dự án",icon:"◇"},{href:"/admin/khoa-hoc",label:"Khóa học",icon:"▱"},{href:"/admin/dich-vu",label:"Dịch vụ",icon:"◈"},{href:"/admin/media",label:"Thư viện",icon:"▧"},{href:"/admin/lien-he",label:"Liên hệ",icon:"✉"},{href:"/admin/dang-ky-khoa-hoc",label:"Đăng ký khóa học",icon:"▥"},{href:"/admin/newsletter",label:"Newsletter",icon:"◎"},
];
const system=[{href:"/admin/nguoi-dung",label:"Người dùng",icon:"♙",permission:"users.read"},{href:"/admin/nhat-ky",label:"Nhật ký",icon:"≡",permission:"audit.read"},{href:"/admin/cai-dat",label:"Cài đặt",icon:"⚙",permission:"settings.read"}];

export function AdminShell({children,title,description,action}:{children:React.ReactNode;title:string;description:string;action?:React.ReactNode}) {
  const pathname=usePathname();const router=useRouter();const[open,setOpen]=useState(false);const[user,setUser]=useState<AdminIdentity|null>(null);
  useEffect(()=>{currentAdmin().then(setUser).catch(()=>router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`));},[pathname,router]);
  const links=(items:Array<{href:string;label:string;icon:string;permission?:string}>)=>items.filter(item=>!item.permission||can(user,item.permission)).map(item=><Link onClick={()=>setOpen(false)} className={pathname===item.href||pathname.startsWith(`${item.href}/`)?"active":""} href={item.href} key={item.href}><span>{item.icon}</span>{item.label}</Link>);
  async function logout(){await fetch('/api/auth/logout',{method:'POST'});router.replace('/admin/login');router.refresh()}
  return <div className="admin-app"><aside className={`admin-sidebar${open?" open":""}`}><div className="admin-brand"><Link href="/">BIM<span>4C</span></Link><small>CONTENT STUDIO</small></div><nav><p>QUẢN TRỊ</p>{links(navigation)}<p>HỆ THỐNG</p>{links(system)}</nav><div className="admin-profile"><div>{user?.name?.slice(0,2).toUpperCase()??'--'}</div><span><strong>{user?.name??'Đang tải…'}</strong><small>{user?.roles.join(', ')}</small></span><button onClick={()=>void logout()} aria-label="Đăng xuất">↪</button></div></aside>{open&&<button className="admin-backdrop" onClick={()=>setOpen(false)} aria-label="Đóng menu"/>}<section className="admin-workspace"><header className="admin-topbar"><button className="admin-menu" onClick={()=>setOpen(true)} aria-label="Mở menu">☰</button><div className="admin-search"><span>⌕</span><input aria-label="Tìm kiếm toàn hệ thống" placeholder="Tìm nội dung, dự án, khóa học..."/></div><div className="admin-top-actions"><Link href="/" target="_blank">Xem website ↗</Link><button onClick={()=>void logout()}>Đăng xuất</button></div></header><div className="admin-page"><header className="admin-page-head"><div><p>BIM4C / ADMIN</p><h1>{title}</h1><span>{description}</span></div>{action}</header>{children}</div></section></div>;
}
