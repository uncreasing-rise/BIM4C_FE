import type { Metadata } from "next";
import { getRequestLocale } from "@/lib/i18n/request";
import { localizedPath } from "@/lib/seo/site";
import { env } from "@/lib/config/env";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_SOCIAL_IMAGE,
  DEFAULT_TITLE,
  getAlternateLanguages,
  SITE_NAME,
} from "@/lib/seo/site";
import "./globals.css";
import { Manrope } from "next/font/google";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/config";
import { Toaster } from "sonner";

const fontSans = Manrope({
  subsets: ["latin", "vietnamese"],
  variable: "--font-bim4c",
  display: "swap",
});

// The layout reads the locale cookie, so every route is intentionally rendered
// dynamically. This also prevents ISR/SSG routes from bailing out with
// DYNAMIC_SERVER_USAGE when they traverse the root layout.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const canonical = localizedPath("/", locale);
  return {
  metadataBase: new URL(env.appUrl),
  title: { default: DEFAULT_TITLE, template: `%s | ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  applicationName: SITE_NAME,
  icons: {
    icon: [
      {
        url: "/images/bim4c-logo.png",
        type: "image/png",
      },
    ],
    shortcut: "/images/bim4c-logo.png",
    apple: "/images/bim4c-logo.png",
  },
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical,
    languages: getAlternateLanguages("/"),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
    locale: locale === "vi" ? "vi_VN" : "en_US",
    alternateLocale: [locale === "vi" ? "en_US" : "vi_VN"],
    url: "/",
    images: [{ url: DEFAULT_SOCIAL_IMAGE, alt: "BIM4C Digital Construction" }],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_SOCIAL_IMAGE],
  },
  verification: {
    google: env.googleSiteVerification || undefined,
    other: env.bingSiteVerification
      ? { "msvalidate.01": env.bingSiteVerification }
      : undefined,
  },
  };
}


export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale: Locale = await getRequestLocale();

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={cn("font-sans", fontSans.variable)}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <LanguageProvider initialLocale={locale}>
          {children}
          <Toaster richColors position="top-right" closeButton />
        </LanguageProvider>
      </body>
    </html>
  );
}
