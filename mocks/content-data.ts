import type { ContentEntry } from "@/types/content";

export type { ContentEntry, ContentSection } from "@/types/content";

export const serviceEntries: ContentEntry[] = [
  {
    slug: "tu-van-bim",
    title: "Tư vấn BIM",
    eyebrow: "DỊCH VỤ BIM4C",
    image: "/images/service-bim.jpg",
    description:
      "Xây dựng chiến lược, tiêu chuẩn và lộ trình BIM phù hợp với mục tiêu của từng tổ chức và dự án.",
    highlights: [
      "BIM Execution Plan",
      "Common Data Environment",
      "Kiểm soát chất lượng mô hình",
    ],
    sections: [
      {
        title: "Giải pháp có thể triển khai",
        body: "BIM4C đánh giá hiện trạng, xác định mục tiêu và xây dựng quy trình phối hợp phù hợp với năng lực của các bên tham gia.",
      },
      {
        title: "Quản trị thông tin xuyên suốt",
        body: "Hệ thống tiêu chuẩn và môi trường dữ liệu chung giúp thông tin được cập nhật, kiểm soát và sử dụng nhất quán trong suốt vòng đời dự án.",
      },
    ],
  },
  {
    slug: "dao-tao",
    title: "Đào tạo",
    eyebrow: "DỊCH VỤ BIM4C",
    image: "/images/service-training.jpg",
    description:
      "Chương trình đào tạo thực chiến giúp đội ngũ ứng dụng BIM hiệu quả vào công việc hàng ngày.",
    highlights: [
      "Lộ trình theo năng lực",
      "Bài tập dự án thực tế",
      "Đánh giá đầu ra",
    ],
    sections: [
      {
        title: "Đào tạo gắn với thực tế",
        body: "Nội dung được thiết kế từ những tình huống phổ biến tại dự án, kết hợp kiến thức cốt lõi với bài tập thực hành.",
      },
      {
        title: "Phát triển đội ngũ bền vững",
        body: "Chương trình có thể tùy chỉnh theo vai trò, bộ môn và mục tiêu chuyển đổi số của từng doanh nghiệp.",
      },
    ],
  },
  {
    slug: "thiet-ke",
    title: "Thiết kế",
    eyebrow: "DỊCH VỤ BIM4C",
    image: "/images/service-design.jpg",
    description:
      "Giải pháp thiết kế đa bộ môn chú trọng tính khả thi, phối hợp và hiệu quả đầu tư.",
    highlights: ["Thiết kế đa bộ môn", "Clash Detection", "Hồ sơ đồng bộ"],
    sections: [
      {
        title: "Thiết kế phối hợp",
        body: "Các bộ môn được phát triển trên nền tảng dữ liệu thống nhất, hỗ trợ phát hiện sớm xung đột và giảm thay đổi tại công trường.",
      },
      {
        title: "Tối ưu giá trị công trình",
        body: "Mô hình thông tin hỗ trợ phân tích phương án, kiểm soát khối lượng và đưa ra quyết định chính xác hơn.",
      },
    ],
  },
  {
    slug: "tu-van-giam-sat",
    title: "Tư vấn giám sát",
    eyebrow: "DỊCH VỤ BIM4C",
    image: "/images/news-site-safety.webp",
    description:
      "Kiểm soát an toàn, chất lượng và tiến độ bằng quy trình minh bạch và dữ liệu cập nhật.",
    highlights: [
      "Giám sát hiện trường",
      "Kiểm soát tiến độ",
      "Báo cáo minh bạch",
    ],
    sections: [
      {
        title: "Kiểm soát chủ động",
        body: "Đội ngũ giám sát nhận diện sớm rủi ro, theo dõi việc khắc phục và cập nhật trạng thái công việc theo thời gian thực.",
      },
      {
        title: "Đồng hành cùng chủ đầu tư",
        body: "Báo cáo tập trung vào những chỉ số quan trọng, hỗ trợ chủ đầu tư nắm bắt tình hình và ra quyết định kịp thời.",
      },
    ],
  },
  {
    slug: "bim-coordination",
    title: "BIM Coordination",
    eyebrow: "DỊCH VỤ BIM4C",
    image: "/images/news-project-coordination.webp",
    description:
      "Tổ chức phối hợp mô hình đa bộ môn, quản lý xung đột và đóng vấn đề theo quy trình có thể truy vết.",
    highlights: ["Federated Model", "Clash Management", "Issue Tracking"],
    sections: [
      {
        title: "Thiết lập mô hình phối hợp",
        body: "BIM4C chuẩn hóa cấu trúc mô hình, điểm gốc, quy tắc đặt tên và chu kỳ trao đổi dữ liệu trước khi bắt đầu phối hợp.",
      },
      {
        title: "Quản lý xung đột",
        body: "Xung đột được phân loại theo mức độ ảnh hưởng, giao đúng đầu mối và theo dõi xuyên suốt đến khi được xác nhận đóng.",
      },
      {
        title: "Báo cáo và kiểm soát",
        body: "Dashboard phối hợp cung cấp trạng thái, xu hướng và các vấn đề ưu tiên để ban điều hành ra quyết định kịp thời.",
      },
    ],
  },
  {
    slug: "digital-twin-va-du-lieu-tai-san",
    title: "Digital Twin & Dữ liệu tài sản",
    eyebrow: "DỊCH VỤ BIM4C",
    image: "/images/news-digital-twin.webp",
    description:
      "Xây dựng nền tảng dữ liệu công trình phục vụ bàn giao số, vận hành, bảo trì và tối ưu hiệu suất tài sản.",
    highlights: [
      "Asset Information",
      "Digital Handover",
      "Operational Insights",
    ],
    sections: [
      {
        title: "Chiến lược thông tin tài sản",
        body: "Xác định bộ dữ liệu cần thiết cho từng nhóm thiết bị, không gian và hệ thống dựa trên mục tiêu vận hành thực tế.",
      },
      {
        title: "Bàn giao số có kiểm soát",
        body: "Mô hình, hồ sơ và dữ liệu tài sản được kiểm tra tính đầy đủ trước khi kết nối với hệ thống quản lý vận hành.",
      },
      {
        title: "Khai thác Digital Twin",
        body: "Dữ liệu hiện trạng và lịch sử vận hành tạo cơ sở cho theo dõi hiệu suất, bảo trì chủ động và cải tiến dài hạn.",
      },
    ],
  },
];

export const projectEntries: ContentEntry[] = [
  {
    slug: "lumi-hanoi",
    title: "Lumi Hanoi",
    eyebrow: "DỰ ÁN CAO TẦNG",
    image: "/images/news-project-coordination.webp",
    description:
      "Tổ hợp căn hộ hiện đại được triển khai với tiêu chuẩn cao về chất lượng, an toàn và tiến độ.",
    meta: "HÀ NỘI · 2025",
    highlights: ["Nhà cao tầng", "Phối hợp BIM", "Quản lý thi công"],
    sections: [
      {
        title: "Phạm vi triển khai",
        body: "BIM4C phối hợp thông tin đa bộ môn, kiểm soát xung đột và hỗ trợ đội ngũ dự án xử lý các vấn đề kỹ thuật.",
      },
      {
        title: "Giá trị mang lại",
        body: "Quy trình dữ liệu nhất quán giúp giảm sai sót, rút ngắn thời gian phối hợp và nâng cao tính minh bạch.",
      },
    ],
  },
  {
    slug: "the-matrix-one-giai-doan-2",
    title: "The Matrix One - Giai đoạn 2",
    eyebrow: "DỰ ÁN CAO TẦNG",
    image: "/images/news-digital-twin.webp",
    description:
      "Công trình biểu tượng với yêu cầu khắt khe về kỹ thuật, thẩm mỹ và quản lý tiến độ.",
    meta: "HÀ NỘI · 2026",
    highlights: ["Tổng thầu", "Cao tầng", "An toàn tuyệt đối"],
    sections: [
      {
        title: "Thách thức dự án",
        body: "Quy mô lớn và mật độ hệ thống kỹ thuật cao đòi hỏi quy trình phối hợp chặt chẽ giữa nhiều bên.",
      },
      {
        title: "Giải pháp BIM4C",
        body: "Mô hình tích hợp và các phiên phối hợp định kỳ giúp phát hiện sớm vấn đề trước khi triển khai ngoài hiện trường.",
      },
    ],
  },
  {
    slug: "elysian",
    title: "Elysian",
    eyebrow: "DỰ ÁN CAO TẦNG",
    image: "/images/news-site-safety.webp",
    description:
      "Không gian sống xanh được phát triển với giải pháp kỹ thuật đồng bộ và quản trị dự án hiện đại.",
    meta: "TP. HỒ CHÍ MINH · 2025",
    highlights: ["Khu căn hộ", "Mô hình tích hợp", "Kiểm soát chất lượng"],
    sections: [
      {
        title: "Định hướng chất lượng",
        body: "Dự án chú trọng sự cân bằng giữa thiết kế, hiệu quả vận hành và trải nghiệm người sử dụng.",
      },
      {
        title: "Quản lý thông tin",
        body: "Dữ liệu mô hình được chuẩn hóa để phục vụ phối hợp, nghiệm thu và quản lý thay đổi.",
      },
    ],
  },
  {
    slug: "tt-avio",
    title: "TT Avio",
    eyebrow: "DỰ ÁN NHÀ Ở",
    image: "/images/news-project-coordination.webp",
    description:
      "Dự án nhà ở được quản lý bằng quy trình phối hợp số và tiêu chuẩn chất lượng nhất quán.",
    meta: "BÌNH DƯƠNG · 2026",
    highlights: ["Nhà ở", "Tiến độ", "Quản trị dữ liệu"],
    sections: [
      {
        title: "Tổ chức triển khai",
        body: "Các nhóm thiết kế và thi công làm việc trên nguồn dữ liệu thống nhất, giảm thời gian trao đổi và xử lý thay đổi.",
      },
      {
        title: "Cam kết",
        body: "An toàn, chất lượng và tiến độ là ba tiêu chí xuyên suốt quá trình triển khai dự án.",
      },
    ],
  },
  {
    slug: "central-park-residences",
    title: "Central Park Residences",
    eyebrow: "DỰ ÁN ĐÔ THỊ",
    image: "/images/news-project-coordination.webp",
    description:
      "Tổ hợp đô thị quy mô lớn được triển khai với tư duy xây dựng bền vững.",
    meta: "NGHỆ AN · 2025",
    highlights: ["Khu đô thị", "Phát triển bền vững", "BIM Coordination"],
    sections: [
      {
        title: "Quy mô tổng thể",
        body: "Hệ thống công trình và hạ tầng được phối hợp trên mô hình tổng thể nhằm bảo đảm tính đồng bộ.",
      },
      {
        title: "Hiệu quả dài hạn",
        body: "Thông tin dự án được cấu trúc để hỗ trợ thi công, bàn giao và vận hành trong tương lai.",
      },
    ],
  },
];

export const courseEntries: (ContentEntry & {
  id: string;
  duration: string;
  level: string;
  price: string;
  instructor: string;
  learningOutcomes: string[];
  curriculum: { id: string; title: string; description: string }[];
})[] = [
  {
    id: "course-1",
    slug: "bim-foundation",
    title: "BIM Foundation (Nền tảng Quản trị & Mô hình hóa BIM)",
    eyebrow: "NỀN TẢNG · 8 TUẦN",
    category: "Nền tảng",
    image: "/images/service-training.jpg",
    description:
      "Trang bị nền tảng tư duy BIM chuẩn ISO 19650, cấu trúc dữ liệu mô hình và phương pháp phối hợp liên bộ môn dành cho kỹ sư xây dựng.",
    duration: "8 tuần (24 buổi)",
    level: "Nền tảng",
    price: "4.800.000 VNĐ",
    instructor: "ThS. KTS Trần Minh Tuấn (BIM Specialist)",
    highlights: [
      "24 buổi học tương tác & lab",
      "Thực hành trên dữ liệu dự án thực",
      "Chứng chỉ chuẩn hóa BIM4C",
    ],
    learningOutcomes: [
      "Nắm vững thuật ngữ chuẩn ISO 19650, BEP, EIR, LOD 100-500",
      "Sử dụng thành thạo Revit tạo lập mô hình kiến trúc & kết cấu cơ bản",
      "Thiết lập và quản lý môi trường dữ liệu chung (CDE)",
      "Đọc hiểu ma trận kiểm soát xung đột và quy trình xuất hồ sơ 2D từ BIM",
    ],
    curriculum: [
      {
        id: "mod-1",
        title: "Mô-đun 01: Tổng quan BIM & Chuẩn mực ISO 19650",
        description:
          "Giới thiệu các nguyên lý BIM, định dạng IFC, phân loại LOD/LOIN và cấu trúc kế hoạch thực thi BIM (BEP).",
      },
      {
        id: "mod-2",
        title: "Mô-đun 02: Dựng hình kết cấu & kiến trúc trên Autodesk Revit",
        description:
          "Thao tác dựng hình dầm, cột, sàn, tường, family cơ bản và quản lý hệ thống view/sheet chuẩn thi công.",
      },
      {
        id: "mod-3",
        title: "Mô-đun 03: Thiết lập CDE & Quản trị dữ liệu chia sẻ",
        description:
          "Thực hành quy trình trạng thái WIP, Shared, Published và quản lý version kiểm soát thay đổi.",
      },
      {
        id: "mod-4",
        title: "Mô-đun 04: Đồ án tốt nghiệp & Trình bày kết quả",
        description:
          "Hoàn thiện gói mô hình và báo cáo kỹ thuật từ một đề bài công trình thực tế có phản biện trực tiếp.",
      },
    ],
    sections: [
      {
        title: "Bạn sẽ học được gì?",
        body: "Học viên hiểu nguyên lý BIM, cấu trúc dữ liệu mô hình và quy trình phối hợp cơ bản trong dự án xây dựng hiện đại.",
      },
      {
        title: "Đối tượng phù hợp",
        body: "Kỹ sư, kiến trúc sư, sinh viên năm cuối và nhân sự kỹ thuật muốn bắt đầu lộ trình nghề nghiệp BIM bài bản.",
      },
    ],
  },
  {
    id: "course-2",
    slug: "bim-coordination",
    title: "BIM Coordination (Điều phối viên BIM Chuyên nghiệp)",
    eyebrow: "CHUYÊN SÂU · 10 TUẦN",
    category: "Chuyên sâu",
    image: "/images/service-bim.jpg",
    description:
      "Kỹ năng phối hợp đa bộ môn, quản trị xung đột không gian MEP/Kết cấu/Kiến trúc và điều hành phiên họp phối hợp trên CDE.",
    duration: "10 tuần (30 buổi)",
    level: "Chuyên sâu",
    price: "7.200.000 VNĐ",
    instructor: "Kỹ sư Lê Quốc Khánh (Senior BIM Coordinator)",
    highlights: [
      "Clash Detective & BCF workflow",
      "Điều phối ACC & Navisworks",
      "Case study dự án cao tầng",
    ],
    learningOutcomes: [
      "Thiết lập bộ quy tắc kiểm tra xung đột phân tầng theo độ ưu tiên",
      "Sử dụng chuẩn BCF (BIM Collaboration Format) để đóng mở issue minh bạch",
      "Chủ trì các buổi họp phối hợp kỹ thuật (BIM Coordination Meeting)",
      "Tối ưu không gian lắp đặt và bảo trì hệ thống cơ điện (MEP Clearance)",
    ],
    curriculum: [
      {
        id: "mod-1",
        title: "Mô-đun 01: Thiết lập mô hình liên kết (Federated Model)",
        description:
          "Tổ chức hệ tọa độ Shared Coordinates, kiểm soát nguồn gốc file và phân quyền mô hình đa bộ môn.",
      },
      {
        id: "mod-2",
        title: "Mô-đun 02: Quản trị xung đột chuyên sâu với Navisworks",
        description:
          "Xây dựng Search Sets tự động, thiết lập ma trận Clash Matrix và lọc bỏ xung đột giả (Soft Clash).",
      },
      {
        id: "mod-3",
        title: "Mô-đun 03: Điều hành luồng giải quyết vấn đề qua BCF & Cloud",
        description:
          "Tích hợp Revit - Navisworks - BIM Track/ACC để theo dõi vòng đời sự cố và phân công trách nhiệm.",
      },
      {
        id: "mod-4",
        title: "Mô-đun 04: Quản lý cuộc họp phối hợp & Báo cáo tiến độ",
        description:
          "Mô phỏng phiên họp thực chiến, ra biên bản phối hợp và cập nhật dashboard trạng thái mô hình.",
      },
    ],
    sections: [
      {
        title: "Năng lực đầu ra",
        body: "Học viên có thể độc lập tổ chức phiên phối hợp, phân loại xung đột và quản lý quá trình đóng vấn đề kỹ thuật.",
      },
      {
        title: "Phương pháp học",
        body: "Mỗi chủ đề được thực hành trên mô hình dự án cao tầng và khu phức hợp thực tế, kèm phản hồi trực tiếp từ chuyên gia.",
      },
    ],
  },
  {
    id: "course-3",
    slug: "bim-management",
    title: "BIM Management (Quản trị & Hoạch định Chiến lược BIM)",
    eyebrow: "QUẢN LÝ · 6 TUẦN",
    category: "Quản lý",
    image: "/images/news-site-safety.webp",
    description:
      "Thiết lập chiến lược chuyển đổi số, xây dựng kế hoạch thực thi BEP/EIR, dự toán chi phí và đo lường ROI triển khai BIM cho doanh nghiệp.",
    duration: "6 tuần (18 buổi)",
    level: "Quản lý",
    price: "8.500.000 VNĐ",
    instructor: "ThS. Phạm Hoàng Long (BIM Director)",
    highlights: [
      "Soạn thảo BEP, EIR, AIR chuẩn quốc tế",
      "Định giá & KPI chuyển đổi số",
      "Cố vấn chiến lược 1:1",
    ],
    learningOutcomes: [
      "Soạn thảo hồ sơ mời thầu EIR và kế hoạch thực thi BEP sát thực tế",
      "Đánh giá năng lực nhà thầu và thẩm định chất lượng mô hình bàn giao",
      "Tính toán chi phí đầu tư công nghệ và tối ưu hóa nguồn lực nhân sự",
      "Xây dựng quy chế quản trị thông tin và lộ trình số hóa cấp doanh nghiệp",
    ],
    curriculum: [
      {
        id: "mod-1",
        title: "Mô-đun 01: Chiến lược & Khung thể chế BIM",
        description:
          "Phân tích tiêu chuẩn ISO 19650-1/2, các văn bản pháp lý Việt Nam và xác định mục tiêu áp dụng BIM.",
      },
      {
        id: "mod-2",
        title: "Mô-đun 02: Xây dựng EIR, BEP và Ma trận phân công trách nhiệm",
        description:
          "Hướng dẫn soạn thảo bộ tài liệu BEP hoàn chỉnh, phân bổ RACI matrix và tiêu chí nghiệm thu LOD.",
      },
      {
        id: "mod-3",
        title: "Mô-đun 03: Quản trị hợp đồng & Thẩm định mô hình bàn giao",
        description:
          "Quy trình kiểm tra QA/QC mô hình, audit dữ liệu thuộc tính và điều khoản pháp lý liên quan đến bản quyền số.",
      },
      {
        id: "mod-4",
        title: "Mô-đun 04: Chuyển đổi số & Đo lường hiệu quả đầu tư (ROI)",
        description:
          "Cách thức chuyển giao công nghệ, quản trị thay đổi nhân sự và xây dựng KPI đo lường giá trị thực tế.",
      },
    ],
    sections: [
      {
        title: "Tư duy quản lý",
        body: "Chương trình tập trung vào cách chuyển mục tiêu kinh doanh thành yêu cầu thông tin và kế hoạch thực thi có thể kiểm chứng.",
      },
      {
        title: "Dành cho người lãnh đạo",
        body: "Phù hợp với BIM Manager, Giám đốc dự án, Trưởng ban quản lý và lãnh đạo doanh nghiệp đang triển khai chuyển đổi số.",
      },
    ],
  },
  {
    id: "course-4",
    slug: "revit-structure-professional",
    title: "Revit Structure Professional (Mô hình hóa Kết cấu Chuyên sâu)",
    eyebrow: "CHUYÊN NGÀNH · 8 TUẦN",
    category: "Chuyên ngành",
    image: "/images/service-design.jpg",
    description:
      "Phát triển mô hình kết cấu bê tông, cốt thép và kết cấu thép đạt LOD 350-400, kiểm soát hồ sơ bản vẽ thi công và tham số khối lượng.",
    duration: "8 tuần (24 buổi)",
    level: "Chuyên sâu",
    price: "5.500.000 VNĐ",
    instructor: "KS. Vũ Đình Hải (Lead Structural Modeler)",
    highlights: [
      "Revit Rebar & Steel Connection",
      "Trích xuất khối lượng tự động",
      "Hồ sơ Shopdrawing chuẩn xác",
    ],
    learningOutcomes: [
      "Mô hình hóa cốt thép 3D chi tiết cho móng, cột, dầm, sàn phức tạp",
      "Thiết lập liên kết kết cấu thép tiền chế và chi tiết bản mã",
      "Tự động hóa thống kê khối lượng cốt thép và bảng uốn thép",
      "Xuất bản vẽ thi công kết cấu đồng bộ, hạn chế 100% sai lệch bản vẽ - mô hình",
    ],
    curriculum: [
      {
        id: "mod-1",
        title: "Mô-đun 01: Thiết lập mô hình kết cấu tiêu chuẩn",
        description:
          "Cấu hình dự án, liên kết mô hình kiến trúc, thiết lập lưới trục, cao trình và family kết cấu chuẩn.",
      },
      {
        id: "mod-2",
        title: "Mô-đun 02: Mô hình hóa cốt thép 3D (Revit Rebar Modeling)",
        description:
          "Triển khai thép móng, dầm, cột, vách, sàn chuyển và xử lý xung đột cốt thép mật độ cao.",
      },
      {
        id: "mod-3",
        title: "Mô-đun 03: Kết cấu thép & Chi tiết liên kết (Steel Connections)",
        description:
          "Mô hình kết cấu giàn thép, khung thép nhà xưởng, bu-lông, mối hàn và bản mã liên kết.",
      },
      {
        id: "mod-4",
        title: "Mô-đun 04: Quản lý khối lượng & Trích xuất hồ sơ bản vẽ",
        description:
          "Tạo lập Schedule khối lượng vật liệu, bóc tách bê tông/thép và bố trí dàn trang hồ sơ kỹ thuật thi công.",
      },
    ],
    sections: [
      {
        title: "Nội dung trọng tâm",
        body: "Học viên xây dựng mô hình bê tông, thép, cấu kiện đặc thù và tổ chức bộ hồ sơ bản vẽ theo tiêu chuẩn dự án thực tế.",
      },
      {
        title: "Quản lý chất lượng",
        body: "Chương trình hướng dẫn kiểm tra mô hình, quản lý cảnh báo, tham số và tính nhất quán giữa mô hình với bản vẽ.",
      },
    ],
  },
  {
    id: "course-5",
    slug: "navisworks-clash-detection",
    title: "Navisworks & Clash Detection (Thực chiến Kiểm soát Xung đột)",
    eyebrow: "THỰC CHIẾN · 5 TUẦN",
    category: "Thực chiến",
    image: "/images/news-project-coordination.webp",
    description:
      "Tổ chức mô hình liên kết tổng thể, làm chủ bộ công cụ Clash Detective, kiểm soát TimeLiner 4D và mô phỏng biện pháp thi công.",
    duration: "5 tuần (15 buổi)",
    level: "Thực chiến",
    price: "4.500.000 VNĐ",
    instructor: "KS. Đỗ Minh Quân (BIM Coordinator)",
    highlights: [
      "Quy tắc Clash Detective nâng cao",
      "Mô phỏng 4D TimeLiner",
      "Xuất báo cáo xung đột HTML/BCF",
    ],
    learningOutcomes: [
      "Cấu hình Search Sets theo hệ thống mã phân cấp (Uniclass/OmniClass)",
      "Lập ma trận kiểm tra xung đột chuyên sâu giữa Kết cấu - Kiến trúc - MEP",
      "Kết hợp tiến độ thi công vào mô hình để tạo hoạt cảnh mô phỏng 4D",
      "Xuất báo cáo chuyên nghiệp phục vụ giao ban hiện trường",
    ],
    curriculum: [
      {
        id: "mod-1",
        title: "Mô-đun 01: Tổng hợp mô hình & Quản trị tập hợp dữ liệu",
        description:
          "Nhập xuất các định dạng NWD, NWC, IFC, DWG và tối ưu hiệu năng hiển thị cho mô hình dung lượng lớn.",
      },
      {
        id: "mod-2",
        title: "Mô-đun 02: Làm chủ Clash Detective & Xử lý xung đột",
        description:
          "Thiết lập dung sai, quy tắc bỏ qua xung đột (Rules) và phân nhóm theo vị trí/tầng.",
      },
      {
        id: "mod-3",
        title: "Mô-đun 03: Mô phỏng thi công 4D với TimeLiner",
        description:
          "Liên kết dữ liệu tiến độ MS Project/Primavera P6 với các đối tượng mô hình để mô phỏng giai đoạn thi công.",
      },
      {
        id: "mod-4",
        title: "Mô-đun 04: Báo cáo phối hợp & Thực hành dự án",
        description:
          "Tạo báo cáo chi tiết, điều hành phiên họp phối hợp và nghiệm thu mô hình không xung đột nghiêm trọng.",
      },
    ],
    sections: [
      {
        title: "Thiết lập kiểm tra",
        body: "Học viên chuẩn hóa file đầu vào, search set và ma trận kiểm tra theo mức độ ưu tiên của từng giai đoạn.",
      },
      {
        title: "Điều hành vấn đề",
        body: "Kết quả clash được phân loại, nhóm theo nguyên nhân và chuyển thành issue có trách nhiệm cùng thời hạn xử lý.",
      },
    ],
  },
  {
    id: "course-6",
    slug: "cde-iso-19650",
    title: "CDE & ISO 19650 (Quản trị Dữ liệu Môi trường Chung)",
    eyebrow: "QUẢN TRỊ THÔNG TIN · 6 TUẦN",
    category: "Quản trị thông tin",
    image: "/images/news-digital-twin.webp",
    description:
      "Thiết kế kiến trúc môi trường dữ liệu chung CDE, chuẩn hóa quy tắc đặt tên, revision và luồng xét duyệt thông tin số cho toàn dự án.",
    duration: "6 tuần (18 buổi)",
    level: "Quản trị thông tin",
    price: "5.800.000 VNĐ",
    instructor: "Chuyên gia ISO 19650 Nguyễn Văn Hải",
    highlights: [
      "Xây dựng CDE trên ACC / SharePoint / Nextcloud",
      "Quy tắc đặt tên file ISO 19650",
      "Luồng xét duyệt phân cấp",
    ],
    learningOutcomes: [
      "Thiết kế cấu trúc thư mục 4 trạng thái: WIP -> Shared -> Published -> Archived",
      "Áp dụng chuẩn đặt tên file ISO 19650 National Annex",
      "Xây dựng quy trình phê duyệt tài liệu và ký số điện tử",
      "Quản lý phân quyền bảo mật dữ liệu cho Chủ đầu tư, Tư vấn và Nhà thầu",
    ],
    curriculum: [
      {
        id: "mod-1",
        title: "Mô-đun 01: Nguyên lý Môi trường dữ liệu chung CDE",
        description:
          "Hiểu rõ khái niệm Single Source of Truth và các yêu cầu kỹ thuật đối với nền tảng CDE.",
      },
      {
        id: "mod-2",
        title: "Mô-đun 02: Chuẩn hóa quy tắc đặt tên và trường thuộc tính",
        description:
          "Thực hành áp dụng cấu trúc mã dự án, bộ môn, vị trí, loại tài liệu và trạng thái phù hợp ISO 19650.",
      },
      {
        id: "mod-3",
        title: "Mô-đun 03: Thiết lập luồng kiểm duyệt (Review Workflow)",
        description:
          "Cấu hình bước kiểm tra nội bộ, phát hành chia sẻ và phê duyệt chính thức trên nền tảng đám mây.",
      },
      {
        id: "mod-4",
        title: "Mô-đun 04: Bảo mật, lưu trữ và bàn giao dữ liệu số",
        description:
          "Quy trình đóng gói Asset Information Model (AIM) phục vụ vận hành và lưu trữ dự án dài hạn.",
      },
    ],
    sections: [
      {
        title: "Yêu cầu thông tin",
        body: "Chuyển mục tiêu của chủ đầu tư thành yêu cầu thông tin, mốc bàn giao và tiêu chí chấp nhận có thể đo lường.",
      },
      {
        title: "Thiết kế CDE",
        body: "Xây dựng trạng thái WIP, Shared, Published, Archived cùng quy tắc đặt tên, revision và luồng phê duyệt.",
      },
    ],
  },
];

export const blogEntries: ContentEntry[] = [
  {
    slug: "phoi-hop-bim-du-an-cao-tang",
    title:
      "Phối hợp BIM tại dự án cao tầng: Từ mô hình 3D đến quyết định hiện trường",
    eyebrow: "DỰ ÁN",
    meta: "15.08.2026",
    image: "/images/news-project-coordination.webp",
    description:
      "Đội ngũ BIM4C kết nối mô hình, bản vẽ và dữ liệu hiện trường để phát hiện sớm hơn 1.200 xung đột và hỗ trợ quyết định thi công chính xác.",
    highlights: [
      "Phối hợp đa bộ môn MEP - Kết cấu",
      "Kiểm soát xung đột không gian hẹp",
      "Giảm 35% chi phí phát sinh",
    ],
    sections: [
      {
        title: "Một nguồn thông tin thống nhất (Single Source of Truth)",
        body: "Mô hình phối hợp giúp các bên cùng làm việc trên nguồn dữ liệu được kiểm soát, giảm độ trễ khi trao đổi và hạn chế sai lệch giữa thiết kế với hiện trường.",
      },
      {
        title: "Quyết định dựa trên dữ liệu thời gian thực",
        body: "Các vấn đề được phân loại, giao trách nhiệm và theo dõi đến khi đóng, giúp đội ngũ dự án xử lý chủ động trước khi ảnh hưởng đến tiến độ.",
      },
    ],
  },
  {
    slug: "digital-twin-trong-quan-ly-cong-trinh",
    title:
      "Digital Twin mở ra cách tiếp cận mới trong quản lý vòng đời công trình",
    eyebrow: "CÔNG NGHỆ",
    meta: "14.08.2026",
    image: "/images/news-digital-twin.webp",
    description:
      "Mô hình số đồng bộ dữ liệu thiết kế, thi công và cảm biến IoT vận hành, tạo nền tảng trực quan cho quản trị tài sản và dự báo rủi ro.",
    highlights: [
      "Digital Twin thời gian thực",
      "Tích hợp cảm biến IoT",
      "Tối ưu chi phí bảo trì vòng đời",
    ],
    sections: [
      {
        title: "Từ mô hình tĩnh đến hệ sinh thái sống",
        body: "Digital Twin liên kết mô hình với dữ liệu vận hành để phản ánh trạng thái công trình, hỗ trợ theo dõi hiệu suất và nhận diện bất thường ngay tức thì.",
      },
      {
        title: "Nền tảng cho vận hành thông minh",
        body: "Dữ liệu có cấu trúc giúp chủ đầu tư đánh giá phương án bảo trì, tối ưu tài sản và ra quyết định trên cơ sở dữ liệu minh bạch.",
      },
    ],
  },
  {
    slug: "dao-tao-bim-thuc-chien-cho-ky-su",
    title:
      "Đào tạo BIM thực chiến: Nâng cao năng lực phối hợp số cho kỹ sư thế hệ mới",
    eyebrow: "ĐÀO TẠO",
    meta: "13.08.2026",
    image: "/images/news-bim-training.webp",
    description:
      "Chương trình học dựa trên tình huống dự án thật giúp kỹ sư hình thành tư duy phối hợp, làm chủ công cụ và xử lý xung đột có hệ thống.",
    highlights: [
      "Học từ dự án thực tế",
      "Thực hành tương tác trực tiếp",
      "Cấp chứng chỉ xác thực QR",
    ],
    sections: [
      {
        title: "Học thông qua tình huống thực tế",
        body: "Mỗi chuyên đề được xây dựng quanh bài toán phối hợp thường gặp, để học viên trực tiếp phân tích dữ liệu và đề xuất phương án xử lý.",
      },
      {
        title: "Đo lường năng lực đầu ra",
        body: "Kết quả được đánh giá bằng sản phẩm thực hành và khả năng tổ chức quy trình, thay vì chỉ dừng lại ở kiến thức lý thuyết.",
      },
    ],
  },
  {
    slug: "du-lieu-so-nang-cao-an-toan-cong-truong",
    title: "Ứng dụng dữ liệu số & 4D Simulation để chủ động kiểm soát an toàn",
    eyebrow: "AN TOÀN",
    meta: "12.08.2026",
    image: "/images/news-site-safety.webp",
    description:
      "Quy trình kiểm tra số hóa và mô phỏng 4D giúp đội ngũ nhận diện vùng nguy hiểm, theo dõi hành động khắc phục và duy trì an toàn tuyệt đối.",
    highlights: [
      "Nhận diện rủi ro trước thi công",
      "Mô phỏng 4D không gian hẹp",
      "An toàn chủ động không tai nạn",
    ],
    sections: [
      {
        title: "Thông tin được ghi nhận tại nguồn",
        body: "Các phát hiện tại hiện trường được gắn với vị trí không gian mô hình, hình ảnh và người phụ trách, giúp hành động khắc phục rõ ràng và có thể truy vết.",
      },
      {
        title: "Chuyển từ phản ứng sang phòng ngừa rủi ro",
        body: "Dữ liệu lịch sử giúp đội ngũ nhận diện xu hướng rủi ro và ưu tiên biện pháp kiểm soát trước khi sự cố xảy ra.",
      },
    ],
  },
];

