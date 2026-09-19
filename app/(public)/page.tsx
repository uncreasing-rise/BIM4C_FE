import { getProjects } from "@/features/projects/api/queries";
import { getServices } from "@/features/services/api/queries";
import { getPosts } from "@/features/blog/api/queries";
import { getCourses } from "@/features/courses/api/queries";
import { getHomepageContent } from "@/features/homepage/queries";
import { getSiteSettings } from "@/features/settings/queries";
import { HomeView } from "@/components/sections/HomeView";

export default async function Home() {
  const [projects, services, posts, courses, homepageData, settings] = await Promise.all([
    getProjects({ limit: 6 }).catch(() => []),
    getServices({ limit: 6 }).catch(() => []),
    getPosts({ limit: 3 }).catch(() => []),
    getCourses({ limit: 3 }).catch(() => []),
    getHomepageContent().catch(() => ({ slides: [], partners: [] })),
    getSiteSettings().catch(() => null),
  ]);

  return (
    <HomeView
      rawProjects={projects}
      rawServices={services}
      rawPosts={posts}
      rawCourses={courses}
      rawPartners={homepageData.partners}
      rawSettings={settings || undefined}
    />
  );
}
