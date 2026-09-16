const api = process.env.BIM4C_API_URL ?? "http://127.0.0.1:8080";
const email = process.env.BIM4C_ADMIN_EMAIL;
const password = process.env.BIM4C_ADMIN_PASSWORD;
if (!email || !password) throw new Error("BIM4C_ADMIN_EMAIL and BIM4C_ADMIN_PASSWORD are required");

function repair(value) {
  if (typeof value !== "string") return value;
  if (!/[ÃÂÄÅÆÐÑĂ]|á(?:»|º)|â(?:€|€“|-)|�/u.test(value)) return value;
  return new TextDecoder("utf-8").decode(Uint8Array.from(value, (c) => c.charCodeAt(0)));
}
function cleanSections(sections) {
  return (Array.isArray(sections) ? sections : []).map((section) => ({
    ...section,
    title: repair(section.title),
    body: repair(section.body),
  }));
}

const login = await fetch(`${api}/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
if (!login.ok) throw new Error(`Login failed: ${await login.text()}`);
const cookie = login.headers.getSetCookie()[0]?.split(";", 1)[0];
const headers = { cookie, origin: process.env.BIM4C_FRONTEND_ORIGIN ?? "http://localhost:3000", "content-type": "application/json; charset=utf-8" };

const prose = {
  services: {
    en: "The delivery approach is agreed around the project brief, information requirements, model uses and approval points. BIM4C coordinates with the responsible disciplines to make assumptions visible, record decisions and keep the issued information consistent with the intended use.",
    vi: "Phương pháp triển khai được thống nhất theo nhiệm vụ dự án, yêu cầu thông tin, mục đích sử dụng mô hình và các mốc phê duyệt. BIM4C phối hợp với các bộ môn phụ trách để làm rõ giả định, ghi nhận quyết định và duy trì tính nhất quán của hồ sơ theo đúng mục đích sử dụng.",
  },
  projects: {
    en: "The project record is presented according to the documented scope and available information. It separates confirmed deliverables from assumptions, identifies the interfaces that require coordination and provides a clear basis for the next design, review or delivery decision.",
    vi: "Bản ghi dự án được trình bày theo phạm vi đã được ghi nhận và thông tin hiện có. Nội dung phân biệt rõ sản phẩm đã xác nhận với giả định, chỉ ra các giao diện cần phối hợp và tạo cơ sở cho quyết định tiếp theo về thiết kế, thẩm tra hoặc triển khai.",
  },
  courses: {
    en: "Each programme connects principles with a realistic project workflow. Participants work with defined inputs, review criteria and outputs, then receive feedback on both the technical result and the decisions used to produce it. This makes the learning transferable to daily project work.",
    vi: "Mỗi chương trình kết nối nguyên tắc với một quy trình dự án thực tế. Học viên làm việc trên dữ liệu đầu vào, tiêu chí kiểm tra và sản phẩm đầu ra rõ ràng, đồng thời nhận phản hồi về cả kết quả kỹ thuật lẫn quyết định tạo ra kết quả đó. Nhờ vậy, kiến thức có thể áp dụng trực tiếp vào công việc hằng ngày.",
  },
  posts: {
    en: "The practical takeaway is to turn the idea into a repeatable project habit: define the information needed, assign ownership, review against agreed criteria and record the decision. This keeps digital delivery useful beyond a single model, meeting or software workflow.",
    vi: "Điểm rút ra thực tiễn là biến ý tưởng thành một thói quen có thể lặp lại trong dự án: xác định thông tin cần thiết, giao trách nhiệm, kiểm tra theo tiêu chí đã thống nhất và ghi nhận quyết định. Cách làm này giúp chuyển đổi số tạo giá trị vượt ra ngoài một mô hình, cuộc họp hoặc công cụ riêng lẻ.",
  },
};

async function update(kind, copy) {
  const response = await fetch(`${api}/admin/${kind}?limit=100`, { headers });
  if (!response.ok) throw new Error(`List ${kind} failed: ${await response.text()}`);
  const records = (await response.json()).data ?? [];
  for (const record of records) {
    const sections = cleanSections(record.sections);
    const sectionsVi = cleanSections(record.sections_vi ?? record.sections);
    const marker = "The delivery approach is agreed";
    if (!sections.some((section) => section.body?.includes(marker))) sections.push({ title: "Delivery approach", body: copy.en });
    if (!sectionsVi.some((section) => section.body?.includes("Phương pháp triển khai được thống nhất"))) sectionsVi.push({ title: "Cách triển khai", body: copy.vi });
    const patch = { sections, sections_vi: sectionsVi };
    const updateResponse = await fetch(`${api}/admin/${kind}/${record.id}`, { method: "PATCH", headers, body: JSON.stringify(patch) });
    if (!updateResponse.ok) throw new Error(`Update ${kind}/${record.slug} failed: ${await updateResponse.text()}`);
  }
  return records.length;
}

const counts = {};
for (const kind of ["services", "projects", "courses", "posts"]) counts[kind] = await update(kind, prose[kind]);
console.log(`Enriched detail prose through CRUD: ${JSON.stringify(counts)}`);
