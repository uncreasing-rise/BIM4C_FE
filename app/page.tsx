import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Company } from "@/components/sections/Company";
import { Partners } from "@/components/sections/Partners";
import { News } from "@/components/sections/News";
import { Careers } from "@/components/sections/Careers";
import { getProjects } from "@/features/projects/api/queries";
import { getServices } from "@/features/services/api/queries";
import { getPosts } from "@/features/blog/api/queries";
import { getHomepageContent } from "@/features/homepage/queries";

export default async function Home() {
  const [projects, services, posts,homepage] = await Promise.all([getProjects(), getServices(), getPosts({ limit: 3 }),getHomepageContent()]);
  return <><Hero slides={homepage.slides}/><Projects projects={projects}/><Company services={services}/><Partners partners={homepage.partners}/><News posts={posts}/><Careers/></>;
}
