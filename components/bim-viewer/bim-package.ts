/**
 * A converted model as one file (.bim4c): the element data the viewer's
 * panels read (properties, storeys, boxes) plus the ThatOpen Fragments model
 * it draws. Opening one skips IFC parsing and conversion entirely, so a
 * large project can be converted once — in the browser, or on a server with
 * scripts/ifc-to-bim4c.mjs — and shared.
 *
 * Layout: "BIM4CPKG" · u32 format version · u32 metadata length · gzip(JSON
 * metadata) · Fragments bytes. Little-endian. Runs in browsers and Node 18+.
 */
import type { BimModelDefinition } from "./types";

const MAGIC = "BIM4CPKG";
export const PACKAGE_VERSION = 1;
export const PACKAGE_EXTENSION = ".bim4c";

async function gzip(bytes: Uint8Array, mode: "compress" | "decompress") {
  const stream =
    mode === "compress" ? new CompressionStream("gzip") : new DecompressionStream("gzip");
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

/**
 * Element ids and model keys are the viewer's (namespaced per open file);
 * the package keeps the file's own ids, and no triangles (Fragments has them).
 */
function portable(model: BimModelDefinition): BimModelDefinition {
  const { fragments: _fragments, ...rest } = model;
  void _fragments;
  return {
    ...rest,
    elements: model.elements.map(({ geometryData: _geometry, modelKey: _key, ...element }) => {
      void _geometry;
      void _key;
      return { ...element, id: element.id.slice(element.id.lastIndexOf("/") + 1) };
    }),
    clashes: model.clashes.map((c) => ({ ...c, id: c.id.slice(c.id.lastIndexOf("/") + 1) })),
  };
}

export async function encodePackage(model: BimModelDefinition): Promise<Uint8Array> {
  if (!model.fragments) throw new Error("PACKAGE_NO_FRAGMENTS");
  const meta = await gzip(new TextEncoder().encode(JSON.stringify(portable(model))), "compress");
  const out = new Uint8Array(16 + meta.length + model.fragments.length);
  out.set(new TextEncoder().encode(MAGIC), 0);
  const view = new DataView(out.buffer);
  view.setUint32(8, PACKAGE_VERSION, true);
  view.setUint32(12, meta.length, true);
  out.set(meta, 16);
  out.set(model.fragments, 16 + meta.length);
  return out;
}

export function isPackage(bytes: Uint8Array) {
  return bytes.length > 16 && new TextDecoder().decode(bytes.subarray(0, 8)) === MAGIC;
}

export async function decodePackage(bytes: Uint8Array): Promise<BimModelDefinition> {
  if (!isPackage(bytes)) throw new Error("PACKAGE_INVALID");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const version = view.getUint32(8, true);
  if (version > PACKAGE_VERSION) throw new Error("PACKAGE_TOO_NEW");
  const length = view.getUint32(12, true);
  if (16 + length > bytes.length) throw new Error("PACKAGE_INVALID");
  const meta = JSON.parse(new TextDecoder().decode(await gzip(bytes.subarray(16, 16 + length), "decompress")));
  if (!meta || !Array.isArray(meta.elements)) throw new Error("PACKAGE_INVALID");
  return { ...(meta as BimModelDefinition), fragments: bytes.slice(16 + length) };
}
