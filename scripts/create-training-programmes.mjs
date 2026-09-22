const apiUrl = process.env.BIM4C_API_URL ?? "http://127.0.0.1:8080";
const email = process.env.BIM4C_ADMIN_EMAIL;
const password = process.env.BIM4C_ADMIN_PASSWORD;
if (!email || !password) throw new Error("BIM4C_ADMIN_EMAIL and BIM4C_ADMIN_PASSWORD are required");

const programmes = [
  {
    slug: "bim-foundation-for-project-teams",
    title: "BIM Foundation for Project Teams",
    title_vi: "Nền tảng BIM cho đội ngũ dự án",
    description: "A practical introduction to BIM roles, information requirements, model coordination and project workflows.",
    description_vi: "Chương trình thực hành nền tảng về vai trò BIM, yêu cầu thông tin, phối hợp mô hình và quy trình dự án.",
    duration: "4 weeks", duration_vi: "4 tuần", level: "Foundation", level_vi: "Nền tảng",
    highlights: ["BIM roles and responsibilities", "Model information basics", "Coordination workflow exercises"],
    highlights_vi: ["Vai trò và trách nhiệm BIM", "Nền tảng thông tin mô hình", "Thực hành quy trình phối hợp"],
    outcomes: ["Understand core BIM concepts and project responsibilities.", "Read and organize model information for coordination.", "Contribute to a structured team workflow."],
    outcomes_vi: ["Hiểu các khái niệm BIM và trách nhiệm trong dự án.", "Đọc và tổ chức thông tin mô hình để phối hợp.", "Tham gia quy trình làm việc có cấu trúc."],
    sections: [["Programme overview", "A foundation programme for project owners, consultants, contractors and team members starting or standardizing BIM workflows."], ["Learning activities", "Guided lessons, role-based exercises, model-information reviews and a small coordination assignment based on a project workflow."], ["Expected outcome", "Participants leave with a shared vocabulary, clearer responsibilities and a practical starting workflow for their team."]],
    sections_vi: [["Tổng quan chương trình", "Chương trình nền tảng dành cho chủ đầu tư, đơn vị tư vấn, nhà thầu và thành viên dự án bắt đầu hoặc chuẩn hóa quy trình BIM."], ["Hoạt động học tập", "Học có hướng dẫn, bài tập theo vai trò, rà soát thông tin mô hình và một bài tập phối hợp nhỏ dựa trên quy trình dự án."], ["Kết quả dự kiến", "Học viên có chung thuật ngữ, hiểu rõ trách nhiệm và có quy trình khởi đầu thực tế cho đội ngũ."]]
  },
  {
    slug: "bim-model-coordination-and-clash-detection",
    title: "BIM Model Coordination and Clash Detection",
    title_vi: "Phối hợp mô hình BIM và phát hiện xung đột",
    description: "Develop practical skills for combining discipline models, reviewing clashes and tracking issues to resolution.",
    description_vi: "Phát triển kỹ năng tổng hợp mô hình đa bộ môn, rà soát xung đột và theo dõi vấn đề đến khi xử lý.",
    duration: "5 weeks", duration_vi: "5 tuần", level: "Applied", level_vi: "Ứng dụng",
    highlights: ["Federated model setup", "Clash review and issue tracking", "Coordination meeting practice"],
    highlights_vi: ["Thiết lập mô hình tổng hợp", "Rà soát xung đột và theo dõi vấn đề", "Thực hành họp phối hợp"],
    outcomes: ["Prepare models for a coordination review.", "Classify and communicate coordination issues.", "Track actions and verify resolutions."],
    outcomes_vi: ["Chuẩn bị mô hình cho buổi rà soát phối hợp.", "Phân loại và truyền đạt vấn đề phối hợp.", "Theo dõi hành động và kiểm tra kết quả xử lý."],
    sections: [["Programme overview", "An applied programme for BIM coordinators, design teams and contractors who need a repeatable model-coordination process."], ["Learning activities", "Model federation, search-set setup, clash review, issue classification, coordination workshops and resolution verification using project-style examples."], ["Expected outcome", "Participants can support a clear coordination cycle with traceable issues, assigned actions and documented decisions."]],
    sections_vi: [["Tổng quan chương trình", "Chương trình ứng dụng dành cho BIM Coordinator, nhóm thiết kế và nhà thầu cần một quy trình phối hợp mô hình có thể lặp lại."], ["Hoạt động học tập", "Tổng hợp mô hình, thiết lập bộ tìm kiếm, rà soát xung đột, phân loại vấn đề, tổ chức workshop phối hợp và kiểm tra xử lý bằng ví dụ theo dự án."], ["Kết quả dự kiến", "Học viên có thể hỗ trợ chu kỳ phối hợp rõ ràng với vấn đề có thể truy vết, hành động được phân công và quyết định được ghi nhận."]]
  },
  {
    slug: "bim-execution-plan-and-cde-workflows",
    title: "BIM Execution Plan and CDE Workflows",
    title_vi: "Kế hoạch triển khai BIM và quy trình CDE",
    description: "Learn how to structure BIM requirements, responsibilities, naming, approvals and information exchange in a CDE workflow.",
    description_vi: "Học cách cấu trúc yêu cầu BIM, trách nhiệm, quy tắc đặt tên, phê duyệt và trao đổi thông tin trong quy trình CDE.",
    duration: "3 weeks", duration_vi: "3 tuần", level: "Applied", level_vi: "Ứng dụng",
    highlights: ["BEP and information requirements", "CDE states and approvals", "Information delivery planning"],
    highlights_vi: ["BEP và yêu cầu thông tin", "Trạng thái và phê duyệt trên CDE", "Lập kế hoạch bàn giao thông tin"],
    outcomes: ["Map information requirements to team responsibilities.", "Define a practical approval and exchange workflow.", "Identify information needed at key delivery stages."],
    outcomes_vi: ["Liên kết yêu cầu thông tin với trách nhiệm đội ngũ.", "Xác định quy trình phê duyệt và trao đổi thực tế.", "Nhận diện thông tin cần thiết tại các mốc bàn giao."],
    sections: [["Programme overview", "A workflow-focused programme for owners, project managers and BIM leads establishing a consistent information-management approach."], ["Learning activities", "Review information requirements, develop a BEP outline, define naming and status conventions, map approvals and practice delivery planning in a CDE."], ["Expected outcome", "A clear starting framework for managing project information, responsibilities and exchanges across the project team."]],
    sections_vi: [["Tổng quan chương trình", "Chương trình tập trung vào quy trình dành cho chủ đầu tư, quản lý dự án và BIM Lead đang xây dựng phương pháp quản lý thông tin thống nhất."], ["Hoạt động học tập", "Rà soát yêu cầu thông tin, xây dựng khung BEP, xác định quy tắc đặt tên và trạng thái, lập sơ đồ phê duyệt và thực hành kế hoạch bàn giao trên CDE."], ["Kết quả dự kiến", "Một khung khởi đầu rõ ràng để quản lý thông tin, trách nhiệm và trao đổi giữa các bên trong dự án."]]
  },
  {
    slug: "digital-handover-and-asset-information",
    title: "Digital Handover and Asset Information",
    title_vi: "Bàn giao số và thông tin tài sản",
    description: "Prepare structured model, document and asset information for handover and future operations.",
    description_vi: "Chuẩn bị mô hình, tài liệu và thông tin tài sản có cấu trúc cho bàn giao và vận hành về sau.",
    duration: "4 weeks", duration_vi: "4 tuần", level: "Applied", level_vi: "Ứng dụng",
    highlights: ["Asset information requirements", "Handover data checks", "Operations-ready information"],
    highlights_vi: ["Yêu cầu thông tin tài sản", "Kiểm tra dữ liệu bàn giao", "Thông tin sẵn sàng cho vận hành"],
    outcomes: ["Define what asset information is needed for the next use.", "Check completeness and consistency before handover.", "Organize a practical handover information set."],
    outcomes_vi: ["Xác định thông tin tài sản cần cho mục đích sử dụng tiếp theo.", "Kiểm tra tính đầy đủ và nhất quán trước khi bàn giao.", "Tổ chức bộ thông tin bàn giao có thể sử dụng."],
    sections: [["Programme overview", "A practical programme for owners, contractors and operations teams preparing information beyond the construction stage."], ["Learning activities", "Define asset information requirements, map model and document data, review completeness, structure handover registers and discuss operational use cases."], ["Expected outcome", "Participants can plan a verified information set that is easier for the receiving operations team to find and maintain."]],
    sections_vi: [["Tổng quan chương trình", "Chương trình thực hành dành cho chủ đầu tư, nhà thầu và đội ngũ vận hành chuẩn bị thông tin vượt ra ngoài giai đoạn thi công."], ["Hoạt động học tập", "Xác định yêu cầu thông tin tài sản, liên kết dữ liệu mô hình và tài liệu, kiểm tra tính đầy đủ, cấu trúc danh mục bàn giao và trao đổi tình huống vận hành."], ["Kết quả dự kiến", "Học viên có thể lập bộ thông tin đã kiểm tra để đội ngũ vận hành tiếp nhận, tìm kiếm và duy trì thuận lợi hơn."]]
  }
];

const login = await fetch(`${apiUrl}/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
if (!login.ok) throw new Error(`Login failed: ${await login.text()}`);
const cookie = login.headers.getSetCookie()[0]?.split(";", 1)[0];
const listResponse = await fetch(`${apiUrl}/admin/courses?limit=100`, { headers: { cookie } });
if (!listResponse.ok) throw new Error(`List failed: ${await listResponse.text()}`);
const list = await listResponse.json();

for (const [index, programme] of programmes.entries()) {
  if (list.data.some((item) => item.slug === programme.slug)) continue;
  const course = programme;
  const payload = {
    ...course,
    image: "/images/service-training.jpg",
    eyebrow: "BIM4C Academy",
    eyebrow_vi: "Học viện BIM4C",
    meta: `${programme.level} · ${programme.duration}`,
    meta_vi: `${programme.level_vi} · ${programme.duration_vi}`,
    sections: programme.sections.map(([title, body]) => ({ title, body })),
    sections_vi: programme.sections_vi.map(([title, body]) => ({ title, body })),
    learningOutcomes: programme.outcomes,
    learningOutcomes_vi: programme.outcomes_vi,
    status: "PUBLISHED",
    sortOrder: (index + 1) * 10,
    publishedAt: new Date().toISOString(),
  };
  const response = await fetch(`${apiUrl}/admin/courses`, {
    method: "POST",
    headers: { cookie, origin: process.env.BIM4C_FRONTEND_ORIGIN ?? "http://localhost:3000", "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Create failed for ${programme.slug}: ${await response.text()}`);
}
console.log(`Created or retained ${programmes.length} training programmes through the admin CRUD API.`);
