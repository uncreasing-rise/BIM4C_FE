/**
 * Solid fills where a section plane cuts through closed elements, so a cut
 * wall reads as a solid wall, not an empty shell (the stencil technique from
 * three.js' clipping examples).
 *
 * For each active plane: back faces increment and front faces decrement the
 * stencil on the kept side of that plane; wherever the count is non-zero the
 * cut passes through material, and a cap is drawn on the plane, trimmed by
 * the other planes. Open surfaces (single faces, glass panels) have no inside
 * and are left out.
 */
import * as THREE from "three";

export const CAP_COLOR = 0x5b6573;

export class SectionCaps {
  private readonly capScene = new THREE.Scene();
  private readonly back: THREE.MeshBasicMaterial[] = [];
  private readonly front: THREE.MeshBasicMaterial[] = [];
  private readonly caps: THREE.Mesh[] = [];
  private readonly capGeometry = new THREE.PlaneGeometry(1, 1);

  constructor(
    private readonly scene: THREE.Scene,
    /** Objects that must not count as solids (helpers, lines, glass, ghosts). */
    private readonly exclude: (object: THREE.Object3D) => boolean,
  ) {}

  private stencilMaterial(side: THREE.Side, op: THREE.StencilOp) {
    return new THREE.MeshBasicMaterial({
      side,
      colorWrite: false,
      depthWrite: false,
      depthTest: false,
      stencilWrite: true,
      stencilFunc: THREE.AlwaysStencilFunc,
      stencilFail: op,
      stencilZFail: op,
      stencilZPass: op,
    });
  }

  private ensure(count: number) {
    while (this.caps.length < count) {
      this.back.push(this.stencilMaterial(THREE.BackSide, THREE.IncrementWrapStencilOp));
      this.front.push(this.stencilMaterial(THREE.FrontSide, THREE.DecrementWrapStencilOp));
      const cap = new THREE.Mesh(
        this.capGeometry,
        new THREE.MeshBasicMaterial({
          color: CAP_COLOR,
          side: THREE.DoubleSide,
          stencilWrite: true,
          stencilRef: 0,
          stencilFunc: THREE.NotEqualStencilFunc,
          // Reset as it draws, so the next plane starts from a clean stencil.
          stencilFail: THREE.ReplaceStencilOp,
          stencilZFail: THREE.ReplaceStencilOp,
          stencilZPass: THREE.ReplaceStencilOp,
        }),
      );
      cap.renderOrder = 2;
      this.caps.push(cap);
      this.capScene.add(cap);
    }
  }

  /**
   * Draws the caps into the current render target (which must have a stencil
   * buffer) after the model itself has been drawn.
   */
  render(renderer: THREE.WebGLRenderer, camera: THREE.Camera, planes: THREE.Plane[], size: number) {
    if (!planes.length) return;
    this.ensure(planes.length);
    const hidden: THREE.Object3D[] = [];
    this.scene.traverseVisible((object) => {
      if (this.exclude(object)) hidden.push(object);
    });
    for (const object of hidden) object.visible = false;
    const background = this.scene.background;
    const autoClear = renderer.autoClear;
    this.scene.background = null;
    renderer.autoClear = false;
    renderer.clearStencil();
    const normal = new THREE.Vector3();
    planes.forEach((plane, i) => {
      // Stencil counts on the kept side of this plane only.
      this.back[i].clippingPlanes = [plane];
      this.front[i].clippingPlanes = [plane];
      this.scene.overrideMaterial = this.back[i];
      renderer.render(this.scene, camera);
      this.scene.overrideMaterial = this.front[i];
      renderer.render(this.scene, camera);
      this.scene.overrideMaterial = null;
      // The cap lies on the plane, trimmed by every other active plane.
      const cap = this.caps[i];
      plane.coplanarPoint(cap.position);
      cap.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal.copy(plane.normal).negate());
      cap.scale.setScalar(size);
      (cap.material as THREE.MeshBasicMaterial).clippingPlanes = planes.filter((p) => p !== plane);
      for (const [j, other] of this.caps.entries()) other.visible = j === i;
      renderer.render(this.capScene, camera);
    });
    this.scene.overrideMaterial = null;
    this.scene.background = background;
    renderer.autoClear = autoClear;
    for (const object of hidden) object.visible = true;
  }

  dispose() {
    for (const m of [...this.back, ...this.front]) m.dispose();
    for (const cap of this.caps) (cap.material as THREE.Material).dispose();
    this.capGeometry.dispose();
  }
}
