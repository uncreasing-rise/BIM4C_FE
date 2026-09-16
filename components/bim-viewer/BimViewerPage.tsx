"use client";

import { useLanguage } from "@/lib/i18n/context";
import { ArrowLeft, Box, Layers, Upload } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { BimCanvas } from "./BimCanvas";
import { BimControlsOverlay } from "./BimControlsOverlay";
import { BimPropertyInspector } from "./BimPropertyInspector";
import { BimToolbar } from "./BimToolbar";
import { EMPTY_BIM_MODEL } from "./empty-model";
import type {
  ActiveMeasurement,
  BimClipPlanes,
  BimDiscipline,
  BimElementData,
  BimModelDefinition,
  BimTool,
  BimViewPreset,
} from "./types";
import { defaultClip, getModelBounds } from "./viewer-geometry";

export function BimViewerPage() {
  const { t, locale } = useLanguage();
  const vi = locale === "vi";
  const v = t.bimViewerPage;
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const taskRef = useRef<AbortController | null>(null);
  const dragDepth = useRef(0);
  const [selectedModelId, setSelectedModelId] = useState("empty");
  const [customModel, setCustomModel] = useState<BimModelDefinition | null>(
    null,
  );
  const model = customModel ?? EMPTY_BIM_MODEL;
  const bounds = useMemo(() => getModelBounds(model), [model]);
  const [activeTool, setActiveTool] = useState<BimTool>("orbit");
  const [selectedElement, setSelectedElement] = useState<BimElementData | null>(
    null,
  );
  const [inspector, setInspector] = useState(false);
  const [preset, setPreset] = useState<BimViewPreset>("perspective");
  const [viewRevision, setViewRevision] = useState(0);
  const [snapshotRevision, setSnapshotRevision] = useState(0);
  const [layers, setLayers] = useState<Record<BimDiscipline, boolean>>({
    architecture: true,
    structure: true,
    mep: true,
    clash: true,
  });
  const [clip, setClip] = useState<BimClipPlanes>(() =>
    defaultClip(getModelBounds(EMPTY_BIM_MODEL)),
  );
  const [explode, setExplode] = useState(0);
  const [measurement, setMeasurement] = useState<ActiveMeasurement | null>(
    null,
  );
  const [clashPoint, setClashPoint] = useState<[number, number, number] | null>(
    null,
  );
  const [clashId, setClashId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState<{
    name: string;
    percent: number;
  } | null>(null);
  const [stats, setStats] = useState({ bytes: 0, triangles: 0 });
  useEffect(() => {
    const listener = () =>
      setFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", listener);
    return () => {
      taskRef.current?.abort();
      document.removeEventListener("fullscreenchange", listener);
    };
  }, []);
  const cancelLoad = () => {
    taskRef.current?.abort();
    taskRef.current = null;
    setLoading(null);
  };
  const chooseView = (view: BimViewPreset) => {
    setPreset(view);
    setViewRevision((n) => n + 1);
    setClashPoint(null);
    setClashId(null);
  };
  const resetModelState = (next: BimModelDefinition) => {
    setSelectedElement(null);
    setInspector(false);
    setMeasurement(null);
    setClashPoint(null);
    setClashId(null);
    setExplode(0);
    setClip(defaultClip(getModelBounds(next)));
    setActiveTool("orbit");
    chooseView("perspective");
    setStats({ bytes: 0, triangles: 0 });
  };
  const load = async (input: File) => {
    if (!input.name.toLowerCase().endsWith(".ifc")) {
      toast.error(
        vi ? "Vui lòng chọn tệp .ifc." : "Please select an .ifc file.",
      );
      return;
    }
    cancelLoad();
    const controller = new AbortController();
    taskRef.current = controller;
    setLoading({
      name: input.name,
      percent: 0,
    });
    try {
      const file = input;
      const { parseIfcFileToBimModel } = await import("./ifc-loader");
      controller.signal.throwIfAborted();
      const parsed = await parseIfcFileToBimModel(
        file,
        (percent) => {
          if (!controller.signal.aborted)
            setLoading({ name: file.name, percent });
        },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      resetModelState(parsed);
      setCustomModel(parsed);
      setSelectedModelId("uploaded");
      toast.success(
        vi
          ? `Đã tải ${parsed.elements.length} cấu kiện có hình học.`
          : `Loaded ${parsed.elements.length} elements with geometry.`,
      );
    } catch (error) {
      if (controller.signal.aborted) return;
      const code = error instanceof Error ? error.message : "";
      const messages: Record<string, [string, string]> = {
        IFC_FILE_EMPTY: ["Tệp IFC rỗng.", "The IFC file is empty."],
        IFC_NO_GEOMETRY: [
          "Tệp không chứa hình học 3D được hỗ trợ. Không có khối thay thế nào được tạo.",
          "This file contains no supported 3D geometry. No substitute shapes were created.",
        ],
        IFC_WORKER_FAILED: [
          "Không thể khởi tạo bộ đọc IFC. Hãy tải lại trang và thử lại.",
          "The IFC reader could not start. Reload the page and retry.",
        ],
      };
      toast.error(
        messages[code]?.[vi ? 0 : 1] ??
          (vi
            ? "Không đọc được IFC. Kiểm tra tệp, kết nối và thử lại."
            : "Unable to read IFC. Check the file and connection, then retry."),
        { duration: 7000 },
      );
    } finally {
      if (taskRef.current === controller) {
        taskRef.current = null;
        setLoading(null);
      }
    }
  };

  const snapshot = (data: string | null) => {
    if (!data) {
      toast.error(
        vi ? "Không thể chụp ảnh 3D." : "Unable to capture the 3D view.",
      );
      return;
    }
    const a = document.createElement("a");
    a.href = data;
    a.download = `BIM4C-${Date.now()}.png`;
    a.click();
    toast.success(vi ? "Đã xuất ảnh 3D." : "3D image exported.");
  };
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (containerRef.current?.requestFullscreen)
        await containerRef.current.requestFullscreen();
      else throw Error("unsupported");
    } catch {
      toast.info(
        vi
          ? "Trình duyệt chưa hỗ trợ toàn màn hình tại đây."
          : "Fullscreen is unavailable in this browser.",
      );
    }
  };
  const diagnostics = model.diagnostics;
  const hasWarnings = diagnostics && Object.values(diagnostics).some(Boolean);
  const smallScreen = () => window.innerWidth < 1024;
  return (
    <div
      ref={containerRef}
      className="flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-[#090d16] text-white"
    >
      <header className="flex min-h-14 shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-slate-950 px-2 py-2 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Link
            href="/"
            aria-label={t.common.back}
            className="flex min-h-10 shrink-0 items-center gap-1 rounded-lg px-2 text-xs hover:bg-white/10"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">{t.common.back}</span>
          </Link>
          <Box className="hidden size-5 shrink-0 text-teal-300 sm:block" />
          <h1
            className="min-w-0 truncate text-xs font-bold sm:text-sm"
            title={v.title}
          >
            {v.title}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <input
            ref={inputRef}
            type="file"
            accept=".ifc"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void load(file);
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label={v.uploadIfc}
            title={v.uploadIfc}
            className="flex min-h-10 items-center gap-1 rounded-lg border border-teal-500/30 bg-teal-500/10 px-2 text-xs text-teal-300"
          >
            <Upload className="size-4" />
            <span className="hidden sm:inline">{v.uploadIfc}</span>
          </button>
          <button
            type="button"
            aria-label={v.properties.title}
            title={v.properties.title}
            aria-expanded={inspector}
            onClick={() => {
              setInspector(!inspector);
              if (!inspector && smallScreen()) setActiveTool("orbit");
            }}
            className="flex min-h-10 items-center gap-1 rounded-lg border border-white/15 px-2 text-xs"
          >
            <Layers className="size-4 text-teal-300" />
            <span className="hidden lg:inline">{v.properties.title}</span>
          </button>
        </div>
      </header>
      {loading && (
        <div
          role="status"
          className="flex shrink-0 items-center gap-3 bg-teal-950 px-3 py-2 text-xs"
        >
          <span className="min-w-0 flex-1 truncate">
            {vi ? "Đang đọc" : "Reading"}: {loading.name} ({loading.percent}%)
          </span>
          <button
            type="button"
            onClick={cancelLoad}
            className="shrink-0 rounded border px-3 py-1"
          >
            {vi ? "Hủy" : "Cancel"}
          </button>
        </div>
      )}
      {hasWarnings && (
        <div
          role="status"
          className="shrink-0 bg-amber-950 px-3 py-2 text-xs text-amber-100"
        >
          {vi
            ? `Không có hình học: ${diagnostics.missingGeometry}; lỗi hình học: ${diagnostics.failedGeometry}; thuộc tính đọc chưa đầy đủ: ${diagnostics.failedProperties}.`
            : `Without geometry: ${diagnostics.missingGeometry}; geometry errors: ${diagnostics.failedGeometry}; incomplete properties: ${diagnostics.failedProperties}.`}
        </div>
      )}
      <main
        className="flex min-h-0 flex-1 flex-col"
        onDragEnter={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            dragDepth.current++;
            setDragging(true);
          }
        }}
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) e.preventDefault();
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (!dragDepth.current) setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          dragDepth.current = 0;
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) void load(file);
        }}
      >
        <BimToolbar
          activeTool={activeTool}
          onSelectTool={(tool) => {
            setActiveTool(tool);
            if (tool !== "measure") setMeasurement(null);
            if (tool !== "orbit" && smallScreen()) setInspector(false);
          }}
          activeViewPreset={preset}
          onSelectViewPreset={chooseView}
          selectedModelId={selectedModelId}
          uploadedName={customModel?.filename}
          onResetView={() => {
            chooseView("perspective");
            setSelectedElement(null);
            setMeasurement(null);
          }}
          onTakeSnapshot={() => setSnapshotRevision((n) => n + 1)}
          isFullscreen={fullscreen}
          onToggleFullscreen={() => void toggleFullscreen()}
          clashesCount={model.clashes.length}
        />
        <div className="relative flex min-h-0 flex-1">
          {!customModel && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <button
                type="button"
                className="pointer-events-auto rounded-xl bg-teal-400 px-6 py-4 font-semibold text-slate-950"
                onClick={() => inputRef.current?.click()}
              >
                {vi
                  ? "Chọn tệp IFC để xem mô hình"
                  : "Choose an IFC file to view"}
              </button>
            </div>
          )}
          <BimCanvas
            model={model}
            activeTool={activeTool}
            selectedElementId={selectedElement?.id ?? null}
            onSelectElement={(e) => {
              setSelectedElement(e);
              if (e) {
                setInspector(true);
                if (smallScreen()) setActiveTool("orbit");
              }
            }}
            visibleLayers={layers}
            clipPlanes={clip}
            explodeFactor={explode}
            activeClashPoint={clashPoint}
            activeViewPreset={preset}
            viewRevision={viewRevision}
            snapshotRevision={snapshotRevision}
            onSnapshot={snapshot}
            onStats={setStats}
            activeMeasurement={measurement}
            onMeasurementChange={setMeasurement}
          />
          <BimControlsOverlay
            activeTool={activeTool}
            onCloseTool={() => setActiveTool("orbit")}
            clipPlanes={clip}
            onChangeClipPlanes={(next) => {
              setClip(next);
              setMeasurement(null);
            }}
            bounds={bounds}
            measurement={measurement}
            onClearMeasurement={() => setMeasurement(null)}
            explodeFactor={explode}
            onChangeExplodeFactor={(n) => {
              setExplode(n);
              setMeasurement(null);
              setClashPoint(null);
              setClashId(null);
            }}
            visibleLayers={layers}
            onToggleLayer={(layer) => {
              setLayers((p) => ({ ...p, [layer]: !p[layer] }));
              setSelectedElement(null);
              setMeasurement(null);
            }}
            clashes={model.clashes}
            onFocusClash={(clash) => {
              setExplode(0);
              setClip((p) => ({ ...p, enabled: false }));
              setLayers({
                architecture: true,
                structure: true,
                mep: true,
                clash: true,
              });
              setClashId(clash.id);
              setClashPoint([...clash.point]);
            }}
            activeClashId={clashId}
          />
          <BimPropertyInspector
            key={selectedElement?.id ?? "empty"}
            element={selectedElement}
            isOpen={inspector}
            onClose={() => setInspector(false)}
          />
          {dragging && (
            <div className="pointer-events-none absolute inset-2 z-50 grid place-items-center rounded-xl border-2 border-dashed border-teal-400 bg-slate-950/90 p-4 text-center">
              {vi
                ? "Thả tệp IFC để xem mô hình"
                : "Drop an IFC file to view the model"}
            </div>
          )}
        </div>
      </main>
      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-white/10 px-3 py-2 text-[10px] text-slate-400">
        <span>
          {model.elements.length} {v.performance.elements}
          <span className="hidden sm:inline">
            {" "}
            · {stats.triangles.toLocaleString(locale)}{" "}
            {vi ? "tam giác" : "triangles"} ·{" "}
            {(stats.bytes / 1048576).toFixed(1)} MB{" "}
            {vi ? "bộ đệm hình học" : "geometry buffers"}
          </span>
        </span>
        <span
          className="max-w-full truncate text-teal-300"
          title={model.filename}
        >
          {model.source === "ifc"
            ? `${model.schema} · ${model.filename}`
            : vi
              ? "Chưa tải mô hình IFC"
              : "No IFC model loaded"}
        </span>
      </footer>
    </div>
  );
}
