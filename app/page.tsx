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

export default async function Home() {
  const [projects, services, posts,homepage] = await Promise.all([getProjects(), getServices(), getPosts({ limit: 5 }),getHomepageContent()]);
  return <><Hero slides={homepage.slides}/><ScrollReveal><Projects projects={projects}/></ScrollReveal><ScrollReveal><Company services={services}/></ScrollReveal><ScrollReveal><Partners partners={homepage.partners}/></ScrollReveal><ScrollReveal><News posts={posts}/></ScrollReveal></>;
}
