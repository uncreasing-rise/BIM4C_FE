import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return <main className="page-shell empty-projects"><strong>Không tìm thấy nội dung</strong><p>Trang bạn yêu cầu không tồn tại hoặc đã được di chuyển.</p><Link className="button button-primary" href={ROUTES.home}>Về trang chủ</Link></main>;
}
