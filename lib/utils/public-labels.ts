const labels: Record<string, string> = {
  "Tư vấn BIM": "BIM Consulting",
  "Đào tạo": "Training",
  "Thiết kế": "Design",
  "Tư vấn giám sát": "Construction Supervision",
  "Digital Twin & Dữ liệu tài sản": "Digital Twin & Asset Information",
  "The Matrix One - Giai đoạn 2": "The Matrix One - Phase 2",
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
  "NỀN TẢNG": "Foundation",
  "CHUYÊN SÂU": "Advanced",
  "QUẢN LÝ": "Management",
  "CHUYÊN NGÀNH": "Specialist",
  "THỰC CHIẾN": "Applied",
  "QUẢN TRỊ THÔNG TIN": "Information management",
  "DỰ ÁN": "Projects",
  "DỰ ÁN BIM4C": "BIM4C project",
  "CÔNG NGHỆ": "Technology",
  "ĐÀO TẠO": "Training",
  "AN TOÀN": "Safety",
  "CHUYÊN MÔN": "Expertise",
  "CON NGƯỜI": "People",
  "Hà Nội": "Hanoi",
  "TP. Hồ Chí Minh": "Ho Chi Minh City",
  "Bình Dương": "Binh Duong",
  "Nghệ An": "Nghe An",
  "Bắc Ninh": "Bac Ninh",
  "Hải Phòng": "Hai Phong",
  Khác: "Other",
  "Sắp triển khai": "Planned",
  "Đã lưu trữ": "Archived",
  "Tất cả": "All",
  "DỊCH VỤ BIM4C": "BIM4C SOLUTION",
  "DỰ ÁN CAO TẦNG": "HIGH-RISE PROJECT",
  "DỰ ÁN THẤP TẦNG": "LOW-RISE PROJECT",
  "Nhà cao tầng": "High-rise",
  "Nhà thấp tầng": "Low-rise",
  "Công nghiệp": "Industrial",
  "Hạ tầng": "Infrastructure",
  "Cơ điện": "MEP",
  "Đang thi công": "In delivery",
  "Hoàn thành": "Completed",
  "Đã xuất bản": "Published",
  "Bản nháp": "Draft",
};

export function toEnglishLabel(value: string): string {
  return labels[value] ?? value;
}
