import { NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE_NAME, SUPPORTED_LOCALES, negotiateLocale, type Locale } from "@/lib/i18n/config";
import { canonicalPageQuery } from "@/lib/seo/page-param";

const PUBLIC_PREFIXES = [
  "",
  "gioi-thieu",
  "dich-vu",
  "du-an",
  "khoa-hoc",
  "blog",
  "tin-tuc",
  "chuyen-mon",
  "phap-ly",
  "lien-he",
  "bim-viewer",
];

function isPublicPath(pathname: string) {
  const first = pathname.replace(/^\//, "").split("/")[0];
  return PUBLIC_PREFIXES.includes(first);
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // The admin has its own Vietnamese-only root layout (app/admin/layout.tsx).
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return NextResponse.next();

  const segments = pathname.replace(/^\//, "").split("/");
  const requestedLocale = segments[0] as Locale;
  if (SUPPORTED_LOCALES.includes(requestedLocale)) {
    const internalPath = `/${segments.slice(1).join("/")}`.replace(/\/$/, "") || "/";
    // Listing pages: ?page=1, ?page=abc, ?page=02 become their one canonical
    // URL here, as a real permanent redirect, before the page streams.
    if (isPublicPath(internalPath)) {
      const canonical = canonicalPageQuery(request.nextUrl.searchParams);
      if (canonical) {
        const target = request.nextUrl.clone();
        target.search = canonical.size ? `?${canonical}` : "";
        return NextResponse.redirect(target, 308);
      }
    }
    // app/[locale] serves the prefixed URL as is; the cookie only remembers
    // the choice for the next unprefixed visit. It is set when it changes, so
    // cached pages are not served with a Set-Cookie on every request.
    const response = NextResponse.next();
    if (request.cookies.get(LOCALE_COOKIE_NAME)?.value !== requestedLocale) {
      response.cookies.set(LOCALE_COOKIE_NAME, requestedLocale, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
    return response;
  }

  // A remembered choice wins; otherwise follow the browser's language.
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value as Locale | undefined;
  const locale =
    cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)
      ? cookieLocale
      : negotiateLocale(request.headers.get("accept-language"));

  if (isPublicPath(pathname) && !pathname.startsWith("/api")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    // Temporary: the target depends on the visitor, so it must never be cached
    // as a permanent redirect by browsers or CDNs.
    const response = NextResponse.redirect(redirectUrl, 307);
    response.headers.set("Vary", "Accept-Language, Cookie");
    return response;
  }

  // Any other page-like path (/xx/du-an) is no page of this site: rendered
  // under a language so the 404 is the full site page, still with a 404
  // status. Files (a dot in the path), /api and /_next pass through.
  if (!/^\/(api|_next)(\/|$)/.test(pathname) && !pathname.includes(".")) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  // Admin authentication is verified client-side through /auth/me using the
  // bearer token kept in sessionStorage; a proxy cannot read sessionStorage.
  return NextResponse.next();
}
export const config = { matcher: ["/:path*"] };
