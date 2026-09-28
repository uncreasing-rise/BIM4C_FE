/**
 * Stable identities for saved sessions.
 *
 * In memory, element ids are "<modelKey>/ifc-<expressID>" and model keys
 * ("m1", "m2", …) follow the order files were opened, so they change when the
 * same files are opened in another order. Saved sessions therefore replace
 * each model key with a token derived from the file's content hash
 * ("h:<16 hex>", with "~n" for the n-th copy of an identical file) and
 * translate back when loading. Only id-bearing fields are rewritten; titles
 * and descriptions typed by users are never touched.
 */

type Json = Record<string, unknown>;

/** Content-hash token for each model key; identical files get ~1, ~2… */
export function modelTokens(models: { key: string; hash?: string }[]): Map<string, string> | null {
  if (!models.length || models.some((m) => !m.hash)) return null;
  const seen = new Map<string, number>();
  return new Map(
    models.map((m) => {
      const base = `h:${m.hash!.slice(0, 16)}`;
      const n = seen.get(base) ?? 0;
      seen.set(base, n + 1);
      return [m.key, n ? `${base}~${n}` : base];
    }),
  );
}

/** Order-independent session identity for a set of files. */
export const sessionIdentity = (tokens: Map<string, string>) => [...tokens.values()].sort().join("|");

// A model key or token at the start of an id or after "-" (clash ids embed two).
const KEY = /(^|-)(m\d+)(?=\/|$)/g;
const TOKEN = /(^|-)(h:[0-9a-f]{16}(?:~\d+)?)(?=\/|$)/g;

function rewriteIds(session: Json, pattern: RegExp, map: Map<string, string>): Json {
  const id = (value: unknown) =>
    typeof value === "string" ? value.replace(pattern, (whole, lead: string, key: string) => (map.has(key) ? lead + map.get(key) : whole)) : value;
  const ids = (value: unknown) => (Array.isArray(value) ? value.map(id) : value);
  const out: Json = { ...session };
  if ("hiddenElements" in out) out.hiddenElements = ids(out.hiddenElements);
  if (Array.isArray(out.measurements))
    out.measurements = out.measurements.map((m: Json) => ({
      ...m,
      points: Array.isArray(m.points) ? m.points.map((p: Json) => ("modelKey" in p ? { ...p, modelKey: id(p.modelKey) } : p)) : m.points,
    }));
  if (Array.isArray(out.savedViews))
    out.savedViews = out.savedViews.map((v: Json) => ({
      ...v,
      ...("modelKey" in v ? { modelKey: id(v.modelKey) } : {}),
      elementIds: ids(v.elementIds),
      ...("hiddenElements" in v ? { hiddenElements: ids(v.hiddenElements) } : {}),
      ...("isolatedElements" in v ? { isolatedElements: ids(v.isolatedElements) } : {}),
      ...(Array.isArray(v.models) ? { models: v.models.map((m: Json) => ({ ...m, key: id(m.key) })) } : {}),
    }));
  if (Array.isArray(out.issues))
    out.issues = out.issues.map((i: Json) => ({
      ...i,
      elementIds: ids(i.elementIds),
      ...("clashId" in i ? { clashId: id(i.clashId) } : {}),
    }));
  for (const field of ["clashStatus", "clashReview"] as const)
    if (out[field] && typeof out[field] === "object")
      out[field] = Object.fromEntries(Object.entries(out[field] as Json).map(([k, v]) => [id(k) as string, v]));
  if ("clashLastIds" in out) out.clashLastIds = ids(out.clashLastIds);
  if ("clashNew" in out) out.clashNew = ids(out.clashNew);
  return out;
}

/** In-memory ids -> content tokens, for saving. */
export const stabilizeSession = <T extends Json>(session: T, tokens: Map<string, string>) =>
  rewriteIds(session, KEY, tokens) as T;

/** Content tokens -> the keys of the files open now, for loading. */
export const localizeSession = <T extends Json>(session: T, tokens: Map<string, string>) =>
  rewriteIds(session, TOKEN, new Map([...tokens].map(([key, token]) => [token, key]))) as T;

/** SHA-256 of a file's bytes as hex (Web Crypto; undefined where unavailable). */
export async function contentHash(data: Blob): Promise<string | undefined> {
  try {
    const digest = await crypto.subtle.digest("SHA-256", await data.arrayBuffer());
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return undefined;
  }
}
