import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRequestLocale } from "@/lib/i18n/request";
import { localizedPath } from "@/lib/seo/site";
import { env } from "@/lib/config/env";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_DESCRIPTION_EN,
  DEFAULT_KEYWORDS,
  DEFAULT_SOCIAL_IMAGE,
  DEFAULT_TITLE,
  DEFAULT_TITLE_EN,
  getAlternateLanguages,
  SITE_NAME,
} from "@/lib/seo/site";
import "../globals.css";
import { Manrope } from "next/font/google";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/lib/i18n/context";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/config";
import { Toaster } from "sonner";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";
import { getSiteSettings } from "@/features/settings/queries";

const fontSans = Manrope({
  subsets: ["latin", "vietnamese"],
  variable: "--font-bim4c",
  display: "swap",
});

// The language is the URL's first segment (a root param, read anywhere on the
// server through getRequestLocale), not a cookie or header, so pages can be
// prerendered and cached. No dynamicParams = false here: it would also apply
// to every [slug] below and 404 any entry not prerendered at build time.
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const canonical = localizedPath("/", locale);
  // Admin SEO defaults are bilingual; an empty Vietnamese value falls back to
  // the built-in Vietnamese brand copy, never to the English setting.
  const settings = await getSiteSettings();
  const title =
    locale === "vi"
      ? settings?.defaultSeoTitle_vi || DEFAULT_TITLE
      : settings?.defaultSeoTitle || DEFAULT_TITLE_EN;
  const description =
    locale === "vi"
      ? settings?.defaultSeoDescription_vi || DEFAULT_DESCRIPTION
      : settings?.defaultSeoDescription || DEFAULT_DESCRIPTION_EN;
  const socialImage = settings?.defaultOgImage || DEFAULT_SOCIAL_IMAGE;
  return {
    metadataBase: new URL(env.appUrl),
    title: { default: title, template: `%s | ${SITE_NAME}` },
    description,
    keywords: DEFAULT_KEYWORDS,
    applicationName: SITE_NAME,
    // Icons come from app/favicon.ico, app/icon.png and app/apple-icon.png.
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
      title,
      description,
      siteName: SITE_NAME,
      type: "website",
      locale: locale === "vi" ? "vi_VN" : "en_US",
      alternateLocale: [locale === "vi" ? "en_US" : "vi_VN"],
      url: canonical,
      images: [{ url: socialImage, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
    verification: {
      google: env.googleSiteVerification || undefined,
      other: env.bingSiteVerification
        ? { "msvalidate.01": env.bingSiteVerification }
        : undefined,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  // Any other first segment (/xx/du-an) is not a page of this site.
  const { locale: segment } = await params;
  if (!SUPPORTED_LOCALES.includes(segment as Locale)) notFound();
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
          <AnalyticsTracker />
        </LanguageProvider>
      </body>
    </html>
  );
}
