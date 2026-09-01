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
    image: "/images/service-consulting.jpg",
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
    image: "/images/project-lumi.jpg",
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
    image: "/images/project-matrix.jpg",
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
    image: "/images/project-elysian.jpg",
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
    image: "/images/hero.jpg",
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
    image: "/images/about.jpg",
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
  {
    slug: "northgate-logistics-hub",
    title: "Northgate Logistics Hub",
    eyebrow: "DỰ ÁN CÔNG NGHIỆP",
    image: "/images/news-site-safety.webp",
    description:
      "Trung tâm logistics đa chức năng được phối hợp BIM nhằm tối ưu luồng vận hành, kết cấu nhịp lớn và hệ thống kỹ thuật.",
    meta: "BẮC NINH · 2026",
    highlights: ["Công nghiệp", "4D Planning", "MEP Coordination"],
    sections: [
      {
        title: "Bài toán dự án",
        body: "Tiến độ nhanh và mật độ hệ thống kỹ thuật cao đòi hỏi các gói thiết kế, kết cấu và MEP phải được phối hợp theo chu kỳ ngắn.",
      },
      {
        title: "Phạm vi BIM4C",
        body: "Đội ngũ thiết lập mô hình liên kết, kiểm tra không gian bảo trì, quản lý xung đột và hỗ trợ lập kế hoạch thi công 4D.",
      },
      {
        title: "Kết quả triển khai",
        body: "Các vấn đề ảnh hưởng đến lắp đặt được xử lý trước khi phát hành bản vẽ thi công, giảm thay đổi tại hiện trường.",
      },
    ],
  },
  {
    slug: "greenfield-smart-factory",
    title: "Greenfield Smart Factory",
    eyebrow: "DỰ ÁN CÔNG NGHIỆP",
    image: "/images/service-design.jpg",
    description:
      "Nhà máy thông minh được phát triển trên nền tảng dữ liệu thống nhất từ thiết kế đến bàn giao vận hành.",
    meta: "HẢI PHÒNG · 2025",
    highlights: ["Nhà máy", "Digital Handover", "Asset Data"],
    sections: [
      {
        title: "Mục tiêu thông tin",
        body: "Yêu cầu dữ liệu được xác định sớm để mô hình không chỉ phục vụ thi công mà còn sẵn sàng cho quản lý tài sản.",
      },
      {
        title: "Tích hợp đa bộ môn",
        body: "Kiến trúc, kết cấu, MEP và dây chuyền công nghệ được phối hợp trong một mô hình tổng thể có kiểm soát phiên bản.",
      },
      {
        title: "Bàn giao số",
        body: "Danh mục thiết bị, tài liệu kỹ thuật và dữ liệu bảo trì được liên kết phục vụ đội ngũ vận hành sau nghiệm thu.",
      },
    ],
  },
  {
    slug: "metro-depot-digital-coordination",
    title: "Metro Depot Digital Coordination",
    eyebrow: "DỰ ÁN HẠ TẦNG",
    image: "/images/news-digital-twin.webp",
    description:
      "Phối hợp số cho tổ hợp depot với nhiều hệ thống hạ tầng, kiến trúc và thiết bị chuyên ngành giao cắt phức tạp.",
    meta: "TP. HỒ CHÍ MINH · 2026",
    highlights: ["Hạ tầng", "CDE", "Interface Management"],
    sections: [
      {
        title: "Quản lý giao diện",
        body: "Ranh giới giữa các gói thầu được mô hình hóa và quản lý bằng danh mục giao diện có người chịu trách nhiệm rõ ràng.",
      },
      {
        title: "Môi trường dữ liệu chung",
        body: "Quy trình CDE kiểm soát trạng thái tài liệu, phiên bản và luồng phê duyệt cho các bên tham gia.",
      },
      {
        title: "Hỗ trợ điều hành",
        body: "Báo cáo trực quan giúp ban dự án theo dõi các vấn đề liên ngành và ưu tiên xử lý theo ảnh hưởng tiến độ.",
      },
    ],
  },
];

export const courseEntries: ContentEntry[] = [
  {
    slug: "bim-foundation",
    title: "BIM Foundation",
    eyebrow: "NỀN TẢNG · 8 TUẦN",
    image: "/images/service-training.jpg",
    description:
      "Kiến thức BIM nền tảng và quy trình phối hợp dành cho kỹ sư xây dựng.",
    highlights: ["24 buổi học", "Bài tập thực hành", "Chứng nhận BIM4C"],
    sections: [
      {
        title: "Bạn sẽ học được gì?",
        body: "Học viên hiểu nguyên lý BIM, cấu trúc dữ liệu mô hình và quy trình phối hợp cơ bản trong dự án.",
      },
      {
        title: "Đối tượng phù hợp",
        body: "Kỹ sư, kiến trúc sư, sinh viên năm cuối và nhân sự muốn bắt đầu lộ trình nghề nghiệp BIM.",
      },
    ],
  },
  {
    slug: "bim-coordination",
    title: "BIM Coordination",
    eyebrow: "CHUYÊN SÂU · 10 TUẦN",
    image: "/images/service-bim.jpg",
    description:
      "Phối hợp đa bộ môn, kiểm soát xung đột và quản lý thông tin trong CDE.",
    highlights: ["Clash Detection", "CDE Workflow", "Dự án cuối khóa"],
    sections: [
      {
        title: "Năng lực đầu ra",
        body: "Học viên có thể tổ chức phiên phối hợp, phân loại xung đột và quản lý quá trình đóng vấn đề.",
      },
      {
        title: "Phương pháp học",
        body: "Mỗi chủ đề được thực hành trên mô hình dự án, kèm phản hồi trực tiếp từ giảng viên.",
      },
    ],
  },
  {
    slug: "bim-management",
    title: "BIM Management",
    eyebrow: "QUẢN LÝ · 6 TUẦN",
    image: "/images/service-consulting.jpg",
    description:
      "Thiết lập chiến lược BIM và đo lường hiệu quả triển khai cho doanh nghiệp.",
    highlights: ["BEP & EIR", "Quản trị thay đổi", "Đo lường hiệu quả"],
    sections: [
      {
        title: "Tư duy quản lý",
        body: "Chương trình tập trung vào cách chuyển mục tiêu kinh doanh thành yêu cầu thông tin và kế hoạch thực thi.",
      },
      {
        title: "Dành cho người lãnh đạo",
        body: "Phù hợp với BIM Manager, quản lý dự án và lãnh đạo doanh nghiệp đang triển khai chuyển đổi số.",
      },
    ],
  },
  {
    slug: "revit-structure-professional",
    title: "Revit Structure Professional",
    eyebrow: "CHUYÊN NGÀNH · 8 TUẦN",
    image: "/images/service-design.jpg",
    description:
      "Phát triển mô hình kết cấu có tính thi công, kiểm soát hồ sơ và phối hợp hiệu quả với các bộ môn liên quan.",
    highlights: [
      "Concrete & Steel",
      "Model QA/QC",
      "Construction Documentation",
    ],
    sections: [
      {
        title: "Nội dung trọng tâm",
        body: "Học viên xây dựng mô hình bê tông, thép, cấu kiện đặc thù và tổ chức bộ hồ sơ theo tiêu chuẩn dự án.",
      },
      {
        title: "Quản lý chất lượng",
        body: "Chương trình hướng dẫn kiểm tra mô hình, quản lý cảnh báo, tham số và tính nhất quán giữa mô hình với bản vẽ.",
      },
      {
        title: "Sản phẩm cuối khóa",
        body: "Hoàn thiện một gói mô hình và hồ sơ kết cấu có thể sử dụng làm portfolio chuyên môn.",
      },
    ],
  },
  {
    slug: "navisworks-clash-detection",
    title: "Navisworks & Clash Detection",
    eyebrow: "THỰC CHIẾN · 5 TUẦN",
    image: "/images/news-project-coordination.webp",
    description:
      "Tổ chức mô hình liên kết, thiết lập quy tắc clash và điều hành phiên phối hợp đa bộ môn trên dữ liệu dự án.",
    highlights: ["Search Sets", "Clash Rules", "Coordination Meeting"],
    sections: [
      {
        title: "Thiết lập kiểm tra",
        body: "Học viên chuẩn hóa file đầu vào, search set và ma trận kiểm tra theo mức độ ưu tiên của từng giai đoạn.",
      },
      {
        title: "Điều hành vấn đề",
        body: "Kết quả clash được phân loại, nhóm theo nguyên nhân và chuyển thành issue có trách nhiệm cùng thời hạn xử lý.",
      },
      {
        title: "Báo cáo phối hợp",
        body: "Cuối khóa, học viên tổ chức một phiên coordination và trình bày dashboard trạng thái cho ban dự án.",
      },
    ],
  },
  {
    slug: "cde-iso-19650",
    title: "CDE & ISO 19650",
    eyebrow: "QUẢN TRỊ THÔNG TIN · 6 TUẦN",
    image: "/images/news-digital-twin.webp",
    description:
      "Thiết kế quy trình môi trường dữ liệu chung và quản trị thông tin dự án theo nguyên tắc ISO 19650.",
    highlights: [
      "Information Requirements",
      "CDE Workflow",
      "Naming & Approval",
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
      {
        title: "Áp dụng vào tổ chức",
        body: "Học viên hoàn thiện bộ quy trình mẫu và kế hoạch triển khai phù hợp với quy mô doanh nghiệp hoặc dự án.",
      },
    ],
  },
];

export const blogEntries: ContentEntry[] = [
  {
    slug: "phoi-hop-bim-du-an-cao-tang",
    title:
      "Phối hợp BIM tại dự án cao tầng: Từ mô hình đến quyết định hiện trường",
    eyebrow: "DỰ ÁN",
    meta: "15.08.2026",
    image: "/images/news-project-coordination.webp",
    description:
      "Đội ngũ BIM4C kết nối mô hình, bản vẽ và dữ liệu hiện trường để phát hiện sớm xung đột và hỗ trợ quyết định thi công chính xác.",
    highlights: [
      "Phối hợp đa bộ môn",
      "Kiểm soát xung đột",
      "Dữ liệu hiện trường",
    ],
    sections: [
      {
        title: "Một nguồn thông tin thống nhất",
        body: "Mô hình phối hợp giúp các bên cùng làm việc trên nguồn dữ liệu được kiểm soát, giảm độ trễ khi trao đổi và hạn chế sai lệch giữa thiết kế với hiện trường.",
      },
      {
        title: "Quyết định dựa trên dữ liệu",
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
      "Mô hình số đồng bộ dữ liệu thiết kế, thi công và vận hành, tạo nền tảng trực quan cho quản trị tài sản và dự báo rủi ro.",
    highlights: ["Digital Twin", "Dữ liệu thời gian thực", "Quản trị vòng đời"],
    sections: [
      {
        title: "Từ mô hình tĩnh đến hệ thống sống",
        body: "Digital Twin liên kết mô hình với dữ liệu vận hành để phản ánh trạng thái công trình, hỗ trợ theo dõi hiệu suất và nhận diện bất thường.",
      },
      {
        title: "Nền tảng cho vận hành thông minh",
        body: "Dữ liệu có cấu trúc giúp chủ đầu tư đánh giá phương án bảo trì, tối ưu tài sản và ra quyết định trên cơ sở minh bạch.",
      },
    ],
  },
  {
    slug: "dao-tao-bim-thuc-chien-cho-ky-su",
    title:
      "Đào tạo BIM thực chiến: Nâng cao năng lực phối hợp cho đội ngũ kỹ sư",
    eyebrow: "ĐÀO TẠO",
    meta: "13.08.2026",
    image: "/images/news-bim-training.webp",
    description:
      "Chương trình học dựa trên tình huống dự án giúp kỹ sư hình thành tư duy phối hợp, kiểm soát thông tin và xử lý vấn đề có hệ thống.",
    highlights: ["Học từ dự án", "Thực hành mô hình", "Phát triển năng lực"],
    sections: [
      {
        title: "Học thông qua tình huống thực tế",
        body: "Mỗi chuyên đề được xây dựng quanh bài toán phối hợp thường gặp, để học viên trực tiếp phân tích dữ liệu và đề xuất phương án xử lý.",
      },
      {
        title: "Đo lường năng lực đầu ra",
        body: "Kết quả được đánh giá bằng sản phẩm thực hành và khả năng tổ chức quy trình, thay vì chỉ dựa trên kiến thức lý thuyết.",
      },
    ],
  },
  {
    slug: "du-lieu-so-nang-cao-an-toan-cong-truong",
    title: "Ứng dụng dữ liệu số để chủ động kiểm soát an toàn công trường",
    eyebrow: "AN TOÀN",
    meta: "12.08.2026",
    image: "/images/news-site-safety.webp",
    description:
      "Quy trình kiểm tra số hóa giúp đội ngũ nhận diện rủi ro, theo dõi hành động khắc phục và duy trì tiêu chuẩn an toàn nhất quán.",
    highlights: ["Nhận diện rủi ro", "Kiểm tra số hóa", "An toàn chủ động"],
    sections: [
      {
        title: "Thông tin được ghi nhận tại nguồn",
        body: "Các phát hiện tại hiện trường được gắn với vị trí, hình ảnh và người phụ trách, giúp hành động khắc phục rõ ràng và có thể truy vết.",
      },
      {
        title: "Chuyển từ phản ứng sang phòng ngừa",
        body: "Dữ liệu lịch sử giúp đội ngũ nhận diện xu hướng rủi ro và ưu tiên biện pháp kiểm soát trước khi sự cố xảy ra.",
      },
    ],
  },
];
