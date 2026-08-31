import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Company } from "@/components/sections/Company";
import { Partners } from "@/components/sections/Partners";
import { News } from "@/components/sections/News";
import { getProjects } from "@/features/projects/api/queries";
import { getServices } from "@/features/services/api/queries";
import { getPosts } from "@/features/blog/api/queries";
import { getHomepageContent } from "@/features/homepage/queries";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default async function Home() {
  const [projects, services, posts,homepage] = await Promise.all([getProjects(), getServices(), getPosts({ limit: 7 }),getHomepageContent()]);
  return <><Hero slides={homepage.slides}/><ScrollReveal><Projects projects={projects}/></ScrollReveal><ScrollReveal><Company services={services}/></ScrollReveal><ScrollReveal><Partners partners={homepage.partners}/></ScrollReveal><ScrollReveal><News posts={posts}/></ScrollReveal><section className="apple-home-cta"><p className="apple-kicker">Bắt đầu một dự án BIM</p><h2>Sẵn sàng cho<br/>công trình tiếp theo?</h2><p>Hãy cùng xây dựng một nền tảng dữ liệu đáng tin cậy.</p><Link className="apple-primary" href={ROUTES.contact}>Bắt đầu trao đổi</Link></section></>;
}
