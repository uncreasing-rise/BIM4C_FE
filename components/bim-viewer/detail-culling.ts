/**
 * Navigation detail culling, like Navisworks' guaranteed frame rate: while
 * the view moves, parts smaller on screen than a threshold are skipped, and
 * the threshold adapts to the measured frame time, so a fast GPU culls
 * nothing and an integrated one drops fittings and bolts first. Everything
 * is drawn again the moment the view settles.
 */
import * as THREE from "three";
import type { BatchSlot } from "./render-batches";

/** Frame intervals (ms) above which detail is dropped, below which it comes back. */
const SLOW_MS = 40;
const FAST_MS = 24;
/** Largest on-screen diameter (px) ever culled: beyond this, parts matter for orientation. */
export const MAX_CULL_PX = 24;

const world = new THREE.Vector3();

export class DetailCuller {
  /** Parts with a smaller on-screen diameter are skipped while moving. */
  thresholdPx = 0;
  private culled: BatchSlot[] = [];

  /** Adjusts the threshold from the interval between two frames of one continuous move. */
  adapt(intervalMs: number) {
    // A long gap is the pointer resting mid-drag (or a hidden tab), not a slow frame.
    if (intervalMs > 150) return;
    // Smoothed, so one hiccup (garbage collection, a React update) changes little.
    this.frameMs = this.frameMs ? this.frameMs * 0.7 + intervalMs * 0.3 : intervalMs;
    if (this.frameMs > SLOW_MS) this.thresholdPx = Math.min(MAX_CULL_PX, this.thresholdPx * 1.4 + 1);
    else if (this.frameMs < FAST_MS) this.thresholdPx = Math.max(0, this.thresholdPx * 0.85 - 0.25);
  }
  /** Smoothed frame interval while moving (ms). */
  frameMs = 0;

  /**
   * Hides every shown part whose bounding sphere spans fewer pixels than the
   * threshold. `pixelsPerMetre` gives the screen scale at a world point.
   */
  cull(groups: Iterable<BatchSlot[]>, pixelsPerMetre: (point: THREE.Vector3) => number) {
    this.restore();
    if (this.thresholdPx < 0.5) return 0;
    for (const slots of groups)
      for (const slot of slots) {
        if (!slot.visible) continue;
        world.copy(slot.center).applyMatrix4(slot.batch.matrixWorld);
        if (2 * slot.radius * pixelsPerMetre(world) >= this.thresholdPx) continue;
        slot.batch.setVisibleAt(slot.instance, false);
        this.culled.push(slot);
      }
    return this.culled.length;
  }

  /** Shows again everything culled (keeping what the viewer itself hides). */
  restore() {
    for (const slot of this.culled) slot.batch.setVisibleAt(slot.instance, slot.visible);
    this.culled = [];
  }

  get active() {
    return this.culled.length > 0;
  }
}
