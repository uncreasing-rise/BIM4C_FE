/**
 * First-party, cookieless analytics for the public site.
 *
 * - No cookies and no lasting id: a visit is a random id in sessionStorage
 *   (this tab only) that ends after 30 minutes without activity. The server
 *   derives a daily-rotating visitor hash and never stores the IP.
 * - Respects Do Not Track / Global Privacy Control, skips automated
 *   browsers and never runs in the admin.
 * - Page views, time on page and scroll depth, link clicks (calls, email,
 *   Zalo, downloads, outbound), elements marked data-track, site searches
 *   and form submissions, sent in small batches that survive page unload.
 */
import { env } from "@/lib/config/env";

export type AnalyticsEventType =
  | "pageview"
  | "engagement"
  | "click"
  | "outbound"
  | "download"
  | "contact"
  | "search"
  | "form_submit";

interface AnalyticsEvent {
  type: AnalyticsEventType;
  path: string;
  sessionId: string;
  locale?: "vi" | "en";
  target?: string;
  label?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  durationMs?: number;
  scrollDepth?: number;
}

interface VisitStart {
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPage: string;
}

const SESSION_KEY = "bim4c.visit";
const START_KEY = "bim4c.visit.start";
const PAGES_KEY = "bim4c.visit.pages";
const IDLE_MS = 30 * 60_000;
const FLUSH_MS = 4000;
const MAX_PAGES = 15;

const store = (): Storage | null => {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};
const read = <T,>(key: string): T | null => {
  try {
    const raw = store()?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};
const write = (key: string, value: unknown) => {
  try {
    store()?.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked: the visit simply is not continued */
  }
};

/** Whether this browser and page may be measured at all. */
export function trackingAllowed(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean; doNotTrack?: string | null };
  if (nav.webdriver) return false;
  if (nav.globalPrivacyControl || nav.doNotTrack === "1") return false;
  if (/^\/(?:(?:vi|en)\/)?admin(\/|$)/.test(window.location.pathname)) return false;
  return Boolean(env.apiUrl);
}

const randomId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

/** The current visit's id; a new visit starts after 30 idle minutes. */
function visitId(): string {
  const now = Date.now();
  const current = read<{ id: string; last: number }>(SESSION_KEY);
  if (current && now - current.last < IDLE_MS) {
    write(SESSION_KEY, { id: current.id, last: now });
    return current.id;
  }
  const id = randomId();
  write(SESSION_KEY, { id, last: now });
  // How this visit began: the referring site and campaign tags, if any.
  const params = new URLSearchParams(window.location.search);
  const start: VisitStart = {
    referrer: document.referrer || undefined,
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
    landingPage: window.location.pathname,
  };
  write(START_KEY, start);
  write(PAGES_KEY, []);
  return id;
}

const localeOf = (path: string) => (/^\/en(\/|$)/.test(path) ? "en" : /^\/vi(\/|$)/.test(path) ? "vi" : undefined);

// ---- Sending ---------------------------------------------------------------

const queue: AnalyticsEvent[] = [];
let timer = 0;

function flush() {
  window.clearTimeout(timer);
  timer = 0;
  while (queue.length) {
    const events = queue.splice(0, 25);
    try {
      // keepalive lets the last batch leave while the page is closing.
      void fetch(`${env.apiUrl}/analytics/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events }),
        keepalive: true,
        credentials: "omit",
      }).catch(() => undefined);
    } catch {
      /* measurement must never break the page */
    }
  }
}

function push(event: Omit<AnalyticsEvent, "sessionId" | "path" | "locale"> & { path?: string }) {
  if (!trackingAllowed()) return;
  const path = event.path ?? window.location.pathname;
  const start = read<VisitStart>(START_KEY);
  queue.push({
    ...event,
    path,
    sessionId: visitId(),
    locale: localeOf(path),
    referrer: start?.referrer,
    utmSource: start?.utmSource,
    utmMedium: start?.utmMedium,
    utmCampaign: start?.utmCampaign,
    ...(event.label ? { label: event.label.slice(0, 200) } : {}),
    ...(event.target ? { target: event.target.slice(0, 1000) } : {}),
  });
  if (queue.length >= 20) flush();
  else if (!timer) timer = window.setTimeout(flush, FLUSH_MS);
}

export function trackEvent(type: AnalyticsEventType, details: { target?: string; label?: string } = {}) {
  push({ type, ...details });
}

// ---- Page views and engagement -------------------------------------------

let page: { path: string; visibleSince: number | null; visibleMs: number; scroll: number } | null = null;

const scrollDepth = () => {
  const doc = document.documentElement;
  const height = Math.max(doc.scrollHeight - window.innerHeight, 1);
  return Math.min(100, Math.round(((window.scrollY || doc.scrollTop) / height) * 100));
};

/**
 * Reports the time the page was visible since the last report, and how far
 * it was read. Sent whenever the tab is hidden too, because mobile browsers
 * often close a hidden tab without any unload event; the server adds the
 * parts up per page view.
 */
function reportEngagement() {
  if (!page) return;
  const visibleMs = page.visibleMs + (page.visibleSince ? Date.now() - page.visibleSince : 0);
  page.visibleMs = 0;
  if (page.visibleSince) page.visibleSince = Date.now();
  if (visibleMs >= 1000)
    push({ type: "engagement", path: page.path, durationMs: Math.min(visibleMs, 86_400_000), scrollDepth: page.scroll });
}

function endPage() {
  reportEngagement();
  page = null;
}

export function trackPageview(path = window.location.pathname) {
  if (!trackingAllowed()) return;
  if (page?.path === path) return;
  endPage();
  push({ type: "pageview", path });
  const pages = read<string[]>(PAGES_KEY) ?? [];
  write(PAGES_KEY, [...pages, path].slice(-MAX_PAGES));
  page = { path, visibleSince: document.visibilityState === "visible" ? Date.now() : null, visibleMs: 0, scroll: 0 };
}

/** What a form sends about how this visitor arrived (session only). */
export function visitAttribution() {
  if (!trackingAllowed()) return undefined;
  const start = read<VisitStart>(START_KEY);
  const session = read<{ id: string }>(SESSION_KEY);
  if (!start || !session) return undefined;
  const pages = read<string[]>(PAGES_KEY) ?? [];
  return {
    ...(start.referrer ? { referrer: start.referrer.slice(0, 1000) } : {}),
    ...(start.utmSource ? { utmSource: start.utmSource.slice(0, 100) } : {}),
    ...(start.utmMedium ? { utmMedium: start.utmMedium.slice(0, 100) } : {}),
    ...(start.utmCampaign ? { utmCampaign: start.utmCampaign.slice(0, 200) } : {}),
    landingPage: start.landingPage.slice(0, 500),
    pages: pages.slice(-MAX_PAGES).map((p) => p.slice(0, 500)),
    sessionId: session.id,
  };
}

// ---- Clicks -----------------------------------------------------------------

const DOWNLOAD = /\.(pdf|docx?|xlsx?|pptx?|zip|rar|7z|dwg|rvt|ifc|nwd|skp)$/i;
const MESSAGING = /(^|\.)(zalo\.me|m\.me|messenger\.com|wa\.me|t\.me)$/i;

/** Links are classified by where they go; other elements need data-track. */
export function classifyClick(element: Element, location: { host: string }):
  | { type: AnalyticsEventType; target?: string; label: string }
  | null {
  if (element.closest("[data-no-track]")) return null;
  const label = (element.getAttribute("data-track") || element.getAttribute("aria-label") || element.textContent || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  const href = element.getAttribute("href");
  if (element.tagName === "A" && href) {
    const anchor = element as HTMLAnchorElement;
    if (/^(tel|mailto):/i.test(href)) return { type: "contact", target: href, label };
    let url: URL;
    try {
      url = new URL(anchor.href);
    } catch {
      return null;
    }
    if (MESSAGING.test(url.hostname)) return { type: "contact", target: url.href, label };
    if (anchor.hasAttribute("download") || DOWNLOAD.test(url.pathname)) return { type: "download", target: url.href, label };
    if (url.host !== location.host) return { type: "outbound", target: url.href, label };
    return { type: "click", target: url.pathname, label };
  }
  if (element.hasAttribute("data-track") && label) return { type: "click", label };
  return null;
}

// ---- Install ------------------------------------------------------------------

let installed = false;

/** Listens for clicks, scrolling, tab visibility and page unload (once). */
export function installTracker() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  document.addEventListener(
    "click",
    (e) => {
      const element = (e.target as Element | null)?.closest?.("a[href], [data-track]");
      if (!element || !trackingAllowed()) return;
      const click = classifyClick(element, window.location);
      if (click) trackEvent(click.type, { target: click.target, label: click.label });
    },
    { capture: true, passive: true },
  );
  let frame = 0;
  window.addEventListener(
    "scroll",
    () => {
      if (frame || !page) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (page) page.scroll = Math.max(page.scroll, scrollDepth());
      });
    },
    { passive: true },
  );
  document.addEventListener("visibilitychange", () => {
    if (!page) return;
    if (document.visibilityState === "hidden") {
      reportEngagement();
      page.visibleSince = null;
      flush();
    } else page.visibleSince = Date.now();
  });
  window.addEventListener("pagehide", () => {
    endPage();
    flush();
  });
}
