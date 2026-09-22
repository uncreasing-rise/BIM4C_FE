import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const expected = process.env.REVALIDATION_SECRET;
  const hasValidSecret = Boolean(expected && request.headers.get("x-revalidation-secret") === expected);
  const cookieName = process.env.AUTH_COOKIE_NAME || "bim4c_admin_session";
  const hasAdminCookie = Boolean(request.cookies.get(cookieName)?.value);

  if (!hasValidSecret && !hasAdminCookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    tags?: unknown;
    paths?: unknown;
  } | null;

  const defaultTags = ["projects", "courses", "services", "posts", "homepage", "settings"];
  const tags = Array.isArray(body?.tags) && body.tags.length > 0
    ? ([...new Set(body.tags.filter((t) => typeof t === "string"))] as string[])
    : defaultTags;

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
