import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { MotionObserver } from "@/components/shared/MotionObserver";
import { env } from "@/lib/config/env";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
  adjustFontFallback: true,
});

export const metadata: Metadata = { metadataBase: env.appUrl ? new URL(env.appUrl) : undefined, title: "BIM4C Construction | Chuyển đổi số xây dựng", description: "BIM4C tiên phong ứng dụng BIM trong thiết kế, thi công và quản lý dự án xây dựng tại Việt Nam.", openGraph: { title: "BIM4C Construction", description: "Kiến tạo nền tảng vững chắc cho tương lai xây dựng.", type: "website", locale: "vi_VN" } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="vi" className={montserrat.variable} data-scroll-behavior="smooth"><body className={montserrat.className}><MotionObserver/><SiteChrome>{children}</SiteChrome></body></html>; }
