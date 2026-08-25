import { NextRequest, NextResponse } from "next/server";

export async function backendProxy(request: NextRequest, path: string) {
  const expectedOrigin = process.env.FRONTEND_URL ?? request.nextUrl.origin;
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const incomingOrigin = request.headers.get("origin");
    if (incomingOrigin && incomingOrigin !== expectedOrigin) {
      return NextResponse.json({ error: "Invalid request origin", message: "Nguồn yêu cầu không hợp lệ." }, { status: 403 });
    }
  }

  const baseUrl = (process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");
  if (!baseUrl) return NextResponse.json({ error: "Backend unavailable", message: "Backend chưa được cấu hình." }, { status: 503 });

  let target: URL;
  try {
    target = new URL(`${baseUrl}/${path.replace(/^\/+/, "")}`);
  } catch {
    return NextResponse.json({ error: "Backend configuration invalid", message: "BACKEND_URL không hợp lệ." }, { status: 500 });
  }

  request.nextUrl.searchParams.forEach((value, name) => target.searchParams.append(name, value));
  const headers = new Headers({ Accept: request.headers.get("accept") ?? "application/json", Origin: expectedOrigin });
  for (const name of ["authorization", "cookie", "content-type", "x-request-id"]) { const value = request.headers.get(name); if (value) headers.set(name, value); }

  let response: Response;
  try {
    response = await fetch(target, { method: request.method, headers, body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer(), cache: "no-store", redirect: "manual", signal: AbortSignal.timeout(15_000) });
  } catch (error) {
    console.error(`Backend unavailable at ${target.origin}`, error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Backend unavailable", message: "Không thể kết nối đến backend." }, { status: 503 });
  }

  const outputHeaders = new Headers();
  for (const name of ["content-type", "content-disposition", "set-cookie", "x-request-id"]) { const value = response.headers.get(name); if (value) outputHeaders.set(name, value); }
  return new NextResponse(response.status === 204 ? null : await response.arrayBuffer(), { status: response.status, headers: outputHeaders });
}
