"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Layers,
  Box,
  Cpu,
  Eye,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Maximize2,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/lib/i18n/context";
import type { Project } from "@/features/projects/types/project";

interface BimInteractiveHeroVisualProps {
  featuredProject?: Project;
}

type BimLayer = "all" | "arch" | "mep" | "struct";

export function BimInteractiveHeroVisual({
  featuredProject,
}: BimInteractiveHeroVisualProps) {
  const { t, locale } = useLanguage();
  const isVi = locale === "vi";

  const [activeLayer, setActiveLayer] = useState<BimLayer>("all");
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 9;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
    setActiveNode(null);
  };

  const nodes = [
    {
      id: 1,
      x: "24%",
      y: "32%",
      tag: "LOD 400",
      title: isVi ? "Chi tiết chế tạo" : "Fabrication Detail",
      desc: isVi ? "Mô hình chuẩn xác đến từng liên kết" : "Millimeter-level connection accuracy",
      layer: "arch",
    },
    {
      id: 2,
      x: "68%",
      y: "28%",
      tag: "MEP Clashes",
      title: isVi ? "Xung đột = 0" : "Zero Clash",
      desc: isVi ? "Tự động hóa phối hợp MEP đa hệ thống" : "Automated multi-discipline clash resolution",
      layer: "mep",
    },
    {
      id: 3,
      x: "52%",
      y: "64%",
      tag: "4D Timeline",
      title: isVi ? "Tiến độ 4D" : "4D Scheduling",
      desc: isVi ? "Mô phỏng thi công đồng bộ tiến độ" : "Synced construction sequence simulation",
      layer: "struct",
    },
    {
      id: 4,
      x: "82%",
      y: "72%",
      tag: "Digital Twin",
      title: isVi ? "Vận hành số" : "Asset Operations",
      desc: isVi ? "Bàn giao dữ liệu COBie & FM" : "COBie & FM ready digital handover",
      layer: "all",
    },
  ];

  const filteredNodes = nodes.filter(
    (node) => activeLayer === "all" || node.layer === activeLayer || node.layer === "all",
  );

  return (
    <div className="relative group/canvas select-none" ref={cardRef}>
      {/* Blueprint Architectural Grid Background Behind Visual */}
      <div
        className="pointer-events-none absolute -inset-4 rounded-3xl border border-teal-500/20 bg-gradient-to-br from-teal-500/5 via-transparent to-teal-950/20 opacity-80"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(45, 212, 191, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(45, 212, 191, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      {/* Decorative Blueprint Corner Crosshairs */}
      <div className="pointer-events-none absolute -left-2 -top-2 size-6 border-l-2 border-t-2 border-teal-400/60" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-2 -top-2 size-6 border-r-2 border-t-2 border-teal-400/60" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-2 -bottom-2 size-6 border-l-2 border-b-2 border-teal-400/60" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-2 -bottom-2 size-6 border-r-2 border-b-2 border-teal-400/60" aria-hidden="true" />

      {/* Main 3D Card Container */}
      <div
        className="relative overflow-hidden rounded-2xl border border-white/15 bg-brand-ink/90 backdrop-blur-xl shadow-2xl transition-all duration-300 ease-out"
        style={{
          transform: isHovered
            ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.015, 1.015, 1.015)`
            : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
          boxShadow: isHovered
            ? "0 25px 50px -12px rgba(8, 126, 125, 0.35), 0 0 30px 2px rgba(45, 212, 191, 0.15)"
            : "0 20px 40px -15px rgba(0, 0, 0, 0.5)",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Top Control Bar with Model Switcher & Telemetry HUD */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-white/[0.04] px-4 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-teal-400" />
            </span>
            <span className="font-mono text-[10.5px] font-bold tracking-wider text-teal-300">
              OPENBIM ENGINE v2.4
            </span>
            <div className="hidden sm:flex items-center gap-1.5 font-mono text-[9.5px] text-zinc-400 border-l border-white/10 pl-2">
              <span className="text-teal-400/90 font-semibold">60 FPS</span>
              <span>·</span>
              <span>1.2M TRIS</span>
              <span>·</span>
              <span className="text-emerald-400 font-semibold">0 CLASH</span>
            </div>
          </div>

          {/* Layer Selector */}
          <div className="flex items-center gap-1 rounded-lg border border-white/15 bg-black/60 p-0.5" role="tablist">
            {(
              [
                { id: "all", label: isVi ? "Tổng thể" : "All" },
                { id: "arch", label: isVi ? "Kiến trúc" : "Arch" },
                { id: "struct", label: isVi ? "Kết cấu" : "Struct" },
                { id: "mep", label: "MEP" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeLayer === tab.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveLayer(tab.id);
                }}
                className={cn(
                  "rounded px-2 py-0.5 font-mono text-[10px] font-semibold transition-all",
                  activeLayer === tab.id
                    ? "bg-primary text-white shadow-xs"
                    : "text-white/70 hover:text-white hover:bg-white/10",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Model Display Stage */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-b from-brand-ink/50 to-brand-ink">
          {/* Base Image */}
          <Image
            src={featuredProject?.image ?? "/images/news-digital-twin.webp"}
            alt={featuredProject?.title ?? "BIM4C 3D Engineering Model"}
            fill
            priority
            sizes="(max-width:1023px) 100vw, 50vw"
            className={cn(
              "object-cover transition-all duration-700",
              isHovered ? "scale-105" : "scale-100",
              activeLayer === "arch" && "brightness-110",
              activeLayer === "mep" && "hue-rotate-60 contrast-125",
              activeLayer === "struct" && "saturate-50 contrast-125",
            )}
          />

          {/* CAD 3D ViewCube Simulator (Top-Right) */}
          <div className="pointer-events-none absolute right-4 top-4 z-20 flex flex-col items-end gap-2">
            <div className="relative size-12 rounded-lg border border-teal-400/40 bg-black/60 backdrop-blur-md flex items-center justify-center shadow-lg transition-transform duration-300"
              style={{
                transform: `rotateX(${rotate.x * 1.5}deg) rotateY(${rotate.y * 1.5}deg)`,
              }}
            >
              <div className="size-8 rounded border border-teal-300/60 bg-teal-500/20 flex items-center justify-center text-[8px] font-black tracking-tighter text-teal-200">
                TOP
              </div>
            </div>
            <span className="rounded bg-teal-500/20 px-1.5 py-0.5 text-[9px] font-bold text-teal-300 border border-teal-500/30">
              LOD 400
            </span>
          </div>

          {/* Real-time Clash Detection Resolved Banner (Top-Left) */}
          <div className="pointer-events-none absolute left-4 top-4 z-20 flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/80 px-2.5 py-1 text-[10px] font-semibold text-emerald-300 backdrop-blur-md shadow-md">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t.hero.bimViewport.clashAlert}</span>
          </div>

          {/* Technical Laser Scanning Beam */}
          <div
            className="pointer-events-none absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-300 to-transparent shadow-[0_0_15px_3px_rgba(45,212,191,0.8)] animate-[scan-beam_4s_ease-in-out_infinite]"
            aria-hidden="true"
          />

          {/* Shading Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-ink/60 via-transparent to-transparent" />

          {/* Interactive Inspection Nodes */}
          {filteredNodes.map((node) => {
            const isActive = activeNode === node.id;
            return (
              <div
                key={node.id}
                className="absolute z-20"
                style={{ left: node.x, top: node.y }}
              >
                <button
                  type="button"
                  aria-label={`${node.tag}: ${node.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveNode(isActive ? null : node.id);
                  }}
                  onMouseEnter={() => setActiveNode(node.id)}
                  className={cn(
                    "group relative flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition-all duration-300",
                    isActive
                      ? "border-teal-300 bg-teal-500 text-white scale-125 shadow-[0_0_20px_rgba(45,212,191,0.9)]"
                      : "border-white/50 bg-black/60 text-teal-300 backdrop-blur-md hover:border-teal-300 hover:scale-110",
                  )}
                >
                  <span className="size-2 rounded-full bg-current animate-pulse" />
                  <span
                    className={cn(
                      "absolute -inset-1.5 rounded-full border border-teal-400/40 opacity-0 transition-opacity",
                      isActive ? "opacity-100 animate-ping" : "group-hover:opacity-100",
                    )}
                  />
                </button>

                {/* Node Tooltip Card */}
                {isActive && (
                  <div className="absolute left-full top-1/2 z-30 ml-3 w-56 -translate-y-1/2 animate-in fade-in zoom-in-95 duration-200">
                    <div className="rounded-xl border border-teal-500/40 bg-brand-ink/95 p-3 text-white shadow-2xl backdrop-blur-xl">
                      <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300">
                          {node.tag}
                        </span>
                        <CheckCircle2 className="size-3 text-teal-400" />
                      </div>
                      <p className="mt-1.5 text-xs font-semibold text-white">
                        {node.title}
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                        {node.desc}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Model HUD Badges */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <div className="rounded-lg border border-white/20 bg-brand-ink/85 px-3 py-2 backdrop-blur-md">
              <p className="text-[11px] font-semibold text-teal-300">
                {featuredProject?.category ?? (isVi ? "Dự án Tiêu biểu" : "Featured BIM Project")}
              </p>
              <h2 className="text-sm font-semibold text-white truncate max-w-[240px] sm:max-w-xs">
                {featuredProject?.title ?? "High-Precision BIM Delivery"}
              </h2>
            </div>

            <Link
              href={
                featuredProject
                  ? ROUTES.projectDetail(featuredProject.slug)
                  : ROUTES.projects
              }
              className="flex items-center gap-1.5 rounded-lg border border-teal-400/50 bg-teal-500 px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur transition-all hover:bg-teal-400 hover:scale-105 active:scale-95"
            >
              <span>{isVi ? "Xem mô hình" : "Explore Case"}</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Bottom Status Ticker */}
        <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] text-slate-300">
          <div className="flex items-center gap-3 font-mono text-[10px]">
            <div className="flex items-center gap-1.5 font-medium text-slate-300">
              <Radio className="size-3 text-teal-400 animate-pulse" />
              <span>{t.hero.bimViewport.liveModelStatus}</span>
            </div>
            <span className="hidden md:inline text-white/20">|</span>
            <span className="hidden md:inline text-zinc-400">
              POS: [X:+124.8m Y:+45.2m Z:+18.0m]
            </span>
          </div>
          <span className="font-mono text-[10px] text-teal-300 font-medium">
            {isVi ? "Tọa độ WGS84 · Tỷ lệ 1:100" : "WGS84 Grid · 1:100 Scale"}
          </span>
        </div>
      </div>
    </div>
  );
}
