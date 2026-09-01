import { NextRequest } from "next/server";
import { backendProxy } from "@/lib/server/backend-proxy";
async function proxy(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> },
) {
  return backendProxy(
    request,
    `auth/${encodeURIComponent((await params).action)}`,
  );
}
export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
