/**
 * Grid axis bubbles (the circled "A", "1" at each end of a column grid line),
 * drawn as sprites of a fixed size on screen. Fragments gives the grid lines
 * (FragmentsModel.getGrids); its own labels need a typeface font, so the
 * viewer draws these instead.
 */
import * as THREE from "three";

const SIZE = 64;
/** Fraction of the view height a bubble takes (sizeAttenuation off). */
const SCALE = 0.045;
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
