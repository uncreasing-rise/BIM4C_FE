import type { Metadata } from "next";
import { NotFoundView } from "@/components/shared/NotFoundView";

export const metadata: Metadata = {
  // absolute: skip the layout's " | BIM4C" template.
  title: { absolute: "404 - Không tìm thấy trang | Page Not Found" },
  robots: { index: false, follow: false },
  // Not the homepage's canonical/hreflang inherited from the root layout.
  alternates: { canonical: null, languages: {} },
  openGraph: null,
  twitter: null,
};

export default function NotFound() {
  return <NotFoundView />;
}
