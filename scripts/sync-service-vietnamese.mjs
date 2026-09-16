const apiUrl = process.env.BIM4C_API_URL ?? "http://127.0.0.1:8080";
const email = process.env.BIM4C_ADMIN_EMAIL;
const password = process.env.BIM4C_ADMIN_PASSWORD;

if (!email || !password) {
  throw new Error("BIM4C_ADMIN_EMAIL and BIM4C_ADMIN_PASSWORD are required");
}

const services = [
  ["bim-3d", "BIM 3D", "BIM", "Xây dựng mô hình thông tin 3D phối hợp cho kiến trúc, kết cấu và hệ thống kỹ thuật."],
  ["bim-4d", "BIM 4D", "BIM", "Kết nối mô hình thông tin với trình tự thi công để hỗ trợ lập kế hoạch và phối hợp."],
  ["bim-5d", "BIM 5D", "BIM", "Tổ chức khối lượng và thông tin mô hình để hỗ trợ lập chi phí và rà soát thay đổi."],
  ["bim-6d", "BIM 6D năng lượng & bền vững", "BIM", "Chuẩn bị thông tin mô hình cho các yêu cầu về năng lượng, môi trường và phát triển bền vững."],
  ["bim-7d", "BIM 7D vận hành & tài sản", "BIM", "Cấu trúc thông tin tài sản đã kiểm tra để bàn giao và phục vụ vận hành về sau."],
  ["laser-scan", "Laser Scan", "Khảo sát & Số hóa", "Thu thập hiện trạng bằng quét laser để tạo hồ sơ dự án đáng tin cậy."],
  ["lidar", "Khảo sát LiDAR", "Khảo sát & Số hóa", "Ứng dụng dữ liệu LiDAR cho khảo sát địa hình, công trình và hạ tầng."],
  ["scan-to-bim", "Scan-to-BIM", "Khảo sát & Số hóa", "Chuyển đổi dữ liệu point cloud khảo sát thành mô hình BIM hiện trạng có thể sử dụng."],
  ["kien-truc", "Thiết kế kiến trúc", "Thiết kế", "Phát triển hồ sơ thiết kế kiến trúc từ ý tưởng đến hồ sơ phối hợp."],
  ["noi-that", "Thiết kế nội thất", "Thiết kế", "Phát triển mặt bằng, vật liệu và hồ sơ nội thất phù hợp yêu cầu dự án."],
  ["canh-quan", "Thiết kế cảnh quan", "Thiết kế", "Lập phương án không gian và thông tin cảnh quan để phối hợp triển khai."],
  ["ha-tang", "Thiết kế hạ tầng", "Thiết kế", "Phối hợp thông tin thiết kế hạ tầng cho giao thông, thoát nước và hệ thống khu đất."],
  ["quy-hoach-1-500", "Quy hoạch 1/500", "Thiết kế", "Chuẩn bị hồ sơ quy hoạch 1/500 với các yêu cầu không gian và kỹ thuật được phối hợp."],
  ["quan-ly-du-an", "Quản lý dự án", "Tư vấn & Quản lý", "Hỗ trợ lập kế hoạch, phối hợp, báo cáo và ra quyết định dựa trên thông tin dự án."],
  ["giam-sat-thi-cong", "Giám sát thi công", "Tư vấn & Quản lý", "Hỗ trợ theo dõi chất lượng, tiến độ và phối hợp hiện trường trong phạm vi được phê duyệt."],
  ["giam-sat-lap-dat-thiet-bi", "Giám sát lắp đặt thiết bị", "Tư vấn & Quản lý", "Theo dõi thông tin lắp đặt thiết bị, phối hợp và hồ sơ nghiệm thu."],
  ["tham-tra-tham-dinh-thiet-ke", "Thẩm tra & thẩm định thiết kế", "Tư vấn & Quản lý", "Rà soát thông tin thiết kế về phối hợp, tính đầy đủ và sự phù hợp với yêu cầu được phê duyệt."],
  ["dao-tao-chuyen-giao-cong-nghe", "Đào tạo & chuyển giao công nghệ", "Đào tạo", "Phát triển năng lực BIM thực tiễn và chuyển giao quy trình để đội ngũ dự án có thể sử dụng, duy trì."],
];

const login = await fetch(`${apiUrl}/auth/login`, {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ email, password }),
});
if (!login.ok) throw new Error(`Login failed: ${await login.text()}`);
const cookie = login.headers.getSetCookie()[0]?.split(";", 1)[0];
if (!cookie) throw new Error("Login did not return a session cookie");

const listResponse = await fetch(`${apiUrl}/admin/services?limit=100`, {
  headers: { cookie },
});
if (!listResponse.ok) throw new Error(`List failed: ${await listResponse.text()}`);
const list = await listResponse.json();

for (const [slug, title, group, description] of services) {
  const current = list.data.find((item) => item.slug === slug);
  if (!current) throw new Error(`Missing service record: ${slug}`);
  const payload = {
    title_vi: title,
    eyebrow_vi: group,
    description_vi: description,
    meta_vi: "Dịch vụ BIM4C",
    highlights_vi: [
      "Phạm vi được xác định theo yêu cầu dự án",
      "Thông tin được chuẩn hóa để phối hợp",
      "Sản phẩm bàn giao theo phạm vi",
    ],
    sections_vi: [{ title: "Phạm vi thực hiện", body: description }],
  };
  const response = await fetch(`${apiUrl}/admin/services/${current.id}`, {
    method: "PATCH",
    headers: {
      cookie,
      origin: process.env.BIM4C_FRONTEND_ORIGIN ?? "http://localhost:3000",
      "content-type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Update failed for ${slug}: ${await response.text()}`);
}

const publicResponse = await fetch(`${apiUrl}/services?limit=100`);
const publicData = await publicResponse.json();
console.log(`Synchronized ${services.length} service records. Public total: ${publicData.meta.total}.`);
