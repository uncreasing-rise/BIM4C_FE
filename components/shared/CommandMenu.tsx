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
  category: "navigation" | "action" | "legal";
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

  const items: CommandItem[] = useMemo(
    () => [
      // Navigation
      {
        id: "nav-bim-viewer",
        category: "navigation",
        title: isVi ? "3D OpenBIM Viewer (Mô hình trực quan)" : "3D OpenBIM Viewer (Live Model)",
        subtitle: isVi ? "Kiểm tra IFC, BCF và phân tích xung đột" : "Inspect IFC, BCF & clash matrix",
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
        title: isVi ? "Dự án Thực chiến BIM" : "Enterprise Projects & Case Studies",
        subtitle: isVi ? "50+ dự án cao ốc, hạ tầng và công nghiệp" : "50+ high-rise, infrastructure & industrial",
        icon: FolderGit2,
        keywords: ["du an", "projects", "case study", "cao tang", "ha tang"],
        action: () => {
          router.push(ROUTES.projects);
          onClose();
        },
      },
      {
        id: "nav-services",
        category: "navigation",
        title: isVi ? "Giải pháp & Dịch vụ Tư vấn BIM" : "BIM Solutions & Consulting",
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
        title: isVi ? "BIM4C Academy (Đào tạo Kỹ sư)" : "BIM4C Academy (Enterprise Training)",
        subtitle: isVi ? "Revit, Navisworks, OpenBIM và cấp chứng chỉ" : "Revit, Navisworks, OpenBIM certification",
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
        subtitle: isVi ? "Kinh nghiệm thực tế từ các công trình" : "Field-tested AEC digital methods",
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
        subtitle: isVi ? "CEO Trần Ngọc Hiếu và đội ngũ chuyên gia" : "CEO Tran Ngoc Hieu & senior specialists",
        icon: ShieldCheck,
        keywords: ["gioi thieu", "about", "tran ngoc hieu", "lanh dao", "doi ngu"],
        action: () => {
          router.push(ROUTES.about);
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

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
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
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isVi
                ? "Tìm kiếm nhanh dự án, dịch vụ, mô hình 3D, mã số thuế..."
                : "Search modules, projects, 3D viewer, tax ID..."
            }
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
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
