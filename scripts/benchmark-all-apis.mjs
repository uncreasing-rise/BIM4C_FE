const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8080";

async function measure(url, options = {}) {
  const start = performance.now();
  try {
    const res = await fetch(url, options);
    const duration = Math.round(performance.now() - start);
    return { status: res.status, duration, ok: res.ok };
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    return { status: "ERR", duration, ok: false, error: err.message };
  }
}

async function run() {
  console.log("\n==========================================================================================");
  console.log("                        BIM4C ENTERPRISE - TOÀN DIỆN BENCHMARK API                       ");
  console.log("==========================================================================================");
  console.log(`Backend Server: ${BACKEND_URL}`);
  console.log(`Thời gian kiểm tra: ${new Date().toLocaleString("vi-VN")}`);
  console.log("------------------------------------------------------------------------------------------\n");

  // Step 0: Get real slugs from public lists
  const [srvRes, prjRes, crsRes, pstRes] = await Promise.all([
    fetch(`${BACKEND_URL}/services?limit=1`).then(r => r.json()).catch(() => null),
    fetch(`${BACKEND_URL}/projects?limit=1`).then(r => r.json()).catch(() => null),
    fetch(`${BACKEND_URL}/courses?limit=1`).then(r => r.json()).catch(() => null),
    fetch(`${BACKEND_URL}/posts?limit=1`).then(r => r.json()).catch(() => null),
  ]);

  const serviceSlug = srvRes?.data?.[0]?.slug || srvRes?.data?.items?.[0]?.slug || "tu-van-mo-hinh-hoa-bim-3d";
  const projectSlug = prjRes?.data?.[0]?.slug || prjRes?.data?.items?.[0]?.slug || "m-beach-hotel";
  const courseSlug = crsRes?.data?.[0]?.slug || crsRes?.data?.items?.[0]?.slug || "khoa-hoc-revit-co-ban";
  const postSlug = pstRes?.data?.[0]?.slug || pstRes?.data?.items?.[0]?.slug || "ung-dung-bim-trong-xay-dung-hien-dai";

  const PUBLIC_ENDPOINTS = [
    { name: "1. Health Check", path: "/health", method: "GET" },
    { name: "2. Cài đặt Public", path: "/settings/public", method: "GET" },
    { name: "3. Slide Trang chủ", path: "/homepage/slides", method: "GET" },
    { name: "4. Đối tác chiến lược", path: "/homepage/partners", method: "GET" },
    { name: "5. Danh sách Dịch vụ", path: "/services?page=1&limit=10", method: "GET" },
    { name: "6. Danh sách Dự án", path: "/projects?page=1&limit=10", method: "GET" },
    { name: "7. Danh sách Khóa học", path: "/courses?page=1&limit=10", method: "GET" },
    { name: "8. Danh sách Tin tức", path: "/posts?page=1&limit=10", method: "GET" },
    { name: "9. Chi tiết Dịch vụ", path: `/services/${serviceSlug}`, method: "GET" },
    { name: "10. Chi tiết Dự án", path: `/projects/${projectSlug}`, method: "GET" },
    { name: "11. Chi tiết Khóa học", path: `/courses/${courseSlug}`, method: "GET" },
    { name: "12. Chi tiết Tin tức", path: `/posts/${postSlug}`, method: "GET" },
  ];

  console.log("⚡ [PHẦN 1] BENCHMARK TOÀN BỘ PUBLIC API (Người dùng & Khách xem):");
  const publicTable = [];
  for (const ep of PUBLIC_ENDPOINTS) {
    const r1 = await measure(`${BACKEND_URL}${ep.path}`);
    const r2 = await measure(`${BACKEND_URL}${ep.path}`);
    const r3 = await measure(`${BACKEND_URL}${ep.path}`);
    const avgCache = Math.round((r2.duration + r3.duration) / 2);

    publicTable.push({
      "API": ep.name,
      "Method": ep.method,
      "Lần 1 (Truy vấn DB)": `${r1.duration}ms`,
      "Lần 2 (In-Memory Cache)": `${r2.duration}ms ⚡`,
      "Trung bình Cached": `${avgCache}ms ⚡`,
      "Tốc độ tăng": `${(r1.duration / Math.max(avgCache, 1)).toFixed(0)}x nhanh hơn`,
    });
  }
  console.table(publicTable);

  // Login for Admin
  const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@bim4c.vn", password: "Admin@123456" }),
  });
  const cookie = (loginRes.headers.get("set-cookie") || "").split(";")[0];

  console.log("\n🔐 [PHẦN 2] BENCHMARK TOÀN BỘ ADMIN CMS API:");
  const adminBackendEndpoints = [
    { name: "1. Thông tin Admin (Me)", path: "/auth/me" },
    { name: "2. Dashboard Thống kê", path: "/admin/dashboard/stats" },
    { name: "3. Hoạt động gần đây", path: "/admin/dashboard/recent-activity" },
    { name: "4. Quản trị Dịch vụ", path: "/admin/services?page=1&limit=20" },
    { name: "5. Quản trị Dự án", path: "/admin/projects?page=1&limit=20" },
    { name: "6. Quản trị Khóa học", path: "/admin/courses?page=1&limit=20" },
    { name: "7. Quản trị Tin tức", path: "/admin/posts?page=1&limit=20" },
    { name: "8. Thư viện Media", path: "/admin/media?page=1&limit=20" },
    { name: "9. Cài đặt Hệ thống", path: "/admin/settings" },
    { name: "10. Hero Slides", path: "/admin/homepage/slides" },
    { name: "11. Đối tác chiến lược", path: "/admin/homepage/partners" },
    { name: "12. Đăng ký Khóa học", path: "/admin/course-registrations?page=1&limit=20" },
    { name: "13. Form Liên hệ", path: "/admin/contacts?page=1&limit=20" },
    { name: "14. Đăng ký Bản tin", path: "/admin/newsletter/subscriptions?page=1&limit=20" },
    { name: "15. Nhật ký Audit", path: "/admin/audit-logs?page=1&limit=20" },
    { name: "16. Quản lý Admin Users", path: "/admin/users" },
  ];

  const adminTable = [];
  for (const ep of adminBackendEndpoints) {
    const r1 = await measure(`${BACKEND_URL}${ep.path}`, { headers: { Cookie: cookie } });
    const r2 = await measure(`${BACKEND_URL}${ep.path}`, { headers: { Cookie: cookie } });
    adminTable.push({
      "Admin API": ep.name,
      "Status": r1.status,
      "Lần 1": `${r1.duration}ms`,
      "Lần 2 (Cache)": `${r2.duration}ms ⚡`,
    });
  }
  console.table(adminTable);

  console.log("\n🚀 [PHẦN 3] STRESS TEST TẢI CAO (100 Request đồng thời song song):");
  const pStart = performance.now();
  const pool = [];
  const testEndpoints = [
    "/services?page=1&limit=10",
    "/projects?page=1&limit=10",
    "/courses?page=1&limit=10",
    "/posts?page=1&limit=10",
    "/homepage/slides",
    "/homepage/partners",
    "/settings/public",
  ];
  for (let i = 0; i < 100; i++) {
    const ep = testEndpoints[i % testEndpoints.length];
    pool.push(fetch(`${BACKEND_URL}${ep}`));
  }
  const allResponses = await Promise.all(pool);
  const pTotal = Math.round(performance.now() - pStart);
  const okCount = allResponses.filter(r => r.ok).length;

  console.log(` -> Tổng số request:     100`);
  const successRate = Math.round((okCount / 100) * 100);
  console.log(` -> Thành công:           ${okCount}/100 (${successRate}% OK)`);
  console.log(` -> Tổng thời gian:       ${pTotal}ms`);
  console.log(` -> Thời gian / 1 request: ${(pTotal / 100).toFixed(1)}ms`);
  console.log(` -> Khả năng phục vụ:     ~${Math.round((100 / pTotal) * 1000)} requests / giây ⚡⚡\n`);

  console.log("==========================================================================================");
  console.log("                             KẾT THÚC BÁO CÁO BENCHMARK                                   ");
  console.log("==========================================================================================\n");
}

run().catch(console.error);
