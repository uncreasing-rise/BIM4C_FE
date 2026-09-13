"use client";

import { usePublicMotion } from "@/components/motion/hooks/use-public-motion";

import { PageHero } from "@/components/shared/PageHero";
import { BlogExplorer } from "@/components/blog/BlogExplorer";
import type { ContentEntry } from "@/types/content";
import type { PageMeta } from "@/features/shared/types/pagination";
import { useLanguage } from "@/lib/i18n/context";

export function BlogPageView({
  posts,
  meta,
}: {
  posts: ContentEntry[];
  meta: PageMeta;
}) {
  usePublicMotion();
  const { t } = useLanguage();

  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: t.navigation.blog }]}
        eyebrow={t.blogPage.eyebrow}
        title={t.blogPage.title}
        description={t.blogPage.description}
        image="/images/news-site-safety.webp"
      />
      <BlogExplorer posts={posts} meta={meta} />
    </main>
  );
}
