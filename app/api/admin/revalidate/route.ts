import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { appLogger } from "@/lib/logging/logger";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    revalidatePath("/", "layout");
    for (const path of ["/du-an", "/khoa-hoc", "/dich-vu", "/blog", "/gioi-thieu", "/lien-he"]) {
      revalidatePath(path, "page");
    }

    const tags = ["projects", "courses", "services", "posts", "homepage", "settings"];
    for (const tag of tags) {
      try {
        revalidateTag(tag, "max");
      } catch (error) {
        appLogger.warn("cache.tag_revalidate.failed", { tag, error });
      }
    }

    return NextResponse.json({
      data: {
        success: true,
        message: "Đã làm mới bộ nhớ đệm (ISR Cache) toàn bộ website thành công!",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    appLogger.error("cache.revalidate.failed", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Lỗi khi xóa cache" },
      { status: 500 },
    );
  }
}
