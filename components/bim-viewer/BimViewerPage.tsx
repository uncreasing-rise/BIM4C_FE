"use client";

import { useLanguage } from "@/lib/i18n/context";
import { ArrowLeft, Box, Download, FolderOpen, Layers, Upload } from "lucide-react";
import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import { ROUTES } from "@/constants/routes";
import { DEFAULT_MEASURE_UNITS, describeMeasurement, finishedPoints, isOpenEnded, MAX_MEASURE_POINTS } from "./measurement-math";
import { localizeSession, modelTokens, sessionIdentity, stabilizeSession } from "./session-ids";
import {
  buildBcfZip,
  bytesToDataUrl,
  cameraFromBcf,
  cameraToBcf,
  dataUrlToBytes,
  newBcfGuid,
  parseBcfZip,
  type BcfTopic,
} from "./bcf";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "./toast";
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
import { BimAppearancePanel } from "./BimAppearancePanel";
import { BimMarkupLayer } from "./BimMarkupLayer";
import { BimComparePanel, type ComparisonState } from "./BimComparePanel";
import { compareModelsAsync, DIFF_COLORS } from "./compare";
import { elementMatches, type SearchSet } from "./search-sets";
import { markupSvg, type MarkupShape } from "./markup";
import { computeLevels, planCutHeight, planHeights, type BimLevel } from "./levels";
import { BimSheetView } from "./BimSheetView";
import type { PlanDrawing } from "./plan-drawing";
import type { SheetRequest } from "./BimCanvas";
import { planeClip } from "./section-box";
import { DEFAULT_DISPLAY, type DisplaySettings } from "./render-pipeline";
import { BimControlsOverlay } from "./BimControlsOverlay";
import { BimModelsPanel } from "./BimModelsPanel";
import {
  BimPropertyInspector,
  type ElementCoordinates,
} from "./BimPropertyInspector";
import { BimToolbar } from "./BimToolbar";
import { CLASH_RESULT_LIMIT, DEFAULT_CLASH_RULES, detectClashes } from "./clash-detection";
import { DEMO_MODELS } from "./demo-models";
import { readIssueSnapshots, writeIssueSnapshots } from "./issue-snapshots";
import { hydrated } from "./fragments-engine";
import { buildLegend, resolveAppearance, type AppearanceProfile, type ManualLook } from "./appearance";
import { compareRuns, reviewChange, RUNS_LIMIT, type ClashReviewEntry, type ClashRun } from "./clash-review";
import { BimClashPanel, type ClashTest } from "./BimClashPanel";
import { timeSlicer } from "./yield";
import { EMPTY_BIM_MODEL } from "./empty-model";
import { displaySettingsSchema, measureUnitsSchema, sessionSchema } from "./session-schema";
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
  BimSelectionSet,
  BimDiscipline,
  BimElementData,
  BimModelDefinition,
  BimMapConversion,
  BimSavedView,
  BimTool,
  BimViewPreset,
  FederatedModel,
  MeasureLock,
  MeasureMode,
  MeasurePoint,
  MeasureUnits,
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
/** Sessions keyed by file content (see session-ids.ts). */
const SESSION_KEY_V2 = "bim4c.viewer.session.v2";
// v2: the default went back to the original look; older saved choices reset.
const LARGE_IFC_BYTES = 200 * 1024 * 1024;
/** A snapshot scaled to at most 1024 px wide as JPEG, small enough to keep and export. */
const shrinkSnapshot = (data: string) =>
  new Promise<string>((resolve) => {
    const image = new Image();
    image.onload = () => {
      const width = Math.min(1024, image.width);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = Math.max(1, Math.round((image.height * width) / Math.max(1, image.width)));
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(data);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    image.onerror = () => resolve(data);
    image.src = data;
  });
const measurementId = () => `ms-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const DISPLAY_KEY = "bim4c.viewer.display.v2";
const MEASURE_UNITS_KEY = "bim4c.viewer.measureUnits.v1";
const REVIEWER_KEY = "bim4c.viewer.reviewer";
/** Measurement undo depth. */
const MEASURE_HISTORY = 50;
const NO_HISTORY: { past: Measurement[][]; future: Measurement[][] } = { past: [], future: [] };
/** Measure tool: keys that toggle a lock (X/Y/Z axis, P perpendicular, L parallel). */
const LOCK_KEYS: Record<string, NonNullable<MeasureLock>> = { x: "x", y: "y", z: "z", p: "perpendicular", l: "parallel" };

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
  /** Latest updateModel, for callbacks created before it (saved views). */
  const updateModelRef = useRef<(key: string, patch: Partial<FederatedModel>) => void>(() => {});
  const [comparison, setComparison] = useState<ComparisonState | null>(null);
  const [searchSets, setSearchSets] = useState<SearchSet[]>([]);
  const [selectionSets, setSelectionSets] = useState<BimSelectionSet[]>([]);
  // Appearance tool: a profile (colour by value) and the user's own looks, both kept in the session.
  const [appearanceProfile, setAppearanceProfile] = useState<AppearanceProfile | null>(null);
  const [manualLooks, setManualLooks] = useState<ManualLook[]>([]);
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
  const [redlineRevision, setRedlineRevision] = useState(0);
  const [layers, setLayers] = useState(ALL_LAYERS);
  const [clip, setClip] = useState<BimClipPlanes>(() =>
    defaultClip(EMPTY_BOUNDS),
  );
  const [explode, setExplode] = useState(0);
  const [measureMode, setMeasureMode] = useState<MeasureMode>("distance");
  const [snapSettings, setSnapSettings] = useState<SnapSettings>({
    vertex: true,
    center: true,
    midpoint: true,
    edge: true,
  });
  const [measureLock, setMeasureLock] = useState<MeasureLock>(null);
  // A viewer preference, like the display settings.
  const [measureUnits, setMeasureUnits] = useState<MeasureUnits>(DEFAULT_MEASURE_UNITS);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = measureUnitsSchema.safeParse(JSON.parse(localStorage.getItem(MEASURE_UNITS_KEY) ?? "null"));
        if (saved.success) setMeasureUnits(saved.data);
      } catch {
        /* Storage unavailable: defaults are fine. */
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const changeMeasureUnits = (next: MeasureUnits) => {
    setMeasureUnits(next);
    try {
      localStorage.setItem(MEASURE_UNITS_KEY, JSON.stringify(next));
    } catch {
      /* Storage unavailable: keep it for this visit only. */
    }
  };
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  // Undo/redo of the user's own edits to the list. Loading a session or
  // moving/removing a model resets it: older states would no longer match.
  const [measureHistory, setMeasureHistory] = useState(NO_HISTORY);
  const changeMeasurements = useCallback((next: Measurement[]) => {
    setMeasureHistory((h) => ({ past: [...h.past.slice(1 - MEASURE_HISTORY), measurements], future: [] }));
    setMeasurements(next);
  }, [measurements]);
  const [pendingPoints, setPendingPoints] = useState<MeasurePoint[]>([]);
  const pendingPoint = pendingPoints.at(-1) ?? null;
  const setPendingPoint = (point: MeasurePoint | null) => setPendingPoints(point ? [point] : []);
  const addMeasurement = useCallback((mode: MeasureMode, points: MeasurePoint[]) => {
    changeMeasurements([...measurements, { id: measurementId(), mode, points }]);
  }, [changeMeasurements, measurements]);
  /** Completes an open-ended measurement; false when it has too few points. */
  const finishMeasurement = useCallback(() => {
    const points = isOpenEnded(measureMode) && finishedPoints(measureMode, pendingPoints);
    if (!points) return false;
    addMeasurement(measureMode, points);
    setPendingPoints([]);
    return true;
  }, [addMeasurement, measureMode, pendingPoints]);
  /** Ctrl+Z: the last pending point first, then the last change to the list. */
  const undoMeasurement = useCallback(() => {
    if (pendingPoints.length) return setPendingPoints((points) => points.slice(0, -1));
    const previous = measureHistory.past.at(-1);
    if (!previous) return;
    setMeasureHistory({ past: measureHistory.past.slice(0, -1), future: [measurements, ...measureHistory.future] });
    setMeasurements(previous);
  }, [measureHistory, measurements, pendingPoints.length]);
  const redoMeasurement = useCallback(() => {
    const [next, ...rest] = measureHistory.future;
    if (!next) return;
    setMeasureHistory({ past: [...measureHistory.past, measurements], future: rest });
    setMeasurements(next);
  }, [measureHistory, measurements]);
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
  /** The test the current results answer: tells "not run" from "ran, none found". */
  const [clashCheckedFor, setClashCheckedFor] = useState<ClashTest | null>(null);
  const [clashStatus, setClashStatus] = useState<Record<string, BimClashItem["status"]>>({});
  // Clash review (clash-review.ts): assignment, notes and history per clash, and the runs.
  const [clashReview, setClashReview] = useState<Record<string, ClashReviewEntry>>({});
  const [clashRuns, setClashRuns] = useState<ClashRun[]>([]);
  const [clashLastIds, setClashLastIds] = useState<string[] | null>(null);
  const [clashNew, setClashNew] = useState<string[]>([]);
  const clashNewSet = useMemo(() => new Set(clashNew), [clashNew]);
  // The reviewer's name, a preference of this browser.
  const [reviewer, setReviewer] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setReviewer(localStorage.getItem(REVIEWER_KEY) ?? "");
      } catch {
        /* Storage unavailable. */
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const changeReviewer = (name: string) => {
    setReviewer(name);
    try {
      localStorage.setItem(REVIEWER_KEY, name.slice(0, 128));
    } catch {
      /* Storage unavailable: this visit only. */
    }
  };
  const [clashColors, setClashColors] = useState<Map<string, string> | null>(null);
  const [clashSection, setClashSection] = useState(false);
  const [savedViews, setSavedViews] = useState<BimSavedView[]>([]);
  const [issues, setIssues] = useState<BimLocalIssue[]>([]);
  /** Issue images are persisted separately in IndexedDB. */
  const [issueSnapshots, setIssueSnapshots] = useState<Record<string, string>>({});
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
    if (Array.isArray(session.measurements)) {
      setMeasurements(session.measurements);
      setMeasureHistory(NO_HISTORY);
    }
    if (Array.isArray(session.savedViews)) setSavedViews(session.savedViews);
    if (Array.isArray(session.issues)) setIssues(session.issues);
    if (session.layers) setLayers({ ...ALL_LAYERS, ...session.layers });
    if (typeof session.explode === "number") setExplode(session.explode);
    if (Array.isArray(session.searchSets)) setSearchSets(session.searchSets);
    if (Array.isArray(session.selectionSets)) setSelectionSets(session.selectionSets);
    if (session.clashStatus) setClashStatus(session.clashStatus);
    if (session.clashReview) setClashReview(session.clashReview);
    if (session.clashRuns) setClashRuns(session.clashRuns);
    if (session.clashLastIds) setClashLastIds(session.clashLastIds);
    if (session.clashNew) setClashNew(session.clashNew);
    if (session.appearance) {
      setAppearanceProfile(session.appearance.profile ?? null);
      setManualLooks(session.appearance.manual ?? []);
    }
  }, []);

  // A session belongs to the exact set of files it was made with. In memory,
  // element ids are "m<n>/ifc-<expressID>" and follow the order files were
  // opened; saved sessions use content-hash tokens instead (session-ids.ts),
  // so the same files restore in any order and under any file name.
  const tokens = useMemo(
    () => modelTokens(models.map((m) => ({ key: m.key, hash: m.model.contentHash }))),
    [models],
  );
  const legacySignature = models
    .map((m) => `${m.model.filename ?? m.key}:${m.model.elementsCount}`)
    .join("|");
  const sessionSignature = tokens ? sessionIdentity(tokens) : legacySignature;
  const sessionKey = tokens ? `${SESSION_KEY_V2}:${sessionSignature}` : `${SESSION_KEY}:${legacySignature}`;
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
        if (raw) {
          const session = sessionSchema.parse(JSON.parse(raw));
          applySession(tokens ? localizeSession(session, tokens) : session);
        } else if (tokens) {
          // Carry over a session saved under the older name-based key; the
          // next save stores it under the content key.
          const legacy = localStorage.getItem(`${SESSION_KEY}:${legacySignature}`);
          if (legacy) applySession(sessionSchema.parse(JSON.parse(legacy)));
        }
      } catch {
        // Storage may be disabled; keep the viewer usable in memory.
      } finally {
        sessionReadyRef.current = sessionSignature;
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [applySession, legacySignature, sessionKey, sessionSignature, tokens]);

  useEffect(() => {
    if (!sessionSignature || sessionReadyRef.current !== sessionSignature) return;
    try {
      const session = {
        hiddenElements: [...hiddenElements],
        measurements,
        savedViews,
        issues,
        layers,
        explode,
        searchSets,
        selectionSets,
        clashStatus,
        clashReview,
        clashRuns,
        ...(clashLastIds ? { clashLastIds } : {}),
        clashNew,
        appearance: { profile: appearanceProfile, manual: manualLooks },
      };
      localStorage.setItem(sessionKey, JSON.stringify(tokens ? stabilizeSession(session, tokens) : session));
    } catch {
      /* Storage quota/privacy settings must not crash the viewer. */
    }
  }, [appearanceProfile, clashLastIds, clashNew, clashReview, clashRuns, clashStatus, explode, hiddenElements, issues, layers, manualLooks, measurements, savedViews, searchSets, selectionSets, sessionKey, sessionSignature, tokens]);

  const [snapshotStorageKey, setSnapshotStorageKey] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    void readIssueSnapshots(sessionKey).then((stored) => {
      if (!alive) return;
      setIssueSnapshots(stored);
      setSnapshotStorageKey(sessionKey);
    });
    return () => { alive = false; };
  }, [sessionKey]);
  useEffect(() => {
    if (!sessionSignature || snapshotStorageKey !== sessionKey) return;
    const ids = new Set(issues.map((issue) => issue.id));
    const images = Object.fromEntries(Object.entries(issueSnapshots).filter(([id]) => ids.has(id)));
    const timer = window.setTimeout(() => {
      void writeIssueSnapshots(sessionKey, images).then((ok) => {
        if (!ok) toast.error(ui(locale).bimViewerPage.snapshotStorageFailed);
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [issueSnapshots, issues, sessionKey, sessionSignature, snapshotStorageKey, locale]);

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
  // Converted models get their element triangles in the background; panels
  // that measure meshes (quantities) recompute once each model has them.
  const [geometryRevision, setGeometryRevision] = useState(0);
  useEffect(() => {
    let alive = true;
    for (const m of models)
      if (m.model.fragments)
        void hydrated(m.model).then(() => {
          if (alive) setGeometryRevision((n) => n + 1);
        }).catch(() => { /* The canvas reports geometry failures. */ });
    return () => {
      alive = false;
    };
  }, [models]);
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
    () => {
      const maps = models.map((m) => m.model.mapConversion);
      const first = maps[0];
      return first && maps.every((map) => JSON.stringify(map) === JSON.stringify(first)) ? first : undefined;
    },
    [models],
  );
  const modelMapConversions = useMemo(() => new Map<string, BimMapConversion | undefined>(models.map((m) => [m.key, m.model.mapConversion])), [models]);
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

  /** What a test compares, as shown in the run history (and to tell runs of one test apart). */
  const clashTestLabel = useCallback(
    (test: ClashTest) => {
      const name = (key: string) => models.find((m) => m.key === key)?.model.filename ?? key;
      const side = (set: ClashTest["a"]) => `${name(set.modelKey)}${set.types?.length ? ` [${set.types.join(", ")}]` : ""}`;
      const mm = Math.round((test.rules.kind === "hard" ? test.rules.tolerance : test.rules.clearance) * 1000);
      return `${side(test.a)} × ${side(test.b)} · ${test.rules.kind} ${mm} mm`;
    },
    [models],
  );
  const clashTaskRef = useRef<{ cancelled: boolean; controller: AbortController } | null>(null);
  const runLocalClashCheck = useCallback(async () => {
    if (clashTaskRef.current || !activeClashTest) return;
    const task = { cancelled: false, controller: new AbortController() };
    clashTaskRef.current = task;
    const s = ui(locale).bimClash;
    const toastId = toast.loading(s.checking(0, 0));
    const slice = timeSlicer();
    let lastToast = 0;
    setClashRunning(true);
    try {
      // Converted models deliver their triangles in the background; the test needs them all.
      if (canvasModels.some((m) => m.model.fragments)) {
        toast.loading(s.preparingGeometry, { id: toastId });
        await Promise.all(canvasModels.map((m) => hydrated(m.model, task.controller.signal)));
        if (task.cancelled) return toast.dismiss(toastId);
      }
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
      // Follow the results across runs of the same test: new, still there, gone.
      const label = clashTestLabel(activeClashTest);
      const ids = clashes.map((c) => c.id);
      const sameTest = clashRuns.at(-1)?.label === label;
      const diff = compareRuns(sameTest ? clashLastIds : null, ids);
      const at = new Date().toISOString();
      // A run that hit the result limit lists only the worst clashes: one left
      // out is not gone, so nothing is resolved automatically then.
      const complete = ids.length < CLASH_RESULT_LIMIT && (clashRuns.at(-1)?.total ?? 0) < CLASH_RESULT_LIMIT;
      if (diff.gone.length && complete) {
        // The model change that removed them resolved them.
        setClashStatus((all) => ({ ...all, ...Object.fromEntries(diff.gone.map((id) => [id, "resolved" as const])) }));
        setClashReview((all) => diff.gone.reduce((acc, id) => reviewChange(acc, id, { status: "resolved", auto: true }, at), all));
      }
      setClashNew(diff.added);
      setClashLastIds(ids);
      setClashRuns((runs) =>
        [...runs, { at, label, total: ids.length, added: diff.added.length, active: diff.active.length, resolved: diff.gone.length }].slice(-RUNS_LIMIT),
      );
      setLocalClashes(clashes);
      setClashCheckedFor(activeClashTest);
      setActiveTool("clashes");
      toast.success(ui(locale).bimViewerPage.localClashes(clashes.length), { id: toastId });
    } catch {
      toast.dismiss(toastId);
      if (!task.cancelled) toast.error(ui(locale).bimViewerPage.geometryFailed);
    } finally {
      if (clashTaskRef.current === task) {
        clashTaskRef.current = null;
        setClashRunning(false);
      }
    }
  }, [activeClashTest, canvasModels, clashLastIds, clashRuns, clashTestLabel, locale]);
  const cancelClashCheck = () => {
    if (clashTaskRef.current) {
      clashTaskRef.current.cancelled = true;
      clashTaskRef.current.controller.abort();
    }
  };
  // A new file set makes a running check meaningless.
  useEffect(() => () => {
    if (clashTaskRef.current) {
      clashTaskRef.current.cancelled = true;
      clashTaskRef.current.controller.abort();
    }
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
          projection: display.projection,
          models: modelsRef.current.map(({ key, visible, alignment, offset }) => ({ key, visible, alignment, offset: { ...offset } })),
          ...(markup?.length ? { markup } : {}),
        },
      ]);
    },
    [selectedElementIds, viewRequest.modelKey, viewRequest.preset, effectiveClip, hiddenElements, isolated, layers, explode, display.projection],
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
      if (view.projection) setDisplay((current) => ({ ...current, projection: view.projection! }));
      // Files still open get back their visibility and placement; placement
      // goes through updateModel so model-anchored measurements follow.
      for (const saved of view.models ?? []) {
        const model = modelsRef.current.find((m) => m.key === saved.key);
        if (!model) continue;
        const moved =
          model.alignment !== saved.alignment ||
          (Object.keys(saved.offset) as (keyof FederatedModel["offset"])[]).some((k) => model.offset[k] !== saved.offset[k]);
        if (moved) updateModelRef.current(saved.key, { visible: saved.visible, alignment: saved.alignment, offset: { ...saved.offset } });
        else if (model.visible !== saved.visible) updateModelRef.current(saved.key, { visible: saved.visible });
      }
      setViewRequest((current) => ({ revision: current.revision + 1, preset: view.preset, modelKey: view.modelKey, elementIds: view.elementIds, camera: view.camera }));
      setClashPoint(null);
    },
    [],
  );

  const addLocalIssue = useCallback(
    (title: string, description: string, elementIds?: string[]) => {
      if (!elementIds && !selectedElement?.id) return;
      const id = `issue-${Date.now()}`;
      setIssues((current) => [
        ...current,
        {
          id,
          title,
          description,
          elementIds: elementIds ?? [...selectedElementIds],
          clashId: clashId ?? undefined,
          status: "open",
          createdAt: new Date().toISOString(),
          // The view the issue was raised in, so it can be revisited and
          // exported as a BCF viewpoint.
          camera: cameraRef.current,
          clip: clip.enabled ? clip : undefined,
          bcfGuid: newBcfGuid(),
          type: clashId ? "Clash" : "Issue",
        },
      ]);
      // A small snapshot for the list and the BCF topic (kept for this visit only).
      void new Promise<string | null>((resolve) => {
        snapshotWaiter.current = resolve;
        setSnapshotRevision((n) => n + 1);
      })
        .then((data) => (data ? shrinkSnapshot(data) : null))
        .then((small) => {
          if (small) setIssueSnapshots((all) => ({ ...all, [id]: small }));
        });
    },
    [clashId, clip, selectedElement, selectedElementIds],
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

  // ---- Issues and BCF ------------------------------------------------------
  /** Scene-space centre of an element, including its model's placement. */
  const elementScenePoint = useCallback(
    (id: string): Vec3 | null => {
      const element = elementById.get(id);
      const owner = element && canvasModels.find((m) => m.key === element.modelKey);
      return element && owner ? applyPlacement(element.position, owner.placement) : null;
    },
    [canvasModels, elementById],
  );
  const goToIssue = useCallback(
    (issue: BimLocalIssue) => {
      const present = issue.elementIds.filter((id) => elementById.has(id));
      setSelectedElementIds(new Set(present));
      setSelectedElement(present[0] ? (elementById.get(present[0]) ?? null) : null);
      setExplode(0);
      setClip((current) => issue.clip ?? { ...current, enabled: false });
      if (issue.camera)
        setViewRequest((current) => ({
          revision: current.revision + 1,
          preset: "perspective",
          elementIds: present,
          camera: issue.camera,
        }));
      else if (present.length) focusIds(present);
    },
    [elementById, focusIds],
  );
  const saveSelectionSet = (name: string) => {
    const guids = [...selectedElementIds].map((id) => elementById.get(id)?.guid).filter((g): g is string => Boolean(g));
    if (!guids.length) return;
    setSelectionSets((sets) => [...sets, { id: `sel-${Date.now()}`, name, guids }]);
  };
  const applySelectionSet = (set: BimSelectionSet) => {
    const wanted = new Set(set.guids);
    const ids = allElements.filter((e) => e.guid && wanted.has(e.guid)).map((e) => e.id);
    if (!ids.length) return toast.error(ui(locale).bimControlsOverlay.selectionSetMissing);
    selectIds(ids);
    focusIds(ids);
  };

  const downloadBcf = (topics: BcfTopic[], name: string) => {
    const project = models[0]?.model.filename?.replace(/\.ifc$/i, "") ?? "BIM4C";
    const url = URL.createObjectURL(
      new Blob([buildBcfZip(topics, project) as BlobPart], { type: "application/octet-stream" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}-${new Date().toISOString().slice(0, 10)}.bcfzip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success(ui(locale).formats.bcfExported(topics.length));
  };
  const downloadPackage = async (key: string) => {
    const model = models.find((m) => m.key === key)?.model;
    if (!model?.fragments) return;
    const { encodePackage, PACKAGE_EXTENSION } = await import("./bim-package");
    const url = URL.createObjectURL(new Blob([(await encodePackage(model)) as BlobPart], { type: "application/octet-stream" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(model.filename ?? "model").replace(/\.(ifc|bim4c)$/i, "")}${PACKAGE_EXTENSION}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const levelOf = useCallback((id: string) => elementById.get(id)?.storey ?? "", [elementById]);
  const guidsOf = (ids: string[]) =>
    ids.map((id) => elementById.get(id)?.guid).filter((g): g is string => Boolean(g));
  const exportIssuesBcf = () => {
    if (!issues.length) return;
    // Older issues get a topic GUID now, so later exports update the same topics.
    const withGuids = issues.map((issue) => (issue.bcfGuid ? issue : { ...issue, bcfGuid: newBcfGuid() }));
    setIssues(withGuids);
    downloadBcf(
      withGuids.map((issue) => ({
        guid: issue.bcfGuid!,
        title: issue.title,
        description: issue.description,
        status: issue.status,
        type: issue.type ?? (issue.clashId ? "Clash" : "Issue"),
        createdAt: issue.createdAt,
        author: issue.author ?? "BIM4C Viewer",
        components: guidsOf(issue.elementIds),
        camera: issue.camera ? cameraToBcf(issue.camera, sceneOrigin) : undefined,
        snapshot: (issueSnapshots[issue.id] && dataUrlToBytes(issueSnapshots[issue.id])) || undefined,
      })),
      "BIM4C-issues",
    );
  };
  const exportClashesBcf = () => {
    const clashes = allClashes;
    if (!clashes.length) return;
    downloadBcf(
      clashes.map((clash) => {
        // Look at the clash point from above and to the side, far enough to
        // show both elements.
        const sizes = [clash.elementA, clash.elementB].flatMap((id) => elementById.get(id)?.size ?? []);
        const distance = Math.max(4, Math.max(2, ...sizes) * 1.8);
        const [x, y, z] = clash.point;
        const k = distance / Math.hypot(1, 0.8, 1);
        const camera = { position: [x + k, y + 0.8 * k, z + k] as Vec3, target: [x, y, z] as Vec3, up: [0, 1, 0] as Vec3, fov: 50 };
        return {
          guid: newBcfGuid(),
          title: clash.title,
          description: [clash.description, clash.typeA && clash.typeB ? `${clash.typeA} × ${clash.typeB}` : ""].filter(Boolean).join(" · "),
          status: clash.status === "resolved" ? "resolved" : "open",
          type: "Clash",
          createdAt: new Date().toISOString(),
          author: "BIM4C Viewer",
          components: guidsOf([clash.elementA, clash.elementB]),
          camera: cameraToBcf(camera, sceneOrigin),
        } satisfies BcfTopic;
      }),
      "BIM4C-clashes",
    );
  };
  const importBcf = async (file: File) => {
    let topics: BcfTopic[];
    try {
      topics = parseBcfZip(new Uint8Array(await file.arrayBuffer()));
    } catch {
      return toast.error(ui(locale).formats.bcfInvalid);
    }
    if (!topics.length) return toast.error(ui(locale).formats.bcfInvalid);
    const byGuid = new Map(allElements.filter((e) => e.guid).map((e) => [e.guid, e.id]));
    let unmatched = 0;
    const snapshots: Record<string, string> = {};
    const imported: BimLocalIssue[] = topics.map((topic, index) => {
      const elementIds = topic.components.flatMap((guid) => {
        const id = byGuid.get(guid);
        if (!id) unmatched++;
        return id ? [id] : [];
      });
      const id = `issue-${Date.now()}-${index}`;
      if (topic.snapshot) snapshots[id] = bytesToDataUrl(topic.snapshot);
      // Orbit about the topic's elements when they are loaded, else 15 m ahead.
      const centres = elementIds.map(elementScenePoint).filter((p): p is Vec3 => Boolean(p));
      let focus = 15;
      if (topic.camera && centres.length) {
        const eye = cameraFromBcf(topic.camera, sceneOrigin, 1).position;
        const c = centres.reduce((s, p) => [s[0] + p[0], s[1] + p[1], s[2] + p[2]], [0, 0, 0]).map((n) => n / centres.length);
        focus = Math.hypot(c[0] - eye[0], c[1] - eye[1], c[2] - eye[2]);
      }
      return {
        id,
        title: topic.title,
        description: topic.description,
        elementIds,
        status: topic.status,
        createdAt: topic.createdAt,
        camera: topic.camera ? cameraFromBcf(topic.camera, sceneOrigin, focus) : undefined,
        bcfGuid: topic.guid,
        type: topic.type,
        author: topic.author || undefined,
      };
    });
    // Re-importing the same topics replaces them instead of duplicating.
    const guids = new Set(imported.map((issue) => issue.bcfGuid));
    setIssues((current) => [...current.filter((issue) => !issue.bcfGuid || !guids.has(issue.bcfGuid)), ...imported]);
    for (const [id, data] of Object.entries(snapshots))
      void shrinkSnapshot(data).then((small) => setIssueSnapshots((all) => ({ ...all, [id]: small })));
    setActiveTool("clashes");
    toast.success(ui(locale).formats.bcfImported(imported.length, unmatched));
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
      if (e.defaultPrevented || e.altKey) return;
      const target = e.target instanceof Element ? e.target : null;
      if (shortcutsOpen || target?.closest("input, textarea, select, [contenteditable=true], [role=menu], dialog")) return;
      if (target && !containerRef.current?.contains(target) && target !== document.body) return;
      if (e.ctrlKey || e.metaKey) {
        // Measurement undo/redo; every other Ctrl shortcut stays the browser's.
        if (activeTool !== "measure") return;
        const key = e.key.toLowerCase();
        if (key === "z" && !e.shiftKey) undoMeasurement();
        else if (key === "y" || (key === "z" && e.shiftKey)) redoMeasurement();
        else return;
        return e.preventDefault();
      }
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
      } else if (key === "Enter" && activeTool === "measure") {
        if (!finishMeasurement()) return;
      } else if (key === "Backspace" && activeTool === "measure" && pendingPoints.length) {
        setPendingPoints((points) => points.slice(0, -1));
      } else if (activeTool === "measure" && Object.hasOwn(LOCK_KEYS, key)) {
        const lock = LOCK_KEYS[key];
        setMeasureLock((current) => (current === lock ? null : lock));
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
  }, [activeTool, clearSelection, finishMeasurement, focusIds, goHome, hideIds, isolateIds, pendingPoints.length, redoMeasurement, selectedIdList, shortcutsOpen, showAll, undoMeasurement]);

  const levels = useMemo(() => computeLevels(canvasModels), [canvasModels]);
  // 2D sheets beside the 3D view (split screen): a floor plan per level, or at
  // the height being looked at when the files have no storeys.
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetLevelId, setSheetLevelId] = useState<string | null>(null);
  const [planRequest, setPlanRequest] = useState<SheetRequest & { revision: number }>();
  const [planDrawing, setPlanDrawing] = useState<PlanDrawing | null>(null);
  const [planBusy, setPlanBusy] = useState(false);
  const sheetLevels = useMemo(() => {
    const s = ui(locale).bimSheets;
    return [
      ...levels.map((l) => ({ id: l.id, name: levels.filter((x) => x.name === l.name).length > 1 ? `${l.name} · ${l.modelName}` : l.name })),
      { id: "view", name: s.atView },
      { id: "section-ew", name: s.sectionEastWest },
      { id: "section-ns", name: s.sectionNorthSouth },
      { id: "section-clip", name: s.sectionClip },
    ];
  }, [levels, locale]);
  const requestPlan = async (levelId: string) => {
    setSheetLevelId(levelId);
    setPlanDrawing(null);
    setPlanBusy(true);
    // The cut uses element triangles: converted models must have delivered them.
    try {
      await Promise.all(models.map((m) => hydrated(m.model)));
    } catch {
      setPlanBusy(false);
      toast.error(ui(locale).bimViewerPage.geometryFailed);
      return;
    }
    const level = levels.find((l) => l.id === levelId);
    const s = ui(locale).bimSheets;
    const target = cameraRef.current?.target ?? [0, 0, 0];
    let request: SheetRequest;
    if (level) {
      const lift = canvasModels.find((m) => m.key === level.modelKey)?.placement.position[1] ?? 0;
      const { floor, cut } = planHeights(level, elementById, lift);
      request = { kind: "plan", name: level.name, height: cut, floor };
    } else if (levelId === "section-ew")
      // Through the point looked at, seen from the south (scene -z is north).
      request = { kind: "section", name: s.sectionEastWest, point: target, view: [0, 0, -1] };
    else if (levelId === "section-ns") request = { kind: "section", name: s.sectionNorthSouth, point: target, view: [1, 0, 0] };
    else if (levelId === "section-clip") request = { kind: "clip", name: s.sectionClip };
    else request = { kind: "plan", name: s.atView, height: target[1], floor: target[1] - 1.2 };
    setPlanRequest((current) => ({ ...request, revision: (current?.revision ?? 0) + 1 }));
  };

  // ---- Version comparison: colours, ghosts and hidden duplicates -----------
  const modelNames = useMemo(() => new Map(models.map((m) => [m.key, m.model.filename ?? m.key])), [models]);
  const appearanceLegend = useMemo(
    () => (appearanceProfile ? buildLegend(allElements, appearanceProfile, modelNames) : null),
    [allElements, appearanceProfile, modelNames],
  );
  const appearance = useMemo(
    () => resolveAppearance(allElements, appearanceLegend, appearanceProfile, manualLooks),
    [allElements, appearanceLegend, appearanceProfile, manualLooks],
  );
  // Clash and comparison colours are temporary views: they win while shown.
  const reviewColors = Boolean((clashColors && activeTool === "clashes") || comparison);
  const opacityOverrides = !reviewColors && appearance.opacities.size ? appearance.opacities : null;
  const canvasHidden = useMemo(
    () => (appearance.hidden.size ? new Set([...hiddenElements, ...appearance.hidden]) : hiddenElements),
    [appearance.hidden, hiddenElements],
  );
  const quantityHidden = useMemo(() => {
    const hidden = new Set(canvasHidden);
    for (const model of models)
      for (const element of model.model.elements)
        if (!model.visible || !layers[element.discipline] ||
          (isolated && !isolated.has(element.id) && !selectedElementIds.has(element.id))) hidden.add(element.id);
    return hidden;
  }, [canvasHidden, models, layers, isolated, selectedElementIds]);
  const colorOverrides = useMemo(() => {
    if (clashColors && activeTool === "clashes") return clashColors;
    if (!comparison) return appearance.colors.size ? appearance.colors : null;
    const map = new Map<string, string>();
    for (const id of comparison.diff.added) map.set(id, DIFF_COLORS.added);
    for (const id of comparison.diff.removed) map.set(id, DIFF_COLORS.removed);
    for (const id of comparison.diff.geometry) map.set(id, DIFF_COLORS.geometry);
    for (const id of comparison.diff.properties) map.set(id, DIFF_COLORS.properties);
    return map;
  }, [activeTool, appearance.colors, clashColors, comparison]);
  const comparisonVisibility = useRef<{ hidden: Set<string>; isolated: Set<string> | null } | null>(null);
  const runComparison = async (oldKey: string, newKey: string) => {
    const older = canvasModels.find((m) => m.key === oldKey);
    const newer = canvasModels.find((m) => m.key === newKey);
    if (!older || !newer) return;
    // Shapes are compared by their triangles, which converted models load in the background.
    try {
      await Promise.all([hydrated(older.model), hydrated(newer.model)]);
    } catch {
      toast.error(ui(locale).bimViewerPage.geometryFailed);
      return;
    }
    if (!modelsRef.current.some((m) => m.key === oldKey) || !modelsRef.current.some((m) => m.key === newKey)) return;
    // Old positions → world → new model frame, so a moved file is not "all changed".
    const c = Math.cos(newer.placement.rotationY);
    const sn = Math.sin(newer.placement.rotationY);
    const toNew = (p: Vec3): Vec3 => {
      const [wx, wy, wz] = applyPlacement(p, older.placement);
      const [dx, dy, dz] = [wx - newer.placement.position[0], wy - newer.placement.position[1], wz - newer.placement.position[2]];
      return [dx * c - dz * sn, dy, dx * sn + dz * c];
    };
    const diff = await compareModelsAsync(older.model.elements, newer.model.elements, toNew);
    if (!modelsRef.current.some((m) => m.key === oldKey) || !modelsRef.current.some((m) => m.key === newKey)) return;
    comparisonVisibility.current ??= { hidden: hiddenElements, isolated };
    setComparison({ oldKey, newKey, diff });
    // The old file overlaps the new one: only its removed elements stay visible.
    setHiddenElements(new Set(diff.matchedOld));
    const changed = [...diff.added, ...diff.removed, ...diff.geometry, ...diff.properties];
    setIsolated(changed.length ? new Set(changed) : null);
    toast.success(ui(locale).bimCompare.done(changed.length));
  };
  const exitComparison = () => {
    setComparison(null);
    setHiddenElements(comparisonVisibility.current?.hidden ?? new Set());
    setIsolated(comparisonVisibility.current?.isolated ?? null);
    comparisonVisibility.current = null;
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

  // Start the IFC engine while the user picks or drags a file.
  const warmEngine = () => {
    void import("./ifc-loader").then((m) => m.prewarmIfcWorker());
  };
  const pickFiles = () => {
    warmEngine();
    inputRef.current?.click();
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
    setMeasureHistory(NO_HISTORY);
    setPendingPoint(null);
    setClashPoint(null);
    setClashId(null);
    setLocalClashes([]);
    setClashColors(null);
    setClashStatus({});
    setClashReview({});
    setClashRuns([]);
    setClashLastIds(null);
    setClashNew([]);
    setClashTest(null);
    setClashSection(false);
    setComparison(null);
    setActiveLevelId(null);
    setMarkupShapes([]);
    setSavedViews([]);
    setIssues([]);
    setIssueSnapshots({});
    setSearchSets([]);
    setSelectionSets([]);
    setLayers(ALL_LAYERS);
    setExplode(0);
    setActiveTool("orbit");
    setStats({ bytes: 0, triangles: 0 });
  };

  const loadFiles = async (files: File[]) => {
    const ifc = files.filter((f) => /\.(ifc|bim4c)$/i.test(f.name));
    if (ifc.length < files.length)
      toast.error(ui(locale).bimViewerPage.onlyIfcFilesAreAccepted);
    if (!ifc.length) return;
    // Parsing holds the file, the WASM heap and the meshes at once: warn
    // before a size that commonly exhausts a browser tab.
    for (const file of ifc)
      if (file.size > LARGE_IFC_BYTES)
        toast.info(
          ui(locale).formats.largeIfc(file.name, Math.round(file.size / 1048576)),
          { duration: 9000 },
        );
    cancelLoad();
    const controller = new AbortController();
    taskRef.current = controller;
    const { loadModelFile } = await import("./ifc-loader");
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
        const parsed = await loadModelFile(
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

  // Commit the federation together: session identity and camera frame use both files.
  useEffect(() => {
    if (demoLoadedRef.current || modelsRef.current.length) return;
    demoLoadedRef.current = true;
    const controller = new AbortController();
    taskRef.current = controller;
    void (async () => {
      try {
        const { loadDemoModel } = await import("./ifc-loader");
        const loaded: FederatedModel[] = [];
        for (const [index, demo] of DEMO_MODELS.entries()) {
          controller.signal.throwIfAborted();
          setLoading({ name: demo.name, percent: 0, index: index + 1, total: DEMO_MODELS.length });
          const parsed = await loadDemoModel(demo.url, demo.hash, controller.signal);
          const key = `m${++keyCounter.current}`;
          loaded.push({ key, model: namespaced(key, parsed), visible: true, alignment: "shared", offset: { x: 0, y: 0, z: 0, rotationDeg: 0 } });
        }
        if (controller.signal.aborted || modelsRef.current.length) return;
        modelsRef.current = loaded;
        setSceneOrigin(modelOrigin(loaded[0].model));
        setModels(loaded);
        requestView("perspective");
      } catch {
        if (!controller.signal.aborted) toast.error(ui(locale).bimViewerPage.unableToReadIFCCheck, { duration: 7000 });
      } finally {
        if (taskRef.current === controller) { taskRef.current = null; setLoading(null); }
      }
    })();
    return () => { controller.abort(); demoLoadedRef.current = false; };
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
      setMeasureHistory(NO_HISTORY);
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
  useEffect(() => {
    updateModelRef.current = updateModel;
  });

  const removeModel = (key: string) => {
    setSelectedElementIds((ids) => new Set([...ids].filter((id) => !id.startsWith(`${key}/`))));
    setHiddenElements((ids) => new Set([...ids].filter((id) => !id.startsWith(`${key}/`))));
    setIsolated((ids) => {
      if (!ids) return ids;
      const kept = [...ids].filter((id) => !id.startsWith(`${key}/`));
      return kept.length ? new Set(kept) : null;
    });
    setMeasurements((list) => list.filter((measurement) => !measurement.points.some((point) => point.modelKey === key)));
    setMeasureHistory(NO_HISTORY);
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
    const previous = pendingPoints.at(-1);
    const startsSegment = measureMode === "accumulate" && pendingPoints.length % 2 === 0;
    if (previous && !startsSegment && Math.hypot(point.x - previous.x, point.y - previous.y, point.z - previous.z) < 1e-7) return;
    const points = [...pendingPoints, point];
    const open = isOpenEnded(measureMode);
    // Open-ended modes keep taking points until finished (Enter), up to the
    // most a session can store; fixed ones complete at their count.
    if (open ? points.length < MAX_MEASURE_POINTS : !finishedPoints(measureMode, points)) {
      setPendingPoints(points);
      return;
    }
    if (open) toast.info(ui(locale).bimControlsOverlay.pointLimitReached(MAX_MEASURE_POINTS));
    addMeasurement(measureMode, finishedPoints(measureMode, points)!);
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
      selectionSets,
      clashStatus,
      clashReview,
      clashRuns,
      ...(clashLastIds ? { clashLastIds } : {}),
      clashNew,
      appearance: { profile: appearanceProfile, manual: manualLooks },
    };
    // Content tokens, so the file restores against the same IFC files in any order.
    const stable = tokens
      ? {
          ...stabilizeSession(data, tokens),
          files: models.map((m) => ({ token: tokens.get(m.key), filename: m.model.filename })),
        }
      : data;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(stable, null, 2)], { type: "application/json" }),
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
      // Exports carry content tokens; older ones carry this visit’s model keys.
      applySession(tokens && /"h:[0-9a-f]{16}/.test(JSON.stringify(session)) ? localizeSession(session, tokens) : session);
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
            accept=".ifc,.bim4c"
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
            onClick={pickFiles}
            aria-label={v.uploadIfc}
            title={`${ui(locale).bimViewerPage.addOneOrMoreIFC}. ${ui(locale).bimViewerPage.processedLocally}`}
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
            <FolderOpen className="size-4" />
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
            className={`flex min-h-10 items-center gap-1 rounded-lg border px-2 text-xs ${inspector ? "border-teal-400/60 bg-teal-500/15 text-teal-100" : "border-white/15 hover:bg-white/5"}`}
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
          sheetOpen={sheetOpen}
          onToggleSheet={() => {
            const open = !sheetOpen;
            setSheetOpen(open);
            // Opens on the level of the selection, else the lowest one (or the height looked at).
            if (open && !planDrawing && !planBusy) {
              const level = levels.find((l) => selectedElement && l.ids.includes(selectedElement.id)) ?? levels[0];
              void requestPlan(level?.id ?? "view");
            }
          }}
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
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-4 text-center">
              <button
                type="button"
                className="pointer-events-auto rounded-xl bg-teal-400 px-6 py-4 font-semibold text-slate-950"
                onClick={pickFiles}
              >
                {ui(locale).bimViewerPage.chooseOneOrMoreIFC}
              </button>
              <p className="max-w-sm rounded-lg bg-slate-950/80 px-3 py-1.5 text-xs text-slate-200">
                {ui(locale).bimViewerPage.processedLocally}
              </p>
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
            hiddenElementIds={canvasHidden}
            isolatedElementIds={isolated}
            colorOverrides={colorOverrides}
            opacityOverrides={opacityOverrides}
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
            redlineRevision={redlineRevision}
            planRequest={planRequest}
            onPlan={(drawing) => {
              setPlanDrawing(drawing);
              setPlanBusy(false);
            }}
            onRedline={(shapes) => {
              if (!shapes.length) return;
              // Opens the markup tool on the current view with the measurements drawn in.
              setMarkupShapes(shapes);
              setActiveTool("markup");
            }}
            onMeasureShortest={(a, b) => {
              addMeasurement("shortest", [a, b]);
              setPendingPoint(null);
            }}
            measureLock={measureLock}
            measureUnits={measureUnits}
          />
          {sheetOpen && (
            <div className="relative w-[46%] min-w-0 shrink-0 max-md:absolute max-md:inset-x-0 max-md:bottom-0 max-md:z-30 max-md:h-1/2 max-md:w-full">
              <BimSheetView
                drawing={planDrawing}
                levels={sheetLevels}
                levelId={sheetLevelId}
                onLevel={(id) => void requestPlan(id)}
                selectedIds={selectedElementIds}
                onSelect={(id, append) => {
                  const element = id ? elementById.get(id) : null;
                  if (!element) return clearSelection();
                  if (append) selectIds([...new Set([...selectedElementIds, element.id])]);
                  else {
                    selectIds([element.id]);
                    setInspector(true);
                  }
                }}
                camera={() => cameraRef.current ?? null}
                project={(models[0]?.model.filename ?? "BIM4C").replace(/\.(ifc|bim4c)$/i, "")}
                busy={planBusy}
                onClose={() => setSheetOpen(false)}
              />
            </div>
          )}
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
          {activeTool === "appearance" && (
            <BimAppearancePanel
              elements={allElements}
              selectedIds={selectedElementIds}
              profile={appearanceProfile}
              legend={appearanceLegend}
              onProfile={setAppearanceProfile}
              manual={manualLooks}
              onManual={setManualLooks}
              onSelect={(ids) => {
                selectIds(ids);
                setInspector(ids.length > 0);
              }}
              onClose={() => setActiveTool("orbit")}
            />
          )}
          {activeTool === "quantities" && (
            <BimQuantitiesPanel
              elements={allElements}
              geometryRevision={geometryRevision}
              hiddenIds={quantityHidden}
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
              onAddFiles={pickFiles}
              onDownloadPackage={(key) => void downloadPackage(key)}
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
            modelMapConversions={modelMapConversions}
            measureMode={measureMode}
            onMeasureMode={(mode) => {
              setMeasureMode(mode);
              setPendingPoint(null);
            }}
            snapSettings={snapSettings}
            onSnapSettings={setSnapSettings}
            measurements={measurements}
            pendingPoint={pendingPoint}
            pendingCount={pendingPoints.length}
            onFinishMeasurement={finishMeasurement}
            onRemoveMeasurement={(id) =>
              changeMeasurements(measurements.filter((m) => m.id !== id))
            }
            onRedlineMeasurements={() => setRedlineRevision((n) => n + 1)}
            onMeasurementIssue={() => {
              if (!measurements.length) return;
              const o = ui(locale).bimControlsOverlay;
              const pointText = (p: { x: number; y: number; z: number }) => {
                const [x, y, z] = sceneToWorld(p, sceneOrigin);
                return `X ${x.toFixed(3)}  Y ${y.toFixed(3)}  Z ${z.toFixed(3)} (m)`;
              };
              const description = measurements
                .map((m, i) => `#${i + 1} ${o.modes[m.mode]}: ${describeMeasurement(m, measureUnits, locale, pointText)}`)
                .join("\n");
              // The measured elements, matched by model and GlobalId.
              const measured = new Set(measurements.flatMap((m) => m.points.map((p) => `${p.modelKey}|${p.guid}`)));
              const ids = allElements.filter((e) => measured.has(`${e.modelKey}|${e.guid}`)).map((e) => e.id);
              addLocalIssue(o.measurementIssueTitle(measurements.length), description, ids);
              toast.success(o.measurementIssueCreated);
            }}
            onClearMeasurements={() => {
              if (measurements.length) changeMeasurements([]);
              setPendingPoint(null);
            }}
            measureLock={measureLock}
            onMeasureLock={setMeasureLock}
            measureUnits={measureUnits}
            onMeasureUnits={changeMeasureUnits}
            canUndoMeasurement={pendingPoints.length > 0 || measureHistory.past.length > 0}
            canRedoMeasurement={measureHistory.future.length > 0}
            onUndoMeasurement={undoMeasurement}
            onRedoMeasurement={redoMeasurement}
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
                  checked={clashCheckedFor !== null && clashCheckedFor === activeClashTest}
                  onRun={() => void runLocalClashCheck()}
                  onCancel={cancelClashCheck}
                  onFocus={focusClash}
                  onStatus={(id, status) => {
                    setClashStatus((all) => ({ ...all, [id]: status }));
                    setClashReview((all) => reviewChange(all, id, { status, ...(reviewer && { by: reviewer }) }));
                  }}
                  review={clashReview}
                  onReview={(id, change) => setClashReview((all) => reviewChange(all, id, { ...change, ...(reviewer && { by: reviewer }) }))}
                  reviewer={reviewer}
                  onReviewer={changeReviewer}
                  newIds={clashNewSet}
                  runs={clashRuns}
                  levelOf={levelOf}
                  sectionAround={clashSection}
                  onSectionAround={setClashSection}
                  inClashView={Boolean(clashColors && clashId)}
                  onExit={exitClashView}
                  onExportBcf={exportClashesBcf}
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
            onGoToIssue={goToIssue}
            onExportIssuesBcf={exportIssuesBcf}
            onImportBcf={(file) => void importBcf(file)}
            issueSnapshots={issueSnapshots}
            selectionSets={selectionSets}
            onSaveSelectionSet={saveSelectionSet}
            onApplySelectionSet={applySelectionSet}
            onDeleteSelectionSet={(id) => setSelectionSets((sets) => sets.filter((set) => set.id !== id))}
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
              <div>
                <p>{ui(locale).bimViewerPage.dropOneOrMoreIFC}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {ui(locale).bimViewerPage.processedLocally}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-white/10 px-3 py-2 text-[11px] text-slate-400">
        <span>
          {elementCount} {v.performance.elements}
          <span className="hidden sm:inline">
            {" "}
            · {stats.triangles.toLocaleString(locale)}{" "}
            {ui(locale).bimViewerPage.triangles} ·{" "}
            {stats.bytes < 1048576
              ? `${Math.ceil(stats.bytes / 1024).toLocaleString(locale)} KB`
              : `${(stats.bytes / 1048576).toFixed(1)} MB`}{" "}
            {ui(locale).bimViewerPage.geometryBuffers}
          </span>
        </span>
        <Link
          href={ROUTES.contact}
          className="hidden text-slate-300 underline-offset-2 hover:text-teal-300 hover:underline md:inline"
        >
          {ui(locale).bimViewerPage.consultCta}
        </Link>
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
