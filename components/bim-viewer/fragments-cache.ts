/**
 * Converted models kept in this browser (IndexedDB), keyed by the IFC file's
 * SHA-256: reopening a file skips parsing and conversion entirely. Nothing is
 * sent anywhere. Entries record the converter version, so an upgrade simply
 * converts again; the least recently used entries go once the cache is full.
 */
import type { BimModelDefinition } from "./types";

const DB = "bim4c-viewer";
const STORE = "fragments";
/** Bump when the parser output or the Fragments format changes. */
export const CACHE_VERSION = "frag-3.4.7/parser-1";
/** Total size kept before the least recently used models are dropped. */
const MAX_BYTES = 1.5 * 1024 ** 3;

interface Entry {
  hash: string;
  version: string;
  model: BimModelDefinition;
  bytes: number;
  usedAt: number;
}

let opening: Promise<IDBDatabase> | null = null;
function open(): Promise<IDBDatabase> {
  opening ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore(STORE, { keyPath: "hash" });
      store.createIndex("usedAt", "usedAt");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  // A failed open (private mode, blocked storage) is retried next time.
  opening.catch(() => (opening = null));
  return opening;
}

const done = (tx: IDBTransaction) =>
  new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = tx.onabort = () => reject(tx.error);
  });
const result = <T>(request: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

/** Rough in-memory size of a model: its Fragments plus its serialised metadata. */
export function modelBytes(model: BimModelDefinition) {
  let bytes = model.fragments?.byteLength ?? 0;
  for (const element of model.elements)
    for (const set of element.psets) bytes += 64 + set.properties.length * 64;
  return bytes + model.elements.length * 512;
}

/** The converted model for this file, or null (absent, outdated or storage unavailable). */
export async function readCachedModel(hash: string): Promise<BimModelDefinition | null> {
  try {
    const db = await open();
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const entry = (await result(store.get(hash))) as Entry | undefined;
    if (!entry || entry.version !== CACHE_VERSION || !entry.model.fragments) {
      if (entry) store.delete(hash);
      await done(tx);
      return null;
    }
    entry.usedAt = Date.now();
    store.put(entry);
    await done(tx);
    return entry.model;
  } catch {
    return null;
  }
}

/** Stores a converted model; failures (quota, private mode) only mean no cache. */
export async function writeCachedModel(hash: string, model: BimModelDefinition): Promise<void> {
  try {
    const db = await open();
    const bytes = modelBytes(model);
    if (bytes > MAX_BYTES) return;
    // Evict least recently used entries until the new one fits.
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const all = (await result(store.index("usedAt").getAll())) as Entry[];
    let total = all.reduce((sum, e) => sum + (e.hash === hash ? 0 : e.bytes), 0) + bytes;
    for (const old of all) {
      if (total <= MAX_BYTES) break;
      if (old.hash === hash) continue;
      store.delete(old.hash);
      total -= old.bytes;
    }
    const entry: Entry = { hash, version: CACHE_VERSION, model, bytes, usedAt: Date.now() };
    store.put(entry);
    await done(tx);
  } catch {
    /* No cache: the file is converted again next time. */
  }
}

/** Every cached model's hash and size (for the models panel's storage line). */
export async function cachedModelsSize(): Promise<{ count: number; bytes: number }> {
  try {
    const db = await open();
    const entries = (await result(db.transaction(STORE).objectStore(STORE).getAll())) as Entry[];
    return { count: entries.length, bytes: entries.reduce((sum, e) => sum + e.bytes, 0) };
  } catch {
    return { count: 0, bytes: 0 };
  }
}

export async function clearCachedModels(): Promise<void> {
  try {
    const db = await open();
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    await done(tx);
  } catch {
    /* Nothing to clear. */
  }
}
