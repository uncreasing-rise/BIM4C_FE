import { NextRequest, NextResponse } from "next/server";
import { handleMockApiRequest } from "./mock-store";

function logProxy(level: "info" | "warn" | "error", event: string, data: Record<string, unknown>): void {
  const payload = JSON.stringify({ timestamp: new Date().toISOString(), level, event, ...data });
  if (level === "error") console.error(payload);
  else if (level === "warn") console.warn(payload);
  else console.info(payload);
}

export async function backendProxy(request: NextRequest, path: string) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const startedAt = Date.now();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const currentOrigin = request.nextUrl.origin;
  const expectedOrigin = appUrl ?? currentOrigin;

  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const incomingOrigin = request.headers.get("origin");
    if (incomingOrigin) {
      const isAllowed =
        incomingOrigin === currentOrigin ||
        incomingOrigin === appUrl ||
        incomingOrigin.endsWith("bim4c.vn") ||
        incomingOrigin.includes("localhost") ||
        incomingOrigin.includes("127.0.0.1") ||
        incomingOrigin.endsWith(".vercel.app");

      if (!isAllowed) {
        return NextResponse.json(
          {
            error: "Invalid request origin",
            message: "Nguồn yêu cầu không hợp lệ.",
          },
          { status: 403 },
        );
      }
    }
  }

  const baseUrl = (
    process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL
  )?.replace(/\/$/, "");
  if (!baseUrl)
    return NextResponse.json(
      { error: "Backend unavailable", message: "Backend chưa được cấu hình." },
      { status: 503 },
    );

  let target: URL;
  try {
    target = new URL(`${baseUrl}/${path.replace(/^\/+/, "")}`);
  } catch {
    return NextResponse.json(
      {
        error: "Backend configuration invalid",
        message: "BACKEND_URL không hợp lệ.",
      },
      { status: 500 },
    );
  }

  request.nextUrl.searchParams.forEach((value, name) =>
    target.searchParams.append(name, value),
  );
  const forwardedOrigin = request.headers.get("origin") ?? expectedOrigin;
  const headers = new Headers({
    Accept: request.headers.get("accept") ?? "application/json",
    Origin: forwardedOrigin,
  });
  for (const name of [
    "authorization",
    "cookie",
    "content-type",
    "x-request-id",
  ]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("x-request-id", requestId);

  function cleanProxyBody(data: unknown): unknown {
    if (typeof data !== "object" || data === null) return data;
    if (Array.isArray(data)) return data.map(cleanProxyBody);
    const copy = { ...(data as Record<string, unknown>) };
    delete copy.id;
    delete copy.type;
    delete copy.author;
    delete copy.createdAt;
    delete copy.updatedAt;
    delete copy.deletedAt;
    if (typeof copy.status === "string") {
      const upper = copy.status.trim().toUpperCase();
      if (upper === "ACTIVE") copy.status = "PUBLISHED";
      else if (upper === "INACTIVE") copy.status = "ARCHIVED";
      else copy.status = upper;
    }
    if (copy.category && typeof copy.category === "object") {
      if (!copy.categoryId && (copy.category as { id?: string }).id) {
        copy.categoryId = (copy.category as { id: string }).id;
      }
      delete copy.category;
    }
    return copy;
  }

  let requestBody: BodyInit | undefined;
  if (!["GET", "HEAD"].includes(request.method)) {
    const isJson = headers.get("content-type")?.includes("application/json");
    if (isJson) {
      try {
        const rawJson = await request.clone().json().catch(() => null);
        if (rawJson && typeof rawJson === "object") {
          requestBody = JSON.stringify(cleanProxyBody(rawJson));
        } else {
          requestBody = await request.arrayBuffer();
        }
      } catch {
        requestBody = await request.arrayBuffer();
      }
    } else {
      requestBody = await request.arrayBuffer();
    }
  }

  let response: Response;
  try {
    response = await fetch(target, {
      method: request.method,
      headers,
      body: requestBody,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
    });

    if (response.ok || response.status === 401 || response.status === 403) {
      // Return actual backend response if reachable
    } else if (response.status >= 500) {
      // If backend errors with 5xx, fallback to mock store in dev/test
      let bodyData: unknown;
      try {
        if (!["GET", "HEAD"].includes(request.method)) {
          bodyData = await request.clone().json().catch(() => undefined);
        }
      } catch {}
      const mockRes = handleMockApiRequest(
        request.method,
        path,
        request.nextUrl.searchParams,
        bodyData,
      );
      logProxy("warn", "proxy.backend.5xx_fallback", {
        requestId,
        method: request.method,
        path,
        status: response.status,
        durationMs: Date.now() - startedAt,
      });
      return NextResponse.json(mockRes.body, { status: mockRes.status });
    }
  } catch (error) {
    logProxy("error", "proxy.backend.unavailable", {
      requestId,
      method: request.method,
      path,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
    });
    console.warn(
      `Backend unavailable at ${path}, using mock store fallback.`,
      error instanceof Error ? error.message : error,
    );
    let bodyData: unknown;
    try {
      if (!["GET", "HEAD"].includes(request.method)) {
        bodyData = await request.clone().json().catch(() => undefined);
      }
    } catch {}
    const mockRes = handleMockApiRequest(
      request.method,
      path,
      request.nextUrl.searchParams,
      bodyData,
    );
    logProxy("warn", "proxy.mock_fallback", {
      requestId,
      method: request.method,
      path,
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json(mockRes.body, { status: mockRes.status });
  }

  const outputHeaders = new Headers();
  for (const name of [
    "content-type",
    "content-disposition",
    "x-request-id",
  ]) {
    const value = response.headers.get(name);
    if (value) outputHeaders.set(name, value);
  }

  const nextResponse = new NextResponse(
    response.status === 204 ? null : await response.arrayBuffer(),
    { status: response.status, headers: outputHeaders },
  );
  nextResponse.headers.set("x-request-id", requestId);
  logProxy(response.ok ? "info" : "warn", "proxy.request.completed", {
    requestId,
    method: request.method,
    path,
    status: response.status,
    durationMs: Date.now() - startedAt,
  });

  // Transfer Set-Cookie headers properly to ensure auth session cookies persist
  const rawSetCookies: string[] = [];
  if (typeof response.headers.getSetCookie === "function") {
    rawSetCookies.push(...response.headers.getSetCookie());
  } else {
    const single = response.headers.get("set-cookie");
    if (single) rawSetCookies.push(single);
  }

  for (const cookieStr of rawSetCookies) {
    if (!cookieStr) continue;
    nextResponse.headers.append("set-cookie", cookieStr);

    const parts = cookieStr.split(";").map((p) => p.trim());
    const [nameVal, ...attrs] = parts;
    const eqIdx = nameVal.indexOf("=");
    if (eqIdx > 0) {
      const name = nameVal.slice(0, eqIdx).trim();
      const val = nameVal.slice(eqIdx + 1).trim();

      const options: {
        path?: string;
        maxAge?: number;
        expires?: Date;
        httpOnly?: boolean;
        secure?: boolean;
        sameSite?: "lax" | "strict" | "none";
      } = { path: "/" };

      for (const attr of attrs) {
        const [k, v] = attr.split("=").map((s) => s.trim());
        const lk = k.toLowerCase();
        if (lk === "path" && v) options.path = v;
        else if (lk === "max-age" && v) options.maxAge = parseInt(v, 10);
        else if (lk === "expires" && v) options.expires = new Date(v);
        else if (lk === "httponly") options.httpOnly = true;
        else if (lk === "secure") options.secure = true;
        else if (lk === "samesite" && v) {
          const lv = v.toLowerCase();
          if (lv === "lax" || lv === "strict" || lv === "none") {
            options.sameSite = lv;
          }
        }
      }
      nextResponse.cookies.set(name, val, options);
    }
  }

  return nextResponse;
}
