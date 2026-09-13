"use client";

import React, { useState } from "react";
import {
  X,
  Layers,
  ChevronRight,
  ChevronDown,
  Box,
  FileCode,
  ShieldCheck,
  Building2,
  Info,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import type { BimElementData } from "./types";

interface BimPropertyInspectorProps {
  element: BimElementData | null;
  onClose: () => void;
  isOpen: boolean;
}

export function BimPropertyInspector({
  element,
  onClose,
  isOpen,
}: BimPropertyInspectorProps) {
  const { t, locale } = useLanguage();
  const v = t.bimViewerPage.properties;
  const [activeTab, setActiveTab] = useState<"psets" | "tree">("psets");
  const [expandedPsets, setExpandedPsets] = useState<Record<string, boolean>>({
    Pset_General: true,
  });

  if (!isOpen) return null;

  const togglePset = (name: string) => {
    setExpandedPsets((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <aside
      className="pointer-events-auto absolute inset-x-3 bottom-12 z-30 flex max-h-[65vh] flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-950/95 text-white shadow-2xl backdrop-blur-2xl transition-all duration-300 sm:inset-x-auto sm:right-4 sm:top-20 sm:bottom-12 sm:max-h-none sm:w-96 sm:bg-slate-950/90"
      data-motion="tile"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <FileCode className="size-4 text-teal-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {v.title}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" />
        </button>
      </div>

      {element ? (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Element Summary Header */}
          <div className="border-b border-white/10 p-5 bg-teal-500/5">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-md bg-teal-500/20 px-2 py-0.5 font-mono text-[11px] font-bold text-teal-300 border border-teal-500/30">
                {element.ifcType}
              </span>
              <span className="font-mono text-[10px] text-slate-400 truncate max-w-[140px]">
                {element.guid}
              </span>
            </div>
            <h4 className="mt-2 text-sm font-bold text-white leading-snug">
              {element.name}
            </h4>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Building2 className="size-3 text-teal-400" /> {element.storey}
              </span>
              <span>·</span>
              <span className="truncate max-w-[200px] text-slate-300">
                {element.material}
              </span>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-white/10 bg-black/20 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("psets")}
              className={cn(
                "flex-1 py-2.5 text-center transition-colors",
                activeTab === "psets"
                  ? "border-b-2 border-teal-400 text-teal-300 bg-white/5"
                  : "text-slate-400 hover:text-slate-200",
              )}
            >
              {v.psetsTitle}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("tree")}
              className={cn(
                "flex-1 py-2.5 text-center transition-colors",
                activeTab === "tree"
                  ? "border-b-2 border-teal-400 text-teal-300 bg-white/5"
                  : "text-slate-400 hover:text-slate-200",
              )}
            >
              {v.spatialTree}
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {activeTab === "psets" ? (
              <>
                {/* Geometric Quantities */}
                {element.dimensions && (
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <h5 className="font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                      <Box className="size-3.5 text-teal-400" />
                      {v.geometryTitle}
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      {element.dimensions.length && (
                        <div className="bg-black/30 p-2 rounded-lg">
                          <span className="text-slate-400 block">{locale === "vi" ? "Dài (L)" : "Length (L)"}</span>
                          <span className="font-mono font-bold text-white">
                            {element.dimensions.length} m
                          </span>
                        </div>
                      )}
                      {element.dimensions.width && (
                        <div className="bg-black/30 p-2 rounded-lg">
                          <span className="text-slate-400 block">{locale === "vi" ? "Rộng (W)" : "Width (W)"}</span>
                          <span className="font-mono font-bold text-white">
                            {element.dimensions.width} m
                          </span>
                        </div>
                      )}
                      {element.dimensions.height && (
                        <div className="bg-black/30 p-2 rounded-lg">
                          <span className="text-slate-400 block">{locale === "vi" ? "Cao (H)" : "Height (H)"}</span>
                          <span className="font-mono font-bold text-white">
                            {element.dimensions.height} m
                          </span>
                        </div>
                      )}
                      {element.dimensions.volume && (
                        <div className="bg-black/30 p-2 rounded-lg">
                          <span className="text-slate-400 block">{locale === "vi" ? "Thể tích (V)" : "Volume (V)"}</span>
                          <span className="font-mono font-bold text-white">
                            {element.dimensions.volume} m³
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Property Sets */}
                {element.psets.map((pset) => {
                  const isExpanded = expandedPsets[pset.name] ?? true;
                  return (
                    <div
                      key={pset.name}
                      className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => togglePset(pset.name)}
                        className="flex w-full items-center justify-between p-3 font-bold text-slate-300 hover:bg-white/5"
                      >
                        <span className="font-mono text-teal-300 text-[11px]">
                          {pset.name}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="size-3.5" />
                        ) : (
                          <ChevronRight className="size-3.5" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="border-t border-white/10 divide-y divide-white/5 bg-black/20">
                          {pset.properties.map((prop) => (
                            <div
                              key={prop.name}
                              className="flex items-center justify-between p-2.5 text-[11px]"
                            >
                              <span className="text-slate-400">{prop.name}</span>
                              <span className="font-mono font-semibold text-white">
                                {prop.value} {prop.unit || ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            ) : (
              /* Spatial Hierarchy Tree */
              <div className="space-y-2 text-[11px]">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 text-slate-300">
                  <Building2 className="size-3.5 text-teal-400" />
                  <span>IfcProject: BIM4C Digital Campus</span>
                </div>
                <div className="ml-4 flex items-center gap-2 p-2 rounded-lg bg-white/5 text-slate-300 border-l border-teal-500/30">
                  <Building2 className="size-3.5 text-teal-400" />
                  <span>IfcSite: Lot 01 - Smart Construction Hub</span>
                </div>
                <div className="ml-8 flex items-center gap-2 p-2 rounded-lg bg-white/5 text-slate-300 border-l border-teal-500/30">
                  <Layers className="size-3.5 text-teal-400" />
                  <span>IfcBuildingStorey: {element.storey}</span>
                </div>
                <div className="ml-12 flex items-center gap-2 p-2 rounded-lg bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40">
                  <Box className="size-3.5 text-teal-300" />
                  <span>{element.name}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-400">
          <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-white/5 border border-white/10 text-teal-400">
            <Info className="size-6" />
          </div>
          <h4 className="text-sm font-bold text-white">{v.noSelection}</h4>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
            {v.noSelectionDesc}
          </p>
        </div>
      )}
    </aside>
  );
}
