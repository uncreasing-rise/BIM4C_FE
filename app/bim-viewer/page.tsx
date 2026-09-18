import type { Metadata } from "next";
import { BimViewerPage } from "@/components/bim-viewer/BimViewerPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "OpenBIM 3D Web Viewer | BIM4C",
  description:
    "Xem mô hình IFC trên trình duyệt, tra cứu thuộc tính gốc, đo bề mặt và khám phá hộp cắt 3D.",
  alternates: {
    canonical: "/bim-viewer",
  },
  openGraph: {
    title: "OpenBIM 3D Web Viewer | BIM4C",
    description:
      "Browser-based IFC viewer using Three.js and Web-IFC, with source properties, surface measurements and section cuts.",
    url: "/bim-viewer",
    images: ["/images/news-digital-twin.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenBIM 3D Web Viewer | BIM4C",
    description:
      "Browser-based IFC viewer using Three.js and Web-IFC, with source properties, surface measurements and section cuts.",
    images: ["/images/news-digital-twin.webp"],
  },
};

export default function BimViewerRoute() {
  return (
    <>
      <JsonLd data={[organizationSchema(), websiteSchema()]} />
      <BimViewerPage />
    </>
  );
}
