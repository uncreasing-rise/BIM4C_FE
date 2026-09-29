/**
 * Grid axis bubbles (the circled "A", "1" at each end of a column grid line),
 * drawn as sprites of a fixed size on screen. Fragments gives the grid lines
 * (FragmentsModel.getGrids); its own labels need a typeface font, so the
 * viewer draws these instead.
 */
import * as THREE from "three";

const SIZE = 64;
/** Fraction of the view height a bubble takes (sizeAttenuation off). */
const SCALE = 0.026;
const textures = new Map<string, THREE.CanvasTexture>();

function bubbleTexture(tag: string) {
  let texture = textures.get(tag);
  if (texture) return texture;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#0f172a";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${tag.length > 2 ? 18 : 28}px Inter, system-ui, sans-serif`;
  ctx.fillText(tag.slice(0, 4), SIZE / 2, SIZE / 2 + 1);
  texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textures.set(tag, texture);
  return texture;
}

/**
 * Identity of a grid axis on the plan: its tag and its two ends to the
 * decimetre, in either direction. Revit exports the same grid once per level,
 * and linked files repeat it: one key per axis however often it appears.
 */
export function gridKey(tag: string, a: [number, number], b: [number, number]) {
  const p = `${Math.round(a[0] * 10)},${Math.round(a[1] * 10)}`;
  const q = `${Math.round(b[0] * 10)},${Math.round(b[1] * 10)}`;
  return `${tag}|${p < q ? `${p};${q}` : `${q};${p}`}`;
}

/**
 * Shows each grid axis once across all the given grid groups: of the copies
 * with the same tag and plan position, the lowest stays visible (with its
 * bubbles); the others are hidden. Returns how many axes remain.
 */
export function showOneCopyPerAxis(roots: THREE.Object3D[]) {
  const best = new Map<string, { line: THREE.Line; y: number }>();
  const all: THREE.Line[] = [];
  const a = new THREE.Vector3(), b = new THREE.Vector3();
  for (const root of roots) {
    root.updateWorldMatrix(true, true);
    root.traverse((object) => {
      const line = object as THREE.Line;
      if (!line.isLine) return;
      const position = line.geometry.getAttribute("position");
      if (!position || position.count < 2) return;
      all.push(line);
      a.fromBufferAttribute(position, 0).applyMatrix4(line.matrixWorld);
      b.fromBufferAttribute(position, position.count - 1).applyMatrix4(line.matrixWorld);
      const key = gridKey(String(line.userData.tag ?? line.parent?.userData.tag ?? ""), [a.x, a.z], [b.x, b.z]);
      const y = Math.min(a.y, b.y);
      const kept = best.get(key);
      if (!kept || y < kept.y) best.set(key, { line, y });
    });
  }
  const keep = new Set([...best.values()].map((k) => k.line));
  for (const line of all) line.visible = keep.has(line);
  return keep.size;
}

/** Adds a bubble at both ends of every labelled grid line in `grids`. */
export function addGridBubbles(grids: THREE.Object3D) {
  const lines: THREE.Line[] = [];
  grids.traverse((object) => {
    if ((object as THREE.Line).isLine) lines.push(object as THREE.Line);
  });
  const point = new THREE.Vector3();
  for (const line of lines) {
    const tag = String(line.userData.tag ?? line.parent?.userData.tag ?? "").trim();
    const position = line.geometry.getAttribute("position");
    if (!tag || !position || position.count < 2) continue;
    for (const index of [0, position.count - 1]) {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: bubbleTexture(tag), sizeAttenuation: false, depthTest: false, transparent: true }),
      );
      sprite.scale.setScalar(SCALE);
      sprite.renderOrder = 5;
      sprite.position.copy(point.fromBufferAttribute(position, index));
      sprite.userData.gridBubble = true;
      line.add(sprite);
    }
  }
  return grids;
}

/** Keep nearby axis labels readable instead of drawing overlapping circles. */
export function declutterGridBubbles(roots: THREE.Object3D[], camera: THREE.Camera, width: number, height: number) {
  const occupied = new Set<string>();
  const point = new THREE.Vector3();
  for (const root of roots) {
    if (!root.visible || root.parent?.visible === false) continue;
    root.traverse((object) => {
      if (!object.userData.gridBubble) return;
      object.visible = false;
      if (object.parent?.visible === false) return;
      object.getWorldPosition(point).project(camera);
      if (Math.abs(point.x) > 1 || Math.abs(point.y) > 1 || Math.abs(point.z) > 1) return;
      const x = Math.floor((point.x + 1) * width / 2 / 28);
      const y = Math.floor((point.y + 1) * height / 2 / 28);
      for (let dx = -1; dx <= 1; dx++)
        for (let dy = -1; dy <= 1; dy++)
          if (occupied.has(`${x + dx},${y + dy}`)) return;
      occupied.add(`${x},${y}`);
      object.visible = true;
    });
  }
}
