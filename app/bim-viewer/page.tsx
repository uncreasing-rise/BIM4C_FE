import type { Metadata } from "next";
import { BimViewerPage } from "@/components/bim-viewer/BimViewerPage";

export const metadata: Metadata = {
  title: "OpenBIM 3D Web Viewer | BIM4C",
  description:
    "Xem mô hình IFC trên trình duyệt, tra cứu thuộc tính gốc, đo bề mặt và khám phá hộp cắt 3D.",
  openGraph: {
    title: "OpenBIM 3D Web Viewer | BIM4C",
    description:
      "Browser-based IFC viewer using Three.js and Web-IFC, with source properties, surface measurements and section cuts.",
    images: ["/images/news-digital-twin.webp"],
  },
};

export default function BimViewerRoute() {
  return <BimViewerPage />;
}
