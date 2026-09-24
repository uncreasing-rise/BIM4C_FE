"use client";

import { CONTACT_EMAIL, ROUTES } from "@/constants/routes";
import { useLanguage } from "@/lib/i18n/context";
import {
  Boxes,
  Building2,
  CornerDownLeft,
  FileText,
  FolderGit2,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { ui } from "@/lib/i18n/ui";
interface CommandItem {
  id: string;
  category:
    | "navigation"
    | "project"
    | "service"
    | "course"
    | "blog"
    | "action"
    | "legal";
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
        title: ui(locale).commandMenu.t3DOpenBIMViewerInteractiveModel,
        subtitle: ui(locale).commandMenu.inspectIFCBCFSpatialCoordination,
        icon: Boxes,
        keywords: [
          "bim",
          "viewer",
          "3d",
          "ifc",
          "bcf",
          "clash",
          "model",
          "mo hinh",
        ],
        action: () => {
          router.push(ROUTES.bimViewer);
          onClose();
        },
      },
      {
        id: "nav-projects",
        category: "navigation",
        title: ui(locale).commandMenu.allProjectsCaseStudies,
        subtitle: ui(locale).commandMenu.exploreHighRiseAndInfrastructure,
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
        title: ui(locale).commandMenu.bIMConsultingSolutions,
        subtitle: ui(locale).commandMenu.iSO19650StrategyCDEMEP,
        icon: Building2,
        keywords: [
          "dich vu",
          "services",
          "tu van",
          "coordination",
          "cde",
          "iso 19650",
        ],
        action: () => {
          router.push(ROUTES.services);
          onClose();
        },
      },
      {
        id: "nav-courses",
        category: "navigation",
        title: ui(locale).commandMenu.bIM4CAcademyProfessionalTraining,
        subtitle: ui(locale).commandMenu.practicalRevitNavisworksOpenBIMCurriculum,
        icon: GraduationCap,
        keywords: [
          "khoa hoc",
          "courses",
          "academy",
          "dao tao",
          "chung chi",
          "revit",
        ],
        action: () => {
          router.push(ROUTES.courses);
          onClose();
        },
      },
      {
        id: "nav-blog",
        category: "navigation",
        title: ui(locale).commandMenu.insightsTechnicalJournal,
        subtitle: ui(locale).commandMenu.fieldTestedAECDigitalMethods,
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
        title: ui(locale).commandMenu.aboutBIM4CLeadershipCapability,
        subtitle: ui(locale).commandMenu.executiveTeamEngineeringCapability,
        icon: ShieldCheck,
        keywords: [
          "gioi thieu",
          "about",
          "tran ngoc hieu",
          "lanh dao",
          "doi ngu",
        ],
        action: () => {
          router.push(ROUTES.about);
          onClose();
        },
      },
      {
        id: "act-call-hotline",
        category: "action",
        title: ui(locale).commandMenu.technicalHotline84932468,
        subtitle: ui(locale).commandMenu.directProjectScopingSupport,
        icon: Phone,
        keywords: ["hotline", "dien thoai", "phone", "call", "lien he"],
        action: () => {
          window.location.href = "tel:+84932468099";
          onClose();
        },
      },
      {
        id: "act-email-contact",
        category: "action",
        title: `Email: ${CONTACT_EMAIL}`,
        subtitle: ui(locale).commandMenu.sendRFPAndProjectRequirements,
        icon: Mail,
        keywords: ["email", "thu dien tu", "mail", "Bim4c.lab@gmail.com"],
        action: () => {
          window.location.href = ROUTES.contactEmail;
          onClose();
        },
      },
      {
        id: "act-danang-hq",
        category: "legal",
        title: ui(locale).commandMenu.hQ20BacSonDa,
        subtitle: ui(locale).commandMenu.taxAddressAnKheWard,
        icon: MapPin,
        keywords: ["tru so", "da nang", "dia chi", "headquarters", "bac son"],
        action: () => {
          router.push(ROUTES.contact);
          onClose();
        },
      },
    ],
    [locale, router, onClose],
  );

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase().trim();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.keywords.some((kw) => kw.toLowerCase().includes(q)),
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
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
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
        setSelectedIndex(
          (prev) =>
            (prev - 1 + filteredItems.length) % (filteredItems.length || 1),
        );
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
        aria-label={
          ui(locale).commandMenu.quickSearchNavigationMenu
        }
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
              ui(locale).commandMenu.searchProjectsServicesCoursesArticles
            }
            aria-label={ui(locale).commandMenu.quickSearchInput}
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={ui(locale).commandMenu.closeSearch}
            className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-white/5">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-400">
              <p>
                {ui(locale).commandMenu.noMatchingCommandsFound}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {ui(locale).commandMenu.trySearchingBIMProjectsOr}
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
                        isSelected
                          ? "bg-teal-500 text-white"
                          : "bg-white/10 text-teal-300"
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate leading-snug">
                        {item.title}
                      </p>
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
              <span>{ui(locale).commandMenu.navigate}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">
                ↵
              </kbd>
              <span>{ui(locale).commandMenu.execute}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">
                ESC
              </kbd>
              <span>{ui(locale).commandMenu.close}</span>
            </span>
          </div>
          <span className="font-mono text-teal-300/80 text-[10px]">
            BIM4C JSC
          </span>
        </div>
      </div>
    </div>
  );
}
