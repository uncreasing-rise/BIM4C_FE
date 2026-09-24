import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { sanitizeTags, secretMatches } from "@/lib/security/revalidation";

const SESSION_CHECK_TIMEOUT_MS = 5_000;

/**
 * An admin in the browser may trigger revalidation. Presence of a cookie proves
 * nothing, so the credentials are verified against the backend. BACKEND_URL is
 * server-only configuration and is never derived from the request.
 */
async function hasAdminSession(request: NextRequest): Promise<boolean> {
  const backendUrl = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
  const authorization = request.headers.get("authorization");
  const cookie = request.headers.get("cookie");
  if (!backendUrl || (!authorization && !cookie)) return false;
  try {
    const response = await fetch(`${backendUrl}/auth/me`, {
      headers: {
        Accept: "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(SESSION_CHECK_TIMEOUT_MS),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const authorized =
    secretMatches(request.headers.get("x-revalidation-secret"), process.env.REVALIDATION_SECRET) ||
    (await hasAdminSession(request));
  if (!authorized) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = sanitizeTags(body?.tags);
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({
    data: {
      message: "Bộ nhớ đệm đã được làm mới thành công.",
      revalidated: tags,
    },
  });
}
