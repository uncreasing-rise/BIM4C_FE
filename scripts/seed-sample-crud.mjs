import {
  SAMPLE_SERVICE,
  SAMPLE_PROJECT,
  SAMPLE_COURSE,
  SAMPLE_POST,
  SAMPLE_HERO_SLIDE,
  SAMPLE_PARTNERS,
} from "../mocks/sample-crud-data.ts";

const api = process.env.BIM4C_API_URL ?? "http://127.0.0.1:8080";
const email = process.env.BIM4C_ADMIN_EMAIL ?? "admin@bim4c.vn";
const password = process.env.BIM4C_ADMIN_PASSWORD ?? "BIM4C!Admin#2026-Aug-24@Q7";

function cleanPayload(item) {
  const { id, createdAt, updatedAt, ...rest } = item;
  return rest;
}

async function main() {
  console.log(`[Seed] Connecting to Backend API at ${api}...`);

  let cookie;
  try {
    const login = await fetch(`${api}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!login.ok) {
      console.warn(`[Seed] Login failed (${login.status}): ${await login.text()}`);
    } else {
      cookie = login.headers.getSetCookie?.()[0]?.split(";", 1)[0];
      console.log(`[Seed] Authenticated as ${email}`);
    }
  } catch (err) {
    console.error("[Seed] Could not reach backend server:", err.message);
    process.exit(1);
  }

  const headers = {
    ...(cookie ? { cookie } : {}),
    origin: process.env.BIM4C_FRONTEND_ORIGIN ?? "http://localhost:3000",
    "content-type": "application/json; charset=utf-8",
  };

  // 1. Service
  console.log("[Seed] Seeding Sample Service (Dịch vụ)...");
  try {
    const payload = {
      slug: SAMPLE_SERVICE.slug,
      title: SAMPLE_SERVICE.title_en || SAMPLE_SERVICE.title,
      title_vi: SAMPLE_SERVICE.title_vi || SAMPLE_SERVICE.title,
      description: SAMPLE_SERVICE.description_en || SAMPLE_SERVICE.description,
      description_vi: SAMPLE_SERVICE.description_vi || SAMPLE_SERVICE.description,
      eyebrow: SAMPLE_SERVICE.eyebrow_en || SAMPLE_SERVICE.eyebrow,
      eyebrow_vi: SAMPLE_SERVICE.eyebrow_vi || SAMPLE_SERVICE.eyebrow,
      image: SAMPLE_SERVICE.image,
      meta: SAMPLE_SERVICE.meta,
      meta_vi: SAMPLE_SERVICE.meta_vi,
      highlights: SAMPLE_SERVICE.highlights_en || SAMPLE_SERVICE.highlights,
      highlights_vi: SAMPLE_SERVICE.highlights_vi || SAMPLE_SERVICE.highlights,
      sections: (SAMPLE_SERVICE.sections_en || SAMPLE_SERVICE.sections || []).map((s) => ({
        title: s.title,
        body: s.body,
        images: s.images,
        unorderedList: s.unorderedList,
        orderedList: s.orderedList,
      })),
      sections_vi: (SAMPLE_SERVICE.sections_vi || SAMPLE_SERVICE.sections || []).map((s) => ({
        title: s.title,
        body: s.body,
        images: s.images,
        unorderedList: s.unorderedList,
        orderedList: s.orderedList,
      })),
      status: "PUBLISHED",
      sortOrder: 10,
      publishedAt: new Date().toISOString(),
    };
    const res = await fetch(`${api}/admin/services`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    console.log(`[Seed] Service result: ${res.status}`);
  } catch (e) {
    console.error(`[Seed] Service error:`, e.message);
  }

  // 2. Project Category & Project
  console.log("[Seed] Seeding Sample Project (Dự án)...");
  try {
    const catRes = await fetch(`${api}/admin/project-categories`, { headers });
    const catJson = await catRes.json().catch(() => ({}));
    let categoryId = catJson.data?.find((c) => c.slug === "ha-tang" || c.slug === "infrastructure")?.id;
    if (!categoryId) {
      const createCat = await fetch(`${api}/admin/project-categories`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name: "Hạ tầng", slug: "ha-tang" }),
      });
      const created = await createCat.json().catch(() => ({}));
      categoryId = created.data?.id;
    }

    const payload = {
      slug: SAMPLE_PROJECT.slug,
      title: SAMPLE_PROJECT.title_en || SAMPLE_PROJECT.title,
      title_vi: SAMPLE_PROJECT.title_vi || SAMPLE_PROJECT.title,
      description: SAMPLE_PROJECT.description_en || SAMPLE_PROJECT.description,
      description_vi: SAMPLE_PROJECT.description_vi || SAMPLE_PROJECT.description,
      eyebrow: SAMPLE_PROJECT.eyebrow_en || SAMPLE_PROJECT.eyebrow,
      eyebrow_vi: SAMPLE_PROJECT.eyebrow_vi || SAMPLE_PROJECT.eyebrow,
      image: SAMPLE_PROJECT.image,
      meta: SAMPLE_PROJECT.meta,
      meta_vi: SAMPLE_PROJECT.meta_vi,
      location: "Da Nang, Vietnam",
      location_vi: "Đà Nẵng, Việt Nam",
      year: 2026,
      categoryId,
      highlights: SAMPLE_PROJECT.highlights_en || SAMPLE_PROJECT.highlights,
      highlights_vi: SAMPLE_PROJECT.highlights_vi || SAMPLE_PROJECT.highlights,
      sections: (SAMPLE_PROJECT.sections_en || SAMPLE_PROJECT.sections || []).map((s) => ({
        title: s.title,
        body: s.body,
        images: s.images,
        unorderedList: s.unorderedList,
        orderedList: s.orderedList,
      })),
      sections_vi: (SAMPLE_PROJECT.sections_vi || SAMPLE_PROJECT.sections || []).map((s) => ({
        title: s.title,
        body: s.body,
        images: s.images,
        unorderedList: s.unorderedList,
        orderedList: s.orderedList,
      })),
      status: "COMPLETED",
      sortOrder: 10,
      publishedAt: new Date().toISOString(),
    };
    const res = await fetch(`${api}/admin/projects`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    console.log(`[Seed] Project result: ${res.status}`);
  } catch (e) {
    console.error(`[Seed] Project error:`, e.message);
  }

  // 3. Course
  console.log("[Seed] Seeding Sample Course (Khóa học)...");
  try {
    const payload = {
      slug: SAMPLE_COURSE.slug,
      title: SAMPLE_COURSE.title_en || SAMPLE_COURSE.title,
      title_vi: SAMPLE_COURSE.title_vi || SAMPLE_COURSE.title,
      description: SAMPLE_COURSE.description_en || SAMPLE_COURSE.description,
      description_vi: SAMPLE_COURSE.description_vi || SAMPLE_COURSE.description,
      eyebrow: SAMPLE_COURSE.eyebrow_en || SAMPLE_COURSE.eyebrow,
      eyebrow_vi: SAMPLE_COURSE.eyebrow_vi || SAMPLE_COURSE.eyebrow,
      image: SAMPLE_COURSE.image,
      meta: SAMPLE_COURSE.meta,
      meta_vi: SAMPLE_COURSE.meta_vi,
      duration: SAMPLE_COURSE.duration_en || "8 weeks",
      duration_vi: SAMPLE_COURSE.duration_vi || "8 tuần (48 giờ)",
      level: SAMPLE_COURSE.level_en || "Advanced",
      level_vi: SAMPLE_COURSE.level_vi || "Nâng cao",
      price: "8500000",
      instructor: SAMPLE_COURSE.instructor_en || "M.Arch Hoang Trong Minh",
      instructor_vi: SAMPLE_COURSE.instructor_vi || "ThS. KTS. Hoàng Trọng Minh & Đội ngũ BIM4C",
      highlights: SAMPLE_COURSE.highlights_en || SAMPLE_COURSE.highlights,
      highlights_vi: SAMPLE_COURSE.highlights_vi || SAMPLE_COURSE.highlights,
      sections: (SAMPLE_COURSE.sections_en || SAMPLE_COURSE.sections || []).map((s) => ({
        title: s.title,
        body: s.body,
        images: s.images,
      })),
      sections_vi: (SAMPLE_COURSE.sections_vi || SAMPLE_COURSE.sections || []).map((s) => ({
        title: s.title,
        body: s.body,
        images: s.images,
      })),
      status: "PUBLISHED",
      sortOrder: 10,
      publishedAt: new Date().toISOString(),
    };
    const res = await fetch(`${api}/admin/courses`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    console.log(`[Seed] Course result: ${res.status}`);
  } catch (e) {
    console.error(`[Seed] Course error:`, e.message);
  }

  // 4. Post
  console.log("[Seed] Seeding Sample Post (Tin tức)...");
  try {
    const payload = {
      slug: SAMPLE_POST.slug,
      title: SAMPLE_POST.title_en || SAMPLE_POST.title,
      title_vi: SAMPLE_POST.title_vi || SAMPLE_POST.title,
      description: SAMPLE_POST.description_en || SAMPLE_POST.description,
      description_vi: SAMPLE_POST.description_vi || SAMPLE_POST.description,
      eyebrow: SAMPLE_POST.eyebrow_en || SAMPLE_POST.eyebrow,
      eyebrow_vi: SAMPLE_POST.eyebrow_vi || SAMPLE_POST.eyebrow,
      image: SAMPLE_POST.image,
      meta: SAMPLE_POST.meta,
      meta_vi: SAMPLE_POST.meta_vi,
      authorName: "BIM4C R&D Lab",
      highlights: SAMPLE_POST.highlights_en || SAMPLE_POST.highlights,
      highlights_vi: SAMPLE_POST.highlights_vi || SAMPLE_POST.highlights,
      sections: (SAMPLE_POST.sections_en || SAMPLE_POST.sections || []).map((s) => ({
        title: s.title,
        body: s.body,
        images: s.images,
        unorderedList: s.unorderedList,
        orderedList: s.orderedList,
      })),
      sections_vi: (SAMPLE_POST.sections_vi || SAMPLE_POST.sections || []).map((s) => ({
        title: s.title,
        body: s.body,
        images: s.images,
        unorderedList: s.unorderedList,
        orderedList: s.orderedList,
      })),
      status: "PUBLISHED",
      sortOrder: 10,
      publishedAt: new Date().toISOString(),
    };
    const res = await fetch(`${api}/admin/posts`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    console.log(`[Seed] Post result: ${res.status}`);
  } catch (e) {
    console.error(`[Seed] Post error:`, e.message);
  }

  // 5. Hero Slide
  console.log("[Seed] Seeding Hero Slide...");
  try {
    const payload = {
      eyebrow: SAMPLE_HERO_SLIDE.eyebrow,
      title: SAMPLE_HERO_SLIDE.title,
      image: SAMPLE_HERO_SLIDE.image,
      alt: SAMPLE_HERO_SLIDE.alt,
      sortOrder: SAMPLE_HERO_SLIDE.sortOrder,
      isActive: true,
    };
    const res = await fetch(`${api}/admin/homepage/slides`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    console.log(`[Seed] Slide result: ${res.status}`);
  } catch (e) {
    console.error(`[Seed] Slide error:`, e.message);
  }

  // 6. Partners
  console.log("[Seed] Seeding Strategic Partners...");
  for (const partner of SAMPLE_PARTNERS) {
    try {
      const payload = {
        name: partner.name,
        logo: partner.logo,
        website: partner.website,
        sortOrder: partner.sortOrder,
        isActive: true,
      };
      const res = await fetch(`${api}/admin/homepage/partners`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      console.log(`[Seed] Partner "${partner.name}" result: ${res.status}`);
    } catch (e) {
      console.error(`[Seed] Partner error:`, e.message);
    }
  }

  console.log("[Seed] Hoàn tất đồng bộ dữ liệu mẫu vào cơ sở dữ liệu!");
}

main().catch(console.error);
