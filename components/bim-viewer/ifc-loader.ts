import type { BimModelDefinition } from "./types";

export async function parseIfcFileToBimModel(
  file: File,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<BimModelDefinition> {
  if (!file.size) throw new Error("IFC_FILE_EMPTY");
  signal?.throwIfAborted();
  const buffer = await file.arrayBuffer();
  signal?.throwIfAborted();
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./ifc.worker.ts", import.meta.url), {
      type: "module",
    });
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
      {
        buffer,
        filename: file.name,
        wasmPath: new URL("/wasm/", location.href).href,
      },
      [buffer],
    );
  });
}

export async function parseIfcFromUrl(
  url: string,
  filename = "bim4c-commercial-tower.ifc",
  signal?: AbortSignal,
): Promise<BimModelDefinition> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`IFC_HTTP_${response.status}`);
  const blob = await response.blob();
  return parseIfcFileToBimModel(new File([blob], filename), undefined, signal);
}
