import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { BlogExplorer } from "@/components/blog/BlogExplorer";
import { getPosts } from "@/features/blog/api/queries";
export const metadata:Metadata={title:"Blog | BIM4C",description:"Tin tức, dự án và kiến thức chuyên môn từ BIM4C."};
export default async function BlogPage(){const posts=await getPosts();return <><PageHero eyebrow="TRUYỀN THÔNG BIM4C" title="Tin tức & sự kiện" description="Những dấu ấn mới nhất trên hành trình kiến tạo và phát triển của BIM4C." image="/images/hero.jpg"/><BlogExplorer posts={posts}/></>}
