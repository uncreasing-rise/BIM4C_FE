import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto my-12 w-[calc(100%_-_32px)] max-w-[1220px] border border-border bg-background px-6 py-16 text-center">
      <strong className="text-2xl text-foreground">
        Không tìm thấy nội dung
      </strong>
      <p className="my-3 text-muted-foreground">
        Trang bạn yêu cầu không tồn tại hoặc đã được di chuyển.
      </p>
      <Button asChild><Link href={ROUTES.home}>Về trang chủ</Link></Button>
    </main>
  );
}
