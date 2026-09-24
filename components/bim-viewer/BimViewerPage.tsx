"use client";

import { useLanguage } from "@/lib/i18n/context";
import { ArrowLeft, Box, Download, Layers, Upload } from "lucide-react";
import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  BimCanvas,
  type CanvasModel,
  type SectionFitRequest,
  type ViewRequest,
} from "./BimCanvas";
import { BimControlsOverlay } from "./BimControlsOverlay";
import { BimModelsPanel } from "./BimModelsPanel";
import {
  BimPropertyInspector,
  type ElementCoordinates,
} from "./BimPropertyInspector";
import { BimToolbar } from "./BimToolbar";
import { detectAabbClashes } from "./clash-detection";
import { EMPTY_BIM_MODEL } from "./empty-model";
import { sessionSchema } from "./session-schema";
import {
  applyPlacement,
  modelOrigin,
  placedBounds,
  resolvePlacement,
  sceneToWorld,
  unionBounds,
  worldToMap,
  type Vec3,
} from "./federation";
import type {
  BimClashItem,
  BimClipPlanes,
  BimLocalIssue,
  BimDiscipline,
  BimElementData,
  BimModelDefinition,
  BimSavedView,
  BimTool,
  BimViewPreset,
  FederatedModel,
  MeasureMode,
  MeasurePoint,
  Measurement,
  SnapSettings,
} from "./types";
import { defaultClip, getModelBounds } from "./viewer-geometry";

import { ui } from "@/lib/i18n/ui";
const EMPTY_BOUNDS = getModelBounds(EMPTY_BIM_MODEL);
const ALL_LAYERS: Record<BimDiscipline, boolean> = {
  architecture: true,
  structure: true,
  mep: true,
  clash: true,
};
const SESSION_KEY = "bim4c.viewer.session.v1";

/** Element ids are per file; prefix them so several files never collide. */
function namespaced(
  key: string,
  model: BimModelDefinition,
): BimModelDefinition {
  return {
    ...model,
    elements: model.elements.map((e) => ({
      ...e,
      id: `${key}/${e.id}`,
      modelKey: key,
    })),
    clashes: model.clashes.map((c) => ({ ...c, id: `${key}/${c.id}` })),
  };
}

export function BimViewerPage() {
  const { t, locale } = useLanguage();
  const v = t.bimViewerPage;
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<BimSavedView["camera"]>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionInputRef = useRef<HTMLInputElement>(null);
  const sessionReadyRef = useRef(false);
  const taskRef = useRef<AbortController | null>(null);
  const keyCounter = useRef(0);
  const dragDepth = useRef(0);

  const [models, setModels] = useState<FederatedModel[]>([]);
  // Mirrors `models` for the async loader, which must know whether a file is the first.
  const modelsRef = useRef<FederatedModel[]>([]);
  // Fixed once the first model loads, so measurements stay valid as files come and go.
  const [sceneOrigin, setSceneOrigin] = useState<Vec3>([0, 0, 0]);
  const [activeTool, setActiveTool] = useState<BimTool>("orbit");
  const [selectedElement, setSelectedElement] = useState<BimElementData | null>(
    null,
  );
  const [selectedElementIds, setSelectedElementIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [hiddenElements, setHiddenElements] = useState<Set<string>>(
    () => new Set(),
  );
  const [inspector, setInspector] = useState(false);
  const [viewRequest, setViewRequest] = useState<ViewRequest>({
    revision: 0,
    preset: "perspective",
  });
  const [sectionFit, setSectionFit] = useState<SectionFitRequest>({
    revision: 0,
    target: "all",
  });
  const [snapshotRevision, setSnapshotRevision] = useState(0);
  const [layers, setLayers] = useState(ALL_LAYERS);
  const [clip, setClip] = useState<BimClipPlanes>(() =>
    defaultClip(EMPTY_BOUNDS),
  );
  const [explode, setExplode] = useState(0);
  const [measureMode, setMeasureMode] = useState<MeasureMode>("distance");
  const [snapSettings, setSnapSettings] = useState<SnapSettings>({
    vertex: true,
    midpoint: true,
    edge: true,
  });
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [pendingPoints, setPendingPoints] = useState<MeasurePoint[]>([]);
  const pendingPoint = pendingPoints.at(-1) ?? null;
  const setPendingPoint = (point: MeasurePoint | null) => setPendingPoints(point ? [point] : []);
  const [clashPoint, setClashPoint] = useState<[number, number, number] | null>(
    null,
  );
  const [clashId, setClashId] = useState<string | null>(null);
  const [localClashes, setLocalClashes] = useState<BimClashItem[]>([]);
  const [savedViews, setSavedViews] = useState<BimSavedView[]>([]);
  const [issues, setIssues] = useState<BimLocalIssue[]>([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState<{
    name: string;
    percent: number;
    index: number;
    total: number;
  } | null>(null);
  const [stats, setStats] = useState({ bytes: 0, triangles: 0 });
  const demoLoadedRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (raw) {
          const session = sessionSchema.parse(JSON.parse(raw));
          if (Array.isArray(session.hiddenElements))
            setHiddenElements(new Set(session.hiddenElements));
          if (Array.isArray(session.measurements))
            setMeasurements(session.measurements);
          if (Array.isArray(session.savedViews))
            setSavedViews(session.savedViews);
          if (Array.isArray(session.issues)) setIssues(session.issues);
          if (session.layers) setLayers({ ...ALL_LAYERS, ...session.layers });
          if (typeof session.explode === "number") setExplode(session.explode);
        }
      } catch {
        // Storage may be disabled; keep the viewer usable in memory.
      } finally {
        sessionReadyRef.current = true;
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!sessionReadyRef.current) return;
    try {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          hiddenElements: [...hiddenElements],
          measurements,
          savedViews,
          issues,
          layers,
          explode,
        }),
      );
    } catch {
      /* Storage quota/privacy settings must not crash the viewer. */
    }
  }, [explode, hiddenElements, issues, layers, measurements, savedViews]);

  const canvasModels = useMemo<CanvasModel[]>(
    () =>
      models.map((m) => ({
        key: m.key,
        model: m.model,
        visible: m.visible,
        placement: resolvePlacement(m, sceneOrigin),
      })),
    [models, sceneOrigin],
  );
  const sceneBounds = useMemo(
    () =>
      unionBounds(
        canvasModels.map((m) =>
          placedBounds(getModelBounds(m.model), m.placement),
        ),
      ) ?? EMPTY_BOUNDS,
    [canvasModels],
  );
  const mapConversion = useMemo(
    () => models.find((m) => m.model.mapConversion)?.model.mapConversion,
    [models],
  );
  // While the section box is off it always spans every loaded model, so
  // enabling it never hides a file that was added later.
  const effectiveClip = useMemo(
    () =>
      clip.enabled ? clip : { ...defaultClip(sceneBounds), enabled: false },
    [clip, sceneBounds],
  );
  const allClashes = useMemo(
    () => [...models.flatMap((m) => m.model.clashes), ...localClashes],
    [localClashes, models],
  );
  const elementCount = models.reduce((n, m) => n + m.model.elements.length, 0);

  useEffect(() => {
    const listener = () =>
      setFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", listener);
    return () => {
      taskRef.current?.abort();
      document.removeEventListener("fullscreenchange", listener);
    };
  }, []);

  useEffect(() => {
    if (activeTool !== "measure") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPendingPoint(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeTool]);

  const requestView = useCallback(
    (preset: BimViewPreset, modelKey?: string, elementIds?: string[]) => {
      setViewRequest((r) => ({
        revision: r.revision + 1,
        preset,
        modelKey,
        elementIds,
      }));
      setClashPoint(null);
      setClashId(null);
    },
    [],
  );

  const runLocalClashCheck = useCallback(() => {
    const clashes = detectAabbClashes(canvasModels);
    setLocalClashes(clashes);
    setActiveTool("clashes");
    toast.success(
      clashes.length
        ? `${clashes.length} local clash candidates found.`
        : "No local clash candidates found.",
    );
  }, [canvasModels]);

  const saveView = useCallback(
    (name: string) => {
      setSavedViews((views) => [
        ...views,
        {
          id: `view-${Date.now()}`,
          name,
          preset: viewRequest.preset,
          modelKey: viewRequest.modelKey,
          elementIds: [...selectedElementIds],
          camera: cameraRef.current,
          clip: { ...effectiveClip },
          hiddenElements: [...hiddenElements],
          layers: { ...layers },
          explode,
        },
      ]);
    },
    [selectedElementIds, viewRequest.modelKey, viewRequest.preset, effectiveClip, hiddenElements, layers, explode],
  );

  const applySavedView = useCallback(
    (view: BimSavedView) => {
      const elements = modelsRef.current.flatMap((model) => model.model.elements);
      const selected = elements.filter((element) => view.elementIds.includes(element.id));
      setSelectedElementIds(new Set(selected.map((element) => element.id)));
      setSelectedElement(selected[0] ?? null);
      setPendingPoint(null);
      setActiveTool("orbit");
      if (view.clip) setClip(view.clip);
      if (view.hiddenElements) setHiddenElements(new Set(view.hiddenElements));
      if (view.layers) setLayers(view.layers);
      if (view.explode !== undefined) setExplode(view.explode);
      setViewRequest((current) => ({ revision: current.revision + 1, preset: view.preset, modelKey: view.modelKey, elementIds: view.elementIds, camera: view.camera }));
      setClashPoint(null);
    },
    [],
  );

  const addLocalIssue = useCallback(
    (title: string, description: string) => {
      if (!selectedElement?.id) return;
      setIssues((current) => [
        ...current,
        {
          id: `issue-${Date.now()}`,
          title,
          description,
          elementIds: [...selectedElementIds],
          clashId: clashId ?? undefined,
          status: "open",
          createdAt: new Date().toISOString(),
        },
      ]);
    },
    [clashId, selectedElement, selectedElementIds],
  );

  const cancelLoad = () => {
    taskRef.current?.abort();
    taskRef.current = null;
    setLoading(null);
  };

  const resetScene = () => {
    setSelectedElement(null);
    setSelectedElementIds(new Set());
    setHiddenElements(new Set());
    setInspector(false);
    setMeasurements([]);
    setPendingPoint(null);
    setClashPoint(null);
    setClashId(null);
    setExplode(0);
    setActiveTool("orbit");
    setStats({ bytes: 0, triangles: 0 });
  };

  const loadFiles = async (files: File[]) => {
    const ifc = files.filter((f) => f.name.toLowerCase().endsWith(".ifc"));
    if (ifc.length < files.length)
      toast.error(ui(locale).bimViewerPage.onlyIfcFilesAreAccepted);
    if (!ifc.length) return;
    cancelLoad();
    const controller = new AbortController();
    taskRef.current = controller;
    const { parseIfcFileToBimModel } = await import("./ifc-loader");
    // Sequential on purpose: each file gets its own WASM worker and heap.
    for (const [index, file] of ifc.entries()) {
      if (controller.signal.aborted) break;
      setLoading({
        name: file.name,
        percent: 0,
        index: index + 1,
        total: ifc.length,
      });
      try {
        const parsed = await parseIfcFileToBimModel(
          file,
          (percent) => {
            if (!controller.signal.aborted)
              setLoading({
                name: file.name,
                percent,
                index: index + 1,
                total: ifc.length,
              });
          },
          controller.signal,
        );
        if (controller.signal.aborted) break;
        const key = `m${++keyCounter.current}`;
        const federated: FederatedModel = {
          key,
          model: namespaced(key, parsed),
          visible: true,
          alignment: "shared",
          offset: { x: 0, y: 0, z: 0, rotationDeg: 0 },
        };
        if (!modelsRef.current.length) {
          // First model: anchor the scene at its origin and frame it.
          const origin = modelOrigin(parsed);
          setSceneOrigin(origin);
        }
        modelsRef.current = [...modelsRef.current, federated];
        setModels(modelsRef.current);
        toast.success(
          ui(locale).formats.modelAdded(file.name, parsed.elements.length),
        );
      } catch (error) {
        if (controller.signal.aborted) break;
        const code = error instanceof Error ? error.message : "";
        toast.error(
          `${file.name}: ${
            ui(locale).formats.ifcErrors[code] ??
            ui(locale).bimViewerPage.unableToReadIFCCheck
          }`,
          { duration: 7000 },
        );
      }
    }
    if (taskRef.current === controller) {
      taskRef.current = null;
      setLoading(null);
    }
    // Frame everything once the batch is in, so newly added files are visible.
    if (modelsRef.current.length) requestView("perspective");
  };

  // The public demo is a real IFC file, so the viewer is useful immediately
  // after opening the route while still allowing users to add their own files.
  useEffect(() => {
    if (demoLoadedRef.current || modelsRef.current.length) return;
    demoLoadedRef.current = true;
    const controller = new AbortController();
    taskRef.current = controller;
    void (async () => {
      try {
        setLoading({
          name: "bim4c-commercial-tower.ifc",
          percent: 0,
          index: 1,
          total: 1,
        });
        const { parseIfcFromUrl } = await import("./ifc-loader");
        const parsed = await parseIfcFromUrl(
          "/models/bim4c-commercial-tower.ifc",
          "bim4c-commercial-tower.ifc",
          controller.signal,
        );
        if (controller.signal.aborted || modelsRef.current.length) return;
        const key = `m${++keyCounter.current}`;
        const model: FederatedModel = {
          key,
          model: namespaced(key, parsed),
          visible: true,
          alignment: "shared",
          offset: { x: 0, y: 0, z: 0, rotationDeg: 0 },
        };
        modelsRef.current = [model];
        setSceneOrigin(modelOrigin(parsed));
        setModels(modelsRef.current);
        requestView("perspective");
        toast.success(
          ui(locale).formats.modelAdded(
            parsed.filename ?? "bim4c-commercial-tower.ifc",
            parsed.elements.length,
          ),
        );
      } catch {
        if (!controller.signal.aborted) {
          toast.error(ui(locale).bimViewerPage.unableToReadIFCCheck, {
            duration: 7000,
          });
        }
      } finally {
        if (taskRef.current === controller) {
          taskRef.current = null;
          setLoading(null);
        }
      }
    })();
    return () => {
      controller.abort();
      demoLoadedRef.current = false;
    };
  }, [locale, requestView]);

  const commitModels = (next: FederatedModel[]) => {
    modelsRef.current = next;
    setModels(next);
  };
  const updateModel = (key: string, patch: Partial<FederatedModel>) => {
    const next = modelsRef.current.map((m) => (m.key === key ? { ...m, ...patch } : m));
    const owner = next.find((m) => m.key === key);
    if (owner && (patch.offset || patch.alignment)) {
      const placement = resolvePlacement(owner, sceneOrigin);
      setMeasurements((list) => list.map((measurement) => ({ ...measurement, points: measurement.points.map((point) => {
        if (point.modelKey !== key || !point.localPoint) return point;
        const [x, y, z] = applyPlacement(point.localPoint, placement);
        return { ...point, x, y, z };
      }) })));
      setPendingPoint(null);
      setLocalClashes([]);
    }
    commitModels(next);
  };

  const removeModel = (key: string) => {
    setSelectedElementIds((ids) => new Set([...ids].filter((id) => !id.startsWith(`${key}/`))));
    setHiddenElements((ids) => new Set([...ids].filter((id) => !id.startsWith(`${key}/`))));
    setMeasurements((list) => list.filter((measurement) => !measurement.points.some((point) => point.modelKey === key)));
    setPendingPoint(null);
    setLocalClashes([]);
    const next = modelsRef.current.filter((m) => m.key !== key);
    commitModels(next);
    if (!next.length) {
      setSceneOrigin([0, 0, 0]);
      setClip(defaultClip(EMPTY_BOUNDS));
      resetScene();
    }
    if (selectedElement?.modelKey === key) {
      setSelectedElement(null);
      setSelectedElementIds((ids) => {
        const next = new Set(ids);
        for (const id of next) if (id.startsWith(`${key}/`)) next.delete(id);
        return next;
      });
      setInspector(false);
    }
  };

  const onMeasurePoint = (point: MeasurePoint) => {
    const id = `ms-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    if (measureMode === "point") {
      setMeasurements((list) => [
        ...list,
        { id, mode: "point", points: [point] },
      ]);
      return;
    }
    const points = [...pendingPoints, point];
    if (points.length < (measureMode === "distance" ? 2 : 3)) {
      setPendingPoints(points);
      return;
    }
    setMeasurements((list) => [
      ...list,
      { id, mode: measureMode, points },
    ]);
    setPendingPoint(null);
  };

  const selectedCoordinates = useMemo<ElementCoordinates | null>(() => {
    if (!selectedElement) return null;
    const owner = canvasModels.find((m) => m.key === selectedElement.modelKey);
    if (!owner) return null;
    const center = sceneToWorld(
      applyPlacement(selectedElement.position, owner.placement),
      sceneOrigin,
    );
    const half = selectedElement.size[1] / 2;
    return {
      modelName: owner.model.filename ?? owner.key,
      center,
      bottom: center[2] - half,
      top: center[2] + half,
      map: mapConversion ? worldToMap(center, mapConversion) : undefined,
    };
  }, [selectedElement, canvasModels, sceneOrigin, mapConversion]);

  const snapshot = (data: string | null) => {
    if (!data) {
      toast.error(ui(locale).bimViewerPage.unableToCaptureThe3D);
      return;
    }
    const a = document.createElement("a");
    a.href = data;
    a.download = `BIM4C-${Date.now()}.png`;
    a.click();
    toast.success(ui(locale).bimViewerPage.t3DImageExported);
  };
  const exportSession = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      hiddenElements: [...hiddenElements],
      measurements,
      savedViews,
      issues,
      layers,
      explode,
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `BIM4C-session-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const importSession = async (file: File) => {
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error("Session too large");
      const session = sessionSchema.parse(JSON.parse(await file.text()));
      if (Array.isArray(session.hiddenElements))
        setHiddenElements(new Set(session.hiddenElements));
      if (Array.isArray(session.measurements))
        setMeasurements(session.measurements);
      if (Array.isArray(session.savedViews)) setSavedViews(session.savedViews);
      if (Array.isArray(session.issues)) setIssues(session.issues);
      if (session.layers) setLayers({ ...ALL_LAYERS, ...session.layers });
      if (typeof session.explode === "number") setExplode(session.explode);
      toast.success("Viewer session imported locally.");
    } catch {
      toast.error("Invalid BIM4C session JSON.");
    }
  };
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (containerRef.current?.requestFullscreen)
        await containerRef.current.requestFullscreen();
      else throw Error("unsupported");
    } catch {
      toast.info(ui(locale).bimViewerPage.fullscreenIsUnavailableInThis);
    }
  };

  const diagnostics = models.reduce(
    (sum, m) => ({
      missingGeometry:
        sum.missingGeometry + (m.model.diagnostics?.missingGeometry ?? 0),
      failedGeometry:
        sum.failedGeometry + (m.model.diagnostics?.failedGeometry ?? 0),
      failedProperties:
        sum.failedProperties + (m.model.diagnostics?.failedProperties ?? 0),
    }),
    { missingGeometry: 0, failedGeometry: 0, failedProperties: 0 },
  );
  const hasWarnings = Object.values(diagnostics).some(Boolean);
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
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = "";
              if (files.length) void loadFiles(files);
            }}
          />
          <input
            ref={sessionInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void importSession(file);
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label={v.uploadIfc}
            title={ui(locale).bimViewerPage.addOneOrMoreIFC}
            className="flex min-h-10 items-center gap-1 rounded-lg border border-teal-500/30 bg-teal-500/10 px-2 text-xs text-teal-300"
          >
            <Upload className="size-4" />
            <span className="hidden sm:inline">
              {models.length
                ? ui(locale).bimViewerPage.addIFCFiles
                : v.uploadIfc}
            </span>
          </button>
          <button
            type="button"
            onClick={exportSession}
            aria-label="Export local viewer session"
            title="Export local viewer session"
            className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-white/15 px-2 text-xs hover:bg-white/10"
          >
            <Download className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => sessionInputRef.current?.click()}
            aria-label="Import local viewer session"
            title="Import local viewer session"
            className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-white/15 px-2 text-xs hover:bg-white/10"
          >
            <Upload className="size-4" />
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
            {ui(locale).bimViewerPage.reading}
            {loading.total > 1
              ? ` (${loading.index}/${loading.total})`
              : ""}: {loading.name} ({loading.percent}%)
          </span>
          <button
            type="button"
            onClick={cancelLoad}
            className="shrink-0 rounded border px-3 py-1"
          >
            {ui(locale).bimViewerPage.cancel}
          </button>
        </div>
      )}
      {hasWarnings && (
        <div
          role="status"
          className="shrink-0 bg-amber-950 px-3 py-2 text-xs text-amber-100"
        >
          {ui(locale).formats.diagnostics(
            diagnostics.missingGeometry,
            diagnostics.failedGeometry,
            diagnostics.failedProperties,
          )}
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
          const files = Array.from(e.dataTransfer.files);
          if (files.length) void loadFiles(files);
        }}
      >
        <BimToolbar
          activeTool={activeTool}
          onSelectTool={(tool) => {
            setActiveTool(tool);
            if (tool === "measure") setExplode(0);
            if (tool !== "measure") setPendingPoint(null);
            if (tool !== "orbit" && smallScreen()) setInspector(false);
          }}
          activeViewPreset={viewRequest.preset}
          onSelectViewPreset={(preset) => requestView(preset)}
          modelCount={models.length}
          onResetView={() => {
            requestView("perspective");
            setSelectedElement(null);
            setSelectedElementIds(new Set());
            setPendingPoint(null);
          }}
          onTakeSnapshot={() => setSnapshotRevision((n) => n + 1)}
          isFullscreen={fullscreen}
          onToggleFullscreen={() => void toggleFullscreen()}
          clashesCount={allClashes.length}
        />
        <div className="relative flex min-h-0 flex-1">
          {!models.length && !loading && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <button
                type="button"
                className="pointer-events-auto rounded-xl bg-teal-400 px-6 py-4 font-semibold text-slate-950"
                onClick={() => inputRef.current?.click()}
              >
                {ui(locale).bimViewerPage.chooseOneOrMoreIFC}
              </button>
            </div>
          )}
          <BimCanvas
            onCameraChange={(camera) => { cameraRef.current = camera; }}
            models={canvasModels}
            sceneBounds={sceneBounds}
            sceneOrigin={sceneOrigin}
            mapConversion={mapConversion}
            activeTool={activeTool}
            selectedElementId={selectedElement?.id ?? null}
            selectedElementIds={selectedElementIds}
            hiddenElementIds={hiddenElements}
            onSelectElement={(e, append) => {
              if (!e) {
                setSelectedElement(null);
                setSelectedElementIds(new Set());
                return;
              }
              const next = append
                ? new Set(selectedElementIds)
                : new Set<string>();
              if (append && next.has(e.id)) next.delete(e.id);
              else next.add(e.id);
              setSelectedElementIds(next);
              if (!next.size) {
                setSelectedElement(null);
                setInspector(false);
                return;
              }
              const primary = next.has(e.id)
                ? e
                : (models
                    .flatMap((model) => model.model.elements)
                    .find((element) => next.has(element.id)) ?? null);
              setSelectedElement(primary);
              setInspector(Boolean(primary));
              if (smallScreen()) setActiveTool("orbit");
            }}
            visibleLayers={layers}
            clipPlanes={effectiveClip}
            onClipPlanesChange={setClip}
            sectionFitRequest={sectionFit}
            explodeFactor={explode}
            activeClashPoint={clashPoint}
            viewRequest={viewRequest}
            snapshotRevision={snapshotRevision}
            onSnapshot={snapshot}
            onStats={setStats}
            measureMode={measureMode}
            snapSettings={snapSettings}
            measurements={measurements}
            pendingPoint={pendingPoint}
            onMeasurePoint={onMeasurePoint}
            pendingPoints={pendingPoints}
          />
          {activeTool === "models" && (
            <BimModelsPanel
              models={models}
              onClose={() => setActiveTool("orbit")}
              onToggleVisible={(key) =>
                updateModel(key, {
                  visible: !models.find((m) => m.key === key)?.visible,
                })
              }
              onRemove={removeModel}
              onFocus={(key) => requestView(viewRequest.preset, key)}
              onAlignment={(key, alignment) => updateModel(key, { alignment })}
              onOffset={(key, offset) => updateModel(key, { offset })}
              onAddFiles={() => inputRef.current?.click()}
              selectedElementId={selectedElement?.id ?? null}
              onSelectElement={(element) => {
                setSelectedElement(element);
                setSelectedElementIds(new Set([element.id]));
                setInspector(true);
                setActiveTool("orbit");
                requestView("perspective", element.modelKey, [element.id]);
              }}
            />
          )}
          <BimControlsOverlay
            activeTool={activeTool}
            onCloseTool={() => setActiveTool("orbit")}
            clipPlanes={effectiveClip}
            onChangeClipPlanes={setClip}
            onFitSection={(target) =>
              setSectionFit((r) => ({ revision: r.revision + 1, target }))
            }
            hasSelection={Boolean(selectedElement)}
            bounds={sceneBounds}
            sceneOrigin={sceneOrigin}
            mapConversion={mapConversion}
            measureMode={measureMode}
            onMeasureMode={(mode) => {
              setMeasureMode(mode);
              setPendingPoint(null);
            }}
            snapSettings={snapSettings}
            onSnapSettings={setSnapSettings}
            measurements={measurements}
            pendingPoint={pendingPoint}
            onRemoveMeasurement={(id) =>
              setMeasurements((list) => list.filter((m) => m.id !== id))
            }
            onClearMeasurements={() => {
              setMeasurements([]);
              setPendingPoint(null);
            }}
            explodeFactor={explode}
            onChangeExplodeFactor={(n) => {
              setExplode(n);
              setClashPoint(null);
              setClashId(null);
            }}
            visibleLayers={layers}
            onToggleLayer={(layer) => {
              setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
              setSelectedElement(null);
              setSelectedElementIds(new Set());
            }}
            clashes={allClashes}
            onFocusClash={(clash) => {
              setExplode(0);
              setClip((prev) => ({ ...prev, enabled: false }));
              setLayers(ALL_LAYERS);
              setClashId(clash.id);
              setClashPoint([...clash.point]);
            }}
            activeClashId={clashId}
            onRunClashCheck={runLocalClashCheck}
            savedViews={savedViews}
            currentViewPreset={viewRequest.preset}
            selectedElementIds={selectedElementIds}
            onSaveView={saveView}
            onApplyView={applySavedView}
            onDeleteView={(id) =>
              setSavedViews((views) => views.filter((view) => view.id !== id))
            }
            selectedElementId={selectedElement?.id ?? null}
            issues={issues}
            onAddIssue={addLocalIssue}
            onToggleIssue={(id) =>
              setIssues((current) =>
                current.map((issue) =>
                  issue.id === id
                    ? {
                        ...issue,
                        status: issue.status === "open" ? "resolved" : "open",
                      }
                    : issue,
                ),
              )
            }
            onDeleteIssue={(id) =>
              setIssues((current) => current.filter((issue) => issue.id !== id))
            }
          />
          <BimPropertyInspector
            key={selectedElement?.id ?? "empty"}
            element={selectedElement}
            coordinates={selectedCoordinates}
            isOpen={inspector}
            onClose={() => setInspector(false)}
            onFitSelection={() =>
              requestView("perspective", undefined, [...selectedElementIds])
            }
            onHide={() => {
              if (!selectedElement) return;
              setHiddenElements(
                (current) => new Set([...current, ...selectedElementIds]),
              );
              setSelectedElement(null);
              setSelectedElementIds(new Set());
            }}
            onIsolate={() => {
              if (!selectedElement) return;
              const ids = new Set(
                models.flatMap((model) =>
                  model.model.elements.map((element) => element.id),
                ),
              );
              for (const id of selectedElementIds) ids.delete(id);
              setHiddenElements(ids);
            }}
            onResetVisibility={() => setHiddenElements(new Set())}
          />
          {dragging && (
            <div className="pointer-events-none absolute inset-2 z-50 grid place-items-center rounded-xl border-2 border-dashed border-teal-400 bg-slate-950/90 p-4 text-center">
              {ui(locale).bimViewerPage.dropOneOrMoreIFC}
            </div>
          )}
        </div>
      </main>
      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-white/10 px-3 py-2 text-[10px] text-slate-400">
        <span>
          {elementCount} {v.performance.elements}
          <span className="hidden sm:inline">
            {" "}
            · {stats.triangles.toLocaleString(locale)}{" "}
            {ui(locale).bimViewerPage.triangles} ·{" "}
            {(stats.bytes / 1048576).toFixed(1)} MB{" "}
            {ui(locale).bimViewerPage.geometryBuffers}
          </span>
        </span>
        <span className="max-w-full truncate text-teal-300">
          {models.length
            ? models.length === 1
              ? `${models[0].model.schema} · ${models[0].model.filename}`
              : ui(locale).formats.federatedModels(models.length)
            : ui(locale).bimViewerPage.noIFCModelLoaded}
        </span>
      </footer>
    </div>
  );
}
