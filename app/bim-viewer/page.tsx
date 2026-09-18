import type { Metadata } from "next";
import { BimViewerPage } from "@/components/bim-viewer/BimViewerPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo/structured-data";
import { getRequestLocale } from "@/lib/i18n/request";
import { getAlternateLanguages, localizedPath } from "@/lib/seo/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const canonical = localizedPath("/bim-viewer", locale);
  return {
  title: "OpenBIM 3D Web Viewer | BIM4C",
  description:
    "Xem mô hình IFC trên trình duyệt, tra cứu thuộc tính gốc, đo bề mặt và khám phá hộp cắt 3D.",
  alternates: {
    canonical,
    languages: getAlternateLanguages("/bim-viewer"),
  },
  openGraph: {
    title: "OpenBIM 3D Web Viewer | BIM4C",
    description:
      "Browser-based IFC viewer using Three.js and Web-IFC, with source properties, surface measurements and section cuts.",
    url: canonical,
    locale: locale === "vi" ? "vi_VN" : "en_US",
    alternateLocale: [locale === "vi" ? "en_US" : "vi_VN"],
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
}

export default function BimViewerRoute() {
  return (
    <>
      <JsonLd data={[organizationSchema(), websiteSchema()]} />
      <BimViewerPage />
    </>
  );
}
