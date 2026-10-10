import type { Metadata } from "next";
import "./globals.css";
import { Manrope } from "next/font/google";
import { cn } from "@/lib/utils";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { LanguageProvider } from "@/lib/i18n/context";
import { NotFoundView } from "@/components/shared/NotFoundView";

const fontSans = Manrope({
  subsets: ["latin", "vietnamese"],
  variable: "--font-bim4c",
  display: "swap",
});

export const metadata: Metadata = {
  title: "404 - Không tìm thấy trang | Page Not Found",
  robots: { index: false, follow: false },
};

/**
 * 404 for URLs outside every root layout: an unknown first segment (/xx/...)
 * or a path no route matches. Missing entries under /vi or /en use
 * app/[locale]/not-found.tsx instead.
 */
export default function GlobalNotFound() {
  return (
    <html lang={DEFAULT_LOCALE} className={cn("font-sans", fontSans.variable)}>
      <body>
        <LanguageProvider initialLocale={DEFAULT_LOCALE}>
          <NotFoundView />
        </LanguageProvider>
      </body>
    </html>
  );
}
