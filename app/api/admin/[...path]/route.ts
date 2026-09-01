import { NextRequest } from "next/server";
import { backendProxy } from "@/lib/server/backend-proxy";
async function proxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return backendProxy(
    request,
    `admin/${(await params).path.map(encodeURIComponent).join("/")}`,
  );
}
export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
