import type { Metadata } from "next";
import { BimViewerPage } from "@/components/bim-viewer/BimViewerPage";

export const metadata: Metadata = {
  title: "OpenBIM 3D Web Viewer Demo | BIM4C",
  description:
    "Trải nghiệm trực tiếp trình xem mô hình 3D OpenBIM trên trình duyệt: đo đạc kích thước 3D, cắt mặt phẳng Section Box, tra cứu thuộc tính IFC và kiểm soát xung đột BCF.",
  openGraph: {
    title: "OpenBIM 3D Web Viewer Demo | BIM4C",
    description:
      "Interactive 3D Web BIM Viewer powered by That Open Platform & Three.js with full IFC element inspection.",
    images: ["/images/news-digital-twin.webp"],
  },
};

export default function BimViewerRoute() {
  return <BimViewerPage />;
}
