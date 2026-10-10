import type { Metadata } from "next";
import "../globals.css";
import { Manrope } from "next/font/google";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/lib/i18n/context";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";
import { SITE_NAME } from "@/lib/seo/site";

const fontSans = Manrope({
  subsets: ["latin", "vietnamese"],
  variable: "--font-bim4c",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: `${SITE_NAME} Admin`, template: `%s | ${SITE_NAME}` },
  robots: { index: false, follow: false, noarchive: true, nocache: true },
};

/**
 * Root layout of the admin, separate from app/[locale]: the admin UI is
 * Vietnamese-only, whatever language the visitor last browsed the site in.
 */
export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      className={cn("font-sans", fontSans.variable)}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <LanguageProvider initialLocale="vi">
          {children}
          <Toaster richColors position="top-right" closeButton />
          <AnalyticsTracker />
        </LanguageProvider>
      </body>
    </html>
  );
}
