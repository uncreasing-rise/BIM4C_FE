import { getProjects } from "@/features/projects/api/queries";
import { getServices } from "@/features/services/api/queries";
import { getPosts } from "@/features/blog/api/queries";
import { getCourses } from "@/features/courses/api/queries";
import { getHomepageContent } from "@/features/homepage/queries";
import { HomeView } from "@/components/sections/HomeView";

export default async function Home() {
  const [projects, services, posts, courses, homepageData] = await Promise.all([
    getProjects({ limit: 6 }),
    getServices({ limit: 6 }),
    getPosts({ limit: 3 }),
    getCourses({ limit: 3 }),
    getHomepageContent(),
  ]);

  return (
    <HomeView
      rawProjects={projects}
      rawServices={services}
      rawPosts={posts}
      rawCourses={courses}
      rawPartners={homepageData.partners}
    />
  );
}

