import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { BlogExplorer } from "@/components/blog/BlogExplorer";
import { getPosts } from "@/features/blog/api/queries";
export const metadata: Metadata = {
  title: "Blog | BIM4C",
  description: "Tin tức, dự án và kiến thức chuyên môn từ BIM4C.",
};
export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <main>
      <PageHero
        eyebrow="BIM4C"
        title="Tin tức"
        description="Tin mới, sự kiện và góc nhìn chuyên môn từ BIM4C."
        image="/images/news-project-coordination.webp"
      />
      <BlogExplorer posts={posts} />
    </main>
  );
}
