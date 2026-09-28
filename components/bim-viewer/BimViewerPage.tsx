"use client";

import { useLanguage } from "@/lib/i18n/context";
import { ArrowLeft, Box, Download, Layers, Upload } from "lucide-react";
import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  BimCanvas,
  type CanvasContextMenu,
  type CanvasModel,
  type SectionFitRequest,
  type ViewRequest,
} from "./BimCanvas";
import { BimContextMenu, type ContextAction } from "./BimContextMenu";
import { BimShortcutsDialog } from "./BimShortcutsDialog";
import { BimVisibilityBar } from "./BimVisibilityBar";
import { BimDisplayPanel } from "./BimDisplayPanel";
import { BimLevelsPanel } from "./BimLevelsPanel";
import { BimQuantitiesPanel } from "./BimQuantitiesPanel";
import { BimMarkupLayer } from "./BimMarkupLayer";
import { BimComparePanel, type ComparisonState } from "./BimComparePanel";
import { compareModels, DIFF_COLORS } from "./compare";
import { elementMatches, type SearchSet } from "./search-sets";
import { markupSvg, type MarkupShape } from "./markup";
import { computeLevels, planCutHeight, type BimLevel } from "./levels";
import { planeClip } from "./section-box";
import { DEFAULT_DISPLAY, type DisplaySettings } from "./render-pipeline";
import { BimControlsOverlay } from "./BimControlsOverlay";
import { BimModelsPanel } from "./BimModelsPanel";
import {
  BimPropertyInspector,
  type ElementCoordinates,
} from "./BimPropertyInspector";
import { BimToolbar } from "./BimToolbar";
import { DEFAULT_CLASH_RULES, detectClashes } from "./clash-detection";
import { BimClashPanel, type ClashTest } from "./BimClashPanel";
import { timeSlicer } from "./yield";
import { EMPTY_BIM_MODEL } from "./empty-model";
import { displaySettingsSchema, sessionSchema } from "./session-schema";
import type { z } from "zod";
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
// v2: the default went back to the original look; older saved choices reset.
const DISPLAY_KEY = "bim4c.viewer.display.v2";

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
  /** Signature of the file set whose saved session has been applied. */
  const sessionReadyRef = useRef<string | null>(null);
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
  const [isolated, setIsolated] = useState<Set<string> | null>(null);
  const [contextMenu, setContextMenu] = useState<CanvasContextMenu | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [activeLevelId, setActiveLevelId] = useState<string | null>(null);
  // Shapes shown when the markup tool opens (from a saved viewpoint).
  const [markupShapes, setMarkupShapes] = useState<MarkupShape[]>([]);
  const snapshotWaiter = useRef<((data: string | null) => void) | null>(null);
  const [comparison, setComparison] = useState<ComparisonState | null>(null);
  const [searchSets, setSearchSets] = useState<SearchSet[]>([]);
  // A viewer preference, not part of a model session.
  const [display, setDisplay] = useState<DisplaySettings>(DEFAULT_DISPLAY);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = displaySettingsSchema.safeParse(JSON.parse(localStorage.getItem(DISPLAY_KEY) ?? "null"));
        if (saved.success) setDisplay({ ...DEFAULT_DISPLAY, ...saved.data });
      } catch {
        /* Storage unavailable: defaults are fine. */
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const changeDisplay = (next: DisplaySettings) => {
    setDisplay(next);
    try {
      localStorage.setItem(DISPLAY_KEY, JSON.stringify(next));
    } catch {
      /* Storage unavailable: keep it for this visit only. */
    }
  };
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
  const [sectionFacePick, setSectionFacePick] = useState(false);
  const [clashId, setClashId] = useState<string | null>(null);
  const [localClashes, setLocalClashes] = useState<BimClashItem[]>([]);
  // Clash detective: the test set-up, review status per clash (kept in the
  // session) and the red/green colouring while a clash is isolated.
  const [clashTest, setClashTest] = useState<ClashTest | null>(null);
  const [clashRunning, setClashRunning] = useState(false);
  const [clashStatus, setClashStatus] = useState<Record<string, BimClashItem["status"]>>({});
  const [clashColors, setClashColors] = useState<Map<string, string> | null>(null);
  const [clashSection, setClashSection] = useState(false);
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

  const applySession = useCallback((session: z.infer<typeof sessionSchema>) => {
    if (Array.isArray(session.hiddenElements))
      setHiddenElements(new Set(session.hiddenElements));
    if (Array.isArray(session.measurements))
      setMeasurements(session.measurements);
    if (Array.isArray(session.savedViews)) setSavedViews(session.savedViews);
    if (Array.isArray(session.issues)) setIssues(session.issues);
    if (session.layers) setLayers({ ...ALL_LAYERS, ...session.layers });
    if (typeof session.explode === "number") setExplode(session.explode);
    if (Array.isArray(session.searchSets)) setSearchSets(session.searchSets);
    if (session.clashStatus) setClashStatus(session.clashStatus);
  }, []);

  // Element ids are "m<n>/ifc-<expressID>", which repeat across files. A
  // session therefore belongs to the exact set of files it was made with.
  const sessionSignature = models
    .map((m) => `${m.model.filename ?? m.key}:${m.model.elementsCount}`)
    .join("|");
  const sessionKey = `${SESSION_KEY}:${sessionSignature}`;
  useEffect(() => {
    if (!sessionSignature) {
      sessionReadyRef.current = null;
      return;
    }
    if (sessionReadyRef.current === sessionSignature) return;
    const timer = window.setTimeout(() => {
      try {
        // Sessions from before per-file keys cannot be matched to a file.
        localStorage.removeItem(SESSION_KEY);
        const raw = localStorage.getItem(sessionKey);
        if (raw) applySession(sessionSchema.parse(JSON.parse(raw)));
      } catch {
        // Storage may be disabled; keep the viewer usable in memory.
      } finally {
        sessionReadyRef.current = sessionSignature;
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [applySession, sessionKey, sessionSignature]);

  useEffect(() => {
    if (!sessionSignature || sessionReadyRef.current !== sessionSignature) return;
    try {
      localStorage.setItem(
        sessionKey,
        JSON.stringify({
          hiddenElements: [...hiddenElements],
          measurements,
          savedViews,
          issues,
          layers,
          explode,
          searchSets,
          clashStatus,
        }),
      );
    } catch {
      /* Storage quota/privacy settings must not crash the viewer. */
    }
  }, [clashStatus, explode, hiddenElements, issues, layers, measurements, savedViews, searchSets, sessionKey, sessionSignature]);

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
    () =>
      [...models.flatMap((m) => m.model.clashes), ...localClashes].map((c) =>
        clashStatus[c.id] ? { ...c, status: clashStatus[c.id] } : c,
      ),
    [clashStatus, localClashes, models],
  );
  // A test naming files that are no longer open falls back to the first two.
  const activeClashTest = useMemo<ClashTest | null>(() => {
    if (!models.length) return null;
    const keys = new Set(models.map((m) => m.key));
    if (clashTest && keys.has(clashTest.a.modelKey) && keys.has(clashTest.b.modelKey)) return clashTest;
    return {
      a: { modelKey: models[0].key },
      b: { modelKey: (models[1] ?? models[0]).key },
      rules: DEFAULT_CLASH_RULES,
    };
  }, [clashTest, models]);
  const clashModels = useMemo(
    () => models.map((m) => ({ key: m.key, name: m.model.filename ?? m.key, elements: m.model.elements })),
    [models],
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

  const requestView = useCallback(
    (
      preset: BimViewPreset,
      modelKey?: string,
      elementIds?: string[],
      keepDirection = false,
    ) => {
      setViewRequest((r) => ({
        revision: r.revision + 1,
        preset,
        modelKey,
        elementIds,
        keepDirection,
      }));
      setClashPoint(null);
      setClashId(null);
    },
    [],
  );

  const clashTaskRef = useRef<{ cancelled: boolean } | null>(null);
  const runLocalClashCheck = useCallback(async () => {
    if (clashTaskRef.current || !activeClashTest) return;
    const task = { cancelled: false };
    clashTaskRef.current = task;
    const s = ui(locale).bimClash;
    const toastId = toast.loading(s.checking(0, 0));
    const slice = timeSlicer();
    let lastToast = 0;
    setClashRunning(true);
    try {
      const clashes = await detectClashes(canvasModels, {
        ...activeClashTest,
        describe: ({ volume, verified, kind, distance }) =>
          kind === "clearance" ? s.clearanceDescription(Math.round(distance * 1000)) : s.description(volume, verified),
        // Mesh checks run on the main thread in slices so the view stays live.
        shouldYield: async () => {
          await slice();
          return task.cancelled;
        },
        onProgress: (done, total) => {
          if (performance.now() - lastToast > 150 || done === total) {
            lastToast = performance.now();
            toast.loading(s.checking(done, total), { id: toastId });
          }
        },
      });
      if (task.cancelled) return toast.dismiss(toastId);
      setLocalClashes(clashes);
      setActiveTool("clashes");
      toast.success(ui(locale).bimViewerPage.localClashes(clashes.length), { id: toastId });
    } finally {
      if (clashTaskRef.current === task) {
        clashTaskRef.current = null;
        setClashRunning(false);
      }
    }
  }, [activeClashTest, canvasModels, locale]);
  const cancelClashCheck = () => {
    if (clashTaskRef.current) clashTaskRef.current.cancelled = true;
  };
  // A new file set makes a running check meaningless.
  useEffect(() => () => {
    if (clashTaskRef.current) clashTaskRef.current.cancelled = true;
  }, [canvasModels]);

  const saveView = useCallback(
    (name: string, markup?: MarkupShape[]) => {
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
          ...(isolated ? { isolatedElements: [...isolated] } : {}),
          layers: { ...layers },
          explode,
          ...(markup?.length ? { markup } : {}),
        },
      ]);
    },
    [selectedElementIds, viewRequest.modelKey, viewRequest.preset, effectiveClip, hiddenElements, isolated, layers, explode],
  );

  const applySavedView = useCallback(
    (view: BimSavedView) => {
      const elements = modelsRef.current.flatMap((model) => model.model.elements);
      const selected = elements.filter((element) => view.elementIds.includes(element.id));
      setSelectedElementIds(new Set(selected.map((element) => element.id)));
      setSelectedElement(selected[0] ?? null);
      setPendingPoint(null);
      setMarkupShapes(view.markup ?? []);
      setActiveTool(view.markup?.length ? "markup" : "orbit");
      if (view.clip) setClip(view.clip);
      if (view.hiddenElements) setHiddenElements(new Set(view.hiddenElements));
      setIsolated(view.isolatedElements?.length ? new Set(view.isolatedElements) : null);
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

  const allElements = useMemo(
    () => models.flatMap((m) => m.model.elements),
    [models],
  );
  const elementById = useMemo(
    () => new Map(allElements.map((e) => [e.id, e])),
    [allElements],
  );
  const selectIds = useCallback(
    (ids: string[], primaryId?: string) => {
      setSelectedElementIds(new Set(ids));
      const primary = elementById.get(primaryId ?? ids[0]) ?? null;
      setSelectedElement(primary);
      if (!primary) setInspector(false);
    },
    [elementById],
  );
  const clearSelection = useCallback(() => {
    setSelectedElement(null);
    setSelectedElementIds(new Set());
  }, []);
  const isolateIds = useCallback((ids: string[]) => {
    if (!ids.length) return;
    setIsolated(new Set(ids));
    // Isolating something hidden should show it.
    setHiddenElements((hidden) => {
      const next = new Set(hidden);
      for (const id of ids) next.delete(id);
      return next;
    });
  }, []);
  const hideIds = useCallback(
    (ids: string[]) => {
      if (!ids.length) return;
      setHiddenElements((hidden) => new Set([...hidden, ...ids]));
      setIsolated((current) => {
        if (!current) return current;
        const kept = [...current].filter((id) => !ids.includes(id));
        return kept.length ? new Set(kept) : null;
      });
      clearSelection();
    },
    [clearSelection],
  );
  const showAll = useCallback(() => {
    setHiddenElements(new Set());
    setIsolated(null);
  }, []);
  /** Frame the selection (or everything) without changing the view direction. */
  const focusIds = useCallback(
    (ids: string[]) => requestView("perspective", undefined, ids.length ? ids : undefined, true),
    [requestView],
  );
  const goHome = useCallback(() => requestView("perspective"), [requestView]);
  /**
   * Clash review as in Navisworks: only the two elements stay solid (A red,
   * B green), everything else is ghosted, and the view frames the pair.
   */
  const focusClash = useCallback(
    (clash: BimClashItem) => {
      const ids = [clash.elementA, clash.elementB].filter((id) => elementById.has(id));
      setExplode(0);
      setLayers(ALL_LAYERS);
      if (!ids.length) {
        // A clash from the model file whose elements are not loaded: fly to its point.
        setClashId(clash.id);
        setClashPoint([...clash.point]);
        return;
      }
      // Framing resets the active clash, so it goes first.
      focusIds(ids);
      setClashId(clash.id);
      isolateIds(ids);
      setClashColors(new Map([[clash.elementA, "#ef4444"], [clash.elementB, "#22c55e"]]));
      if (clashSection) setSectionFit((f) => ({ revision: f.revision + 1, target: "ids", ids }));
      else setClip((prev) => ({ ...prev, enabled: false }));
    },
    [clashSection, elementById, focusIds, isolateIds],
  );
  const exitClashView = () => {
    setIsolated(null);
    setClashColors(null);
    setClashId(null);
    if (clashSection) setClip((prev) => ({ ...prev, enabled: false }));
  };
  const selectedIdList = useMemo(() => [...selectedElementIds], [selectedElementIds]);

  const runContextAction = (action: ContextAction) => {
    const anchor = contextMenu?.element ?? selectedElement;
    const visible = allElements.filter((e) => !hiddenElements.has(e.id));
    switch (action) {
      case "isolate":
        return isolateIds(selectedIdList);
      case "hide":
        return hideIds(selectedIdList);
      case "focus":
        return focusIds(selectedIdList);
      case "selectSameType":
        if (anchor)
          selectIds(visible.filter((e) => e.ifcType === anchor.ifcType).map((e) => e.id), anchor.id);
        return;
      case "selectSameStorey":
        if (anchor)
          selectIds(
            visible
              .filter((e) => e.modelKey === anchor.modelKey && e.storey === anchor.storey)
              .map((e) => e.id),
            anchor.id,
          );
        return;
      case "showAll":
        return showAll();
      case "fitAll":
        return focusIds([]);
      case "clearSelection":
        return clearSelection();
      case "properties":
        return setInspector(true);
    }
  };

  // Autodesk-style shortcuts. Typing in fields, menus and dialogs is left alone.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target instanceof Element ? e.target : null;
      if (shortcutsOpen || target?.closest("input, textarea, select, [contenteditable=true], [role=menu], dialog")) return;
      if (target && !containerRef.current?.contains(target) && target !== document.body) return;
      if (activeTool === "markup") return;
      if (activeTool === "walk") {
        if (e.key === "Escape") setActiveTool("orbit");
        return;
      }
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === "Escape") {
        // Panels close themselves on Escape; only the scene reacts here.
        if (target?.closest("aside, section")) return;
        if (pendingPoints.length) setPendingPoints([]);
        else clearSelection();
      } else if (key === "f") focusIds(selectedIdList);
      else if (key === "i") isolateIds(selectedIdList);
      else if (key === "h") hideIds(selectedIdList);
      else if (key === "u") showAll();
      else if (key === "Home") goHome();
      else if (key === "?") setShortcutsOpen(true);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeTool, clearSelection, focusIds, goHome, hideIds, isolateIds, pendingPoints.length, selectedIdList, shortcutsOpen, showAll]);

  const levels = useMemo(() => computeLevels(canvasModels), [canvasModels]);

  // ---- Version comparison: colours, ghosts and hidden duplicates -----------
  const colorOverrides = useMemo(() => {
    if (clashColors && activeTool === "clashes") return clashColors;
    if (!comparison) return null;
    const map = new Map<string, string>();
    for (const id of comparison.diff.added) map.set(id, DIFF_COLORS.added);
    for (const id of comparison.diff.removed) map.set(id, DIFF_COLORS.removed);
    for (const id of comparison.diff.geometry) map.set(id, DIFF_COLORS.geometry);
    for (const id of comparison.diff.properties) map.set(id, DIFF_COLORS.properties);
    return map;
  }, [activeTool, clashColors, comparison]);
  const runComparison = (oldKey: string, newKey: string) => {
    const older = canvasModels.find((m) => m.key === oldKey);
    const newer = canvasModels.find((m) => m.key === newKey);
    if (!older || !newer) return;
    // Old positions → world → new model frame, so a moved file is not "all changed".
    const c = Math.cos(newer.placement.rotationY);
    const sn = Math.sin(newer.placement.rotationY);
    const toNew = (p: Vec3): Vec3 => {
      const [wx, wy, wz] = applyPlacement(p, older.placement);
      const [dx, dy, dz] = [wx - newer.placement.position[0], wy - newer.placement.position[1], wz - newer.placement.position[2]];
      return [dx * c - dz * sn, dy, dx * sn + dz * c];
    };
    const diff = compareModels(older.model.elements, newer.model.elements, toNew);
    setComparison({ oldKey, newKey, diff });
    // The old file overlaps the new one: only its removed elements stay visible.
    setHiddenElements(new Set(diff.matchedOld));
    const changed = [...diff.added, ...diff.removed, ...diff.geometry, ...diff.properties];
    setIsolated(changed.length ? new Set(changed) : null);
    toast.success(ui(locale).bimCompare.done(changed.length));
  };
  const exitComparison = () => {
    setComparison(null);
    setHiddenElements(new Set());
    setIsolated(null);
  };
  const showPlan = (level: BimLevel) => {
    const lift = canvasModels.find((m) => m.key === level.modelKey)?.placement.position[1] ?? 0;
    setClip({ ...planeClip(sceneBounds, 1), y: planCutHeight(level, elementById, lift) });
    setExplode(0);
    setActiveLevelId(level.id);
    requestView("top", undefined, level.ids);
  };
  const clearPlan = () => {
    setClip((current) => ({ ...current, enabled: false }));
    setActiveLevelId(null);
  };

  const cancelLoad = () => {
    taskRef.current?.abort();
    taskRef.current = null;
    setLoading(null);
  };

  const resetScene = () => {
    setSelectedElement(null);
    setSelectedElementIds(new Set());
    setHiddenElements(new Set());
    setIsolated(null);
    setContextMenu(null);
    setInspector(false);
    setMeasurements([]);
    setPendingPoint(null);
    setClashPoint(null);
    setClashId(null);
    setLocalClashes([]);
    setClashColors(null);
    setClashStatus({});
    setClashTest(null);
    setClashSection(false);
    setComparison(null);
    setActiveLevelId(null);
    setMarkupShapes([]);
    setSavedViews([]);
    setIssues([]);
    setSearchSets([]);
    setLayers(ALL_LAYERS);
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
    if (!controller.signal.aborted && modelsRef.current.length) requestView("perspective");
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
          (percent) => {
            if (!controller.signal.aborted)
              setLoading({
                name: "bim4c-commercial-tower.ifc",
                percent,
                index: 1,
                total: 1,
              });
          },
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
    setIsolated((ids) => {
      if (!ids) return ids;
      const kept = [...ids].filter((id) => !id.startsWith(`${key}/`));
      return kept.length ? new Set(kept) : null;
    });
    setMeasurements((list) => list.filter((measurement) => !measurement.points.some((point) => point.modelKey === key)));
    setPendingPoint(null);
    setLocalClashes([]);
    setComparison((c) => (c && (c.oldKey === key || c.newKey === key) ? null : c));
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
      map: owner.model.mapConversion ? worldToMap(center, owner.model.mapConversion) : undefined,
    };
  }, [selectedElement, canvasModels, sceneOrigin]);

  const snapshot = (data: string | null) => {
    // A pending capture (markup export) takes the image instead of downloading it.
    if (snapshotWaiter.current) {
      const resolve = snapshotWaiter.current;
      snapshotWaiter.current = null;
      resolve(data);
      return;
    }
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
  const captureView = () =>
    new Promise<string | null>((resolve) => {
      snapshotWaiter.current = resolve;
      setSnapshotRevision((n) => n + 1);
    });
  /** 3D image + markup vectors, at the image's full (hi-DPI) resolution. */
  const exportMarkup = async (shapes: MarkupShape[], width: number, height: number) => {
    const s = ui(locale).bimMarkup;
    const data = await captureView();
    if (!data) return toast.error(ui(locale).bimViewerPage.unableToCaptureThe3D);
    const load = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    try {
      const base = await load(data);
      const overlay = await load(
        `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markupSvg(shapes, width, height, base.width, base.height))}`,
      );
      const canvas = document.createElement("canvas");
      canvas.width = base.width;
      canvas.height = base.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(base, 0, 0);
      ctx.drawImage(overlay, 0, 0);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `BIM4C-markup-${new Date().toISOString().slice(0, 19).replaceAll(":", "-")}.png`;
      a.click();
      toast.success(s.exported);
    } catch {
      toast.error(ui(locale).bimViewerPage.unableToCaptureThe3D);
    }
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
      searchSets,
      clashStatus,
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
      applySession(sessionSchema.parse(JSON.parse(await file.text())));
      toast.success(ui(locale).bimViewerPage.sessionImported);
    } catch {
      toast.error(ui(locale).bimViewerPage.sessionInvalid);
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
            <span className="hidden sm:inline">{v.uploadIfc}</span>
          </button>
          <button
            type="button"
            onClick={exportSession}
            aria-label={ui(locale).bimViewerPage.exportSession}
            title={ui(locale).bimViewerPage.exportSession}
            className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-white/15 px-2 text-xs hover:bg-white/10"
          >
            <Download className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => sessionInputRef.current?.click()}
            aria-label={ui(locale).bimViewerPage.importSession}
            title={ui(locale).bimViewerPage.importSession}
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
          onSelectViewPreset={(preset) => requestView(preset)}
          modelCount={models.length}
          onResetView={() => {
            requestView("perspective");
            setSelectedElement(null);
            setSelectedElementIds(new Set());
            setPendingPoint(null);
          }}
          onTakeSnapshot={() => setSnapshotRevision((n) => n + 1)}
          onShowShortcuts={() => setShortcutsOpen(true)}
          isFullscreen={fullscreen}
          onToggleFullscreen={() => void toggleFullscreen()}
          clashesCount={allClashes.length}
        />
        <div className="relative flex min-h-0 flex-1">
          {/* Floats over the viewport so starting a load does not shift the toolbar. */}
          {loading && (
            <div
              role="status"
              className="absolute left-1/2 top-3 z-30 w-[min(28rem,calc(100%-1.5rem))] -translate-x-1/2 overflow-hidden rounded-lg border border-teal-400/30 bg-teal-950/95 text-xs shadow-lg"
            >
              <div className="flex items-center gap-3 px-3 py-2">
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
              <div className="h-0.5 bg-teal-900">
                <div
                  className="h-full bg-teal-400 transition-[width]"
                  style={{ width: `${loading.percent}%` }}
                />
              </div>
            </div>
          )}
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
            isolatedElementIds={isolated}
            colorOverrides={colorOverrides}
            onDoubleClick={(element) => {
              if (!element) return focusIds([]);
              selectIds([element.id]);
              setInspector(true);
              focusIds([element.id]);
            }}
            onContextMenu={(menu) => {
              // Right-clicking outside the selection acts on what was clicked.
              if (menu.element && !selectedElementIds.has(menu.element.id))
                selectIds([menu.element.id]);
              setContextMenu(menu);
            }}
            onHome={goHome}
            onSelectMany={(ids, append) => {
              const next = append ? [...new Set([...selectedElementIds, ...ids])] : ids;
              selectIds(next, ids[0]);
              if (next.length) setInspector(true);
            }}
            rightPanelOpen={inspector}
            display={display}
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
            sectionFacePick={sectionFacePick && activeTool === "section"}
            onSectionFacePickDone={() => setSectionFacePick(false)}
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
          <BimVisibilityBar
            isolatedCount={isolated?.size ?? 0}
            hiddenCount={hiddenElements.size}
            onExitIsolation={() => setIsolated(null)}
            onShowAll={showAll}
          />
          {contextMenu && (
            <BimContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              element={contextMenu.element}
              selectionCount={contextMenu.element ? Math.max(1, selectedElementIds.size) : selectedElementIds.size}
              canShowAll={Boolean(isolated || hiddenElements.size)}
              onAction={runContextAction}
              onClose={() => setContextMenu(null)}
            />
          )}
          <BimShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
          {activeTool === "compare" && (
            <BimComparePanel
              models={models}
              comparison={comparison}
              onCompare={runComparison}
              onExit={exitComparison}
              onSelect={(ids) => {
                selectIds(ids);
                setInspector(ids.length > 0);
                focusIds(ids);
              }}
              onClose={() => setActiveTool("orbit")}
            />
          )}
          {activeTool === "markup" && (
            <BimMarkupLayer
              initialShapes={markupShapes}
              onSave={(shapes, name) => {
                saveView(name, shapes);
                toast.success(ui(locale).bimMarkup.saved);
              }}
              onExport={(shapes, width, height) => void exportMarkup(shapes, width, height)}
              onClose={() => {
                setMarkupShapes([]);
                setActiveTool("orbit");
              }}
            />
          )}
          {activeTool === "quantities" && (
            <BimQuantitiesPanel
              elements={allElements}
              hiddenIds={hiddenElements}
              selectedIds={selectedElementIds}
              onSelect={(ids) => {
                selectIds(ids);
                setInspector(ids.length > 0);
              }}
              onClose={() => setActiveTool("orbit")}
            />
          )}
          {activeTool === "levels" && (
            <BimLevelsPanel
              levels={levels}
              // A plan stays "active" only while its horizontal cut is on.
              activeLevelId={clip.enabled && clip.planeAxis === 1 && !clip.rotation ? activeLevelId : null}
              elevationOffset={sceneOrigin[1]}
              multipleModels={models.length > 1}
              onPlan={showPlan}
              onIsolate={(level) => {
                isolateIds(level.ids);
                focusIds(level.ids);
              }}
              onSelect={(level) => {
                selectIds(level.ids);
                setInspector(true);
              }}
              onClearPlan={clearPlan}
              onClose={() => setActiveTool("orbit")}
            />
          )}
          {activeTool === "display" && (
            <BimDisplayPanel
              settings={display}
              onChange={changeDisplay}
              onClose={() => setActiveTool("orbit")}
            />
          )}
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
              onFocus={(key) => requestView("perspective", key, undefined, true)}
              onAlignment={(key, alignment) => updateModel(key, { alignment })}
              onOffset={(key, offset) => updateModel(key, { offset })}
              onAddFiles={() => inputRef.current?.click()}
              selectedElementId={selectedElement?.id ?? null}
              onSelectElement={(element) => {
                selectIds([element.id]);
                setInspector(true);
                if (smallScreen()) setActiveTool("orbit");
                focusIds([element.id]);
              }}
              hiddenElementIds={hiddenElements}
              onSelectMany={(ids) => {
                selectIds(ids);
                setInspector(ids.length > 0);
              }}
              onSetHidden={(ids, hidden) => {
                if (hidden) hideIds(ids);
                else
                  setHiddenElements((current) => {
                    const next = new Set(current);
                    for (const id of ids) next.delete(id);
                    return next;
                  });
              }}
              onIsolate={isolateIds}
              searchSets={searchSets}
              onSaveSearchSet={(set) =>
                setSearchSets((list) => [
                  ...list,
                  // Next free number: ids stay unique after deletions.
                  { ...set, id: `set-${list.reduce((n, x) => Math.max(n, Number(x.id.split("-")[1]) || 0), 0) + 1}` },
                ])
              }
              onDeleteSearchSet={(id) => setSearchSets((list) => list.filter((set) => set.id !== id))}
              onApplySearchSet={(set) => {
                const ids = models.flatMap((m) =>
                  m.model.elements
                    .filter((e) => elementMatches(e, m.model.filename, set, locale))
                    .map((e) => e.id),
                );
                selectIds(ids);
                setInspector(ids.length > 0);
                toast.success(ui(locale).bimSearchSets.applied(ids.length, set.name));
              }}
            />
          )}
          <BimControlsOverlay
            activeTool={activeTool}
            onCloseTool={() => setActiveTool("orbit")}
            clipPlanes={effectiveClip}
            onChangeClipPlanes={setClip}
            sectionFacePick={sectionFacePick}
            onToggleSectionFacePick={() => setSectionFacePick((on) => !on)}
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
            clashPanel={
              activeClashTest ? (
                <BimClashPanel
                  models={clashModels}
                  test={activeClashTest}
                  onTestChange={setClashTest}
                  clashes={allClashes}
                  activeClashId={clashId}
                  running={clashRunning}
                  onRun={() => void runLocalClashCheck()}
                  onCancel={cancelClashCheck}
                  onFocus={focusClash}
                  onStatus={(id, status) => setClashStatus((all) => ({ ...all, [id]: status }))}
                  sectionAround={clashSection}
                  onSectionAround={setClashSection}
                  inClashView={Boolean(clashColors && clashId)}
                  onExit={exitClashView}
                />
              ) : null
            }
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
            selectionCount={selectedElementIds.size}
            onFitSelection={() => focusIds(selectedIdList)}
            onHide={() => hideIds(selectedIdList)}
            onIsolate={() => isolateIds(selectedIdList)}
            onResetVisibility={showAll}
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
