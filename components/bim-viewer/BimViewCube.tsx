"use client";

import { forwardRef } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, House } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { ui } from "@/lib/i18n/ui";
import {
  CUBE_FACES,
  FACE_CSS,
  cubeCellDirection,
  type CubeFace,
  type CubeTurn,
  type Vec3,
} from "./camera-motion";

const SIZE = 64;
const HALF = SIZE / 2;
const RING = SIZE * 1.62;
const CELLS = [1, 0, -1].flatMap((row) =>
  ([-1, 0, 1] as const).map((col) => ({ col, row: row as -1 | 0 | 1 })),
);

/** Each face gets its own tone so the cube reads as a solid, lit from above. */
const FACE_TONE: Record<CubeFace, string> = {
  top: "linear-gradient(160deg, #ffffff 0%, #eef2f6 100%)",
  front: "linear-gradient(180deg, #f5f7fa 0%, #e2e8f0 100%)",
  back: "linear-gradient(180deg, #f5f7fa 0%, #e2e8f0 100%)",
  right: "linear-gradient(180deg, #edf1f5 0%, #d7dee7 100%)",
  left: "linear-gradient(180deg, #edf1f5 0%, #d7dee7 100%)",
  bottom: "linear-gradient(180deg, #d5dde6 0%, #c3cdd8 100%)",
};

/** Faces a hot spot touches: the face itself plus the neighbours its edge/corner reaches. */
function cellFaces(face: CubeFace, col: -1 | 0 | 1, row: -1 | 0 | 1): CubeFace[] {
  const [x, y, z] = cubeCellDirection(face, col, row);
  const faces: CubeFace[] = [];
  if (z > 0.3) faces.push("front");
  if (z < -0.3) faces.push("back");
  if (x > 0.3) faces.push("right");
  if (x < -0.3) faces.push("left");
  if (y > 0.3) faces.push("top");
  if (y < -0.3) faces.push("bottom");
  return faces;
}

const ARROWS: { turn: CubeTurn; icon: typeof ChevronUp; className: string; yaw: boolean }[] = [
  { turn: "up", icon: ChevronUp, className: "left-1/2 top-0 -translate-x-1/2", yaw: false },
  { turn: "down", icon: ChevronDown, className: "bottom-0 left-1/2 -translate-x-1/2", yaw: false },
  { turn: "left", icon: ChevronLeft, className: "left-0 top-1/2 -translate-y-1/2", yaw: true },
  { turn: "right", icon: ChevronRight, className: "right-0 top-1/2 -translate-y-1/2", yaw: true },
];

/**
 * Autodesk-style ViewCube: click a face, edge or corner to fly there, or an
 * arrow to turn 90°. The canvas rotates the inner element every frame (via
 * the ref) and flags plan views with data-vertical on the widget.
 */
export const BimViewCube = forwardRef<
  HTMLDivElement,
  {
    onPick: (direction: Vec3) => void;
    onTurn: (turn: CubeTurn) => void;
    onHome: () => void;
    shifted?: boolean;
  }
>(function BimViewCube({ onPick, onTurn, onHome, shifted }, ref) {
  const { locale } = useLanguage();
  const s = ui(locale).bimViewCube;
  return (
    <div
      data-viewcube
      className={`group/cube absolute right-3 top-3 z-20 flex select-none flex-col items-center gap-1 transition-[right] duration-200 ${shifted ? "sm:right-[26rem]" : ""}`}
      role="group"
      aria-label={s.label}
    >
      <div className="relative" style={{ width: SIZE * 2, height: SIZE * 2 }}>
        {ARROWS.map(({ turn, icon: Icon, className, yaw }) => (
          <button
            key={turn}
            type="button"
            onClick={() => onTurn(turn)}
            aria-label={s.turn[turn]}
            title={s.turn[turn]}
            className={`absolute z-10 grid size-5 place-items-center rounded-full bg-white/80 text-slate-600 opacity-0 shadow-sm ring-1 ring-slate-900/10 transition-opacity hover:bg-teal-400 hover:text-slate-950 focus-visible:opacity-100 group-hover/cube:opacity-100 ${className} ${yaw ? "group-data-[vertical=true]/cube:hidden" : ""}`}
          >
            <Icon className="size-3.5" />
          </button>
        ))}
        <div className="absolute inset-0 grid place-items-center" style={{ perspective: "none" }}>
          <div
            ref={ref}
            className="relative"
            style={{ width: SIZE, height: SIZE, transformStyle: "preserve-3d" }}
          >
            {/* Compass on the ground plane: N is -z (north) after rotateX(90°). */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute rounded-full border-[5px] border-slate-400/45"
              style={{
                width: RING,
                height: RING,
                left: (SIZE - RING) / 2,
                top: (SIZE - RING) / 2,
                transform: `translateY(${HALF + 6}px) rotateX(90deg)`,
              }}
            >
              {([
                ["N", "left-1/2 -top-[9px] -translate-x-1/2"],
                ["E", "top-1/2 -right-[9px] -translate-y-1/2"],
                ["S", "left-1/2 -bottom-[9px] -translate-x-1/2"],
                ["W", "top-1/2 -left-[9px] -translate-y-1/2"],
              ] as const).map(([key, position]) => (
                <span
                  key={key}
                  className={`absolute grid size-[13px] place-items-center rounded-full bg-white text-[8px] font-bold text-slate-600 shadow-sm ${position} ${key === "N" ? "text-red-600" : ""}`}
                >
                  {s.compass[key]}
                </span>
              ))}
            </div>
            {CUBE_FACES.map((face) => (
              <div
                key={face}
                className="absolute inset-0 grid overflow-hidden rounded-[3px] border border-slate-400/80 text-slate-700 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]"
                style={{
                  transform: `${FACE_CSS[face]} translateZ(${HALF}px)`,
                  backfaceVisibility: "hidden",
                  background: FACE_TONE[face],
                  gridTemplateColumns: "13px 1fr 13px",
                  gridTemplateRows: "13px 1fr 13px",
                }}
              >
                {CELLS.map(({ col, row }) => {
                  const label = cellFaces(face, col, row)
                    .map((f) => s.faces[f])
                    .join(" · ");
                  const centre = col === 0 && row === 0;
                  return (
                    <button
                      key={`${col}:${row}`}
                      type="button"
                      tabIndex={centre ? 0 : -1}
                      aria-label={`${s.goTo} ${label}`}
                      title={label}
                      onClick={() => onPick(cubeCellDirection(face, col, row))}
                      className="grid place-items-center overflow-hidden text-[9px] font-bold uppercase tracking-[0.08em] transition-colors hover:bg-teal-400/75 hover:text-slate-950 focus-visible:bg-teal-400/75 focus-visible:outline-none"
                    >
                      {centre ? s.faces[face] : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onHome}
        aria-label={s.home}
        title={`${s.home} (Home)`}
        className="grid size-8 place-items-center rounded-full bg-white/85 text-slate-700 shadow-sm ring-1 ring-slate-900/10 transition hover:bg-teal-400 hover:text-slate-950"
      >
        <House className="size-4" />
      </button>
    </div>
  );
});
