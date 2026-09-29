/**
 * The viewer's image pipeline: image-based lighting, ambient occlusion,
 * outline edges and an optional orthographic projection.
 *
 * One G-buffer pass (view normals + depth) feeds both the AO and the edge
 * detection. Everything is screen-space, so it costs the same for 50 elements
 * or 50 000 and automatically respects hiding, exploding and section planes.
 */
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GTAOPass } from "three/examples/jsm/postprocessing/GTAOPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Pass } from "three/examples/jsm/postprocessing/Pass.js";
import { orthoHalfHeight } from "./camera-motion";
import { SectionCaps } from "./section-caps";

export type ViewerEnvironment = "classic" | "light" | "neutral" | "dark";

export interface DisplaySettings {
  edges: boolean;
  ambientOcclusion: boolean;
  projection: "perspective" | "orthographic";
  environment: ViewerEnvironment;
  grid: boolean;
  /** Fill cut solids where a section plane passes through them. */
  sectionCaps: boolean;
  /** The files' own column grids (IfcGrid), with axis bubbles. */
  ifcGrids: boolean;
  /** Plan overview in a corner, with the camera; click to go there. */
  minimap: boolean;
}

// The default is the original look: flat background, direct lights, no effects.
export const DEFAULT_DISPLAY: DisplaySettings = {
  edges: true,
  ambientOcclusion: true,
  projection: "perspective",
  environment: "light",
  grid: true,
  sectionCaps: true,
  ifcGrids: false,
  minimap: false,
};

export const ENVIRONMENTS: Record<
  ViewerEnvironment,
  { top: string; bottom: string; grid: [number, number]; edge: number; ibl: number }
> = {
  classic: { top: "#e1e8f0", bottom: "#e1e8f0", grid: [0x64748b, 0xcbd5e1], edge: 0x1e293b, ibl: 0 },
  light: { top: "#f8fafc", bottom: "#cbd5e1", grid: [0x94a3b8, 0xd8dee7], edge: 0x1e293b, ibl: 0.6 },
  neutral: { top: "#e5e7eb", bottom: "#9ca3af", grid: [0x6b7280, 0xc4c8ce], edge: 0x111827, ibl: 0.4 },
  dark: { top: "#1e293b", bottom: "#020617", grid: [0x475569, 0x1e293b], edge: 0x020617, ibl: 0.35 },
};

/**
 * Outline edges from the G-buffer. Normal edges: creases above ~30°. Depth
 * edges: the second difference of 1/z, which is zero across any plane seen
 * at any angle (plain depth steps would outline every floor at grazing angles).
 */
const EdgeShader = {
  name: "BimEdgeShader",
  defines: { PERSPECTIVE_CAMERA: 1 },
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    tNormal: { value: null as THREE.Texture | null },
    tDepth: { value: null as THREE.Texture | null },
    resolution: { value: new THREE.Vector2(1, 1) },
    cameraNear: { value: 0.1 },
    cameraFar: { value: 1000 },
    edgeColor: { value: new THREE.Color(0x1e293b) },
    strength: { value: 0.65 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    #include <packing>
    uniform sampler2D tDiffuse;
    uniform sampler2D tNormal;
    uniform sampler2D tDepth;
    uniform vec2 resolution;
    uniform float cameraNear;
    uniform float cameraFar;
    uniform vec3 edgeColor;
    uniform float strength;
    varying vec2 vUv;

    float depthAt(vec2 uv) { return texture2D(tDepth, uv).x; }
    float viewZ(float depth) {
      #if PERSPECTIVE_CAMERA == 1
        return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
      #else
        return orthographicDepthToViewZ(depth, cameraNear, cameraFar);
      #endif
    }
    // Linear across planes in screen space: 1/z for perspective, z for ortho.
    float planar(float z) {
      #if PERSPECTIVE_CAMERA == 1
        return 1.0 / z;
      #else
        return z;
      #endif
    }
    float axisEdge(vec2 step, float d0, vec3 n0) {
      float da = depthAt(vUv + step);
      float db = depthAt(vUv - step);
      // Silhouette against the background, drawn on the model side only.
      if (da >= 0.99999 || db >= 0.99999) return 1.0;
      vec3 na = unpackRGBToNormal(texture2D(tNormal, vUv + step).rgb);
      vec3 nb = unpackRGBToNormal(texture2D(tNormal, vUv - step).rgb);
      float crease = smoothstep(0.12, 0.3, max(1.0 - dot(n0, na), 1.0 - dot(n0, nb)));
      float z0 = viewZ(d0);
      float p0 = planar(z0);
      float curvature = abs(planar(viewZ(da)) + planar(viewZ(db)) - 2.0 * p0) / max(abs(p0), 1e-6);
      float step_ = smoothstep(0.02, 0.06, curvature);
      return max(crease, step_);
    }
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      float d0 = depthAt(vUv);
      if (d0 >= 0.99999) { gl_FragColor = color; return; }
      vec3 n0 = unpackRGBToNormal(texture2D(tNormal, vUv).rgb);
      vec2 px = 1.0 / resolution;
      float edge = max(axisEdge(vec2(px.x, 0.0), d0, n0), axisEdge(vec2(0.0, px.y), d0, n0));
      color.rgb = mix(color.rgb, edgeColor, edge * strength);
      gl_FragColor = color;
    }`,
};

function gradientTexture(top: string, bottom: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, top);
  gradient.addColorStop(1, bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 2, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Draws section caps into the composer's current image (needs its stencil). */
class CapsPass extends Pass {
  planes: THREE.Plane[] = [];
  size = 1;
  constructor(private readonly caps: SectionCaps, public camera: THREE.Camera) {
    super();
    this.needsSwap = false;
  }
  render(renderer: THREE.WebGLRenderer, _write: THREE.WebGLRenderTarget, read: THREE.WebGLRenderTarget) {
    renderer.setRenderTarget(read);
    this.caps.render(renderer, this.camera, this.planes, this.size);
  }
}

export class ViewerPipeline {
  readonly ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 1000);
  settings: DisplaySettings = { ...DEFAULT_DISPLAY };
  private readonly composer: EffectComposer;
  private readonly renderPass: RenderPass;
  private readonly aoPass: GTAOPass;
  private readonly edgePass: ShaderPass;
  private readonly gbuffer: THREE.WebGLRenderTarget;
  private readonly normalMaterial = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
  private readonly environmentMap: THREE.Texture;
  private background: THREE.Texture | null = null;
  private hidden: THREE.Object3D[] = [];
  private readonly caps: SectionCaps;
  private readonly capsPass: CapsPass;
  private initialised = false;
  /** Large scene: section caps are drawn only once the camera settles. */
  heavy = false;

  constructor(
    private readonly renderer: THREE.WebGLRenderer,
    private readonly scene: THREE.Scene,
    private readonly perspective: THREE.PerspectiveCamera,
    /** Objects left out of normals/depth: helpers, ghosts, glass. */
    private readonly excludeFromGBuffer: (object: THREE.Object3D) => boolean,
  ) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    this.environmentMap = pmrem.fromScene(room, 0.04).texture;
    room.dispose();
    pmrem.dispose();
    scene.environment = this.environmentMap;

    const depthTexture = new THREE.DepthTexture(1, 1);
    depthTexture.format = THREE.DepthStencilFormat;
    depthTexture.type = THREE.UnsignedInt248Type;
    this.gbuffer = new THREE.WebGLRenderTarget(1, 1, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      type: THREE.HalfFloatType,
      depthTexture,
    });

    this.caps = new SectionCaps(scene, excludeFromGBuffer);
    // MSAA on the main image keeps geometry edges smooth under the effects;
    // the stencil is for section caps.
    const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4, stencilBuffer: true });
    this.composer = new EffectComposer(renderer, target);
    this.renderPass = new RenderPass(scene, perspective);
    this.aoPass = new GTAOPass(scene, perspective, 1, 1);
    this.aoPass.setGBuffer(depthTexture, this.gbuffer.texture);
    this.aoPass.blendIntensity = 0.9;
    this.aoPass.updateGtaoMaterial({ radius: 0.75, distanceExponent: 1.5, thickness: 2.0, scale: 1, samples: 16 });
    this.aoPass.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 8, rings: 2, samples: 16 });
    this.edgePass = new ShaderPass(EdgeShader);
    this.edgePass.uniforms.tNormal.value = this.gbuffer.texture;
    this.edgePass.uniforms.tDepth.value = depthTexture;
    this.capsPass = new CapsPass(this.caps, perspective);
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.capsPass);
    this.composer.addPass(this.aoPass);
    this.composer.addPass(this.edgePass);
    this.composer.addPass(new OutputPass());
    this.apply(this.settings);
  }

  /** The camera that renders, picks and projects this frame. */
  get camera(): THREE.PerspectiveCamera | THREE.OrthographicCamera {
    return this.settings.projection === "orthographic" ? this.ortho : this.perspective;
  }

  apply(settings: DisplaySettings) {
    const previous = this.settings;
    this.settings = { ...settings };
    this.caps.invalidate();
    if (!this.initialised || previous.environment !== settings.environment) {
      this.initialised = true;
      const env = ENVIRONMENTS[settings.environment];
      this.background?.dispose();
      this.background = null;
      if (settings.environment === "classic") {
        // Original look: plain colour, no image-based lighting.
        this.scene.background = new THREE.Color(env.top);
        this.scene.environment = null;
      } else {
        this.background = gradientTexture(env.top, env.bottom);
        this.scene.background = this.background;
        this.scene.environment = this.environmentMap;
        this.scene.environmentIntensity = env.ibl;
      }
      (this.edgePass.uniforms.edgeColor.value as THREE.Color).setHex(env.edge);
    }
    const camera = this.camera;
    const perspective = camera === this.perspective ? 1 : 0;
    this.renderPass.camera = camera;
    this.aoPass.camera = camera;
    this.capsPass.camera = camera;
    for (const material of [this.aoPass.gtaoMaterial, this.aoPass.pdMaterial, this.edgePass.material]) {
      if (material.defines.PERSPECTIVE_CAMERA !== perspective) {
        material.defines.PERSPECTIVE_CAMERA = perspective;
        material.needsUpdate = true;
      }
    }
  }

  /** Match the orthographic view to the perspective one around the orbit target. */
  sync(target: THREE.Vector3, span: number) {
    if (this.settings.projection !== "orthographic") return;
    const p = this.perspective;
    const distance = p.position.distanceTo(target);
    const half = orthoHalfHeight(distance, p.fov);
    const o = this.ortho;
    o.left = -half * p.aspect;
    o.right = half * p.aspect;
    o.top = half;
    o.bottom = -half;
    o.quaternion.copy(p.quaternion);
    // Stand well back: in parallel projection distance changes nothing on
    // screen, but it keeps everything in front of the near plane.
    const back = Math.max(span * 2, distance);
    o.position.copy(target).addScaledVector(p.getWorldDirection(new THREE.Vector3()), -back);
    o.near = 0.01;
    o.far = back + span * 4;
    o.updateProjectionMatrix();
    o.updateMatrixWorld();
  }

  /** Scene objects or their visibility changed. */
  invalidate() {
    this.caps.invalidate();
  }

  /** World size of a screen-constant marker at `point`. */
  screenScale(point: THREE.Vector3, target: THREE.Vector3) {
    return this.settings.projection === "orthographic"
      ? this.perspective.position.distanceTo(target)
      : this.perspective.position.distanceTo(point);
  }

  setSize(width: number, height: number, pixelRatio: number) {
    this.composer.setPixelRatio(pixelRatio);
    this.composer.setSize(width, height);
    const w = Math.max(1, Math.round(width * pixelRatio));
    const h = Math.max(1, Math.round(height * pixelRatio));
    this.gbuffer.setSize(w, h);
    this.aoPass.setSize(w, h);
    (this.edgePass.uniforms.resolution.value as THREE.Vector2).set(w, h);
  }

  private renderGBuffer(camera: THREE.Camera, clippingPlanes: THREE.Plane[]) {
    this.hidden = [];
    this.scene.traverseVisible((object) => {
      if (this.excludeFromGBuffer(object)) this.hidden.push(object);
    });
    for (const object of this.hidden) object.visible = false;
    const background = this.scene.background;
    this.scene.background = null;
    this.scene.overrideMaterial = this.normalMaterial;
    this.normalMaterial.clippingPlanes = clippingPlanes;
    const clearColor = this.renderer.getClearColor(new THREE.Color());
    const clearAlpha = this.renderer.getClearAlpha();
    this.renderer.setRenderTarget(this.gbuffer);
    this.renderer.setClearColor(0x7777ff, 1);
    this.renderer.clear();
    this.renderer.render(this.scene, camera);
    this.renderer.setRenderTarget(null);
    this.renderer.setClearColor(clearColor, clearAlpha);
    this.scene.overrideMaterial = null;
    this.scene.background = background;
    for (const object of this.hidden) object.visible = true;
  }

  /**
   * One frame. While the user is moving the view, ambient occlusion is left
   * out; the caller renders again with `interacting = false` once it settles.
   */
  render(interacting: boolean, clippingPlanes: THREE.Plane[], sceneSize = 100) {
    const camera = this.camera;
    const capPlanes = this.settings.sectionCaps && !(interacting && this.heavy) ? clippingPlanes : [];
    this.capsPass.planes = capPlanes;
    this.capsPass.size = sceneSize * 4;
    this.capsPass.enabled = capPlanes.length > 0;
    const ao = this.settings.ambientOcclusion && !interacting;
    const edges = this.settings.edges;
    this.aoPass.enabled = ao;
    this.edgePass.enabled = edges;
    if (!ao && !edges) {
      // No effects: draw straight to the screen, exactly as before.
      this.renderer.render(this.scene, camera);
      if (capPlanes.length) this.caps.render(this.renderer, camera, capPlanes, sceneSize * 4);
      return;
    }
    if (ao || edges) {
      this.renderGBuffer(camera, clippingPlanes);
      const near = "near" in camera ? camera.near : 0.1;
      this.edgePass.uniforms.cameraNear.value = near;
      this.edgePass.uniforms.cameraFar.value = camera.far;
    }
    this.composer.render();
  }

  dispose() {
    this.composer.dispose();
    this.caps.dispose();
    this.aoPass.dispose();
    this.gbuffer.depthTexture?.dispose();
    this.gbuffer.dispose();
    this.normalMaterial.dispose();
    this.environmentMap.dispose();
    this.background?.dispose();
    if (this.scene.environment === this.environmentMap) this.scene.environment = null;
  }
}
