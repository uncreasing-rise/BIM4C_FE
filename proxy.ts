import { NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE_NAME, SUPPORTED_LOCALES, negotiateLocale, type Locale } from "@/lib/i18n/config";
import { LOCALE_HEADER } from "@/lib/i18n/request";

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

/** The admin UI is Vietnamese-only; render it with lang="vi" regardless of the visitor's site locale. */
function adminResponse(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set(LOCALE_HEADER, "vi");
  return NextResponse.next({ request: { headers } });
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) return adminResponse(request);

  const segments = pathname.replace(/^\//, "").split("/");
  const requestedLocale = segments[0] as Locale;
  if (SUPPORTED_LOCALES.includes(requestedLocale)) {
    const internalPath = `/${segments.slice(1).join("/")}`.replace(/\/$/, "") || "/";
    const headers = new Headers(request.headers);
    headers.set(LOCALE_HEADER, requestedLocale);
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = internalPath;
    const response = NextResponse.rewrite(rewriteUrl, { request: { headers } });
    response.cookies.set(LOCALE_COOKIE_NAME, requestedLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  if (isPublicPath(pathname) && !pathname.startsWith("/api")) {
    // A remembered choice wins; otherwise follow the browser's language.
    const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value as Locale | undefined;
    const locale =
      cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)
        ? cookieLocale
        : negotiateLocale(request.headers.get("accept-language"));
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    // Temporary: the target depends on the visitor, so it must never be cached
    // as a permanent redirect by browsers or CDNs.
    const response = NextResponse.redirect(redirectUrl, 307);
    response.headers.set("Vary", "Accept-Language, Cookie");
    return response;
  }

  // Admin authentication is verified client-side through /auth/me using the
  // bearer token kept in sessionStorage; a proxy cannot read sessionStorage.
  return NextResponse.next();
}
export const config = { matcher: ["/:path*"] };
