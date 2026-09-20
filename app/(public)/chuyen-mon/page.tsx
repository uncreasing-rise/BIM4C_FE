import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  listingMetadata,
  normalizedPageRedirect,
  type ListingSearchParams,
} from "@/lib/seo/listing";
import { ROUTES } from "@/constants/routes";
import { getPostsPage, getPostCategories } from "@/features/blog/api/queries";
import { PageHero } from "@/components/shared/PageHero";
import { BlogExplorer } from "@/components/blog/BlogExplorer";

const TECHNICAL_BASE_CATEGORIES = [
  "Khảo sát & Scan-to-BIM",
  "Quy trình & Tiêu chuẩn",
  "Công nghệ & Tự động hóa",
  "Phối hợp & Kỹ thuật",
  "Quản lý Dự án & Chi phí",
  "Vận hành & Digital Twin",
  "Dự án Thực tế",
  "Đào tạo & Nhân lực",
];

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}): Promise<Metadata> {
  return await listingMetadata(
    "Kiến thức Chuyên môn BIM & Nghiên cứu Kỹ thuật",
    "Góc nhìn chuyên môn sâu về Scan-to-BIM, ISO 19650, Revit API, MEP Clash Detection, 4D/5D và Digital Twin 7D từ các chuyên gia hàng đầu BIM4C.",
    ROUTES.technical,
    await searchParams,
  );
}

export default async function TechnicalKnowledgePage({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}) {
  const params = await searchParams;
  const [postsPage, categories] = await Promise.all([
    getPostsPage({
      page: Number(params.page ?? 1),
      limit: 6,
      search: typeof params.q === "string" ? params.q : undefined,
      category:
        typeof params.category === "string" && params.category !== "All"
          ? params.category
          : undefined,
      group: "technical",
    }),
    getPostCategories("technical").catch(() => []),
  ]);

  const destination = normalizedPageRedirect(
    ROUTES.technical,
    params,
    postsPage.meta.total,
    6,
  );
  if (destination) redirect(destination);

  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: "Chuyên môn BIM" }]}
        eyebrow="BIM4C TECHNICAL INSIGHTS & RESEARCH"
        title="Kiến thức & Nghiên cứu Chuyên môn BIM"
        description="Tổng hợp các bài viết nghiên cứu học thuật và thực tiễn chuyên sâu về Quy trình Scan-to-BIM, Tiêu chuẩn ISO 19650, Tự động hóa Revit API, Phối hợp MEP và Bản sao số Digital Twin 7D."
        image="/images/profile/bim-3d.webp"
      />
      <BlogExplorer
        posts={postsPage.items}
        meta={postsPage.meta}
        categoryItems={categories}
        detailRoute={ROUTES.technicalDetail}
        catalogueEyebrow="KHO TRI THỨC KỸ THUẬT SỐ"
        catalogueTitle="Nghiên cứu & Báo cáo Chuyên môn"
        catalogueDesc="Khám phá các hướng dẫn kỹ thuật, giải pháp xử lý va chạm và ứng dụng thực tiễn trong công trình từ đội ngũ chuyên gia BIM4C."
        searchLabel="Tìm kiếm bài viết kỹ thuật"
        searchPlaceholder="Tìm kiếm theo từ khóa (Scan-to-BIM, Revit, Navisworks, ISO 19650...)..."
        baseCategories={TECHNICAL_BASE_CATEGORIES}
      />
    </main>
  );
}
