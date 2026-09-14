import { readFile } from "node:fs/promises";
import dotenv from "dotenv";

const frontend = "http://127.0.0.1:3000";
const backendEnvPath = "../BE/.env";
const envText = await readFile(backendEnvPath, "utf8");
const env = dotenv.parse(envText);

const email = env.ADMIN_BOOTSTRAP_EMAIL;
const password = env.ADMIN_BOOTSTRAP_PASSWORD;

if (!email || !password) {
  console.error("❌ ADMIN_BOOTSTRAP_EMAIL or ADMIN_BOOTSTRAP_PASSWORD not found in BE/.env");
  process.exit(1);
}

let cookie = "";
const auditResults = [];

function record(category, operation, endpoint, status, passed, details = "") {
  console.log(`  [${category}] ${operation} ${endpoint} -> ${status} ${passed ? "✅" : "❌"} ${details}`);
  auditResults.push({
    Category: category,
    Operation: operation,
    Endpoint: endpoint,
    Status: status,
    Result: passed ? "✅ PASS" : "❌ FAIL",
    Details: details,
  });
}

const request = async (path, init = {}, authenticated = true) => {
  const headers = new Headers(init.headers);
  if (!headers.has("origin")) headers.set("origin", "http://localhost:3000");
  if (authenticated && cookie) headers.set("cookie", cookie);
  const response = await fetch(`${frontend}${path}`, {
    ...init,
    headers,
    redirect: "manual",
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { response, body, status: response.status };
};

const json = (method, body) => ({
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

console.log("🚀 Bắt đầu kiểm tra toàn diện Admin CMS: Queries, Mutations, Caching & Revalidation...\n");

try {
  // 1. AUTHENTICATION & IDENTITY
  let res = await request("/api/auth/login", json("POST", { email, password }), false);
  cookie = res.response.headers.getSetCookie()[0]?.split(";", 1)[0] ?? "";
  record(
    "Auth",
    "LOGIN",
    "/api/auth/login",
    res.status,
    res.status === 200 && cookie.startsWith("bim4c_admin_session="),
    "Đăng nhập & thiết lập HttpOnly cookie",
  );

  res = await request("/api/auth/me");
  record(
    "Auth",
    "GET_ME",
    "/api/auth/me",
    res.status,
    res.status === 200 && res.body?.data?.email,
    `Admin identity: ${res.body?.data?.name}`,
  );

  // 2. QUERY CHECKS (ALL MODULES)
  const queryModules = [
    { name: "Tin tức", path: "/api/admin/posts?page=1&limit=10" },
    { name: "Dự án", path: "/api/admin/projects?page=1&limit=10" },
    { name: "Khóa học", path: "/api/admin/courses?page=1&limit=10" },
    { name: "Dịch vụ", path: "/api/admin/services?page=1&limit=10" },
    { name: "Liên hệ", path: "/api/admin/contacts?page=1&limit=10" },
    { name: "Đăng ký khóa học", path: "/api/admin/course-registrations?page=1&limit=10" },
    { name: "Newsletter", path: "/api/admin/newsletter/subscriptions?page=1&limit=10" },
    { name: "Slide Trang chủ", path: "/api/admin/homepage/slides" },
    { name: "Đối tác Trang chủ", path: "/api/admin/homepage/partners" },
    { name: "Danh mục Tin tức", path: "/api/admin/post-categories" },
    { name: "Danh mục Dự án", path: "/api/admin/project-categories" },
    { name: "Thư viện Media", path: "/api/admin/media?page=1&limit=10" },
    { name: "Người dùng hệ thống", path: "/api/admin/users" },
    { name: "Nhật ký kiểm toán", path: "/api/admin/audit-logs?limit=20" },
    { name: "Cài đặt doanh nghiệp", path: "/api/admin/settings" },
  ];

  for (const mod of queryModules) {
    res = await request(mod.path);
    const ok = res.status === 200;
    record("Query", "GET", mod.path, res.status, ok, mod.name);
  }

  // 3. MUTATION CHECKS (POST / PATCH / DELETE)
  // 3.1 Posts Mutation
  const postSlug = `audit-test-post-${Date.now()}`;
  res = await request(
    "/api/admin/posts",
    json("POST", {
      title: "Audit Test Post",
      slug: postSlug,
      title_vi: "Bài viết kiểm toán Admin",
      description: "Testing create post description and content.",
      description_vi: "Kiểm tra tạo bài viết kiểm toán.",
      eyebrow: "BIM4C Enterprise",
      image: "/images/about.jpg",
      status: "DRAFT",
      highlights: ["Highlight 1", "Highlight 2"],
      sections: [],
    }),
  );
  const postId = res.body?.id || res.body?.data?.id;
  record(
    "Mutation: Posts",
    "CREATE",
    "/api/admin/posts",
    res.status,
    [200, 201].includes(res.status) && Boolean(postId),
    `Created Post ID: ${postId}`,
  );

  if (postId) {
    res = await request(
      `/api/admin/posts/${postId}`,
      json("PATCH", {
        title: "Audit Test Post (Updated)",
        status: "PUBLISHED",
      }),
    );
    record(
      "Mutation: Posts",
      "UPDATE",
      `/api/admin/posts/${postId}`,
      res.status,
      [200, 204].includes(res.status),
      "Updated title & published status",
    );

    res = await request(`/api/admin/posts/${postId}`, { method: "DELETE" });
    record(
      "Mutation: Posts",
      "DELETE",
      `/api/admin/posts/${postId}`,
      res.status,
      [200, 204].includes(res.status),
      "Deleted test post",
    );
  }

  // 3.2 Category Mutation (Standalone CREATE / UPDATE / DELETE)
  const catSlug = `audit-cat-${Date.now()}`;
  res = await request(
    "/api/admin/project-categories",
    json("POST", {
      name: "Chuyên mục Test Độc Lập",
      slug: catSlug,
    }),
  );
  const standaloneCatId = res.body?.data?.id || res.body?.id;
  record(
    "Mutation: Categories",
    "CREATE",
    "/api/admin/project-categories",
    res.status,
    [200, 201].includes(res.status) && Boolean(standaloneCatId),
    `Created Project Category ID: ${standaloneCatId}`,
  );

  if (standaloneCatId) {
    res = await request(
      `/api/admin/project-categories/${standaloneCatId}`,
      json("PATCH", {
        name: "Chuyên mục Test Độc Lập (Đã Sửa)",
        slug: catSlug,
      }),
    );
    record(
      "Mutation: Categories",
      "UPDATE",
      `/api/admin/project-categories/${standaloneCatId}`,
      res.status,
      [200, 204].includes(res.status),
      "Updated project category",
    );

    res = await request(`/api/admin/project-categories/${standaloneCatId}`, { method: "DELETE" });
    record(
      "Mutation: Categories",
      "DELETE",
      `/api/admin/project-categories/${standaloneCatId}`,
      res.status,
      [200, 204].includes(res.status),
      "Deleted standalone project category",
    );
  }

  // 3.3 Projects Mutation (Using existing category from query)
  const existingCatsRes = await request("/api/admin/project-categories");
  const existingCatId = existingCatsRes.body?.data?.[0]?.id || existingCatsRes.body?.[0]?.id;

  const projectSlug = `audit-test-project-${Date.now()}`;
  res = await request(
    "/api/admin/projects",
    json("POST", {
      title: "Audit Test Project",
      slug: projectSlug,
      title_vi: "Dự án kiểm toán Admin",
      description: "Testing create project description.",
      description_vi: "Kiểm tra tạo dự án kiểm toán.",
      eyebrow: "BIM4C Enterprise",
      image: "/images/about.jpg",
      location: "Hà Nội, Việt Nam",
      year: 2026,
      categoryId: existingCatId,
      status: "PLANNED",
      highlights: ["BIM LOD 400"],
      sections: [],
    }),
  );
  const projId = res.body?.id || res.body?.data?.id;
  record(
    "Mutation: Projects",
    "CREATE",
    "/api/admin/projects",
    res.status,
    [200, 201].includes(res.status) && Boolean(projId),
    `Created Project ID: ${projId}`,
  );

  if (projId) {
    res = await request(
      `/api/admin/projects/${projId}`,
      json("PATCH", {
        title: "Audit Test Project (Updated)",
        status: "IN_PROGRESS",
      }),
    );
    record(
      "Mutation: Projects",
      "UPDATE",
      `/api/admin/projects/${projId}`,
      res.status,
      [200, 204].includes(res.status),
      "Updated project title & status",
    );

    res = await request(`/api/admin/projects/${projId}`, { method: "DELETE" });
    record(
      "Mutation: Projects",
      "DELETE",
      `/api/admin/projects/${projId}`,
      res.status,
      [200, 204].includes(res.status),
      "Deleted test project",
    );
  }

  // 3.3 Courses Mutation
  const courseSlug = `audit-test-course-${Date.now()}`;
  res = await request(
    "/api/admin/courses",
    json("POST", {
      title: "Audit Test Course",
      slug: courseSlug,
      title_vi: "Khóa học kiểm toán Admin",
      description: "Testing create course with structured curriculum.",
      description_vi: "Kiểm tra tạo khóa học kiểm toán.",
      eyebrow: "BIM4C Academy",
      image: "/images/about.jpg",
      status: "DRAFT",
      level: "All Levels",
      duration: "10 hours",
      price: "Liên hệ",
      highlights: ["Chứng chỉ hoàn thành"],
      sections: [],
    }),
  );
  const courseId = res.body?.id || res.body?.data?.id;
  record(
    "Mutation: Courses",
    "CREATE",
    "/api/admin/courses",
    res.status,
    [200, 201].includes(res.status) && Boolean(courseId),
    `Created Course ID: ${courseId}`,
  );

  if (courseId) {
    res = await request(
      `/api/admin/courses/${courseId}`,
      json("PATCH", {
        title: "Audit Test Course (Updated)",
        status: "PUBLISHED",
      }),
    );
    record(
      "Mutation: Courses",
      "UPDATE",
      `/api/admin/courses/${courseId}`,
      res.status,
      [200, 204].includes(res.status),
      "Updated course title & status",
    );

    res = await request(`/api/admin/courses/${courseId}`, { method: "DELETE" });
    record(
      "Mutation: Courses",
      "DELETE",
      `/api/admin/courses/${courseId}`,
      res.status,
      [200, 204].includes(res.status),
      "Deleted test course",
    );
  }

  // 3.4 Services Mutation
  const serviceSlug = `audit-test-service-${Date.now()}`;
  res = await request(
    "/api/admin/services",
    json("POST", {
      title: "Audit Test Service",
      slug: serviceSlug,
      title_vi: "Dịch vụ kiểm toán Admin",
      description: "Testing create service with enterprise SLA.",
      description_vi: "Kiểm tra tạo dịch vụ kiểm toán.",
      eyebrow: "BIM4C Consulting",
      image: "/images/about.jpg",
      status: "DRAFT",
      highlights: ["Tối ưu chi phí 25%"],
      sections: [],
    }),
  );
  const serviceId = res.body?.id || res.body?.data?.id;
  record(
    "Mutation: Services",
    "CREATE",
    "/api/admin/services",
    res.status,
    [200, 201].includes(res.status) && Boolean(serviceId),
    `Created Service ID: ${serviceId}`,
  );

  if (serviceId) {
    res = await request(
      `/api/admin/services/${serviceId}`,
      json("PATCH", {
        title: "Audit Test Service (Updated)",
        status: "PUBLISHED",
      }),
    );
    record(
      "Mutation: Services",
      "UPDATE",
      `/api/admin/services/${serviceId}`,
      res.status,
      [200, 204].includes(res.status),
      "Updated service title & status",
    );

    res = await request(`/api/admin/services/${serviceId}`, { method: "DELETE" });
    record(
      "Mutation: Services",
      "DELETE",
      `/api/admin/services/${serviceId}`,
      res.status,
      [200, 204].includes(res.status),
      "Deleted test service",
    );
  }

  // 3.5 Settings Mutation
  res = await request(
    "/api/admin/settings",
    json("PATCH", {
      companyName: "BIM4C Construction",
      email: "info@bim4c.vn",
      socialLinks: {},
      defaultSeoTitle: "BIM4C Construction - BIM Solutions",
      defaultSeoDescription: "Giải pháp BIM và quản lý xây dựng hiện đại cho doanh nghiệp.",
    }),
  );
  record(
    "Mutation: Settings",
    "PATCH",
    "/api/admin/settings",
    res.status,
    res.status === 200,
    "Updated enterprise metadata & default SEO",
  );

  // 4. CACHING & ISR REVALIDATION
  res = await request("/api/admin/revalidate", json("POST", {}));
  record(
    "Cache: Revalidation",
    "POST",
    "/api/admin/revalidate",
    res.status,
    res.status === 200,
    res.body?.data?.message || "Làm mới bộ nhớ đệm toàn bộ website",
  );

} catch (err) {
  console.error("🚨 Fatal error during admin audit:", err);
  record("Error", "CRASH", "Audit Pipeline", 500, false, err instanceof Error ? err.message : String(err));
}

console.log("\n=======================================================");
console.log("       BÁO CÁO KIỂM TOÀN TOÀN BỘ HỆ THỐNG ADMIN        ");
console.log("=======================================================\n");
console.table(auditResults);

const total = auditResults.length;
const passed = auditResults.filter((r) => r.Result.includes("PASS")).length;
const failed = total - passed;

console.log(`\n📊 Tổng kết: ${passed}/${total} bài kiểm tra đạt (${Math.round((passed / total) * 100)}%).`);
if (failed > 0) {
  console.log(`⚠️ Có ${failed} mục chưa đạt yêu cầu.`);
  process.exit(1);
} else {
  console.log("✨ TẤT CẢ QUERIES, MUTATIONS VÀ REVALIDATION HOẠT ĐỘNG HOÀN HẢO 100%!");
  process.exit(0);
}
