"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Box,
  Image as ImageIcon,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/lib/i18n/context";
import type { Project } from "@/features/projects/types/project";
import { BimHero3DCanvas } from "./BimHero3DCanvas";

interface BimInteractiveHeroVisualProps {
  featuredProject?: Project;
}

export function BimInteractiveHeroVisual({
  featuredProject,
}: BimInteractiveHeroVisualProps) {
  const { locale } = useLanguage();
  const isVi = locale === "vi";

  const [viewMode, setViewMode] = useState<"3d" | "render">("3d");

  // Real enterprise showcase items with high-res images
  const showcaseProjects = [
    {
      id: "matrix-one",
      title: isVi ? "The Matrix One — Giai đoạn 2" : "The Matrix One — Phase 2",
      category: isVi ? "Nhà ở cao tầng cao cấp" : "High-Rise Residential",
      scale: isVi ? "2 tòa tháp 44 tầng · 2 hầm" : "2 Towers 44 Floors · 2 Basements",
      location: isVi ? "Nam Từ Liêm, Hà Nội" : "Hanoi, Vietnam",
      investor: "MIK Group",
      deliverables: "LOD 400 · MEP Coordination · CDE",
      image: "/images/project-matrix.jpg",
      slug: "the-matrix-one-giai-doan-2",
    },
    {
      id: "lumi-hanoi",
      title: isVi ? "Lumi Hà Nội Complex" : "Lumi Hanoi Complex",
      category: isVi ? "Tổ hợp thương mại & Căn hộ" : "Commercial & Residential",
      scale: isVi ? "9 tòa tháp 29-35 tầng" : "9 Towers 29-35 Floors",
      location: isVi ? "Tây Mỗ, Hà Nội" : "Hanoi, Vietnam",
      investor: "CapitaLand Development",
      deliverables: "BIM 4D/5D · Clash Detective · IFC4",
      image: "/images/project-lumi.jpg",
      slug: "lumi-ha-noi",
    },
    {
      id: "elysian",
      title: isVi ? "Elysian Park & Commercial" : "Elysian Park & Commercial",
      category: isVi ? "Khu đô thị sinh thái" : "Eco Mixed-Use Urban",
      scale: isVi ? "4 tháp 21 tầng · 1.400 căn" : "4 Towers 21 Floors",
      location: isVi ? "TP. Thủ Đức, TP.HCM" : "HCMC, Vietnam",
      investor: "Gamuda Land",
      deliverables: "Digital Twin · OpenBIM · Scan-to-BIM",
      image: "/images/project-elysian.jpg",
      slug: "elysian-thu-duc",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const current = showcaseProjects[activeIndex];

  return (
    <div className="relative select-none">
      {/* Ambient background glow */}
      <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-teal-500/25 via-teal-400/15 to-emerald-500/25 opacity-90 blur-3xl pointer-events-none" />

      {/* Mode Switcher Floating Tabs (3D Model vs High-Res Renders) */}
      <div className="mb-3 flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-slate-950/80 p-1 backdrop-blur-xl shadow-lg">
          <button
            type="button"
            onClick={() => setViewMode("3d")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
              viewMode === "3d"
                ? "bg-primary text-white shadow-md shadow-teal-900/50"
                : "text-slate-400 hover:text-white",
            )}
          >
            <Box className="size-3.5" />
            <span>{isVi ? "Mô hình BIM 3D Tương tác" : "Interactive 3D BIM"}</span>
            <span className="flex size-1.5 rounded-full bg-teal-300 animate-ping" />
          </button>

          <button
            type="button"
            onClick={() => setViewMode("render")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
              viewMode === "render"
                ? "bg-primary text-white shadow-md shadow-teal-900/50"
                : "text-slate-400 hover:text-white",
            )}
          >
            <ImageIcon className="size-3.5" />
            <span>{isVi ? "Dự án Thực tế" : "Real Projects"}</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono font-semibold text-slate-400">
          <span>WebGL 2.0</span>
          <span className="text-zinc-600">·</span>
          <span>OpenBIM</span>
        </div>
      </div>

      {/* Main Container */}
      {viewMode === "3d" ? (
        <BimHero3DCanvas />
      ) : (
        /* Rendered Projects Showcase View */
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-slate-950/80 shadow-2xl backdrop-blur-2xl">
          {/* Top CAD & Standard Header Bar */}
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-slate-950/90 px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2.5">
              <span className="flex size-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="font-mono text-xs font-bold tracking-wider text-teal-300">
                BIM4C PROJECT SHOWCASE
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
              <span className="rounded bg-teal-500/20 px-2 py-0.5 font-bold text-teal-300 border border-teal-500/30">
                ISO 19650
              </span>
              <span className="rounded bg-white/10 px-2 py-0.5 font-semibold text-white">
                LOD 400
              </span>
            </div>
          </div>

          {/* High-Resolution Architectural Stage */}
          <div className="relative h-[360px] sm:h-[420px] overflow-hidden bg-slate-950">
            <Image
              key={current.id}
              src={current.image}
              alt={current.title}
              fill
              priority
              sizes="(max-width:1023px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out hover:scale-105"
            />

            {/* Clean Subtle Gradient Depth Mask */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/20 to-transparent" />

            {/* Floating Top Specs Tag */}
            <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
              <span className="rounded-lg border border-white/15 bg-slate-950/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md shadow-md">
                {current.category}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-teal-500/30 bg-slate-950/85 px-2.5 py-1 text-xs font-semibold text-teal-300 backdrop-blur-md">
                <ShieldCheck className="size-3.5 text-teal-400" />
                <span>{current.deliverables}</span>
              </span>
            </div>

            {/* Floating Bottom Project Card */}
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/15 bg-slate-950/90 p-4 backdrop-blur-xl shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs font-semibold text-teal-300">
                    <Building2 className="size-3.5 shrink-0 text-teal-400" />
                    <span className="truncate">{current.scale}</span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-slate-300 truncate">{current.investor}</span>
                  </div>
                  <h4 className="mt-1 text-base sm:text-lg font-bold text-white truncate">
                    {current.title}
                  </h4>
                </div>

                <Link
                  href={ROUTES.projectDetail(current.slug)}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md shadow-teal-900/50 hover:bg-primary-hover transition-colors"
                >
                  <span>{isVi ? "Xem dự án" : "Case Study"}</span>
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Interactive Project Switcher Tabs */}
          <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 bg-slate-950">
            {showcaseProjects.map((item, index) => {
              const isSelected = activeIndex === index;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "flex flex-col items-start p-3 sm:px-4 sm:py-3 transition-colors text-left",
                    isSelected
                      ? "bg-teal-500/15 border-b-2 border-teal-400"
                      : "hover:bg-white/[0.04]",
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-[10px] font-bold",
                      isSelected ? "text-teal-300" : "text-zinc-500",
                    )}
                  >
                    0{index + 1} / CASE
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 text-xs font-semibold truncate w-full",
                      isSelected ? "text-white" : "text-zinc-400",
                    )}
                  >
                    {item.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
