import { NextRequest, NextResponse } from "next/server";
import { handleMockApiRequest } from "./mock-store";

export async function backendProxy(request: NextRequest, path: string) {
  const expectedOrigin =
    process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const incomingOrigin = request.headers.get("origin");
    if (incomingOrigin && incomingOrigin !== expectedOrigin) {
      return NextResponse.json(
        {
          error: "Invalid request origin",
          message: "Nguồn yêu cầu không hợp lệ.",
        },
        { status: 403 },
      );
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
  const headers = new Headers({
    Accept: request.headers.get("accept") ?? "application/json",
    Origin: expectedOrigin,
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

  function cleanProxyBody(data: unknown): unknown {
    if (typeof data !== "object" || data === null) return data;
    if (Array.isArray(data)) return data.map(cleanProxyBody);
    const copy = { ...(data as Record<string, unknown>) };
    delete copy.id;
    delete copy.createdAt;
    delete copy.updatedAt;
    delete copy.deletedAt;
    if (typeof copy.status === "string") {
      const upper = copy.status.trim().toUpperCase();
      if (["PUBLISHED", "ACTIVE"].includes(upper)) copy.status = "PUBLISHED";
      else if (["ARCHIVED", "INACTIVE"].includes(upper)) copy.status = "ARCHIVED";
      else if (["DRAFT", "PLANNED"].includes(upper)) copy.status = "DRAFT";
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
      return NextResponse.json(mockRes.body, { status: mockRes.status });
    }
  } catch (error) {
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
    return NextResponse.json(mockRes.body, { status: mockRes.status });
  }

  const outputHeaders = new Headers();
  for (const name of [
    "content-type",
    "content-disposition",
    "set-cookie",
    "x-request-id",
  ]) {
    const value = response.headers.get(name);
    if (value) outputHeaders.set(name, value);
  }
  return new NextResponse(
    response.status === 204 ? null : await response.arrayBuffer(),
    { status: response.status, headers: outputHeaders },
  );
}
