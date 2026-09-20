import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  listingMetadata,
  normalizedPageRedirect,
  type ListingSearchParams,
} from "@/lib/seo/listing";
import { getRequestLocale } from "@/lib/i18n/request";
import { ROUTES } from "@/constants/routes";
import { getPostsPage, getPostCategories } from "@/features/blog/api/queries";
import { PageHero } from "@/components/shared/PageHero";
import { BlogExplorer } from "@/components/blog/BlogExplorer";

const NEWS_BASE_CATEGORIES = [
  "Tin tức công ty",
  "Sự kiện & Hội thảo",
  "Hợp tác & Đối tác",
  "Hoạt động doanh nghiệp",
  "Tuyển dụng & Nhân sự",
];

const copy = {
  en: {
    breadcrumb: "News",
    title: "News & Corporate Activities",
    description:
      "The latest updates on company events, strategic partnerships, internal training and press releases from BIM4C.",
    catalogueEyebrow: "CORPORATE NEWSROOM",
    catalogueTitle: "Latest News",
    catalogueDesc:
      "Discover BIM4C milestones, industry events and stories from our company culture.",
    searchLabel: "Search news",
    searchPlaceholder: "Search events, news and partnerships...",
    metadataTitle: "BIM4C News & Corporate Events",
    metadataDescription:
      "The latest news, strategic partnerships, events and corporate activities from BIM4C.",
  },
  vi: {
    breadcrumb: "Tin tức",
    title: "Tin tức & Hoạt động Doanh nghiệp",
    description:
      "Thông tin cập nhật liên tục về các sự kiện công ty, lễ ký kết hợp tác chiến lược, hoạt động đào tạo nội bộ và thông cáo báo chí từ BIM4C.",
    catalogueEyebrow: "BẢN TIN HOẠT ĐỘNG",
    catalogueTitle: "Tin tức Mới nhất",
    catalogueDesc:
      "Khám phá các dấu mốc phát triển, sự kiện chuyên ngành và câu chuyện văn hóa doanh nghiệp tại BIM4C.",
    searchLabel: "Tìm kiếm tin tức",
    searchPlaceholder: "Tìm kiếm sự kiện, tin tức, hợp tác...",
    metadataTitle: "Tin tức & Sự kiện Doanh nghiệp",
    metadataDescription:
      "Cập nhật những tin tức mới nhất, sự kiện hợp tác chiến lược và hoạt động nổi bật từ BIM4C.",
  },
} as const;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}): Promise<Metadata> {
  const locale = await getRequestLocale();
  const content = copy[locale];
  return listingMetadata(
    content.metadataTitle,
    content.metadataDescription,
    ROUTES.news,
    await searchParams,
  );
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}) {
  const params = await searchParams;
  const locale = await getRequestLocale();
  const content = copy[locale];
  const [postsPage, categories] = await Promise.all([
    getPostsPage({
      page: Number(params.page ?? 1),
      limit: 6,
      search: typeof params.q === "string" ? params.q : undefined,
      category:
        typeof params.category === "string" && params.category !== "All"
          ? params.category
          : undefined,
      group: "news",
    }),
    getPostCategories("news").catch(() => []),
  ]);

  const destination = normalizedPageRedirect(ROUTES.news, params, postsPage.meta.total, 6);
  if (destination) redirect(destination);

  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: content.breadcrumb }]}
        eyebrow="BIM4C NEWS & CORPORATE UPDATES"
        title={content.title}
        description={content.description}
        image="/images/news-site-safety.webp"
      />
      <BlogExplorer
        posts={postsPage.items}
        meta={postsPage.meta}
        categoryItems={categories}
        detailRoute={ROUTES.news}
        catalogueEyebrow={content.catalogueEyebrow}
        catalogueTitle={content.catalogueTitle}
        catalogueDesc={content.catalogueDesc}
        searchLabel={content.searchLabel}
        searchPlaceholder={content.searchPlaceholder}
        baseCategories={NEWS_BASE_CATEGORIES}
      />
    </main>
  );
}
