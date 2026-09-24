import type { Locale } from "../i18n/config";

const viToEnLabels: Record<string, string> = {
  // Categories & Names
  "Tư vấn BIM": "BIM Consulting",
  "Đào tạo": "Training",
  "ĐÀO TẠO": "Training",
  "Thiết kế": "Design",
  "THIẾT KẾ": "Design",
  "Tư vấn giám sát": "Construction Supervision",
  "BIM Coordination": "BIM Coordination",
  "Digital Twin & Dữ liệu tài sản": "Digital Twin & Asset Information",
  "DỊCH VỤ BIM4C": "BIM4C Solutions",
  "Dịch vụ BIM4C": "BIM4C Solutions",
  "Dịch vụ BIM": "BIM Services",
  "DỊCH VỤ BIM": "BIM Services",
  "Khảo sát & Số hóa": "Survey & Digitization",
  "Khảo sát & số hóa": "Survey & Digitization",
  "KHẢO SÁT & SỐ HÓA": "Survey & Digitization",
  "Khảo sát & Scan-to-BIM": "Survey & Scan-to-BIM",
  "KHẢO SÁT & SCAN-TO-BIM": "SURVEY & SCAN-TO-BIM",
  "Quy trình & Tiêu chuẩn": "Processes & Standards",
  "QUY TRÌNH & TIÊU CHUẨN": "PROCESSES & STANDARDS",
  "Công nghệ & Tự động hóa": "Technology & Automation",
  "CÔNG NGHỆ & TỰ ĐỘNG HÓA": "TECHNOLOGY & AUTOMATION",
  "Phối hợp & Xử lý va chạm": "Coordination & Clash Detection",
  "PHỐI HỢP & XỬ LÝ VA CHẠM": "COORDINATION & CLASH DETECTION",
  "Quản lý Dự án BIM": "Project Management BIM",
  "QUẢN LÝ DỰ ÁN BIM": "PROJECT MANAGEMENT BIM",
  "Vận hành & Digital Twin": "Operations & Digital Twin",
  "VẬN HÀNH & DIGITAL TWIN": "OPERATIONS & DIGITAL TWIN",
  "Kiến thức BIM": "BIM Knowledge",
  "KIẾN THỨC BIM": "BIM KNOWLEDGE",
  "Đào tạo BIM": "BIM Training",
  "ĐÀO TẠO BIM": "BIM TRAINING",
  "Chuyên môn BIM & Digital Twin": "BIM Expertise & Digital Twin",
  "Tin tức công ty": "Company News",
  "Sự kiện & Hội thảo": "Events & Seminars",
  "Hợp tác & Đối tác": "Partnerships",
  "Hoạt động doanh nghiệp": "Corporate Activities",
  "Tuyển dụng & Nhân sự": "Careers & People",
  "Tư vấn & Quản lý": "Consulting & Management",
  "Tư vấn & quản lý": "Consulting & Management",
  "TƯ VẤN & QUẢN LÝ": "Consulting & Management",

  "BIM 3D": "BIM 3D",
  "BIM 4D": "BIM 4D",
  "BIM 5D": "BIM 5D",
  "BIM 6D": "BIM 6D",
  "BIM 7D": "BIM 7D",
  "Laser Scan": "Laser Scan",
  "LiDAR": "LiDAR",
  "Scan-to-BIM": "Scan-to-BIM",
  "Kiến trúc": "Architecture",
  "Nội thất": "Interior Design",
  "Cảnh quan": "Landscape Design",
  "Hạ tầng": "Infrastructure Design",
  "Quy hoạch 1/500": "1/500 Master Planning",
  "Quản lý dự án": "Project Management",
  "Giám sát thi công": "Construction Supervision",
  "Giám sát lắp đặt thiết bị": "Equipment Installation Supervision",
  "Thẩm tra & thẩm định thiết kế": "Design Review & Appraisal",
  "Đào tạo & chuyển giao công nghệ": "Training & Technology Transfer",
  "Đào tạo & Chuyển giao công nghệ": "Training & Technology Transfer",
  "ĐÀO TẠO & CHUYỂN GIAO CÔNG NGHỆ": "Training & Technology Transfer",

  // Articles & News
  "Phối hợp BIM tại dự án cao tầng: Từ mô hình đến quyết định hiện trường":
    "High-rise BIM coordination: from models to site decisions",
  "Digital Twin mở ra cách tiếp cận mới trong quản lý vòng đời công trình":
    "Digital twins: a new approach to building lifecycle management",
  "Đào tạo BIM thực chiến: Nâng cao năng lực phối hợp cho đội ngũ kỹ sư":
    "Practical BIM training: building coordination skills for engineers",
  "Ứng dụng dữ liệu số để chủ động kiểm soát an toàn công trường":
    "Using digital information to improve site safety",
  "Quản trị dữ liệu xuyên suốt vòng đời dự án":
    "Managing information throughout the project lifecycle",
  "Ứng dụng BIM nâng cao chất lượng thi công":
    "Using BIM to improve construction quality",
  "Đẩy mạnh đào tạo thực chiến cho đội ngũ kỹ sư":
    "Developing engineers through practical training",
  "BIM4C triển khai dự án trọng điểm trong năm 2026":
    "BIM4C project delivery in 2026",

  // Course Levels & Categories
  "NỀN TẢNG": "Foundation",
  "Nền tảng": "Foundation",
  "CHUYÊN SÂU": "Advanced",
  "Chuyên sâu": "Advanced",
  "QUẢN LÝ": "Management",
  "Quản lý": "Management",
  "CHUYÊN NGÀNH": "Specialist",
  "Chuyên ngành": "Specialist",
  "THỰC CHIẾN": "Applied",
  "Thực chiến": "Applied",
  "ỨNG DỤNG": "Applied",
  "Ứng dụng": "Applied",
  "CƠ BẢN": "Beginner",
  "Cơ bản": "Beginner",
  "TRUNG CẤP": "Intermediate",
  "Trung cấp": "Intermediate",
  "NÂNG CAO": "Advanced",
  "Nâng cao": "Advanced",
  "CHUYÊN GIA": "Expert",
  "Chuyên gia": "Expert",
  "QUẢN TRỊ THÔNG TIN": "Information Management",
  "Quản trị thông tin": "Information Management",
  "3 TUẦN": "3 Weeks",
  "3 tuần": "3 weeks",

  // Durations
  "4 TUẦN": "4 Weeks",
  "4 tuần": "4 weeks",
  "5 TUẦN": "5 Weeks",
  "5 tuần": "5 weeks",
  "6 TUẦN": "6 Weeks",
  "6 tuần": "6 weeks",
  "8 TUẦN": "8 Weeks",
  "8 tuần": "8 weeks",
  "10 TUẦN": "10 Weeks",
  "10 tuần": "10 weeks",
  "12 TUẦN": "12 Weeks",
  "12 tuần": "12 weeks",

  // Categories / Tags
  "DỰ ÁN": "Projects",
  "Dự án": "Projects",
  "DỰ ÁN BIM4C": "BIM4C Project",
  "Dự án BIM4C": "BIM4C Project",
  "CÔNG NGHỆ": "Technology",
  "Công nghệ": "Technology",
  "AN TOÀN": "Safety",
  "An toàn": "Safety",
  "CHUYÊN MÔN": "Expertise",
  "Chuyên môn": "Expertise",
  "CON NGƯỜI": "People",
  "Con người": "People",

  // Locations
  "Hà Nội": "Hanoi",
  "TP. Hồ Chí Minh": "Ho Chi Minh City",
  "Đà Nẵng": "Da Nang",
  "Bình Dương": "Binh Duong",
  "Nghệ An": "Nghe An",
  "Bắc Ninh": "Bac Ninh",
  "Hải Phòng": "Hai Phong",
  "Quảng Nam": "Quang Nam",
  "Đồng Nai": "Dong Nai",
  "Khánh Hòa": "Khanh Hoa",
  "Cần Thơ": "Can Tho",
  Khác: "Other",

  // Common filters & Project categories
  "Tất cả": "All",
  "DỰ ÁN CAO TẦNG": "High-rise Project",
  "DỰ ÁN THẤP TẦNG": "Low-rise Project",
  "DỰ ÁN ĐÔ THỊ": "Urban Project",
  "DỰ ÁN CÔNG NGHIỆP": "Industrial Project",
  "DỰ ÁN HẠ TẦNG": "Infrastructure Project",
  "DỰ ÁN NHÀ Ở": "Residential Project",
  "Dự án cao tầng": "High-rise Project",
  "Dự án thấp tầng": "Low-rise Project",
  "Dự án đô thị": "Urban Project",
  "Dự án công nghiệp": "Industrial Project",
  "Dự án hạ tầng": "Infrastructure Project",
  "Dự án nhà ở": "Residential Project",
  "Nhà cao tầng": "High-rise",
  "Nhà thấp tầng": "Low-rise",
  "Công nghiệp": "Industrial",
  "Cơ điện": "MEP",


  // Statuses
  "Bản nháp": "Draft",
  "Sắp triển khai": "Planned",
  "Đang thi công": "In delivery",
  "Hoàn thành": "Completed",
  "Đã lưu trữ": "Archived",
  "Đã xuất bản": "Published",
  "Đã lên kế hoạch": "Planned",
  draft: "Draft",
  planned: "Planned",
  in_progress: "In delivery",
  completed: "Completed",
  archived: "Archived",

};

const enToViLabels: Record<string, string> = {};

// Build reverse dictionary
for (const [vi, en] of Object.entries(viToEnLabels)) {
  enToViLabels[en] = vi;
}

// Extra reverse mappings for variations
enToViLabels["All"] = "Tất cả";
enToViLabels["all"] = "Tất cả";
enToViLabels["High-rise"] = "Nhà cao tầng";
enToViLabels["Low-rise"] = "Nhà thấp tầng";
enToViLabels["Industrial"] = "Công nghiệp";
enToViLabels["Infrastructure"] = "Hạ tầng";
enToViLabels["MEP"] = "Cơ điện";
enToViLabels["In delivery"] = "Đang thi công";
enToViLabels["In progress"] = "Đang thi công";
enToViLabels["in delivery"] = "Đang thi công";
enToViLabels["in_progress"] = "Đang thi công";
enToViLabels["Completed"] = "Hoàn thành";
enToViLabels["completed"] = "Hoàn thành";
enToViLabels["Planned"] = "Sắp triển khai";
enToViLabels["planned"] = "Sắp triển khai";
enToViLabels["Draft"] = "Bản nháp";
enToViLabels["draft"] = "Bản nháp";
enToViLabels["Archived"] = "Đã lưu trữ";
enToViLabels["archived"] = "Đã lưu trữ";
enToViLabels["Published"] = "Đã xuất bản";
enToViLabels["published"] = "Đã xuất bản";
enToViLabels["Hanoi"] = "Hà Nội";
enToViLabels["Ho Chi Minh City"] = "TP. Hồ Chí Minh";
enToViLabels["Binh Duong"] = "Bình Dương";
enToViLabels["Nghe An"] = "Nghệ An";
enToViLabels["Bac Ninh"] = "Bắc Ninh";
enToViLabels["Hai Phong"] = "Hải Phòng";
enToViLabels["Other"] = "Khác";
enToViLabels["Foundation"] = "Nền tảng";
enToViLabels["Advanced"] = "Chuyên sâu";
enToViLabels["Management"] = "Quản lý";
enToViLabels["Specialist"] = "Chuyên ngành";
enToViLabels["Applied"] = "Thực chiến";
enToViLabels["Information Management"] = "Quản trị thông tin";
enToViLabels["Information management"] = "Quản trị thông tin";
enToViLabels["4 Weeks"] = "4 Tuần";
enToViLabels["5 Weeks"] = "5 Tuần";
enToViLabels["6 Weeks"] = "6 Tuần";
enToViLabels["8 Weeks"] = "8 Tuần";
enToViLabels["10 Weeks"] = "10 Tuần";
enToViLabels["12 Weeks"] = "12 Tuần";
enToViLabels["4 weeks"] = "4 tuần";
enToViLabels["5 weeks"] = "5 tuần";
enToViLabels["6 weeks"] = "6 tuần";
enToViLabels["8 weeks"] = "8 tuần";
enToViLabels["10 weeks"] = "10 tuần";
enToViLabels["12 weeks"] = "12 tuần";

function translateParts(
  value: string,
  translator: (str: string) => string,
): string {
  if (value.includes(" · ")) {
    return value
      .split(" · ")
      .map((part) => translator(part.trim()))
      .join(" · ");
  }
  if (value.includes(" - ")) {
    return value
      .split(" - ")
      .map((part) => translator(part.trim()))
      .join(" - ");
  }
  return translator(value);
}

export function toEnglishLabel(value: string): string {
  if (!value) return value;
  const direct = viToEnLabels[value];
  if (direct) return direct;
  return translateParts(value, (part) => viToEnLabels[part] ?? part);
}

export function toVietnameseLabel(value: string): string {
  if (!value) return value;
  const direct = enToViLabels[value];
  if (direct) return direct;
  return translateParts(value, (part) => enToViLabels[part] ?? part);
}

export function toLocalizedLabel(value: string, locale: Locale = "vi"): string {
  if (!value) return value;
  if (locale === "en") {
    return toEnglishLabel(value);
  }
  return toVietnameseLabel(value);
}
