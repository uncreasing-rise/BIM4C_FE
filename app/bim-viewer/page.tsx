import type { Metadata } from "next";
import { BimViewerPage } from "@/components/bim-viewer/BimViewerPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo/structured-data";
import { getSiteSettings } from "@/features/settings/queries";
import { getPageContent } from "@/features/page-content/queries";
import { getRequestLocale } from "@/lib/i18n/request";
import { pageMetadata } from "@/lib/seo/listing";

const META = {
  vi: {
    title: "Trình xem mô hình BIM 3D trực tuyến (IFC)",
    description:
      "Xem mô hình IFC ngay trên trình duyệt: tra cứu thuộc tính gốc, đo đạc 3D, mặt cắt, kiểm tra xung đột và bóc tách khối lượng.",
  },
  en: {
    title: "OpenBIM 3D Web Viewer (IFC)",
    description:
      "View IFC models in your browser: inspect source properties, measure in 3D, cut sections, check clashes and take off quantities.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = META[await getRequestLocale()];
  // No brand suffix here: the root layout's title template adds " | BIM4C".
  return pageMetadata(title, description, "/bim-viewer", "/images/news-digital-twin.webp");
}

export default async function BimViewerRoute() {
  const [settings, content] = await Promise.all([
    getSiteSettings(),
    getPageContent(),
  ]);
  return (
    <>
      <JsonLd
        data={[
          organizationSchema(settings, content.company?.vi),
          websiteSchema(),
        ]}
      />
      <BimViewerPage />
    </>
  );
}
