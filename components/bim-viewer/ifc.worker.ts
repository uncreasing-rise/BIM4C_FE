import { IfcAPI } from "web-ifc";
import { parseIfcData } from "./ifc-parser";

// A single-use worker also releases its WASM heap when cancelled or finished.
self.onmessage = async ({
  data,
}: MessageEvent<{
  buffer: ArrayBuffer;
  filename: string;
  wasmPath: string;
}>) => {
  const api = new IfcAPI();
  try {
    api.SetWasmPath(data.wasmPath, true);
    await api.Init((path) => `${data.wasmPath}${path}`, true);
    let lastProgress = -1;
    const model = parseIfcData(
      api,
      new Uint8Array(data.buffer),
      data.filename,
      (percent) => {
        if (percent !== lastProgress) {
          lastProgress = percent;
          self.postMessage({ type: "progress", percent });
        }
      },
    );
    const transfer: ArrayBuffer[] = [];
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
    api.Dispose();
  }
};
