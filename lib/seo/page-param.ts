/**
 * Items per page of each public listing. The page that fetches a listing and
 * the check that clamps its page number must use the same size: technical and
 * news fetched 5 but counted pages of 6, so the 6th post's page redirected away.
 * Posts are 5 because their layout is one featured story plus four beside it.
 */
export const PAGE_SIZE = {
  services: 6,
  projects: 6,
  courses: 6,
  posts: 5,
} as const;

/**
 * The canonical form of a listing URL's `page` parameter: absent for page 1,
 * otherwise a plain number ("02" → "2"). Returns the corrected query, or null
 * when it is already canonical. Pure, so the proxy can redirect at the edge
 * before any page streams (a redirect from a page arrives as a delayed
 * meta refresh instead).
 */
export function canonicalPageQuery(search: URLSearchParams): URLSearchParams | null {
  const values = search.getAll("page");
  if (!values.length) return null;
  const raw = values[0];
  const number = /^\d+$/.test(raw) ? Number(raw) : NaN;
  const canonical = Number.isSafeInteger(number) && number > 1 ? String(number) : null;
  if (values.length === 1 && canonical === raw) return null;
  const next = new URLSearchParams(search);
  next.delete("page");
  if (canonical) next.set("page", canonical);
  return next;
}
