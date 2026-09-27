/**
 * Markups: vector annotations drawn over a frozen view and stored with a
 * viewpoint. Points are normalised to the view (0…1), so a markup still lines
 * up after the window is resized.
 */
export type MarkupKind = "pen" | "arrow" | "rect" | "ellipse" | "text";

export interface MarkupShape {
  id: string;
  kind: MarkupKind;
  color: string;
  /** Stroke width in CSS pixels. */
  width: number;
  /** Normalised points; two for arrow/rect/ellipse (start, end), one for text. */
  points: [number, number][];
  text?: string;
}

export const MARKUP_COLORS = ["#ef4444", "#f59e0b", "#2563eb", "#0f172a"] as const;
export const MARKUP_WIDTHS = [2, 4, 8] as const;

const px = ([x, y]: [number, number], w: number, h: number): [number, number] => [x * w, y * h];

/** Arrow head: two short strokes back from the tip, 28° either side. */
export function arrowHead(
  from: [number, number],
  to: [number, number],
  size: number,
): [[number, number], [number, number]] {
  const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const spread = (28 * Math.PI) / 180;
  const back = (a: number): [number, number] => [to[0] - size * Math.cos(a), to[1] - size * Math.sin(a)];
  return [back(angle - spread), back(angle + spread)];
}

/** Smooth pen path (quadratic midpoints) in pixel space. */
export function penPath(points: [number, number][]): string {
  if (!points.length) return "";
  if (points.length < 3) return `M${points.map((p) => p.join(",")).join(" L")}`;
  let d = `M${points[0].join(",")}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i];
    const [nx, ny] = points[i + 1];
    d += ` Q${x},${y} ${(x + nx) / 2},${(y + ny) / 2}`;
  }
  return `${d} L${points.at(-1)!.join(",")}`;
}

const escapeXml = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

/**
 * Markups can arrive from an imported session file, and shapes are rendered
 * as SVG text: only a plain hex colour and a bounded number get through.
 */
const safeColor = (c: string) => (/^#[0-9a-f]{3,8}$/i.test(c) ? c : MARKUP_COLORS[0]);
const safeWidth = (w: number) => (Number.isFinite(w) ? Math.min(20, Math.max(1, w)) : 2);

/** One shape as SVG markup at a given view size. */
export function shapeSvg(input: MarkupShape, w: number, h: number): string {
  const shape = { ...input, color: safeColor(input.color), width: safeWidth(Number(input.width)) };
  const stroke = `stroke="${shape.color}" stroke-width="${shape.width}" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const pts = shape.points.map((p) => px(p, w, h));
  switch (shape.kind) {
    case "pen":
      return `<path d="${penPath(pts)}" ${stroke}/>`;
    case "arrow": {
      const [a, b] = pts;
      const [l, r] = arrowHead(a, b, 10 + shape.width * 2.5);
      return `<path d="M${a.join(",")} L${b.join(",")} M${l.join(",")} L${b.join(",")} L${r.join(",")}" ${stroke}/>`;
    }
    case "rect": {
      const [a, b] = pts;
      return `<rect x="${Math.min(a[0], b[0])}" y="${Math.min(a[1], b[1])}" width="${Math.abs(b[0] - a[0])}" height="${Math.abs(b[1] - a[1])}" rx="3" ${stroke}/>`;
    }
    case "ellipse": {
      const [a, b] = pts;
      return `<ellipse cx="${(a[0] + b[0]) / 2}" cy="${(a[1] + b[1]) / 2}" rx="${Math.abs(b[0] - a[0]) / 2}" ry="${Math.abs(b[1] - a[1]) / 2}" ${stroke}/>`;
    }
    case "text": {
      const [a] = pts;
      const size = 12 + shape.width * 2;
      // A light halo keeps text readable over any part of the model.
      return `<text x="${a[0]}" y="${a[1]}" font-family="Inter, system-ui, sans-serif" font-size="${size}" font-weight="700" fill="${shape.color}" stroke="#ffffff" stroke-width="3" paint-order="stroke" dominant-baseline="hanging">${escapeXml(shape.text ?? "")}</text>`;
    }
  }
}

/** The whole markup as an SVG document; `outW/outH` rescale it (e.g. to a hi-DPI image). */
export function markupSvg(shapes: MarkupShape[], w: number, h: number, outW = w, outH = h): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${outW}" height="${outH}" viewBox="0 0 ${w} ${h}">${shapes.map((s) => shapeSvg(s, w, h)).join("")}</svg>`;
}

/** Drops pen points closer than `minPx` to the previous one (keeps files small). */
export function simplify(points: [number, number][], w: number, h: number, minPx = 2): [number, number][] {
  const out: [number, number][] = [];
  for (const p of points) {
    const last = out.at(-1);
    if (!last || Math.hypot((p[0] - last[0]) * w, (p[1] - last[1]) * h) >= minPx) out.push(p);
  }
  if (points.length && out.at(-1) !== points.at(-1)) out.push(points.at(-1)!);
  return out;
}
