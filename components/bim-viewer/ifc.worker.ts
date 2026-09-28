import { IfcAPI } from "web-ifc";
import { IfcImporter } from "@thatopen/fragments";
import { parseIfcData } from "./ifc-parser";

type InitMessage = { type: "init"; wasmPath: string };
type ParseMessage = {
  type: "parse";
  buffer: ArrayBuffer;
  filename: string;
  wasmPath: string;
  /** Also convert to ThatOpen Fragments; the parse then keeps only element boxes. */
  fragments?: boolean;
};

// A single-use worker also releases its WASM heap when cancelled or finished.
// It may be started ahead of time ("init") so the WASM download and compile
// overlap with fetching or picking the IFC file.
let api: IfcAPI | null = null;
let ready: Promise<void> | null = null;
const init = (wasmPath: string) => {
  if (!ready) {
    api = new IfcAPI();
    api.SetWasmPath(wasmPath, true);
    ready = api.Init((path) => `${wasmPath}${path}`, true);
  }
  return ready;
};

self.onmessage = async ({ data }: MessageEvent<InitMessage | ParseMessage>) => {
  if (data.type === "init") {
    // Errors surface on the parse that awaits the same promise.
    init(data.wasmPath).catch(() => {});
    return;
  }
  try {
    await init(data.wasmPath);
    let lastProgress = -1;
    const report = (percent: number) => {
      percent = Math.round(percent);
      if (percent !== lastProgress) {
        lastProgress = percent;
        self.postMessage({ type: "progress", percent });
      }
    };
    const bytes = new Uint8Array(data.buffer);
    // Converting: properties and boxes first (0–40 %), then the Fragments model.
    const model = parseIfcData(
      api!,
      bytes,
      data.filename,
      (percent) => report(data.fragments ? percent * 0.4 : percent),
      { geometry: data.fragments ? "bounds" : "full" },
    );
    const transfer: ArrayBuffer[] = [];
    if (data.fragments) {
      // Its own web-ifc instance: free ours first, the file may be hundreds of MB.
      api?.Dispose();
      api = null;
      const importer = new IfcImporter();
      importer.wasm = { path: data.wasmPath, absolute: true };
      // The parse succeeded, so a failure here is the converter's: the page
      // falls back to the parser's own triangles (see ifc-loader.ts).
      const fragments = await importer
        .process({
          bytes,
          raw: false,
          progressCallback: (progress) => report(40 + Math.min(1, progress) * 59),
        })
        .catch(() => {
          throw new Error("FRAGMENTS_FAILED");
        });
      if (!fragments?.length) throw new Error("FRAGMENTS_FAILED");
      model.fragments = fragments;
      transfer.push(fragments.buffer as ArrayBuffer);
    }
    for (const element of model.elements)
      for (const array of [
        element.geometryData?.positions,
        element.geometryData?.normals,
        element.geometryData?.indices,
      ]) {
        if (ArrayBuffer.isView(array))
          transfer.push(array.buffer as ArrayBuffer);
      }
    for (const e of model.elements)
      for (const root of e.geometryData?.bvh?.roots ?? [])
        transfer.push(root as ArrayBuffer);
    self.postMessage(
      { type: "result", model },
      { transfer: [...new Set(transfer)] },
    );
  } catch (error) {
    self.postMessage({
      type: "error",
      error: error instanceof Error ? error.message : "IFC_INVALID",
    });
  } finally {
    api?.Dispose();
  }
};
