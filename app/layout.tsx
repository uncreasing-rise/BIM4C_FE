import type { Metadata } from "next";
import { env } from "@/lib/config/env";
import { DEFAULT_DESCRIPTION, DEFAULT_SOCIAL_IMAGE, DEFAULT_TITLE, SITE_NAME } from "@/lib/seo/site";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: { default: DEFAULT_TITLE, template: `%s | ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }], creator: SITE_NAME, publisher: SITE_NAME,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, siteName: SITE_NAME,
    type: "website",
    locale: "vi_VN",
    url: "/", images: [{ url: DEFAULT_SOCIAL_IMAGE, alt: "BIM4C Construction" }],
  },
  twitter: { card: "summary_large_image", title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, images: [DEFAULT_SOCIAL_IMAGE] },
  verification: { google: env.googleSiteVerification || undefined, other: env.bingSiteVerification ? { "msvalidate.01": env.bingSiteVerification } : undefined },
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
