"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  FolderGit2,
  GraduationCap,
  FileText,
  Boxes,
  Phone,
  Mail,
  Copy,
  ExternalLink,
  ShieldCheck,
  MapPin,
  X,
  CornerDownLeft,
} from "lucide-react";
import { toast } from "sonner";
import { ROUTES, CONTACT_EMAIL } from "@/constants/routes";
import { useLanguage } from "@/lib/i18n/context";

interface CommandItem {
  id: string;
  category: "navigation" | "project" | "service" | "course" | "blog" | "action" | "legal";
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
  action: () => void;
}

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandMenu({ isOpen, onClose }: CommandMenuProps) {
  const router = useRouter();
  const { locale } = useLanguage();
  const isVi = locale === "vi";
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const items: CommandItem[] = useMemo(
    () => [
      // Quick Navigation
      {
        id: "nav-bim-viewer",
        category: "navigation",
        title: isVi ? "3D OpenBIM Viewer (Mô hình trực quan)" : "3D OpenBIM Viewer (Interactive Model)",
        subtitle: isVi ? "Kiểm tra IFC, BCF và phân tích không gian" : "Inspect IFC, BCF & spatial coordination",
        icon: Boxes,
        keywords: ["bim", "viewer", "3d", "ifc", "bcf", "clash", "model", "mo hinh"],
        action: () => {
          router.push(ROUTES.bimViewer);
          onClose();
        },
      },
      {
        id: "nav-projects",
        category: "navigation",
        title: isVi ? "Tất cả Dự án Thực chiến" : "All Projects & Case Studies",
        subtitle: isVi ? "Khám phá danh mục dự án cao ốc, hạ tầng của BIM4C" : "Explore high-rise and infrastructure portfolio",
        icon: FolderGit2,
        keywords: ["du an", "projects", "case study", "portfolio"],
        action: () => {
          router.push(ROUTES.projects);
          onClose();
        },
      },
      {
        id: "nav-services",
        category: "navigation",
        title: isVi ? "Dịch vụ & Giải pháp Tư vấn BIM" : "BIM Consulting & Solutions",
        subtitle: isVi ? "Chiến lược ISO 19650, CDE, Phối hợp MEP & 5D" : "ISO 19650 Strategy, CDE, MEP & 5D Cost",
        icon: Building2,
        keywords: ["dich vu", "services", "tu van", "coordination", "cde", "iso 19650"],
        action: () => {
          router.push(ROUTES.services);
          onClose();
        },
      },
      {
        id: "nav-courses",
        category: "navigation",
        title: isVi ? "BIM4C Academy (Đào tạo Kỹ sư)" : "BIM4C Academy (Professional Training)",
        subtitle: isVi ? "Chương trình đào tạo Revit, Navisworks, OpenBIM thực chiến" : "Practical Revit, Navisworks & OpenBIM curriculum",
        icon: GraduationCap,
        keywords: ["khoa hoc", "courses", "academy", "dao tao", "chung chi", "revit"],
        action: () => {
          router.push(ROUTES.courses);
          onClose();
        },
      },
      {
        id: "nav-blog",
        category: "navigation",
        title: isVi ? "Góc nhìn & Bài viết Kỹ thuật" : "Insights & Technical Journal",
        subtitle: isVi ? "Kinh nghiệm thực tế từ các công trình và chuyển đổi số" : "Field-tested AEC digital methods and lessons",
        icon: FileText,
        keywords: ["blog", "bai viet", "tin tuc", "insights", "chuyen doi so"],
        action: () => {
          router.push(ROUTES.blog);
          onClose();
        },
      },
      {
        id: "nav-about",
        category: "navigation",
        title: isVi ? "Về BIM4C (Ban Lãnh đạo & Năng lực)" : "About BIM4C (Leadership & Capability)",
        subtitle: isVi ? "Đội ngũ chuyên gia và năng lực thực chiến" : "Executive team & engineering capability",
        icon: ShieldCheck,
        keywords: ["gioi thieu", "about", "tran ngoc hieu", "lanh dao", "doi ngu"],
        action: () => {
          router.push(ROUTES.about);
          onClose();
        },
      },

      // Real Projects & Case Studies
      {
        id: "proj-lumi-hanoi",
        category: "project",
        title: "Lumi Hanoi",
        subtitle: isVi ? "Dự án Căn hộ cao cấp CapitaLand · LOD 400 & Điều phối MEP" : "CapitaLand Luxury Residential · LOD 400 & MEP Coordination",
        icon: Building2,
        keywords: ["lumi", "hanoi", "capitaland", "can ho", "cao tang", "lod 400", "residential"],
        action: () => {
          router.push(ROUTES.projectDetail("lumi-hanoi"));
          onClose();
        },
      },
      {
        id: "proj-metropole",
        category: "project",
        title: "The Metropole Thủ Thiêm",
        subtitle: isVi ? "Tổ hợp phức hợp đô thị Thủ Thiêm · CDE & Phối hợp không gian" : "Thu Thiem Complex Development · CDE & Clash Governance",
        icon: Building2,
        keywords: ["metropole", "thu thiem", "tphcm", "phuc hop", "cde"],
        action: () => {
          router.push(ROUTES.projectDetail("the-metropole-thu-thiem"));
          onClose();
        },
      },
      {
        id: "proj-lotte-mall",
        category: "project",
        title: "Lotte Mall West Lake",
        subtitle: isVi ? "Đại siêu thị & Khách sạn cao cấp · Phối hợp 3D/4D tiến độ" : "Commercial Mall & Hotel · 3D/4D Schedule Simulation",
        icon: Building2,
        keywords: ["lotte", "mall", "west lake", "tay ho", "thuong mai", "4d"],
        action: () => {
          router.push(ROUTES.projectDetail("lotte-mall-west-lake"));
          onClose();
        },
      },
      {
        id: "proj-masterise",
        category: "project",
        title: "Masterise Centre Point",
        subtitle: isVi ? "Khu căn hộ cao tầng Vinhomes Grand Park · Chuẩn LOD 350 - 400" : "High-rise Complex · LOD 350 - 400 Modeling",
        icon: Building2,
        keywords: ["masterise", "centre point", "vinhomes", "grand park", "thu duc"],
        action: () => {
          router.push(ROUTES.projectDetail("masterise-centre-point"));
          onClose();
        },
      },

      // Real Services
      {
        id: "srv-consulting",
        category: "service",
        title: isVi ? "Tư vấn Chiến lược BIM & Lập BEP" : "BIM Strategy & BEP Consulting",
        subtitle: isVi ? "Thiết lập kế hoạch thực hiện BIM, ma trận LOD và tiêu chuẩn ISO 19650" : "BEP setup, LOD matrix & ISO 19650 compliance roadmap",
        icon: Building2,
        keywords: ["tu van bim", "bep", "eir", "chien luoc", "strategy", "iso 19650"],
        action: () => {
          router.push(ROUTES.serviceDetail("tu-van-bim"));
          onClose();
        },
      },
      {
        id: "srv-coordination",
        category: "service",
        title: isVi ? "Điều phối Xung đột Đa bộ môn (Clash Coordination)" : "Multidiscipline Clash Coordination",
        subtitle: isVi ? "Kiểm soát và giải quyết 100% va chạm Kiến trúc, Kết cấu, MEP trên CDE" : "Resolve Architecture, Structure & MEP clashes in CDE",
        icon: Boxes,
        keywords: ["coordination", "clash", "xung dot", "mep", "dieu phoi", "navisworks"],
        action: () => {
          router.push(ROUTES.serviceDetail("bim-coordination"));
          onClose();
        },
      },
      {
        id: "srv-design-qto",
        category: "service",
        title: isVi ? "Mô hình hóa & Bóc tách Khối lượng (QTO / 5D)" : "Modeling & Quantity Takeoff (QTO / 5D)",
        subtitle: isVi ? "Bóc tách khối lượng tự động và lập dự toán chính xác từ mô hình BIM" : "Accurate automated cost & quantity extraction from BIM",
        icon: Building2,
        keywords: ["qto", "boc tach", "khoi luong", "5d", "du toan", "thiet ke"],
        action: () => {
          router.push(ROUTES.serviceDetail("thiet-ke"));
          onClose();
        },
      },

      // Real Courses
      {
        id: "crs-foundation",
        category: "course",
        title: isVi ? "Khóa học BIM Foundation (Nhập môn Thực chiến)" : "BIM Foundation (Hands-on Fundamentals)",
        subtitle: isVi ? "Làm quen tư duy ISO 19650, OpenBIM và đọc hiểu mô hình 3D" : "Master ISO 19650 mindset, OpenBIM and 3D model navigation",
        icon: GraduationCap,
        keywords: ["foundation", "nhap mon", "co ban", "can ban", "khoa hoc"],
        action: () => {
          router.push(ROUTES.courseDetail("bim-foundation"));
          onClose();
        },
      },
      {
        id: "crs-coordinator",
        category: "course",
        title: isVi ? "Khóa học BIM Coordinator (Điều phối viên Chuyên nghiệp)" : "BIM Coordinator Professional Course",
        subtitle: isVi ? "Quản lý va chạm Navisworks, ma trận BCF và vận hành CDE dự án" : "Master Navisworks clash matrices, BCF tracking & CDE workflows",
        icon: GraduationCap,
        keywords: ["coordinator", "dieu phoi", "navisworks", "bcf", "nang cao"],
        action: () => {
          router.push(ROUTES.courseDetail("bim-coordinator"));
          onClose();
        },
      },
      {
        id: "crs-revit-arch",
        category: "course",
        title: isVi ? "Khóa học Revit Architecture & Structure" : "Revit Architecture & Structure Course",
        subtitle: isVi ? "Triển khai mô hình chuẩn LOD 300 - 400 và xuất hồ sơ bản vẽ kỹ thuật" : "Production-grade modeling LOD 300 - 400 & documentation",
        icon: GraduationCap,
        keywords: ["revit", "kien truc", "ket cau", "architecture", "structure"],
        action: () => {
          router.push(ROUTES.courseDetail("revit-kien-truc-ket-cau"));
          onClose();
        },
      },

      // Real Blog Article
      {
        id: "art-safety",
        category: "blog",
        title: isVi ? "Dữ liệu số nâng cao an toàn công trường" : "Digital Data for Enhanced Jobsite Safety",
        subtitle: isVi ? "Phân tích phương pháp ứng dụng mô hình 3D trong giám sát an toàn thi công" : "Leveraging 3D BIM data to mitigate construction safety risks",
        icon: FileText,
        keywords: ["an toan", "safety", "cong truong", "du lieu so", "bai viet"],
        action: () => {
          router.push(ROUTES.blogDetail("du-lieu-so-nang-cao-an-toan-cong-truong"));
          onClose();
        },
      },

      // Corporate Actions & Legal Verification
      {
        id: "act-copy-tax",
        category: "action",
        title: isVi ? "Sao chép Mã số thuế: 0402225839" : "Copy Tax ID: 0402225839",
        subtitle: isVi
          ? "Cục Thuế TP Đà Nẵng cấp · CÔNG TY CP XÂY DỰNG CÔNG NGHỆ BIM4C"
          : "Issued by Da Nang Tax Department · BIM4C JSC",
        icon: Copy,
        keywords: ["mst", "ma so thue", "tax", "tin", "0402225839", "copy", "sao chep"],
        action: () => {
          navigator.clipboard.writeText("0402225839");
          toast.success(
            isVi
              ? "Đã sao chép mã số thuế: 0402225839"
              : "Tax ID 0402225839 copied to clipboard"
          );
          onClose();
        },
      },
      {
        id: "act-verify-registry",
        category: "legal",
        title: isVi ? "Tra cứu Hồ sơ Pháp lý Doanh nghiệp" : "Verify National Corporate Registry",
        subtitle: isVi ? "Xem tình trạng Đang hoạt động trên Cổng thông tin Quốc gia" : "View active status on national database",
        icon: ExternalLink,
        keywords: ["phap ly", "legal", "tra cuu", "masothue", "dang hoat dong"],
        action: () => {
          window.open("https://masothue.com/0402225839-cong-ty-co-phan-xay-dung-cong-nghe-bim4c", "_blank");
          onClose();
        },
      },
      {
        id: "act-call-hotline",
        category: "action",
        title: isVi ? "Hotline Kỹ thuật: +84 28 7300 4068" : "Technical Hotline: +84 28 7300 4068",
        subtitle: isVi ? "Hỗ trợ dự án và tư vấn phạm vi 24/7" : "Direct project scoping & support",
        icon: Phone,
        keywords: ["hotline", "dien thoai", "phone", "call", "lien he"],
        action: () => {
          window.location.href = "tel:+842873004068";
          onClose();
        },
      },
      {
        id: "act-email-contact",
        category: "action",
        title: `Email: ${CONTACT_EMAIL}`,
        subtitle: isVi ? "Gửi yêu cầu báo giá và tài liệu dự án" : "Send RFP and project requirements",
        icon: Mail,
        keywords: ["email", "thu dien tu", "mail", "contact@bim4c.com"],
        action: () => {
          window.location.href = ROUTES.contactEmail;
          onClose();
        },
      },
      {
        id: "act-danang-hq",
        category: "legal",
        title: isVi ? "Trụ sở chính: 20 Bắc Sơn, Cẩm Lệ, Đà Nẵng" : "HQ: 20 Bac Son, Cam Le, Da Nang",
        subtitle: isVi ? "Địa chỉ kê khai thuế: 20 Bắc Sơn, P. An Khê, TP Đà Nẵng" : "Tax address: An Khe Ward, Da Nang City",
        icon: MapPin,
        keywords: ["tru so", "da nang", "dia chi", "headquarters", "bac son"],
        action: () => {
          router.push(ROUTES.contact);
          onClose();
        },
      },
    ],
    [isVi, router, onClose]
  );

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase().trim();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.keywords.some((kw) => kw.toLowerCase().includes(q))
    );
  }, [items, query]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Focus trap & focus restoration
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      const timer = setTimeout(() => {
        setQuery("");
        setSelectedIndex(0);
        inputRef.current?.focus();
      }, 20);
      return () => {
        clearTimeout(timer);
        previousFocusRef.current?.focus();
      };
    }
  }, [isOpen]);

  // Keyboard navigation & Focus Trapping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusableElements = dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[12vh] sm:pt-[15vh] bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={isVi ? "Menu tìm kiếm và điều hướng nhanh" : "Quick Search & Navigation Menu"}
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/20 bg-brand-ink/95 shadow-2xl backdrop-blur-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
          <Search className="size-5 text-teal-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={
              isVi
                ? "Tìm kiếm nhanh dự án, dịch vụ, khóa học, bài viết, MST..."
                : "Search projects, services, courses, articles, tax ID..."
            }
            aria-label={isVi ? "Ô tìm kiếm nhanh" : "Quick search input"}
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={isVi ? "Đóng tìm kiếm" : "Close search"}
            className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-white/5">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-400">
              <p>{isVi ? "Không tìm thấy kết quả phù hợp." : "No matching commands found."}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {isVi ? "Thử tìm 'BIM', '0402225839', 'Đà Nẵng', hoặc 'Dự án'" : "Try searching 'BIM', '0402225839', 'Projects', or 'Tax'"}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-all ${
                      isSelected
                        ? "bg-teal-500/20 text-white border border-teal-500/40 shadow-sm"
                        : "text-zinc-200 hover:bg-white/[0.04] border border-transparent"
                    }`}
                  >
                    <div
                      className={`flex size-8 items-center justify-center rounded-lg shrink-0 ${
                        isSelected ? "bg-teal-500 text-white" : "bg-white/10 text-teal-300"
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate leading-snug">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-xs text-zinc-400 truncate leading-relaxed">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <CornerDownLeft className="size-4 text-teal-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="flex items-center justify-between border-t border-white/10 bg-black/40 px-4 py-2.5 text-[11px] text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">
                ↑↓
              </kbd>
              <span>{isVi ? "Di chuyển" : "Navigate"}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">
                ↵
              </kbd>
              <span>{isVi ? "Chọn" : "Execute"}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">
                ESC
              </kbd>
              <span>{isVi ? "Đóng" : "Close"}</span>
            </span>
          </div>
          <span className="font-mono text-teal-300/80 text-[10px]">
            MST: 0402225839 · BIM4C JSC
          </span>
        </div>
      </div>
    </div>
  );
}
