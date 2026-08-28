import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return <main className="mx-auto my-16 w-[calc(100%_-_32px)] max-w-[1220px] border border-[#dbe7e5] bg-white px-6 py-20 text-center"><strong className="text-2xl text-[#063f46]">Không tìm thấy nội dung</strong><p className="my-3 text-[#667775]">Trang bạn yêu cầu không tồn tại hoặc đã được di chuyển.</p><Link className="inline-flex min-h-12 items-center bg-[#09a7a5] px-6 text-xs font-semibold uppercase text-white" href={ROUTES.home}>Về trang chủ</Link></main>;
}
