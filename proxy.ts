import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/config";
import { LOCALE_HEADER } from "@/lib/i18n/request";

const PUBLIC_PREFIXES = [
  "",
  "gioi-thieu",
  "dich-vu",
  "du-an",
  "khoa-hoc",
  "blog",
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

  if (pathname === "/admin/login") return NextResponse.next();

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
    const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value as Locale | undefined;
    const locale = cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)
      ? cookieLocale
      : DEFAULT_LOCALE;
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(redirectUrl, 308);
  }

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // Admin authentication is verified client-side through /auth/me using the
  // bearer token kept in sessionStorage. Middleware cannot read sessionStorage.
  return NextResponse.next();
}
export const config = { matcher: ["/:path*"] };
