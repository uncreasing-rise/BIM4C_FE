import * as THREE from "three";

/** Keep tool-only geometry out of the renderer's scene traversal. Both roots
 * use the same model frame, so promotion never changes local coordinates. */
export function placeElementMesh(mesh: THREE.Mesh, rendered: THREE.Group, picking: THREE.Group, draw: boolean) {
  const parent = draw ? rendered : picking;
  if (mesh.parent !== parent) parent.add(mesh);
}

/** The picking root stays detached, but needs the rendered root's world frame. */
export function syncPickingRoot(rendered: THREE.Group, picking: THREE.Group) {
  rendered.updateWorldMatrix(true, false);
  picking.matrixAutoUpdate = false;
  picking.matrix.copy(rendered.matrixWorld);
  picking.visible = rendered.visible;
  picking.updateMatrixWorld(true);
}
