import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  const expected = process.env.REVALIDATION_SECRET;
  if (!expected || request.headers.get("x-revalidation-secret") !== expected) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { tags?: unknown } | null;
  if (!body || !Array.isArray(body.tags) || body.tags.length === 0 || body.tags.some((tag) => typeof tag !== "string" || tag.length > 120)) return NextResponse.json({ message: "Invalid tags" }, { status: 400 });
  const tags = [...new Set(body.tags)] as string[];
  for (const tag of tags) revalidateTag(tag, "max");
  return NextResponse.json({ data: { revalidated: tags } });
}
