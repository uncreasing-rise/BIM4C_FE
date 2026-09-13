import type { Metadata } from "next";
import { cookies } from "next/headers";
import { env } from "@/lib/config/env";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_SOCIAL_IMAGE,
  DEFAULT_TITLE,
  SITE_NAME,
} from "@/lib/seo/site";
import "./globals.css";
import { Manrope } from "next/font/google";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/lib/i18n/context";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  type Locale,
} from "@/lib/i18n/config";
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

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: { default: DEFAULT_TITLE, template: `%s | ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    url: "/",
    images: [{ url: DEFAULT_SOCIAL_IMAGE, alt: "BIM4C Construction" }],
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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value as Locale;
  const locale: Locale = rawLocale === "vi" ? "vi" : DEFAULT_LOCALE;

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
