import { AdminShell } from "@/components/admin/AdminShell";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
export const metadata={title:"Thư viện | BIM4C Admin"};
export default function MediaPage(){return <AdminShell title="Thư viện media" description="Quản lý hình ảnh và tài liệu được sử dụng trên website."><MediaLibrary/></AdminShell>}
