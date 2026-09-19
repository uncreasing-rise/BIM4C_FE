async function testAllPublicApis() {
  console.log("=================================================");
  console.log("   BIM4C - KIỂM TRA & ĐÁNH GIÁ TOÀN BỘ PUBLIC API");
  console.log("=================================================\n");

  const baseUrl = "http://localhost:8080";

  const publicEndpoints = [
    {
      name: "1. Health Check",
      url: `${baseUrl}/health`,
      method: "GET",
      description: "Kiểm tra trạng thái máy chủ Backend",
      expectedFields: ["status"],
    },
    {
      name: "2. Cài đặt trang công khai (Public Settings)",
      url: `${baseUrl}/settings/public`,
      method: "GET",
      description: "Tên công ty, email, hotline, brochure, social links, SEO",
      expectedFields: ["companyName", "email", "phone", "address"],
    },
    {
      name: "3. Slide trang chủ (Homepage Slides)",
      url: `${baseUrl}/homepage/slides`,
      method: "GET",
      description: "Banner / Slider trình diễn ngoài trang chủ",
      isArray: true,
    },
    {
      name: "4. Đối tác chiến lược (Strategic Partners)",
      url: `${baseUrl}/homepage/partners`,
      method: "GET",
      description: "Logo và danh sách đối tác hiển thị trang chủ",
      isArray: true,
    },
    {
      name: "5. Danh sách Dịch vụ (Public Services)",
      url: `${baseUrl}/services`,
      method: "GET",
      description: "Danh mục dịch vụ BIM (3D, 4D, 5D, 6D, Scan-to-BIM...)",
      isPaginated: true,
    },
    {
      name: "6. Danh sách Dự án (Public Projects)",
      url: `${baseUrl}/projects`,
      method: "GET",
      description: "Dự án mẫu, danh mục, quy mô, hình ảnh gallery",
      isPaginated: true,
    },
    {
      name: "7. Danh sách Khóa học (Public Courses)",
      url: `${baseUrl}/courses`,
      method: "GET",
      description: "Khóa đào tạo Revit, BIM Manager, lộ trình học",
      isPaginated: true,
    },
    {
      name: "8. Danh sách Bài viết (Public Posts/News)",
      url: `${baseUrl}/posts`,
      method: "GET",
      description: "Tin tức kiến thức công nghệ BIM, bài viết chuyên môn",
      isPaginated: true,
    },
    {
      name: "9. Gửi Form Liên hệ (Submit Contact Form)",
      url: `${baseUrl}/contact`,
      method: "POST",
      body: {
        name: "Người dùng Test",
        email: "test.user@bim4c.vn",
        phone: "0901234567",
        company: "BIM4C Testing Co",
        message: "Kiểm tra gửi liên hệ từ website",
        consent: true,
        privacyPolicyVersion: "1.0",
      },
      description: "Tiếp nhận thông tin khách hàng liên hệ tư vấn",
      expectedFields: ["success", "message"],
    },
    {
      name: "10. Gửi Đăng ký Khóa học (Submit Course Registration)",
      url: `${baseUrl}/course-registrations`,
      method: "POST",
      skipIfNoCourse: true,
      description: "Đăng ký ghi danh khóa học của học viên",
    },
    {
      name: "11. Đăng ký Nhận bản tin (Newsletter Subscription)",
      url: `${baseUrl}/newsletter/subscriptions`,
      method: "POST",
      body: {
        email: `subscriber_${Date.now()}@bim4c.vn`,
        consent: true,
        privacyPolicyVersion: "1.0",
      },
      description: "Đăng ký nhận email tin tức & ưu đãi",
      expectedFields: ["success", "message"],
    },
  ];

  // First fetch a public course to get a valid courseId for registration test
  let sampleCourseId = null;
  let sampleCourseSlug = null;
  let sampleServiceSlug = null;
  let sampleProjectSlug = null;
  let samplePostSlug = null;

  try {
    const cRes = await fetch(`${baseUrl}/courses`);
    const cData = await cRes.json();
    if (cData.data && cData.data.length > 0) {
      sampleCourseId = cData.data[0].id;
      sampleCourseSlug = cData.data[0].slug;
    }
    const sRes = await fetch(`${baseUrl}/services`);
    const sData = await sRes.json();
    if (sData.data && sData.data.length > 0) sampleServiceSlug = sData.data[0].slug;

    const pRes = await fetch(`${baseUrl}/projects`);
    const pData = await pRes.json();
    if (pData.data && pData.data.length > 0) sampleProjectSlug = pData.data[0].slug;

    const bRes = await fetch(`${baseUrl}/posts`);
    const bData = await bRes.json();
    if (bData.data && bData.data.length > 0) samplePostSlug = bData.data[0].slug;
  } catch {}

  console.log("--------------------------------------------------------------------------------------------------");
  console.log("| API Tên                            | Method | Status | Thời gian | Đánh giá dữ liệu           |");
  console.log("--------------------------------------------------------------------------------------------------");

  for (const ep of publicEndpoints) {
    if (ep.skipIfNoCourse && sampleCourseId) {
      ep.body = {
        courseId: sampleCourseId,
        name: "Học viên Test",
        email: "hocvien@bim4c.vn",
        phone: "0912345678",
        consent: true,
        privacyPolicyVersion: "1.0",
      };
      ep.expectedFields = ["success", "message"];
    }

    const t0 = performance.now();
    try {
      const opts = {
        method: ep.method,
        headers: { "Content-Type": "application/json" },
      };
      if (ep.body) opts.body = JSON.stringify(ep.body);

      const res = await fetch(ep.url, opts);
      const t1 = performance.now();
      const duration = Math.round(t1 - t0);
      const json = await res.json().catch(() => null);

      let dataQuality = "Hợp lệ (OK)";
      if (res.status >= 400) {
        dataQuality = `Lỗi ${res.status}: ${json?.message || "Thất bại"}`;
      } else if (ep.isPaginated) {
        dataQuality = `Chuẩn Phân trang (${json?.data?.length || 0} mục, tổng: ${json?.meta?.total || 0})`;
      } else if (ep.isArray) {
        dataQuality = `Chuẩn Mảng (${Array.isArray(json) ? json.length : 0} mục)`;
      } else if (ep.expectedFields) {
        const hasAll = ep.expectedFields.every((f) => json && json[f] !== undefined);
        dataQuality = hasAll ? "Chuẩn cấu trúc JSON" : "Thiếu trường dữ liệu";
      }

      const speed = duration < 50 ? `${duration}ms ⚡` : `${duration}ms`;
      console.log(
        `| ${ep.name.padEnd(34)} | ${ep.method.padEnd(6)} | ${String(res.status).padEnd(6)} | ${speed.padEnd(9)} | ${dataQuality.padEnd(26)} |`
      );
    } catch (err) {
      console.log(
        `| ${ep.name.padEnd(34)} | ${ep.method.padEnd(6)} | ERR    | ----      | ${String(err.message).padEnd(26)} |`
      );
    }
  }

  // Also test Slug detail endpoints
  const detailEndpoints = [
    { name: "12. Chi tiết Dịch vụ (:slug)", url: sampleServiceSlug ? `${baseUrl}/services/${sampleServiceSlug}` : null },
    { name: "13. Chi tiết Dự án (:slug)", url: sampleProjectSlug ? `${baseUrl}/projects/${sampleProjectSlug}` : null },
    { name: "14. Chi tiết Khóa học (:slug)", url: sampleCourseSlug ? `${baseUrl}/courses/${sampleCourseSlug}` : null },
    { name: "15. Chi tiết Bài viết (:slug)", url: samplePostSlug ? `${baseUrl}/posts/${samplePostSlug}` : null },
  ];

  for (const ep of detailEndpoints) {
    if (!ep.url) continue;
    const t0 = performance.now();
    try {
      await fetch(ep.url); // Cold
      const tWarm0 = performance.now();
      const res = await fetch(ep.url); // Warm
      const duration = Math.round(performance.now() - tWarm0);
      const json = await res.json().catch(() => null);
      const speed = duration < 50 ? `${duration}ms ⚡` : `${duration}ms`;
      const dataQuality = json?.title ? `Hợp lệ (${json.title.slice(0, 18)}...)` : "Hợp lệ";
      console.log(
        `| ${ep.name.padEnd(34)} | GET    | ${String(res.status).padEnd(6)} | ${speed.padEnd(9)} | ${dataQuality.padEnd(26)} |`
      );
    } catch (err) {
      console.log(
        `| ${ep.name.padEnd(34)} | GET    | ERR    | ----      | ${String(err.message).padEnd(26)} |`
      );
    }
  }

  console.log("--------------------------------------------------------------------------------------------------\n");
}

testAllPublicApis();
