const api = process.env.BIM4C_API_URL ?? "http://127.0.0.1:8080";
const email = process.env.BIM4C_ADMIN_EMAIL;
const password = process.env.BIM4C_ADMIN_PASSWORD;
if (!email || !password) throw new Error("BIM4C_ADMIN_EMAIL and BIM4C_ADMIN_PASSWORD are required");

const serviceLists = {
  "laser-scan": [["Site control and scanning plan", "LiDAR or terrestrial scanner capture", "Point-cloud registration and quality review"], ["As-built data", "Scan-to-BIM integration", "Construction and deformation comparison", "Digital-twin preparation"], ["Millimetre-level detail where suitable", "Remote and non-invasive capture", "Less rework and design uncertainty"]],
  "lidar": [["Survey-control planning", "Terrestrial or drone-based capture", "Point-cloud processing and validation"], ["Point-cloud data", "Existing-condition information", "Digital outputs for BIM and design"]],
  "scan-to-bim": [["Point-cloud cleaning", "Modelling scope and LOD definition", "Architecture, structure and MEP modelling", "Model-to-survey validation"], ["Renovation design", "Clash detection", "As-built documentation", "Digital-twin information base"]],
  "bim-3d": [["Architecture, structure and MEP models", "2D, design or survey-data conversion", "LOD and naming conventions", "Point-cloud processing"], ["Federated model coordination", "Clash detection and issue review", "Shop drawing and IFC extraction", "Construction and operations model standards"], ["More consistent design information", "Clearer multidisciplinary coordination", "Reliable foundation for later stages"]],
  "bim-4d": [["3D model and schedule linking", "Primavera or MS Project data", "Sequence simulation", "Scenario and bottleneck review"], ["Lean Construction review", "Critical Path Method planning", "Planner, contractor and owner workshops", "Recorded sequence decisions"], ["Time-based communication", "Earlier delay visibility", "Better site productivity and resource control"]],
  "bim-5d": [["Model quantities and classification", "Rates and budget information", "Estimate preparation and updates", "Design-change cost impact"], ["Planned versus current cost", "Design–estimating–construction coordination", "Budget decision support"], ["Scope and quantity assumptions", "Approved rates and cost rules", "Transparent cost-information trail"]],
  "bim-6d": [["Energy-performance analysis", "Material and resource considerations", "Carbon and environmental review", "Green-building objectives"], ["IoT environmental data", "AI-assisted sustainability analysis", "Digital-twin scenario comparison"], ["Lower carbon and resource use", "Better-informed design decisions", "Lifecycle sustainability reporting"]],
  "bim-7d": [["Asset registers and identifiers", "Maintenance schedules", "Equipment and technical documents", "Warranty and operational records"], ["IoT monitoring", "AI and machine-learning analysis", "Predictive-maintenance scenarios", "Digital-twin operational planning"], ["Faster asset-information access", "Better maintenance planning", "More consistent facility-management decisions"]],
  "kien-truc": [["Concept and spatial development", "Design information and drawings", "Multidisciplinary coordination"], ["Residential and civil buildings", "Public and commercial buildings", "Industrial buildings"]],
  "noi-that": [["Space planning", "Materials and finishes", "Interior documentation"], ["Architecture coordination", "Structure and MEP interfaces", "Operational requirements review"]],
  "canh-quan": [["Outdoor-space planning", "Planting and landscape information", "Site-interface coordination"], ["Urban and residential developments", "Resort projects", "Planning, architecture and infrastructure coordination"]],
  "ha-tang": [["Roads and earthworks", "Drainage systems", "Site utilities", "Technical interface review"], ["Phased documentation", "Design coordination", "Buildability and crossing checks"]],
  "quy-hoach-1-500": [["Land-use information", "Spatial organization", "Movement and access", "Landscape and technical infrastructure"], ["Urban areas", "Low-rise and high-rise housing", "Resorts and industrial developments"]],
  "quan-ly-du-an": [["Scope and responsibility planning", "Schedule and cost tracking", "Quality and risk management", "Stakeholder coordination"], ["Project reporting", "Information-based decisions", "Issue and action follow-up"]],
  "giam-sat-thi-cong": [["Quality and progress monitoring", "Design and method compliance", "Site observations", "Issue follow-up"], ["Civil and industrial works", "Technical infrastructure", "Irrigation and rural-development projects"]],
  "giam-sat-lap-dat-thiet-bi": [["Installation observation", "Technical-document coordination", "Deviation records"], ["Installation inspection", "Testing and acceptance support", "Approved-scope documentation"]],
  "tham-tra-tham-dinh-thiet-ke": [["Completeness review", "Multidisciplinary coordination", "Constructability review", "Applicable requirements"], ["Structured review comments", "Responsible-party follow-up", "Resolution verification"]],
  "dao-tao-chuyen-giao-cong-nghe": [["Construction professionals", "Organizations and project teams", "Owners and project-management units", "Architecture, construction and infrastructure students"], ["Role-based BIM workflows", "Digital tools and information management", "Guided lessons and practical exercises", "Technology and process transfer"], ["Shared BIM vocabulary", "Clearer project responsibilities", "A workflow the team can use and maintain"]]
};

const courseLists = {
  "bim-foundation-for-project-teams": [["BIM roles and responsibilities", "Information requirements and model purpose", "Project-team workflow mapping"], ["Guided BIM concepts", "Role-based information review", "Small coordination assignment"], ["Shared project vocabulary", "Clearer team responsibilities", "Practical starting workflow"]],
  "bim-model-coordination-and-clash-detection": [["Federated-model setup", "Search sets and review rules", "Clash and issue classification"], ["Coordination workshops", "Issue assignment and tracking", "Resolution verification"], ["Traceable coordination issues", "Assigned actions", "Documented decisions"]],
  "bim-execution-plan-and-cde-workflows": [["Information requirements", "BEP structure", "Naming and status conventions"], ["CDE approvals", "Exchange workflow mapping", "Information-delivery planning"], ["Defined responsibilities", "Controlled information exchange", "Clear delivery-stage requirements"]],
  "digital-handover-and-asset-information": [["Asset information requirements", "Model and document mapping", "Completeness and consistency checks"], ["Asset registers", "Technical and warranty information", "Operations use cases"], ["Verified information set", "Easier information retrieval", "Clear update and maintenance responsibility"]]
};

const postLists = [["Define the decision or problem", "Use a clear information scope", "Record assumptions and limitations"], ["Review with the responsible team", "Track actions to resolution", "Keep decisions traceable"], ["Check the output before handover", "Prepare information for its next use", "Improve the workflow through feedback"]];
const projectLists = [["Documented project scope", "Information source and assumptions", "Coordination requirements"], ["Deliverables within the approved scope", "Quality and completeness review", "Status distinguished from construction completion"]];

const login = await fetch(`${api}/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
if (!login.ok) throw new Error(`Login failed: ${await login.text()}`);
const cookie = login.headers.getSetCookie()[0]?.split(";", 1)[0];
const auth = { cookie, origin: process.env.BIM4C_FRONTEND_ORIGIN ?? "http://localhost:3000", "content-type": "application/json; charset=utf-8" };

async function updateCollection(path, listMap, fallback) {
  const response = await fetch(`${api}/admin/${path}?limit=100`, { headers: { cookie } });
  if (!response.ok) throw new Error(`List failed for ${path}: ${await response.text()}`);
  const rows = (await response.json()).data ?? [];
  for (const row of rows) {
    const custom = listMap[row.slug];
    const sections = Array.isArray(row.sections) ? row.sections : [];
    const sectionsVi = Array.isArray(row.sections_vi) ? row.sections_vi : sections;
    const nextSections = sections.map((section, index) => ({ ...section, unorderedList: custom?.[index] ?? fallback[index % fallback.length] }));
    const nextSectionsVi = sectionsVi.map((section, index) => ({ ...section, unorderedList: custom?.[index] ?? fallback[index % fallback.length] }));
    const update = await fetch(`${api}/admin/${path}/${row.id}`, { method: "PATCH", headers: auth, body: JSON.stringify({ sections: nextSections, sections_vi: nextSectionsVi }) });
    if (!update.ok) throw new Error(`Update failed for ${path}/${row.slug}: ${await update.text()}`);
  }
  return rows.length;
}

const services = await updateCollection("services", serviceLists, postLists[0]);
const courses = await updateCollection("courses", courseLists, courseLists["bim-foundation-for-project-teams"]);
const projects = await updateCollection("projects", {}, projectLists);
const posts = await updateCollection("posts", {}, postLists);
console.log(`Enriched detail lists through CRUD: ${services} services, ${courses} courses, ${projects} projects, ${posts} insights.`);
