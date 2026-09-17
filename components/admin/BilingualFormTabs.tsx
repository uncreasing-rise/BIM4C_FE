"use client";

import { cn } from "@/lib/utils";
import { Check, Sparkles } from "lucide-react";

interface BilingualFormTabsProps {
  activeTab: "vi" | "en";
  onTabChange: (tab: "vi" | "en") => void;
  hasViTranslation?: boolean;
  hasEnTranslation?: boolean;
}

export function BilingualFormTabs({
  activeTab,
  onTabChange,
  hasViTranslation = false,
  hasEnTranslation = false,
}: BilingualFormTabsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 bg-muted/20 px-3 py-2 rounded-xl mb-6">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1 flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-primary" />
          Ngôn ngữ biên tập:
        </span>

        {/* Vietnamese Tab */}
        <button
          type="button"
          onClick={() => onTabChange("vi")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all border",
            activeTab === "vi"
              ? "bg-primary text-primary-foreground border-primary shadow-sm ring-2 ring-primary/20"
              : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground",
          )}
        >
          <span className="text-sm">🇻🇳</span>
          <span>Tiếng Việt</span>
          {hasViTranslation ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 text-[10px] font-extrabold">
              <Check className="size-3" /> Đã có
            </span>
          ) : (
            <span className="rounded-full bg-muted-foreground/15 text-muted-foreground px-1.5 py-0.5 text-[10px] font-bold">
              Mới
            </span>
          )}
        </button>

        {/* English Tab */}
        <button
          type="button"
          onClick={() => onTabChange("en")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all border",
            activeTab === "en"
              ? "bg-primary text-primary-foreground border-primary shadow-sm ring-2 ring-primary/20"
              : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground",
          )}
        >
          <span className="text-sm">🇬🇧</span>
          <span>English</span>
          {hasEnTranslation ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 text-[10px] font-extrabold">
              <Check className="size-3" /> Ready
            </span>
          ) : (
            <span className="rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 text-[10px] font-bold">
              Auto/Draft
            </span>
          )}
        </button>
      </div>

      <div className="text-[11px] text-muted-foreground hidden sm:block">
        {activeTab === "vi"
          ? "Đang soạn thảo phiên bản Tiếng Việt (Mặc định cho thị trường VN)"
          : "Editing English version (Default for International users)"}
      </div>
    </div>
  );
}

