const apiUrl = process.env.BIM4C_API_URL ?? "http://127.0.0.1:8080";
const email = process.env.BIM4C_ADMIN_EMAIL;
const password = process.env.BIM4C_ADMIN_PASSWORD;
if (!email || !password) throw new Error("BIM4C_ADMIN_EMAIL and BIM4C_ADMIN_PASSWORD are required");

const serviceImages = {
  "bim-3d": "/images/service-bim.jpg",
  "bim-4d": "/images/service-bim.jpg",
  "bim-5d": "/images/service-bim.jpg",
  "bim-6d": "/images/service-bim.jpg",
  "bim-7d": "/images/service-bim.jpg",
  "laser-scan": "/images/service-bim.jpg",
  lidar: "/images/service-bim.jpg",
  "scan-to-bim": "/images/service-bim.jpg",
  "kien-truc": "/images/service-design.jpg",
  "noi-that": "/images/service-design.jpg",
  "canh-quan": "/images/service-design.jpg",
  "ha-tang": "/images/service-design.jpg",
  "quy-hoach-1-500": "/images/service-design.jpg",
  "quan-ly-du-an": "/images/service-consulting.jpg",
  "giam-sat-thi-cong": "/images/service-consulting.jpg",
  "giam-sat-lap-dat-thiet-bi": "/images/service-consulting.jpg",
  "tham-tra-tham-dinh-thiet-ke": "/images/service-consulting.jpg",
  "dao-tao-chuyen-giao-cong-nghe": "/images/service-training.jpg",
};
const projectImages = ["/images/project-matrix.jpg", "/images/project-lumi.jpg", "/images/project-elysian.jpg"];

const login = await fetch(`${apiUrl}/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
if (!login.ok) throw new Error(`Login failed: ${await login.text()}`);
const cookie = login.headers.getSetCookie()[0]?.split(";", 1)[0];
const headers = { cookie, origin: process.env.BIM4C_FRONTEND_ORIGIN ?? "http://localhost:3000", "content-type": "application/json" };

async function updateCollection(kind, imageFor, fallback) {
  const list = await (await fetch(`${apiUrl}/admin/${kind}?limit=100`, { headers })).json();
  for (const [index, item] of (list.data ?? []).entries()) {
    const image = imageFor(item, index) ?? fallback;
    if (item.image === image) continue;
    const response = await fetch(`${apiUrl}/admin/${kind}/${item.id}`, { method: "PATCH", headers, body: JSON.stringify({ image }) });
    if (!response.ok) throw new Error(`${kind}/${item.slug}: ${await response.text()}`);
  }
  return (list.data ?? []).length;
}

const services = await updateCollection("services", (item) => serviceImages[item.slug], "/images/service-bim.jpg");
const projects = await updateCollection("projects", (_, index) => projectImages[index % projectImages.length], "/images/project-matrix.jpg");
console.log(`Updated professional images for ${services} services and ${projects} projects through CRUD.`);
