const labels: Record<string, string> = {
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
