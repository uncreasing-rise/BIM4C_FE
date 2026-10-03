import type { Metadata } from "next";
import { BimViewerPage } from "@/components/bim-viewer/BimViewerPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  organizationSchema,
  webApplicationSchema,
  websiteSchema,
} from "@/lib/seo/structured-data";
import { getSiteSettings } from "@/features/settings/queries";
import { getRequestLocale } from "@/lib/i18n/request";
import { pageMetadata } from "@/lib/seo/listing";
import { localizedPath } from "@/lib/seo/site";

const META = {
  vi: {
    title: "Trình xem mô hình BIM 3D trực tuyến (IFC)",
    description:
      "Xem mô hình IFC ngay trên trình duyệt: tra cứu thuộc tính gốc, đo đạc 3D, mặt cắt, kiểm tra xung đột và bóc tách khối lượng.",
    features: [
      "Mở và ghép nhiều tệp IFC2x3/IFC4",
      "Tra cứu thuộc tính, Pset và cây không gian",
      "Đo khoảng cách, góc, diện tích và tọa độ trong 3D",
      "Hộp cắt và mặt bằng theo tầng",
      "Kiểm tra xung đột giữa các bộ môn",
      "Bóc tách khối lượng, xuất CSV",
    ],
  },
  en: {
    title: "OpenBIM 3D Web Viewer (IFC)",
    description:
      "View IFC models in your browser: inspect source properties, measure in 3D, cut sections, check clashes and take off quantities.",
    features: [
      "Open and federate multiple IFC2x3/IFC4 files",
      "Inspect properties, Psets and the spatial tree",
      "Measure distance, angle, area and coordinates in 3D",
      "Section box and storey plans",
      "Clash detection between disciplines",
      "Quantity take-off with CSV export",
    ],
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = META[await getRequestLocale()];
  // No brand suffix here: the root layout's title template adds " | BIM4C".
  return pageMetadata(title, description, "/bim-viewer", "/images/news-digital-twin.webp");
}

export default async function BimViewerRoute() {
  const locale = await getRequestLocale();
  const meta = META[locale];
  const settings = await getSiteSettings();
  return (
    <>
      <JsonLd
        data={[
          organizationSchema(settings),
          websiteSchema(),
          webApplicationSchema({
            name: meta.title,
            description: meta.description,
            path: localizedPath("/bim-viewer", locale),
            language: locale,
            features: [...meta.features],
          }),
        ]}
      />
      <BimViewerPage />
    </>
  );
}
