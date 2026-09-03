import type { Metadata } from "next";
import { env } from "@/lib/config/env";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: env.appUrl ? new URL(env.appUrl) : undefined,
  title: "BIM4C Construction | Chuyển đổi số xây dựng",
  description:
    "BIM4C tiên phong ứng dụng BIM trong thiết kế, thi công và quản lý dự án xây dựng tại Việt Nam.",
  openGraph: {
    title: "BIM4C Construction",
    description: "Kiến tạo nền tảng vững chắc cho tương lai xây dựng.",
    type: "website",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" data-scroll-behavior="smooth" className={cn("font-sans", geist.variable)}>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
