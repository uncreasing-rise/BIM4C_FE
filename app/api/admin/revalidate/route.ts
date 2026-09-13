import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // Revalidate main public routes & tags
    revalidatePath("/", "layout");
    revalidatePath("/du-an", "page");
    revalidatePath("/khoa-hoc", "page");
    revalidatePath("/dich-vu", "page");
    revalidatePath("/blog", "page");
    revalidatePath("/gioi-thieu", "page");
    revalidatePath("/lien-he", "page");

    const tags = ["projects", "courses", "services", "posts", "homepage", "settings"];
    for (const tag of tags) {
      try {
        revalidateTag(tag, "max");
      } catch {
        // ignore
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
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Lỗi khi xóa cache" },
      { status: 500 },
    );
  }
}
