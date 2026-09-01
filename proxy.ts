import { NextRequest, NextResponse } from "next/server";
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();
  if (
    !request.cookies.has(process.env.AUTH_COOKIE_NAME ?? "bim4c_admin_session")
  ) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*"] };
