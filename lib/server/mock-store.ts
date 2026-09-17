import {
  SAMPLE_SERVICE,
  SAMPLE_PROJECT,
  SAMPLE_COURSE,
  SAMPLE_POST,
  SAMPLE_HERO_SLIDE,
  SAMPLE_PARTNERS,
  SAMPLE_CONTACT,
  SAMPLE_REGISTRATION,
} from "@/mocks/sample-crud-data";
import type { ContentEntryDto } from "@/features/shared/types/content-dto";
import type { ProjectDto } from "@/features/projects/api/project.mapper";
import type { HeroSlide, StrategicPartner } from "@/features/homepage/types";

export interface MockStoreData {
  services: (ContentEntryDto & Record<string, unknown>)[];
  projects: (ProjectDto & Record<string, unknown>)[];
  courses: (ContentEntryDto & Record<string, unknown>)[];
  posts: (ContentEntryDto & Record<string, unknown>)[];
  slides: HeroSlide[];
  partners: StrategicPartner[];
  contacts: Record<string, unknown>[];
  courseRegistrations: Record<string, unknown>[];
  newsletters: Record<string, unknown>[];
  projectCategories: Record<string, unknown>[];
  postCategories: Record<string, unknown>[];
}

// Global in-memory mock store
const globalStore: MockStoreData = {
  services: [
    {
      ...SAMPLE_SERVICE,
      id: SAMPLE_SERVICE.id ?? "srv-1",
      status: "PUBLISHED",
      sortOrder: 10,
    },
  ],
  projects: [
    {
      ...SAMPLE_PROJECT,
      id: SAMPLE_PROJECT.id ?? "prj-1",
      status: "PUBLISHED",
      sortOrder: 10,
      categoryId: "cat-prj-infrastructure",
    },
  ],
  courses: [
    {
      ...SAMPLE_COURSE,
      id: SAMPLE_COURSE.id ?? "crs-1",
      status: "PUBLISHED",
      sortOrder: 10,
    },
  ],
  posts: [
    {
      ...SAMPLE_POST,
      id: SAMPLE_POST.id ?? "pst-1",
      status: "PUBLISHED",
      sortOrder: 10,
      categoryId: "cat-post-bim-tech",
    },
  ],
  slides: [{ ...SAMPLE_HERO_SLIDE }],
  partners: [...SAMPLE_PARTNERS],
  contacts: [{ ...SAMPLE_CONTACT }],
  courseRegistrations: [{ ...SAMPLE_REGISTRATION }],
  newsletters: [
    {
      id: "news-1",
      email: "contact@bim4c.com",
      createdAt: "2026-09-17T08:00:00.000Z",
    },
  ],
  projectCategories: [
    { id: "cat-prj-infrastructure", name: "Hạ tầng & Giao thông", slug: "ha-tang" },
    { id: "cat-prj-building", name: "Công trình Dân dụng", slug: "dan-dung" },
    { id: "cat-prj-industrial", name: "Hạ tầng Công nghiệp", slug: "cong-nghiep" },
  ],
  postCategories: [
    { id: "cat-post-bim-tech", name: "Công nghệ BIM", slug: "cong-nghe-bim" },
    { id: "cat-post-practical", name: "Thực hành Dự án", slug: "thuc-hanh-du-an" },
  ],
};

export function handleMockApiRequest(
  method: string,
  path: string,
  searchParams: URLSearchParams,
  rawBody?: unknown,
): { status: number; body: unknown } {
  const body = rawBody as Record<string, unknown> | undefined;
  const normalizedPath = path.replace(/^admin\//, "");
  const segments = normalizedPath.split("/").filter(Boolean);
  const resource = segments[0];
  const idOrSub = segments[1];

  // Homepage routes
  if (resource === "homepage") {
    const subResource = segments[1]; // 'slides' | 'partners'
    if (subResource === "slides") {
      if (method === "GET") return { status: 200, body: globalStore.slides };
      if (method === "POST" && body) {
        const item: HeroSlide = {
          ...SAMPLE_HERO_SLIDE,
          ...(body as Partial<HeroSlide>),
          id: (body.id as string) || `slide-${Date.now()}`,
        };
        globalStore.slides.push(item);
        return { status: 201, body: item };
      }
      if (method === "PATCH" && idOrSub) {
        const targetId = segments[2];
        const idx = globalStore.slides.findIndex((s) => s.id === targetId);
        if (idx >= 0) {
          globalStore.slides[idx] = { ...globalStore.slides[idx], ...(body as Partial<HeroSlide>) };
          return { status: 200, body: globalStore.slides[idx] };
        }
      }
      if (method === "DELETE") {
        const targetId = segments[2];
        globalStore.slides = globalStore.slides.filter((s) => s.id !== targetId);
        return { status: 204, body: null };
      }
    }
    if (subResource === "partners") {
      if (method === "GET") return { status: 200, body: globalStore.partners };
      if (method === "POST" && body) {
        const item: StrategicPartner = {
          ...SAMPLE_PARTNERS[0],
          ...(body as Partial<StrategicPartner>),
          id: (body.id as string) || `partner-${Date.now()}`,
        };
        globalStore.partners.push(item);
        return { status: 201, body: item };
      }
      if (method === "PATCH") {
        const targetId = segments[2];
        const idx = globalStore.partners.findIndex((p) => p.id === targetId);
        if (idx >= 0) {
          globalStore.partners[idx] = { ...globalStore.partners[idx], ...(body as Partial<StrategicPartner>) };
          return { status: 200, body: globalStore.partners[idx] };
        }
      }
      if (method === "DELETE") {
        const targetId = segments[2];
        globalStore.partners = globalStore.partners.filter((p) => p.id !== targetId);
        return { status: 204, body: null };
      }
    }
  }

  // Categories
  if (resource === "project-categories") {
    if (method === "GET") return { status: 200, body: { data: globalStore.projectCategories } };
    if (method === "POST" && body) {
      const cat = { ...body, id: `cat-prj-${Date.now()}` };
      globalStore.projectCategories.push(cat);
      return { status: 201, body: { data: cat } };
    }
  }
  if (resource === "post-categories") {
    if (method === "GET") return { status: 200, body: { data: globalStore.postCategories } };
    if (method === "POST" && body) {
      const cat = { ...body, id: `cat-post-${Date.now()}` };
      globalStore.postCategories.push(cat);
      return { status: 201, body: { data: cat } };
    }
  }

  // Contacts
  if (resource === "contacts") {
    if (method === "GET") {
      return {
        status: 200,
        body: {
          data: globalStore.contacts,
          meta: { page: 1, limit: 10, total: globalStore.contacts.length, totalPages: 1 },
        },
      };
    }
  }

  // Course registrations
  if (resource === "course-registrations" || resource === "registrations") {
    if (method === "GET") {
      return {
        status: 200,
        body: {
          data: globalStore.courseRegistrations,
          meta: { page: 1, limit: 10, total: globalStore.courseRegistrations.length, totalPages: 1 },
        },
      };
    }
  }

  // Content Resources: services, projects, courses, posts
  const storeMap: Record<string, Record<string, unknown>[]> = {
    services: globalStore.services,
    projects: globalStore.projects,
    courses: globalStore.courses,
    posts: globalStore.posts,
  };

  const list = storeMap[resource];
  if (list) {
    // Bulk actions
    if (idOrSub === "bulk" && method === "POST") {
      const { ids, action } = (body as { ids?: string[]; action?: string }) || {};
      if (Array.isArray(ids)) {
        if (action === "delete") {
          storeMap[resource] = list.filter((item) => !ids.includes(String(item.id)));
        } else if (action === "publish" || action === "archive") {
          list.forEach((item) => {
            if (ids.includes(String(item.id))) {
              item.status = action === "publish" ? "PUBLISHED" : "ARCHIVED";
            }
          });
        }
      }
      return { status: 200, body: { success: true, affected: ids?.length ?? 0 } };
    }

    // Single item update/delete
    if (idOrSub && idOrSub !== "bulk") {
      const itemIndex = list.findIndex((item) => item.id === idOrSub || item.slug === idOrSub);
      if (method === "GET") {
        if (itemIndex >= 0) return { status: 200, body: { data: list[itemIndex] } };
        return { status: 404, body: { message: "Không tìm thấy bản ghi" } };
      }
      if (method === "PATCH" && body) {
        if (itemIndex >= 0) {
          list[itemIndex] = { ...list[itemIndex], ...body, updatedAt: new Date().toISOString() };
          return { status: 200, body: { data: list[itemIndex] } };
        }
        return { status: 404, body: { message: "Không tìm thấy bản ghi" } };
      }
      if (method === "DELETE") {
        if (itemIndex >= 0) {
          list.splice(itemIndex, 1);
          return { status: 204, body: null };
        }
        return { status: 404, body: { message: "Không tìm thấy bản ghi" } };
      }
    }

    // List query
    if (method === "GET") {
      const search = searchParams.get("search")?.toLowerCase();
      let filtered = [...list];
      if (search) {
        filtered = filtered.filter(
          (item) =>
            String(item.title ?? "").toLowerCase().includes(search) ||
            String(item.description ?? "").toLowerCase().includes(search) ||
            String(item.slug ?? "").toLowerCase().includes(search),
        );
      }
      return {
        status: 200,
        body: {
          data: filtered,
          meta: {
            page: 1,
            limit: 20,
            total: filtered.length,
            totalPages: 1,
          },
        },
      };
    }

    // Create item
    if (method === "POST" && body) {
      const newItem = {
        ...body,
        id: (body.id as string) || `${resource.slice(0, 3)}-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      list.unshift(newItem);
      return { status: 201, body: { data: newItem } };
    }
  }

  return {
    status: 200,
    body: { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 1 } },
  };
}
