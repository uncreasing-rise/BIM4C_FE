import type { BimModelDefinition } from "./types";
import { contentHash } from "./session-ids";
import { readCachedModel, writeCachedModel } from "./fragments-cache";
import { decodePackage, MAX_PACKAGE_BYTES, PACKAGE_EXTENSION } from "./bim-package";

const wasmPath = () => new URL("/wasm/", location.href).href;

// One worker started ahead of time: its web-ifc chunk and WASM load while the
// IFC file is fetched or picked. Each parse takes it (workers are single-use).
let warm: Worker | null = null;

const createWorker = () => {
  const worker = new Worker(new URL("./ifc.worker.ts", import.meta.url), {
    type: "module",
  });
  worker.postMessage({ type: "init", wasmPath: wasmPath() });
  return worker;
};

/** Start the IFC engine before a file is ready; safe to call repeatedly. */
export function prewarmIfcWorker() {
  warm ??= createWorker();
}

const takeWorker = () => {
  const worker = warm ?? createWorker();
  warm = null;
  return worker;
};

export interface ParseOptions {
  /**
   * Convert to ThatOpen Fragments (the default): drawn with levels of detail,
   * a fraction of the memory, and cached in this browser so the next open
   * skips parsing. `false` keeps the parser's own triangles (tests, fallback).
   */
  fragments?: boolean;
  /** Called when the converted model came from this browser's cache. */
  onCacheHit?: () => void;
}

export async function parseIfcFileToBimModel(
  file: File,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
  options: ParseOptions = {},
): Promise<BimModelDefinition> {
  if (!file.size) throw new Error("IFC_FILE_EMPTY");
  signal?.throwIfAborted();
  // ?engine=parser opens files the pre-Fragments way (diagnostics, comparisons).
  const forceParser = typeof location !== "undefined" && new URLSearchParams(location.search).get("engine") === "parser";
  const fragments = options.fragments ?? !forceParser;
  // Hashed from its own copy while the worker parses the transferred one.
  const hash = contentHash(file);
  const key = fragments ? await hash : undefined;
  if (key) {
    const cached = await readCachedModel(key);
    signal?.throwIfAborted();
    if (cached) {
      options.onCacheHit?.();
      onProgress?.(100);
      return { ...cached, filename: file.name, contentHash: await hash };
    }
  }
  const buffer = await file.arrayBuffer();
  signal?.throwIfAborted();
  const model = await new Promise<BimModelDefinition>((resolve, reject) => {
    const worker = takeWorker();
    const cleanup = () => {
      worker.terminate();
      signal?.removeEventListener("abort", abort);
    };
    const abort = () => {
      cleanup();
      reject(new DOMException("Cancelled", "AbortError"));
    };
    signal?.addEventListener("abort", abort, { once: true });
    worker.onerror = () => {
      cleanup();
      reject(new Error("IFC_WORKER_FAILED"));
    };
    worker.onmessageerror = () => {
      cleanup();
      reject(new Error("IFC_WORKER_FAILED"));
    };
    worker.onmessage = ({ data }) => {
      if (data.type === "progress") onProgress?.(data.percent);
      else {
        cleanup();
        if (data.type === "result") resolve(data.model);
        else reject(new Error(data.error));
      }
    };
    worker.postMessage(
      { type: "parse", buffer, filename: file.name, wasmPath: wasmPath(), fragments },
      [buffer],
    );
  }).catch((error: unknown) => {
    // The file itself is fine but converting it failed: open it the way the
    // viewer did before Fragments (its own triangles), rather than not at all.
    if (fragments && error instanceof Error && error.message === "FRAGMENTS_FAILED")
      return parseIfcFileToBimModel(file, onProgress, signal, { ...options, fragments: false });
    throw error;
  });
  const result = { ...model, contentHash: await hash };
  // Not awaited: the model shows while it is being stored.
  if (result.fragments && result.contentHash) void writeCachedModel(result.contentHash, result);
  return result;
}

/** An .ifc file (parsed and converted, or from the cache) or a .bim4c package. */
export async function loadModelFile(
  file: File,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
  options: ParseOptions = {},
): Promise<BimModelDefinition> {
  if (!file.name.toLowerCase().endsWith(PACKAGE_EXTENSION))
    return parseIfcFileToBimModel(file, onProgress, signal, options);
  signal?.throwIfAborted();
  if (file.size > MAX_PACKAGE_BYTES) throw new Error("PACKAGE_TOO_LARGE");
  const model = await decodePackage(new Uint8Array(await file.arrayBuffer()));
  signal?.throwIfAborted();
  onProgress?.(100);
  // Its IFC opens instantly from now on, too.
  if (model.contentHash) void writeCachedModel(model.contentHash, model);
  return { ...model, filename: model.filename ?? file.name };
}

/** The body as bytes, reporting 0–95 % as it downloads (decoding is the rest). */
async function readWithProgress(response: Response, onProgress?: (percent: number) => void) {
  // Content-Length is the compressed size when the server gzips: capped, not exact.
  const total = Number(response.headers.get("content-length")) || 0;
  if (!onProgress || !total || !response.body) return new Uint8Array(await response.arrayBuffer());
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  let reported = -1;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    const percent = Math.min(95, Math.floor((received / total) * 95));
    if (percent !== reported) onProgress((reported = percent));
  }
  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}

/** Load a preconverted public demo, reusing its content-addressed cache. */
export async function loadDemoModel(
  url: string,
  hash: string,
  signal: AbortSignal,
  onProgress?: (percent: number) => void,
): Promise<BimModelDefinition> {
  const cached = await readCachedModel(hash);
  signal.throwIfAborted();
  if (cached) {
    onProgress?.(100);
    return cached;
  }
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`IFC_HTTP_${response.status}`);
  const model = await decodePackage(await readWithProgress(response, onProgress));
  signal.throwIfAborted();
  if (model.contentHash !== hash) throw new Error("PACKAGE_INVALID");
  void writeCachedModel(hash, model);
  onProgress?.(100);
  return model;
}

export async function parseIfcFromUrl(
  url: string,
  filename = "bim4c-commercial-tower.ifc",
  signal?: AbortSignal,
  onProgress?: (percent: number) => void,
): Promise<BimModelDefinition> {
  // Engine start-up and the download run side by side.
  prewarmIfcWorker();
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`IFC_HTTP_${response.status}`);
  const blob = await response.blob();
  return parseIfcFileToBimModel(new File([blob], filename), onProgress, signal);
}
