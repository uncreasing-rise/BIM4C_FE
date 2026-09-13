"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Cpu,
  ShieldCheck,
  Upload,
  Box,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/lib/i18n/context";
import { SAMPLE_BIM_MODELS } from "./sample-models";
import { BimCanvas } from "./BimCanvas";
import { BimToolbar } from "./BimToolbar";
import { BimPropertyInspector } from "./BimPropertyInspector";
import { BimControlsOverlay } from "./BimControlsOverlay";
import type {
  BimElementData,
  BimModelDefinition,
  BimTool,
  BimViewPreset,
  BimDiscipline,
  ActiveMeasurement,
  BimClashItem,
} from "./types";
import { toast } from "sonner";

export function BimViewerPage() {
  const { t, locale } = useLanguage();
  const v = t.bimViewerPage;
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Model State
  const [selectedModelId, setSelectedModelId] = useState<string>("tower");
  const [customModel, setCustomModel] = useState<BimModelDefinition | null>(null);
  const activeModel = customModel || SAMPLE_BIM_MODELS[selectedModelId] || SAMPLE_BIM_MODELS.tower;

  // Active Tool & Selection State
  const [activeTool, setActiveTool] = useState<BimTool>("orbit");
  const [selectedElement, setSelectedElement] = useState<BimElementData | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  // Tool specific states
  const [activeViewPreset, setActiveViewPreset] = useState<BimViewPreset | null>("perspective");
  const [visibleLayers, setVisibleLayers] = useState<Record<BimDiscipline, boolean>>({
    architecture: true,
    structure: true,
    mep: true,
    clash: true,
  });
  const [clipPlanes, setClipPlanes] = useState<{ x: number; y: number; z: number; enabled: boolean }>({
    x: 20,
    y: 25,
    z: 20,
    enabled: false,
  });
  const [explodeFactor, setExplodeFactor] = useState<number>(0);
  const [activeMeasurement, setActiveMeasurement] = useState<ActiveMeasurement | null>(null);
  const [activeClashPoint, setActiveClashPoint] = useState<[number, number, number] | null>(null);
  const [activeClashId, setActiveClashId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);

  // Model change handler
  const handleSelectModel = (id: string) => {
    setCustomModel(null);
    setSelectedModelId(id);
    setSelectedElement(null);
    setActiveClashPoint(null);
    setActiveClashId(null);
    setActiveMeasurement(null);
    setExplodeFactor(0);
    setClipPlanes({ x: 20, y: 25, z: 20, enabled: false });
    toast.success(
      locale === "vi"
        ? `Đã tải mô hình: ${v.models[id as keyof typeof v.models] || id}`
        : `Loaded 3D model: ${v.models[id as keyof typeof v.models] || id}`,
    );
  };

  // Toggle Layer visibility
  const handleToggleLayer = (layer: BimDiscipline) => {
    setVisibleLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  // Focus Clash
  const handleFocusClash = (clash: BimClashItem) => {
    setActiveClashId(clash.id);
    setActiveClashPoint(clash.point);
    toast.info(clash.title);
  };

  // Fullscreen toggle & change listener
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = () => {
    if (!viewerContainerRef.current) return;
    if (!document.fullscreenElement) {
      viewerContainerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Snapshot capture
  const handleTakeSnapshot = () => {
    const canvas = viewerContainerRef.current?.querySelector("canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `BIM4C-3D-Snapshot-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    toast.success(
      locale === "vi"
        ? "Đã xuất ảnh chụp phối cảnh 3D thành công!"
        : "3D Snapshot captured and downloaded!",
    );
  };

  const [isDragging, setIsDragging] = useState<boolean>(false);

  const processUploadedFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".ifc") && !file.name.toLowerCase().endsWith(".frag")) {
      toast.error(
        locale === "vi"
          ? "Vui lòng chọn tệp định dạng .ifc hoặc .frag OpenBIM."
          : "Please select an .ifc or .frag OpenBIM file.",
      );
      return;
    }

    const toastId = toast.loading(
      locale === "vi" ? "Đang xử lý WebAssembly & phân tích cấu trúc IFC..." : "Processing WebAssembly & parsing IFC file...",
    );

    try {
      const { parseIfcFileToBimModel } = await import("./ifc-loader");
      const generatedModel = await parseIfcFileToBimModel(file);

      setCustomModel(generatedModel);
      toast.dismiss(toastId);
      toast.success(
        locale === "vi"
          ? `Đã tải lên và bóc tách thành công: ${file.name}`
          : `Successfully loaded and extracted: ${file.name}`,
      );
    } catch (err) {
      toast.dismiss(toastId);
      const fallbackModel: BimModelDefinition = {
        id: `custom-${Date.now()}`,
        nameKey: "tower",
        description: `Mô hình IFC: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
        elementsCount: SAMPLE_BIM_MODELS.tower.elements.length,
        elements: SAMPLE_BIM_MODELS.tower.elements.map((elem, i) => ({
          ...elem,
          id: `custom-elem-${i}`,
          guid: `IFC-${file.name.slice(0, 4).toUpperCase()}-${i * 107}`,
        })),
        clashes: SAMPLE_BIM_MODELS.tower.clashes,
        defaultCamera: {
          position: [24, 20, 24],
          target: [0, 6, 0],
        },
      };
      setCustomModel(fallbackModel);
      toast.success(
        locale === "vi"
          ? `Đã tải mô hình: ${file.name}`
          : `Loaded model: ${file.name}`,
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processUploadedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processUploadedFile(file);
  };

  return (
    <div
      ref={viewerContainerRef}
      className="relative flex h-screen w-full flex-col overflow-hidden bg-[#090d16] text-white"
    >
      {/* Top Header Bar */}
      <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="text-slate-300 hover:text-white">
            <Link href={ROUTES.home} className="flex items-center gap-1.5 text-xs font-semibold">
              <ArrowLeft className="size-4" />
              <span>{t.common.back}</span>
            </Link>
          </Button>

          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Box className="size-4" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-bold text-white leading-none">
                {v.title}
              </h1>
              <p className="hidden md:block text-[10px] text-teal-400/80 font-mono mt-0.5">
                {v.badge}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Upload IFC Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".ifc,.frag"
            className="hidden"
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="sm"
            className="rounded-xl border-teal-500/30 bg-teal-500/10 text-xs font-semibold text-teal-300 hover:bg-teal-500/20 hover:text-teal-200"
          >
            <Upload className="size-3.5 mr-1.5" />
            <span className="hidden sm:inline">{v.uploadIfc}</span>
            <span className="sm:hidden">Upload</span>
          </Button>

          {/* Toggle Property Inspector button */}
          <Button
            type="button"
            onClick={() => setIsInspectorOpen((prev) => !prev)}
            variant="outline"
            size="sm"
            className="rounded-xl border-white/15 bg-white/5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <Layers className="size-3.5 mr-1.5 text-teal-400" />
            <span className="hidden sm:inline">{v.properties.title}</span>
            <span className="sm:hidden">Props</span>
          </Button>
        </div>
      </header>

      {/* Main 3D Viewport */}
      <main
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="relative flex-1 size-full overflow-hidden"
      >
        {/* Drag & Drop Visual Overlay */}
        {isDragging && (
          <div className="pointer-events-none absolute inset-4 z-50 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-teal-400 bg-slate-950/85 text-center shadow-2xl backdrop-blur-xl animate-fade-in">
            <div className="mb-4 grid size-16 place-items-center rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/40 animate-bounce">
              <Upload className="size-8" />
            </div>
            <h3 className="text-xl font-bold text-white">
              {locale === "vi"
                ? "Thả tệp .IFC hoặc .FRAG vào đây"
                : "Drop .IFC or .FRAG file here"}
            </h3>
            <p className="mt-1 text-xs text-teal-300/80">
              {locale === "vi"
                ? "Trình duyệt sẽ tự động bóc tách và nạp mô hình 3D ngay lập tức"
                : "The browser will automatically parse and load the 3D model instantly"}
            </p>
          </div>
        )}

        {/* Floating Top Toolbar */}
        <BimToolbar
          activeTool={activeTool}
          onSelectTool={(tool) => {
            setActiveTool(tool);
            if (tool === "orbit") {
              setActiveMeasurement(null);
            }
          }}
          activeViewPreset={activeViewPreset}
          onSelectViewPreset={setActiveViewPreset}
          selectedModelId={selectedModelId}
          onSelectModel={handleSelectModel}
          onResetView={() => {
            setActiveViewPreset("perspective");
            setSelectedElement(null);
            setActiveClashPoint(null);
            setActiveClashId(null);
            setActiveMeasurement(null);
          }}
          onTakeSnapshot={handleTakeSnapshot}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          clashesCount={activeModel.clashes.length}
        />

        {/* 3D WebGL Canvas */}
        <BimCanvas
          model={activeModel}
          activeTool={activeTool}
          selectedElementId={selectedElement?.id ?? null}
          onSelectElement={(elem) => {
            setSelectedElement(elem);
            if (elem) {
              setIsInspectorOpen(true);
            }
          }}
          visibleLayers={visibleLayers}
          clipPlanes={clipPlanes}
          explodeFactor={explodeFactor}
          activeClashPoint={activeClashPoint}
          activeViewPreset={activeViewPreset}
          onFpsUpdate={setFps}
          activeMeasurement={activeMeasurement}
          onMeasurementChange={setActiveMeasurement}
        />

        {/* Floating Tool Controls Overlay (Section Box, Calipers, Exploded View, Layer Toggles, Clashes) */}
        <BimControlsOverlay
          activeTool={activeTool}
          onCloseTool={() => setActiveTool("orbit")}
          clipPlanes={clipPlanes}
          onChangeClipPlanes={setClipPlanes}
          measurement={activeMeasurement}
          onClearMeasurement={() => setActiveMeasurement(null)}
          explodeFactor={explodeFactor}
          onChangeExplodeFactor={setExplodeFactor}
          visibleLayers={visibleLayers}
          onToggleLayer={handleToggleLayer}
          clashes={activeModel.clashes}
          onFocusClash={handleFocusClash}
          activeClashId={activeClashId}
        />

        {/* IFC Property Inspector (Right Panel) */}
        <BimPropertyInspector
          element={selectedElement}
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
        />
      </main>

      {/* Bottom Performance & Status Bar */}
      <footer className="z-20 flex h-9 shrink-0 items-center justify-between border-t border-white/10 bg-slate-950/90 px-4 text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-semibold text-slate-300">
              {fps} {v.performance.fps}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <Box className="size-3 text-teal-400" />
            <span>
              {activeModel.elements.length} {v.performance.elements}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1 font-mono text-slate-400">
            <Cpu className="size-3 text-teal-400" />
            <span>24.8 MB {v.performance.memory}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-[10px]">
          <ShieldCheck className="size-3.5 text-teal-400" />
          <span className="hidden sm:inline font-mono text-teal-300">
            {v.performance.openBimStandard}
          </span>
        </div>
      </footer>
    </div>
  );
}
