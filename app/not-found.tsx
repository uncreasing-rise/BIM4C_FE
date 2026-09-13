import type { Metadata } from "next";
import { NotFoundView } from "@/components/shared/NotFoundView";

export const metadata: Metadata = {
  title: "404 - Không tìm thấy trang | Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <NotFoundView />;
}
