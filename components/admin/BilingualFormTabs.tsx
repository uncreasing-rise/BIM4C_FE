"use client";

import { cn } from "@/lib/utils";

interface BilingualFormTabsProps {
  activeTab: "en" | "vi";
  onTabChange: (tab: "en" | "vi") => void;
  hasViTranslation?: boolean;
}

export function BilingualFormTabs({
  activeTab,
  onTabChange,
  hasViTranslation = false,
}: BilingualFormTabsProps) {
  return (
    <div className="flex items-center gap-2 border-b border-border pb-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-2">
        Ngôn ngữ nhập liệu:
      </span>
      <button
        type="button"
        onClick={() => onTabChange("en")}
        className={cn(
          "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all",
          activeTab === "en"
            ? "bg-primary text-primary-foreground shadow-xs"
            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
        )}
      >
        <span>🇬🇧</span>
        <span>English (Chính)</span>
        <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-bold">
          Bắt buộc
        </span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange("vi")}
        className={cn(
          "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all",
          activeTab === "vi"
            ? "bg-primary text-primary-foreground shadow-xs"
            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
        )}
      >
        <span>🇻🇳</span>
        <span>Tiếng Việt</span>
        {hasViTranslation ? (
          <span className="rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 text-[10px] font-bold">
            Đã có
          </span>
        ) : (
          <span className="rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.2 text-[10px] font-bold">
            Tùy chọn
          </span>
        )}
      </button>
    </div>
  );
}
