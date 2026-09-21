import type { ContentEntryDto } from "@/features/shared/types/content-dto";
import type { ProjectDto } from "@/features/projects/api/project.mapper";
import type { HeroSlide, StrategicPartner } from "@/features/homepage/types";

export const SAMPLE_SERVICE: ContentEntryDto = {
  id: "srv-bim-3d-sample",
  slug: "tu-van-mo-hinh-hoa-bim-3d",
  title: "Tư vấn & Mô hình hóa BIM 3D Đa bộ môn",
  title_vi: "Tư vấn & Mô hình hóa BIM 3D Đa bộ môn",
  title_en: "Multidisciplinary 3D BIM Modeling & Coordination",
  eyebrow: "Dịch vụ cốt lõi",
  eyebrow_vi: "Dịch vụ cốt lõi",
  eyebrow_en: "Core Service",
  category: "Tư vấn BIM",
  meta: "Tiêu chuẩn ISO 19650",
  meta_vi: "Tiêu chuẩn ISO 19650",
  meta_en: "ISO 19650 Standard",
  image: "/images/service-bim.jpg",
  description:
    "Dịch vụ mô hình hóa thông tin công trình 3D chuẩn xác cho Kiến trúc, Kết cấu, MEP và Hạ tầng, chuyển đổi dữ liệu 2D thành mô hình số giàu thông tin phục vụ điều phối và thi công.",
  description_vi:
    "Dịch vụ mô hình hóa thông tin công trình 3D chuẩn xác cho Kiến trúc, Kết cấu, MEP và Hạ tầng, chuyển đổi dữ liệu 2D thành mô hình số giàu thông tin phục vụ điều phối và thi công.",
  description_en:
    "High-precision 3D BIM modeling service for Architecture, Structure, MEP and Infrastructure, transforming 2D data into rich digital information models for coordination and construction.",
  highlights: [
    "Mô hình hóa chính xác theo cấp độ LOD 200 - LOD 400",
    "Phát hiện xung đột liên bộ môn (Clash Detection) tự động",
    "Trích xuất khối lượng (QTO) và bản vẽ Shop Drawing từ mô hình",
    "Chuẩn hóa dữ liệu theo tiêu chuẩn ISO 19650",
  ],
  highlights_vi: [
    "Mô hình hóa chính xác theo cấp độ LOD 200 - LOD 400",
    "Phát hiện xung đột liên bộ môn (Clash Detection) tự động",
    "Trích xuất khối lượng (QTO) và bản vẽ Shop Drawing từ mô hình",
    "Chuẩn hóa dữ liệu theo tiêu chuẩn ISO 19650",
  ],
  highlights_en: [
    "Accurate modeling per LOD 200 - LOD 400 standards",
    "Automated multidisciplinary clash detection",
    "Quantity takeoff (QTO) & shop drawing extraction from model",
    "Standardized data workflow compliant with ISO 19650",
  ],
  sections: [
    {
      title: "Phạm vi và quy trình triển khai BIM 3D",
      body: "BIM4C thiết lập môi trường dữ liệu chung CDE, chuẩn hóa các bộ thư viện tham số Family, và tiến hành dựng mô hình 3D tích hợp. Toàn bộ xung đột không gian giữa các hệ thống đường ống MEP, dầm sàn và kiến trúc được phát hiện và xử lý ngay trên mô hình số trước khi ra công trường.",
      images: [
        {
          url: "/images/service-bim.jpg",
          alt: "Phối cảnh mô hình BIM 3D",
          caption:
            "Quy trình phối hợp BIM 3D giữa các bộ môn Kiến trúc, Kết cấu và MEP",
        },
      ],
      unorderedList: [
        "Mô hình hóa kiến trúc, kết cấu bê tông cốt thép và kết cấu thép",
        "Mô hình hóa hệ thống cơ điện (HVAC, Cấp thoát nước, Điện, PCCC)",
        "Kiểm tra và xử lý xung đột không gian đa bộ môn",
      ],
    },
    {
      title: "Sản phẩm bàn giao và giá trị thực tiễn",
      body: "Khách hàng nhận được mô hình BIM hoàn chỉnh định dạng IFC/Revit, báo cáo phát hiện và giải quyết xung đột (Clash Report), bộ bản vẽ thi công đồng bộ và bảng thống kê khối lượng vật tư chính xác đến từng cấu kiện.",
      images: [
        {
          url: "/images/service-design.jpg",
          alt: "Bản vẽ trích xuất từ BIM",
          caption:
            "Hồ sơ bản vẽ thi công và bảng tổng hợp khối lượng trích xuất tự động",
        },
      ],
      orderedList: [
        "Bàn giao mô hình số theo tiêu chuẩn mở IFC và native file",
        "Báo cáo giải trình xung đột kèm giải pháp kỹ thuật đã thống nhất",
        "Bộ hồ sơ bản vẽ Shop Drawing và trích xuất khối lượng chi tiết",
      ],
    },
  ],
  sections_vi: [
    {
      title: "Phạm vi và quy trình triển khai BIM 3D",
      body: "BIM4C thiết lập môi trường dữ liệu chung CDE, chuẩn hóa các bộ thư viện tham số Family, và tiến hành dựng mô hình 3D tích hợp. Toàn bộ xung đột không gian giữa các hệ thống đường ống MEP, dầm sàn và kiến trúc được phát hiện và xử lý ngay trên mô hình số trước khi ra công trường.",
      images: [
        {
          url: "/images/service-bim.jpg",
          alt: "Phối cảnh mô hình BIM 3D",
          caption:
            "Quy trình phối hợp BIM 3D giữa các bộ môn Kiến trúc, Kết cấu và MEP",
        },
      ],
      unorderedList: [
        "Mô hình hóa kiến trúc, kết cấu bê tông cốt thép và kết cấu thép",
        "Mô hình hóa hệ thống cơ điện (HVAC, Cấp thoát nước, Điện, PCCC)",
        "Kiểm tra và xử lý xung đột không gian đa bộ môn",
      ],
    },
    {
      title: "Sản phẩm bàn giao và giá trị thực tiễn",
      body: "Khách hàng nhận được mô hình BIM hoàn chỉnh định dạng IFC/Revit, báo cáo phát hiện và giải quyết xung đột (Clash Report), bộ bản vẽ thi công đồng bộ và bảng thống kê khối lượng vật tư chính xác đến từng cấu kiện.",
      images: [
        {
          url: "/images/service-design.jpg",
          alt: "Bản vẽ trích xuất từ BIM",
          caption:
            "Hồ sơ bản vẽ thi công và bảng tổng hợp khối lượng trích xuất tự động",
        },
      ],
      orderedList: [
        "Bàn giao mô hình số theo tiêu chuẩn mở IFC và native file",
        "Báo cáo giải trình xung đột kèm giải pháp kỹ thuật đã thống nhất",
        "Bộ hồ sơ bản vẽ Shop Drawing và trích xuất khối lượng chi tiết",
      ],
    },
  ],
  sections_en: [
    {
      title: "Scope and 3D BIM Delivery Workflow",
      body: "BIM4C establishes the Common Data Environment (CDE), standardizes parametric family libraries, and constructs integrated 3D models. Spatial clashes between MEP ductwork/pipework, structural elements, and architectural finishes are detected and resolved digitally before on-site execution.",
      images: [
        {
          url: "/images/service-bim.jpg",
          alt: "3D BIM Model Rendering",
          caption:
            "3D BIM coordination workflow across Architecture, Structure, and MEP disciplines",
        },
      ],
      unorderedList: [
        "Architectural, reinforced concrete, and structural steel modeling",
        "MEP building services modeling (HVAC, Plumbing, Electrical, Fire Fighting)",
        "Inter-disciplinary clash detection and coordination reporting",
      ],
    },
    {
      title: "Deliverables & Practical Value",
      body: "Clients receive complete BIM models in open IFC and native formats, comprehensive clash resolution reports, synchronized shop drawings, and accurate bill of quantities directly extracted from the digital asset.",
      images: [
        {
          url: "/images/service-design.jpg",
          alt: "Drawings extracted from BIM",
          caption:
            "Construction drawing sets and automated quantity takeoff documentation",
        },
      ],
      orderedList: [
        "Delivery of coordinated digital models in IFC and native formats",
        "Detailed clash reports with agreed engineering resolution methods",
        "Synchronized shop drawing sets and element-level quantity takeoffs",
      ],
    },
  ],
  status: "PUBLISHED",
  publishedAt: "2026-09-17T08:00:00.000Z",
  createdAt: "2026-09-17T08:00:00.000Z",
  updatedAt: "2026-09-17T08:00:00.000Z",
};

export const SAMPLE_PROJECT: ProjectDto = {
  id: "prj-nut-giao-hoa-xuan-sample",
  slug: "nut-giao-hoa-xuan",
  title: "Nút giao thông Hòa Xuân — Cầu Hòa Xuân",
  title_vi: "Nút giao thông Hòa Xuân — Cầu Hòa Xuân",
  title_en: "Hoa Xuan Interchange & Bridge — Da Nang",
  eyebrow: "Hạ tầng & Giao thông trọng điểm",
  eyebrow_vi: "Hạ tầng & Giao thông trọng điểm",
  eyebrow_en: "Key Infrastructure & Transport",
  category: "Hạ tầng",
  location: "Đà Nẵng, Việt Nam",
  location_vi: "Đà Nẵng, Việt Nam",
  year: "2026",
  investor: "Ban Quản lý Dự án Đầu tư Xây dựng Hạ tầng Đô thị",
  investor_vi: "Ban Quản lý Dự án Đầu tư Xây dựng Hạ tầng Đô thị",
  scale: "Nút giao khác mức, hầm chui 4 làn xe, cầu vượt liên thông",
  scale_vi: "Nút giao khác mức, hầm chui 4 làn xe, cầu vượt liên thông",
  contractPackage: "Gói thầu Tư vấn BIM & Thiết kế bản vẽ thi công",
  contractPackage_vi: "Gói thầu Tư vấn BIM & Thiết kế bản vẽ thi công",
  expectedCompletion: "2028",
  expectedCompletion_vi: "2028",
  image: "/images/project-matrix.jpg",
  gallery: [
    {
      url: "/images/project-matrix.jpg",
      alt: "Phối cảnh tổng thể nút giao Hòa Xuân",
      caption: "Phối cảnh tổng thể nút giao thông và phân luồng kỹ thuật",
    },
    {
      url: "/images/project-lumi.jpg",
      alt: "Mô hình kết cấu hầm chui và cầu vượt",
      caption: "Mô hình chi tiết kết cấu bê tông hầm và dầm cầu vượt",
    },
    {
      url: "/images/project-elysian.jpg",
      alt: "Bản đồ số hạ tầng kỹ thuật ngầm",
      caption: "Mô hình số hóa hệ thống thoát nước ngầm và hạ tầng kỹ thuật",
    },
  ],
  meta: "Hồ sơ năng lực 2026",
  meta_vi: "Hồ sơ năng lực 2026",
  meta_en: "Capability Profile 2026",
  description:
    "Dự án nút giao thông khác mức trọng điểm tại TP. Đà Nẵng, áp dụng mô hình thông tin công trình BIM nhằm tối ưu hóa giải pháp thiết kế hầm chui, cầu vượt và hệ thống thoát nước ngầm phức tạp.",
  description_vi:
    "Dự án nút giao thông khác mức trọng điểm tại TP. Đà Nẵng, áp dụng mô hình thông tin công trình BIM nhằm tối ưu hóa giải pháp thiết kế hầm chui, cầu vượt và hệ thống thoát nước ngầm phức tạp.",
  description_en:
    "Key grade-separated interchange project in Da Nang, applying Building Information Modeling (BIM) to optimize design solutions for underpasses, flyovers, and complex underground drainage.",
  highlights: [
    "Phạm vi thiết kế bản vẽ thi công (TKBVTC) và phối hợp mô hình LOD 300 - 350",
    "Tối ưu giải pháp giao thông và mặt bằng thi công phân kỳ",
    "Mô hình hóa địa hình và hệ thống hạ tầng ngầm đồng bộ",
    "Rút ngắn 25% thời gian rà soát thiết kế và phát hiện sớm hơn 120 điểm xung đột",
  ],
  highlights_vi: [
    "Phạm vi thiết kế bản vẽ thi công (TKBVTC) và phối hợp mô hình LOD 300 - 350",
    "Tối ưu giải pháp giao thông và mặt bằng thi công phân kỳ",
    "Mô hình hóa địa hình và hệ thống hạ tầng ngầm đồng bộ",
    "Rút ngắn 25% thời gian rà soát thiết kế và phát hiện sớm hơn 120 điểm xung đột",
  ],
  highlights_en: [
    "Construction-document design & model coordination at LOD 300 - 350",
    "Traffic routing & phased construction layout optimization",
    "Synchronous topography & underground utilities modeling",
    "Reduced design review time by 25% with 120+ clashes resolved in advance",
  ],
  sections: [
    {
      title: "Quy mô dự án và thách thức ban đầu",
      body: "Nút giao Hòa Xuân kết nối các trục đường huyết mạch với lưu lượng giao thông lớn và mạng lưới hạ tầng kỹ thuật ngầm chằng chịt. Việc ứng dụng BIM giúp phát hiện hơn 120 điểm xung đột tiềm ẩn giữa cống hộp ngầm và móng cọc cầu.",
      images: [
        {
          url: "/images/project-matrix.jpg",
          alt: "Hiện trạng và giải pháp quy hoạch nút giao",
          caption: "Mặt bằng tổng thể và hiện trạng nút giao thông Hòa Xuân",
        },
      ],
      unorderedList: [
        "Mạng lưới hạ tầng ngầm phức tạp (cấp thoát nước, cáp điện lực ngầm, viễn thông)",
        "Yêu cầu phân luồng giao thông liên tục trong suốt giai đoạn thi công",
        "Kiểm soát cao độ dốc hầm chui và khả năng thoát nước mưa trong mùa lũ",
      ],
    },
    {
      title: "Giải pháp BIM và kết quả đạt được",
      body: "BIM4C đã xây dựng mô hình số chuẩn xác, hỗ trợ chủ đầu tư và ban quản lý dự án rút ngắn 25% thời gian rà soát thiết kế, đảm bảo hồ sơ bàn giao sẵn sàng thi công mà không phát sinh xung đột hiện trường.",
      images: [
        {
          url: "/images/project-lumi.jpg",
          alt: "Phối hợp 3D giải quyết xung đột",
          caption: "Mô phỏng phối hợp 3D giải quyết xung đột giao cắt móng cọc và hạ tầng",
        },
      ],
      orderedList: [
        "Khảo sát địa hình bằng flycam/LiDAR và dựng mô hình bề mặt địa hình số (DTM)",
        "Mô hình hóa cấu kiện cầu hầm và hệ thống thoát nước ở mức LOD 350",
        "Mô phỏng tiến độ thi công 4D phân luồng giao thông an toàn",
      ],
    },
  ],
  sections_vi: [
    {
      title: "Quy mô dự án và thách thức ban đầu",
      body: "Nút giao Hòa Xuân kết nối các trục đường huyết mạch với lưu lượng giao thông lớn và mạng lưới hạ tầng kỹ thuật ngầm chằng chịt. Việc ứng dụng BIM giúp phát hiện hơn 120 điểm xung đột tiềm ẩn giữa cống hộp ngầm và móng cọc cầu.",
      images: [
        {
          url: "/images/project-matrix.jpg",
          alt: "Hiện trạng và giải pháp quy hoạch nút giao",
          caption: "Mặt bằng tổng thể và hiện trạng nút giao thông Hòa Xuân",
        },
      ],
      unorderedList: [
        "Mạng lưới hạ tầng ngầm phức tạp (cấp thoát nước, cáp điện lực ngầm, viễn thông)",
        "Yêu cầu phân luồng giao thông liên tục trong suốt giai đoạn thi công",
        "Kiểm soát cao độ dốc hầm chui và khả năng thoát nước mưa trong mùa lũ",
      ],
    },
    {
      title: "Giải pháp BIM và kết quả đạt được",
      body: "BIM4C đã xây dựng mô hình số chuẩn xác, hỗ trợ chủ đầu tư và ban quản lý dự án rút ngắn 25% thời gian rà soát thiết kế, đảm bảo hồ sơ bàn giao sẵn sàng thi công mà không phát sinh xung đột hiện trường.",
      images: [
        {
          url: "/images/project-lumi.jpg",
          alt: "Phối hợp 3D giải quyết xung đột",
          caption: "Mô phỏng phối hợp 3D giải quyết xung đột giao cắt móng cọc và hạ tầng",
        },
      ],
      orderedList: [
        "Khảo sát địa hình bằng flycam/LiDAR và dựng mô hình bề mặt địa hình số (DTM)",
        "Mô hình hóa cấu kiện cầu hầm và hệ thống thoát nước ở mức LOD 350",
        "Mô phỏng tiến độ thi công 4D phân luồng giao thông an toàn",
      ],
    },
  ],
  sections_en: [
    {
      title: "Project Scope & Initial Engineering Challenges",
      body: "Hoa Xuan Interchange connects major urban arterial roads with dense traffic and complex underground infrastructure networks. BIM deployment identified more than 120 potential spatial clashes between stormwater culverts and bridge foundation piles.",
      images: [
        {
          url: "/images/project-matrix.jpg",
          alt: "Site condition and interchange master plan",
          caption: "General master plan and current layout of Hoa Xuan interchange",
        },
      ],
      unorderedList: [
        "Complex subterranean networks (water supply, drainage, underground power, telecom)",
        "Requirement for continuous uninterrupted traffic routing during phased construction",
        "Underpass slope elevation and flood runoff drainage capacity control",
      ],
    },
    {
      title: "BIM Solutions & Project Outcomes",
      body: "BIM4C created high-fidelity digital models, assisting the project management unit in reducing design review durations by 25% and ensuring construction-ready documentation with zero field clashes.",
      images: [
        {
          url: "/images/project-lumi.jpg",
          alt: "3D coordination resolving clashes",
          caption: "3D model coordination resolving clashes between foundation piles and utilities",
        },
      ],
      orderedList: [
        "Aerial LiDAR topographic survey and Digital Terrain Model (DTM) reconstruction",
        "LOD 350 bridge, underpass and drainage infrastructure modeling",
        "4D BIM construction sequencing and traffic phasing simulation",
      ],
    },
  ],
  status: "completed",
  publishedAt: "2026-09-17T08:00:00.000Z",
  createdAt: "2026-09-17T08:00:00.000Z",
  updatedAt: "2026-09-17T08:00:00.000Z",
};

export const SAMPLE_COURSE: ContentEntryDto = {
  id: "crs-bim-coordinator-sample",
  slug: "chuyen-vien-phoi-hop-bim-3d",
  title: "Chuyên viên Phối hợp Mô hình BIM 3D & Điều phối Xung đột (BIM Coordinator)",
  title_vi: "Chuyên viên Phối hợp Mô hình BIM 3D & Điều phối Xung đột (BIM Coordinator)",
  title_en: "BIM 3D Model Coordination & Clash Resolution Specialist",
  eyebrow: "Đào tạo thực chiến BIM4C",
  eyebrow_vi: "Đào tạo thực chiến BIM4C",
  eyebrow_en: "BIM4C Academy Practical Training",
  category: "Đào tạo BIM",
  meta: "Cấp chứng chỉ hoàn thành",
  meta_vi: "Cấp chứng chỉ hoàn thành",
  meta_en: "Certificate of Completion",
  image: "/images/service-training.jpg",
  duration: "8 tuần (48 giờ học thực hành)",
  duration_vi: "8 tuần (48 giờ học thực hành)",
  duration_en: "8 weeks (48 practical hours)",
  level: "Nâng cao",
  level_vi: "Nâng cao",
  level_en: "Advanced",
  price: "8.500.000 VNĐ",
  price_vi: "8.500.000 VNĐ",
  price_en: "$350 USD",
  instructor: "ThS. KTS. Hoàng Trọng Minh & Đội ngũ BIM4C",
  instructor_vi: "ThS. KTS. Hoàng Trọng Minh & Đội ngũ BIM4C",
  instructor_en: "M.Arch Hoang Trong Minh & BIM4C Team",
  description:
    "Chương trình đào tạo thực chiến trang bị quy trình điều phối mô hình BIM 3D đa bộ môn, kỹ năng kiểm soát xung đột trên Navisworks/BIMCollab và quản lý dữ liệu CDE theo chuẩn ISO 19650.",
  description_vi:
    "Chương trình đào tạo thực chiến trang bị quy trình điều phối mô hình BIM 3D đa bộ môn, kỹ năng kiểm soát xung đột trên Navisworks/BIMCollab và quản lý dữ liệu CDE theo chuẩn ISO 19650.",
  description_en:
    "Practical training program providing multidisciplinary 3D BIM coordination workflows, clash management skills in Navisworks/BIMCollab, and CDE data governance under ISO 19650.",
  highlights: [
    "Thực hành trực tiếp trên dữ liệu dự án thực tế quy mô lớn",
    "Thành thạo công cụ: Revit, Navisworks Manage, BIMCollab, Solibri",
    "Cấp chứng chỉ hoàn thành khóa học BIM Coordinator từ BIM4C",
    "Hỗ trợ giới thiệu việc làm và kết nối mạng lưới doanh nghiệp đối tác",
  ],
  highlights_vi: [
    "Thực hành trực tiếp trên dữ liệu dự án thực tế quy mô lớn",
    "Thành thạo công cụ: Revit, Navisworks Manage, BIMCollab, Solibri",
    "Cấp chứng chỉ hoàn thành khóa học BIM Coordinator từ BIM4C",
    "Hỗ trợ giới thiệu việc làm và kết nối mạng lưới doanh nghiệp đối tác",
  ],
  highlights_en: [
    "Hands-on practice on real large-scale project datasets",
    "Master key tools: Revit, Navisworks Manage, BIMCollab, Solibri",
    "Certificate of Completion for BIM Coordinator issued by BIM4C",
    "Career support & direct connection with partner enterprise network",
  ],
  learningOutcomes: [
    "Nắm vững quy trình quản lý thông tin BIM theo tiêu chuẩn ISO 19650",
    "Thiết lập ma trận kiểm tra xung đột (Clash Matrix) và chủ trì họp điều phối BIM",
    "Quản lý vòng đời lỗi mô hình qua định dạng BCF và nền tảng đám mây",
    "Tự tin đảm nhận vai trò BIM Coordinator tại các tổng thầu và tư vấn lớn",
  ],
  learningOutcomes_vi: [
    "Nắm vững quy trình quản lý thông tin BIM theo tiêu chuẩn ISO 19650",
    "Thiết lập ma trận kiểm tra xung đột (Clash Matrix) và chủ trì họp điều phối BIM",
    "Quản lý vòng đời lỗi mô hình qua định dạng BCF và nền tảng đám mây",
    "Tự tin đảm nhận vai trò BIM Coordinator tại các tổng thầu và tư vấn lớn",
  ],
  learningOutcomes_en: [
    "Master BIM information management principles under ISO 19650",
    "Configure multidisciplinary clash matrices and chair BIM coordination sessions",
    "Manage issue tracking life cycles using BCF standards on cloud platforms",
    "Confident execution of BIM Coordinator responsibilities for major contractors and consultants",
  ],
  curriculum: [
    {
      id: "cur-1",
      title: "Module 1: Tổng quan vai trò BIM Coordinator & Tiêu chuẩn ISO 19650",
      description:
        "Thiết lập Kế hoạch thực hiện BIM (BEP), quy ước đặt tên file/family, hệ tọa độ gốc dự án Shared Coordinates và tổ chức môi trường CDE.",
      sortOrder: 1,
    },
    {
      id: "cur-2",
      title: "Module 2: Kiểm tra & Đảm bảo chất lượng mô hình đơn bộ môn (Revit QA/QC)",
      description:
        "Kiểm tra thông số tham số tham chiếu, cấp độ chi tiết LOD, phân loại cấu kiện và tính toàn vẹn của mô hình Kiến trúc, Kết cấu và MEP.",
      sortOrder: 2,
    },
    {
      id: "cur-3",
      title: "Module 3: Thiết lập & Vận hành Clash Detection chuyên sâu trong Navisworks",
      description:
        "Phân loại xung đột cứng (Hard Clash), xung đột mềm (Clearance Clash), cài đặt dung sai cho phép và gom nhóm xử lý hàng loạt.",
      sortOrder: 3,
    },
    {
      id: "cur-4",
      title: "Module 4: Quản lý BCF & Tổ chức buổi họp điều phối mô hình thực tế",
      description:
        "Xuất/nhập BCF Issue Tracking, phân công người xử lý, theo dõi deadline và nghiệm thu hồ sơ mô hình bàn giao.",
      sortOrder: 4,
    },
  ],
  curriculum_vi: [
    {
      id: "cur-1",
      title: "Module 1: Tổng quan vai trò BIM Coordinator & Tiêu chuẩn ISO 19650",
      description:
        "Thiết lập Kế hoạch thực hiện BIM (BEP), quy ước đặt tên file/family, hệ tọa độ gốc dự án Shared Coordinates và tổ chức môi trường CDE.",
      sortOrder: 1,
    },
    {
      id: "cur-2",
      title: "Module 2: Kiểm tra & Đảm bảo chất lượng mô hình đơn bộ môn (Revit QA/QC)",
      description:
        "Kiểm tra thông số tham số tham chiếu, cấp độ chi tiết LOD, phân loại cấu kiện và tính toàn vẹn của mô hình Kiến trúc, Kết cấu và MEP.",
      sortOrder: 2,
    },
    {
      id: "cur-3",
      title: "Module 3: Thiết lập & Vận hành Clash Detection chuyên sâu trong Navisworks",
      description:
        "Phân loại xung đột cứng (Hard Clash), xung đột mềm (Clearance Clash), cài đặt dung sai cho phép và gom nhóm xử lý hàng loạt.",
      sortOrder: 3,
    },
    {
      id: "cur-4",
      title: "Module 4: Quản lý BCF & Tổ chức buổi họp điều phối mô hình thực tế",
      description:
        "Xuất/nhập BCF Issue Tracking, phân công người xử lý, theo dõi deadline và nghiệm thu hồ sơ mô hình bàn giao.",
      sortOrder: 4,
    },
  ],
  curriculum_en: [
    {
      id: "cur-1",
      title: "Module 1: BIM Coordinator Role & ISO 19650 Framework",
      description:
        "Establishing BIM Execution Plans (BEP), file naming conventions, shared coordinates, and CDE environment management.",
      sortOrder: 1,
    },
    {
      id: "cur-2",
      title: "Module 2: Discipline-Specific Model QA/QC in Revit",
      description:
        "Parameter checking, LOD verification, family categorization, and model integrity audits for Architecture, Structure, and MEP.",
      sortOrder: 2,
    },
    {
      id: "cur-3",
      title: "Module 3: Advanced Clash Detection in Navisworks Manage",
      description:
        "Hard clash vs. clearance clash configurations, tolerance thresholds, rule sets, and intelligent clash grouping workflows.",
      sortOrder: 3,
    },
    {
      id: "cur-4",
      title: "Module 4: BCF Issue Tracking & Hosting Coordination Sessions",
      description:
        "BCF round-tripping, assigning responsibilities, deadline monitoring, and final model delivery sign-off.",
      sortOrder: 4,
    },
  ],
  sections: [
    {
      title: "Mục tiêu đào tạo và lộ trình chuyên sâu",
      body: "Khóa học được thiết kế dành riêng cho kỹ sư, kiến trúc sư đã có nền tảng dựng hình mong muốn nâng cao năng lực lên vị trí Điều phối viên BIM (BIM Coordinator), đóng vai trò then chốt trong các dự án quy mô lớn.",
      images: [
        {
          url: "/images/service-training.jpg",
          alt: "Lớp học thực hành BIM Coordinator",
          caption: "Buổi học thực hành điều phối mô hình trên dự án thực tế",
        },
      ],
    },
    {
      title: "Phương pháp đào tạo & Quyền lợi học viên",
      body: "100% thời lượng học tập trung vào xử lý tình huống thực tế. Học viên được cấp tài khoản CDE thực hành và thư viện family tiêu chuẩn độc quyền của BIM4C.",
      images: [
        {
          url: "/images/news-bim-training.webp",
          alt: "Giáo trình và bộ template BIM4C",
          caption: "Giáo trình chuẩn hóa quốc tế và bộ tài liệu template độc quyền của BIM4C",
        },
      ],
    },
  ],
  sections_vi: [
    {
      title: "Mục tiêu đào tạo và lộ trình chuyên sâu",
      body: "Khóa học được thiết kế dành riêng cho kỹ sư, kiến trúc sư đã có nền tảng dựng hình mong muốn nâng cao năng lực lên vị trí Điều phối viên BIM (BIM Coordinator), đóng vai trò then chốt trong các dự án quy mô lớn.",
      images: [
        {
          url: "/images/service-training.jpg",
          alt: "Lớp học thực hành BIM Coordinator",
          caption: "Buổi học thực hành điều phối mô hình trên dự án thực tế",
        },
      ],
    },
    {
      title: "Phương pháp đào tạo & Quyền lợi học viên",
      body: "100% thời lượng học tập trung vào xử lý tình huống thực tế. Học viên được cấp tài khoản CDE thực hành và thư viện family tiêu chuẩn độc quyền của BIM4C.",
      images: [
        {
          url: "/images/news-bim-training.webp",
          alt: "Giáo trình và bộ template BIM4C",
          caption: "Giáo trình chuẩn hóa quốc tế và bộ tài liệu template độc quyền của BIM4C",
        },
      ],
    },
  ],
  sections_en: [
    {
      title: "Learning Objectives & Professional Roadmap",
      body: "Designed specifically for engineers and architects with modeling background aiming to step up into the critical role of BIM Coordinator across large-scale capital projects.",
      images: [
        {
          url: "/images/service-training.jpg",
          alt: "Hands-on BIM Coordinator Lab",
          caption: "Live practical model coordination session using real project data",
        },
      ],
    },
    {
      title: "Teaching Methodology & Student Benefits",
      body: "100% of the training focuses on real-world engineering problem solving. Students receive full CDE practice accounts and proprietary BIM4C family templates.",
      images: [
        {
          url: "/images/news-bim-training.webp",
          alt: "Course materials and BIM4C templates",
          caption: "Standardized curriculum with proprietary templates from BIM4C",
        },
      ],
    },
  ],
  status: "PUBLISHED",
  publishedAt: "2026-09-17T08:00:00.000Z",
  createdAt: "2026-09-17T08:00:00.000Z",
  updatedAt: "2026-09-17T08:00:00.000Z",
};

export const SAMPLE_POST: ContentEntryDto = {
  id: "pst-phoi-hop-mo-hinh-bim-sample",
  slug: "huong-dan-thuc-hanh-phoi-hop-bim-3d",
  title: "Hướng dẫn thực hành quy trình phối hợp mô hình BIM 3D và quản trị xung đột liên bộ môn",
  title_vi: "Hướng dẫn thực hành quy trình phối hợp mô hình BIM 3D và quản trị xung đột liên bộ môn",
  title_en: "A Practical Guide to BIM 3D Model Coordination and Multidisciplinary Clash Governance",
  eyebrow: "Góc nhìn chuyên gia",
  eyebrow_vi: "Góc nhìn chuyên gia",
  eyebrow_en: "BIM4C Insights",
  category: "Công nghệ BIM",
  authorName: "BIM4C R&D Lab",
  meta: "8 phút đọc • 17/09/2026",
  meta_vi: "8 phút đọc • 17/09/2026",
  meta_en: "8 min read • Sep 17, 2026",
  image: "/images/news-project-coordination.webp",
  description:
    "Phân tích chi tiết quy trình chuẩn để tổ chức dữ liệu đầu vào, thiết lập ma trận xung đột và chuyển kết quả rà soát thành hành động khắc phục cụ thể trên công trường.",
  description_vi:
    "Phân tích chi tiết quy trình chuẩn để tổ chức dữ liệu đầu vào, thiết lập ma trận xung đột và chuyển kết quả rà soát thành hành động khắc phục cụ thể trên công trường.",
  description_en:
    "Detailed breakdown of standard workflows to organize model inputs, establish clash matrices, and turn review findings into concrete actions.",
  highlights: [
    "Tổ chức dữ liệu đầu vào và phân định rõ trách nhiệm từng bộ môn",
    "Thiết lập quy trình rà soát và phân loại mức độ nghiêm trọng của xung đột",
    "Khép kín vòng lặp phối hợp qua định dạng BCF và theo dõi xử lý",
    "Kinh nghiệm thực tiễn từ các dự án quy mô lớn tại Việt Nam",
  ],
  highlights_vi: [
    "Tổ chức dữ liệu đầu vào và phân định rõ trách nhiệm từng bộ môn",
    "Thiết lập quy trình rà soát và phân loại mức độ nghiêm trọng của xung đột",
    "Khép kín vòng lặp phối hợp qua định dạng BCF và theo dõi xử lý",
    "Kinh nghiệm thực tiễn từ các dự án quy mô lớn tại Việt Nam",
  ],
  highlights_en: [
    "Organizing model inputs and defining clear disciplinary responsibilities",
    "Establishing clash review workflows and severity classifications",
    "Closing the coordination loop via BCF and issue tracking",
    "Practical lessons learned from major capital projects in Vietnam",
  ],
  sections: [
    {
      title: "1. Bắt đầu từ việc chuẩn hóa yêu cầu thông tin và môi trường CDE",
      body: "Trước khi tiến hành tổng hợp mô hình, các bên cần thống nhất mốc rà soát, hệ tọa độ chuẩn dự án và phân định phạm vi trách nhiệm. Điều này ngăn ngừa tình trạng mô hình bị lệch tọa độ hoặc chồng lấn ranh giới làm việc.",
      images: [
        {
          url: "/images/news-project-coordination.webp",
          alt: "Sơ đồ luồng dữ liệu CDE",
          caption: "Quy trình truyền nhận và kiểm duyệt dữ liệu trong môi trường CDE",
        },
      ],
      unorderedList: [
        "Thống nhất hệ tọa độ Shared Coordinates giữa tất cả các file mô hình",
        "Xác định rõ quyền sở hữu cấu kiện và phân chia ranh giới thiết kế",
        "Lập lịch trình trao đổi mô hình định kỳ hàng tuần",
      ],
    },
    {
      title: "2. Biến dữ liệu xung đột thành hành động cụ thể",
      body: "Mỗi vấn đề phát hiện cần ghi nhận rõ: vị trí trục/tầng, bộ môn liên quan, mức độ ưu tiên, người chịu trách nhiệm và hạn chót xử lý. Việc sử dụng định dạng BCF giúp kỹ sư mở trực tiếp góc nhìn lỗi trong phần mềm tác nghiệp của mình.",
      images: [
        {
          url: "/images/news-digital-twin.webp",
          alt: "Phát hiện xung đột không gian",
          caption: "Giao diện phân tích xung đột và gắn thẻ trách nhiệm theo bộ môn",
        },
      ],
      orderedList: [
        "Lọc bỏ các xung đột giả (False Positives) trước buổi họp",
        "Gán mã BCF cho từng lỗi kèm ảnh chụp trực quan và mô tả kỹ thuật",
        "Gửi yêu cầu chỉnh sửa tự động đến kỹ sư phụ trách bộ môn",
      ],
    },
    {
      title: "3. Nghiệm thu và lưu vết quyết định kỹ thuật",
      body: "Sau mỗi chu kỳ chỉnh sửa, mô hình phối hợp cần được đối chiếu lại để xác nhận xung đột đã được giải quyết triệt để mà không tạo ra xung đột thứ cấp mới.",
      images: [
        {
          url: "/images/news-site-safety.webp",
          alt: "Mô hình phối hợp hoàn chỉnh",
          caption: "Kiểm tra lại mô hình đã cập nhật giải pháp xử lý trước khi xuất hồ sơ thi công",
        },
      ],
      quote:
        "Một quy trình phối hợp BIM thành công không nằm ở số lượng xung đột tìm thấy, mà nằm ở tốc độ và độ tin cậy khi các xung đột đó được giải quyết dứt điểm.",
    },
  ],
  sections_vi: [
    {
      title: "1. Bắt đầu từ việc chuẩn hóa yêu cầu thông tin và môi trường CDE",
      body: "Trước khi tiến hành tổng hợp mô hình, các bên cần thống nhất mốc rà soát, hệ tọa độ chuẩn dự án và phân định phạm vi trách nhiệm. Điều này ngăn ngừa tình trạng mô hình bị lệch tọa độ hoặc chồng lấn ranh giới làm việc.",
      images: [
        {
          url: "/images/news-project-coordination.webp",
          alt: "Sơ đồ luồng dữ liệu CDE",
          caption: "Quy trình truyền nhận và kiểm duyệt dữ liệu trong môi trường CDE",
        },
      ],
      unorderedList: [
        "Thống nhất hệ tọa độ Shared Coordinates giữa tất cả các file mô hình",
        "Xác định rõ quyền sở hữu cấu kiện và phân chia ranh giới thiết kế",
        "Lập lịch trình trao đổi mô hình định kỳ hàng tuần",
      ],
    },
    {
      title: "2. Biến dữ liệu xung đột thành hành động cụ thể",
      body: "Mỗi vấn đề phát hiện cần ghi nhận rõ: vị trí trục/tầng, bộ môn liên quan, mức độ ưu tiên, người chịu trách nhiệm và hạn chót xử lý. Việc sử dụng định dạng BCF giúp kỹ sư mở trực tiếp góc nhìn lỗi trong phần mềm tác nghiệp của mình.",
      images: [
        {
          url: "/images/news-digital-twin.webp",
          alt: "Phát hiện xung đột không gian",
          caption: "Giao diện phân tích xung đột và gắn thẻ trách nhiệm theo bộ môn",
        },
      ],
      orderedList: [
        "Lọc bỏ các xung đột giả (False Positives) trước buổi họp",
        "Gán mã BCF cho từng lỗi kèm ảnh chụp trực quan và mô tả kỹ thuật",
        "Gửi yêu cầu chỉnh sửa tự động đến kỹ sư phụ trách bộ môn",
      ],
    },
    {
      title: "3. Nghiệm thu và lưu vết quyết định kỹ thuật",
      body: "Sau mỗi chu kỳ chỉnh sửa, mô hình phối hợp cần được đối chiếu lại để xác nhận xung đột đã được giải quyết triệt để mà không tạo ra xung đột thứ cấp mới.",
      images: [
        {
          url: "/images/news-site-safety.webp",
          alt: "Mô hình phối hợp hoàn chỉnh",
          caption: "Kiểm tra lại mô hình đã cập nhật giải pháp xử lý trước khi xuất hồ sơ thi công",
        },
      ],
      quote:
        "Một quy trình phối hợp BIM thành công không nằm ở số lượng xung đột tìm thấy, mà nằm ở tốc độ và độ tin cậy khi các xung đột đó được giải quyết dứt điểm.",
    },
  ],
  sections_en: [
    {
      title: "1. Standardizing Information Requirements & CDE Setup",
      body: "Before merging models, teams must agree on milestone dates, shared coordinate origins, and boundary ownership. This prevents coordinate misalignments or overlapping design scopes.",
      images: [
        {
          url: "/images/news-project-coordination.webp",
          alt: "CDE Data Flow Diagram",
          caption: "Data transmission and sign-off workflows within the CDE",
        },
      ],
      unorderedList: [
        "Establish unified Shared Coordinates across all model files",
        "Define element ownership and multidisciplinary workset boundaries",
        "Set up regular weekly model exchange schedules",
      ],
    },
    {
      title: "2. Transforming Clash Data into Concrete Action",
      body: "Every identified clash must clearly state: grid/level location, discipline, priority, responsible engineer, and resolution deadline. Utilizing BCF allows engineers to jump directly to the clash viewpoint in their native authoring tools.",
      images: [
        {
          url: "/images/news-digital-twin.webp",
          alt: "Spatial Clash Detection",
          caption: "Clash analytics interface with discipline assignment tags",
        },
      ],
      orderedList: [
        "Filter out false positives before coordination meetings",
        "Assign BCF tickets with visual snapshots and engineering notes",
        "Automate update requests directly to responsible discipline leads",
      ],
    },
    {
      title: "3. Verification & Decision Traceability",
      body: "Following each revision cycle, the federated model must be re-tested to ensure that resolved clashes do not introduce secondary clashes.",
      images: [
        {
          url: "/images/news-site-safety.webp",
          alt: "Coordinated Model Sign-off",
          caption: "Re-verifying coordinated models before issuing construction documentation",
        },
      ],
      quote:
        "A successful BIM coordination process is not measured by the quantity of clashes found, but by the speed and certainty with which they are permanently resolved.",
    },
  ],
  status: "PUBLISHED",
  publishedAt: "2026-09-17T08:00:00.000Z",
  createdAt: "2026-09-17T08:00:00.000Z",
  updatedAt: "2026-09-17T08:00:00.000Z",
};

export const SAMPLE_HERO_SLIDE: HeroSlide = {
  id: "slide-hero-sample-1",
  eyebrow: "Công nghệ số hóa công trình BIM",
  title: "Tiên phong Chuyển đổi số & Tư vấn BIM chuyên sâu",
  image: "/images/hero.jpg",
  alt: "Tiên phong Chuyển đổi số & Tư vấn BIM chuyên sâu - BIM4C",
  sortOrder: 1,
  isActive: true,
};

export const SAMPLE_PARTNERS: StrategicPartner[] = [
  {
    id: "partner-sample-1",
    name: "Bitexco Group",
    logo: "/images/partners/bitexco.png",
    website: "https://www.bitexco.com.vn",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "partner-sample-2",
    name: "Masterise Homes",
    logo: "/images/partners/masterise.png",
    website: "https://masterisehomes.com",
    sortOrder: 2,
    isActive: true,
  },
];

export const SAMPLE_CONTACT = {
  id: "contact-sample-1",
  name: "Nguyễn Văn An (Trưởng ban QLDA)",
  email: "an.nguyen@alphagroup.vn",
  phone: "0912 345 678",
  subject: "Yêu cầu báo giá tư vấn BIM cho dự án Tòa nhà phức hợp",
  message:
    "Chúng tôi cần tư vấn dịch vụ mô hình hóa BIM 3D và quản lý CDE cho dự án 30 tầng tại TP.HCM. Xin vui lòng gửi báo giá và hồ sơ năng lực công ty.",
  status: "NEW",
  createdAt: "2026-09-17T08:00:00.000Z",
};

export const SAMPLE_REGISTRATION = {
  id: "reg-sample-1",
  name: "Trần Thị Mai Phương",
  email: "phuong.tran@vietbuild.com",
  phone: "0988 765 432",
  course: "Chuyên viên Phối hợp Mô hình BIM 3D & Điều phối Xung đột (BIM Coordinator)",
  note: "Tôi muốn đăng ký lớp học cuối tuần. Công ty tôi có 3 học viên tham gia.",
  status: "PENDING",
  createdAt: "2026-09-17T08:00:00.000Z",
};
