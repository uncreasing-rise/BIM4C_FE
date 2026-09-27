"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Maximize2, Layers } from "lucide-react";
import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/lib/i18n/context";

import { ui } from "@/lib/i18n/ui";

// Matches --brand-ink so fogged geometry dissolves into the hero background.
const HERO_INK = 0x04181f;

// Feathers the canvas edges into the hero instead of framing it as a card.
const EDGE_FADE =
  "radial-gradient(ellipse 72% 68% at 50% 52%, #000 58%, transparent 100%)";

function radialGlowTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(45, 212, 191, 0.55)");
  gradient.addColorStop(0.35, "rgba(20, 184, 166, 0.18)");
  gradient.addColorStop(1, "rgba(20, 184, 166, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

export function BimHero3DCanvas() {
  const { locale } = useLanguage();

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let isVisible = true;
    let animId: number | null = null;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // 1. Scene: transparent background, fog tinted to the hero ink
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(HERO_INK, 28, 50);

    // 2. Camera (Isometric Architectural Angle)
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 80);
    const cameraBase = new THREE.Vector3(19, 13, 21);
    const lookTarget = new THREE.Vector3(0, 6.2, 0);
    camera.position.copy(cameraBase);
    camera.lookAt(lookTarget);

    // 3. Lightweight renderer (capped pixel ratio, no stencil buffer)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "default",
      stencil: false,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.domElement.style.pointerEvents = "none";
    container.replaceChildren(renderer.domElement);

    // 4. Lights
    scene.add(new THREE.HemisphereLight(0x99f6e4, HERO_INK, 1.1));

    const keyLight = new THREE.DirectionalLight(0x2dd4bf, 1.9);
    keyLight.position.set(15, 25, 15);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-15, 10, -15);
    scene.add(rimLight);

    // 5. Ground: polar survey grid + soft light pool under the tower
    const grid = new THREE.PolarGridHelper(11, 16, 8, 96, 0x14b8a6, 0x134e4a);
    const gridMat = grid.material as THREE.Material;
    gridMat.transparent = true;
    gridMat.opacity = 0.35;
    scene.add(grid);

    const glowTexture = radialGlowTexture();
    const groundGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 18),
      new THREE.MeshBasicMaterial({
        map: glowTexture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    groundGlow.rotation.x = -Math.PI / 2;
    groundGlow.position.y = 0.01;
    scene.add(groundGlow);

    // 6. BIM tower: a twisting curtain-wall tower on a glazed podium, with a
    // dashed "design stage" annex beside it
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const floors = 16;
    const floorHeight = 0.62;
    const podiumHeight = 1.1;
    const towerWidth = 3.6;
    const twistPerFloor = 0.035;
    const panelsPerSide = 6;

    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x172a33,
      roughness: 0.6,
      metalness: 0.2,
    });
    const slabMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.5,
      metalness: 0.3,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0e7490,
      emissive: 0x083344,
      roughness: 0.08,
      metalness: 0.8,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    });
    const mullionMat = new THREE.LineBasicMaterial({
      color: 0x5eead4,
      transparent: true,
      opacity: 0.32,
    });
    const accentLineMat = new THREE.LineBasicMaterial({
      color: 0x5eead4,
      transparent: true,
      opacity: 0.75,
    });
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const pipeMats = [
      new THREE.MeshStandardMaterial({
        color: 0xf97316,
        emissive: 0x7c2d12,
        roughness: 0.4,
      }),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0c4a6e,
        roughness: 0.4,
      }),
    ];

    const edges = (
      geo: THREE.BufferGeometry,
      mat: THREE.LineBasicMaterial,
      at: THREE.Object3D,
    ) => {
      const line = new THREE.LineSegments(new THREE.EdgesGeometry(geo), mat);
      line.position.copy(at.position);
      line.rotation.copy(at.rotation);
      return line;
    };

    // Podium: solid base, lit canopy band and an overhanging roof slab
    const podiumGeo = new THREE.BoxGeometry(7.2, podiumHeight, 5.6);
    const podium = new THREE.Mesh(podiumGeo, concreteMat);
    podium.position.y = podiumHeight / 2;
    rootGroup.add(podium);
    rootGroup.add(edges(podiumGeo, accentLineMat, podium));

    const band = new THREE.Mesh(
      new THREE.BoxGeometry(7.26, 0.05, 5.66),
      glowMat,
    );
    band.position.y = podiumHeight * 0.55;
    rootGroup.add(band);

    const podiumRoofGeo = new THREE.BoxGeometry(7.6, 0.08, 6.0);
    const podiumRoof = new THREE.Mesh(podiumRoofGeo, slabMat);
    podiumRoof.position.y = podiumHeight;
    rootGroup.add(podiumRoof);
    rootGroup.add(edges(podiumRoofGeo, accentLineMat, podiumRoof));

    // Structural core with MEP risers, visible through the glazing
    const coreHeight = floors * floorHeight + 0.9;
    const coreGeo = new THREE.BoxGeometry(1.3, coreHeight, 1.3);
    const core = new THREE.Mesh(coreGeo, concreteMat);
    core.position.y = podiumHeight + coreHeight / 2;
    rootGroup.add(core);
    rootGroup.add(edges(coreGeo, mullionMat, core));

    const riserGeo = new THREE.CylinderGeometry(0.06, 0.06, coreHeight, 8);
    [
      [0.8, 0.35, 0],
      [0.8, -0.35, 1],
      [-0.35, 0.8, 0],
      [0.35, 0.8, 1],
    ].forEach(([x, z, kind]) => {
      const riser = new THREE.Mesh(riserGeo, pipeMats[kind]);
      riser.position.set(x, core.position.y, z);
      rootGroup.add(riser);
    });

    // Floors: slab, glass, curtain-wall mullions and instanced lit windows.
    // Each slab has its own edge material so the scanner can light it up.
    const floorEdges: { y: number; mat: THREE.LineBasicMaterial }[] = [];
    const glassHeight = floorHeight - 0.05;
    const windowMesh = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(
        (towerWidth / panelsPerSide) * 0.78,
        glassHeight * 0.62,
      ),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.9 }),
      floors * 4 * panelsPerSide,
    );
    const pane = new THREE.Object3D();
    const paneMatrix = new THREE.Matrix4();
    const paneColor = new THREE.Color();
    const up = new THREE.Vector3(0, 1, 0);
    let paneIndex = 0;

    for (let i = 0; i < floors; i++) {
      const y = podiumHeight + i * floorHeight;
      const w = towerWidth * (1 - 0.12 * (i / (floors - 1)));

      const floor = new THREE.Group();
      floor.position.y = y;
      floor.rotation.y = i * twistPerFloor;
      floor.updateMatrix();
      rootGroup.add(floor);

      const slabGeo = new THREE.BoxGeometry(w + 0.16, 0.05, w + 0.16);
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.y = 0.025;
      floor.add(slab);
      const slabEdgeMat = accentLineMat.clone();
      slabEdgeMat.opacity = 0.55;
      floor.add(edges(slabGeo, slabEdgeMat, slab));
      floorEdges.push({ y, mat: slabEdgeMat });

      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(w, glassHeight, w),
        glassMat,
      );
      glass.position.y = 0.05 + glassHeight / 2;
      floor.add(glass);

      const mullions: number[] = [];
      for (let side = 0; side < 4; side++) {
        const angle = (side * Math.PI) / 2;
        for (let j = 0; j <= panelsPerSide; j++) {
          const p = new THREE.Vector3(
            -w / 2 + (j * w) / panelsPerSide,
            0,
            w / 2,
          );
          p.applyAxisAngle(up, angle);
          mullions.push(p.x, 0.05, p.z, p.x, floorHeight, p.z);
        }
        for (let j = 0; j < panelsPerSide; j++) {
          pane.position
            .set(
              -w / 2 + ((j + 0.5) * w) / panelsPerSide,
              glass.position.y,
              w / 2 + 0.01,
            )
            .applyAxisAngle(up, angle);
          pane.rotation.set(0, angle, 0);
          pane.scale.set(w / towerWidth, 1, 1);
          pane.updateMatrix();
          paneMatrix.multiplyMatrices(floor.matrix, pane.matrix);
          windowMesh.setMatrixAt(paneIndex, paneMatrix);
          const lit = Math.random();
          paneColor.setHex(
            lit < 0.2 ? 0xfde68a : lit < 0.34 ? 0x5eead4 : 0x0b3037,
          );
          windowMesh.setColorAt(paneIndex, paneColor);
          paneIndex++;
        }
      }
      const mullionGeo = new THREE.BufferGeometry();
      mullionGeo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(mullions, 3),
      );
      floor.add(new THREE.LineSegments(mullionGeo, mullionMat));
    }
    windowMesh.instanceMatrix.needsUpdate = true;
    rootGroup.add(windowMesh);

    // Crown: open roof frame, setback plant room, mast and aviation beacon
    const topY = podiumHeight + floors * floorHeight;
    const crown = new THREE.Group();
    crown.position.y = topY;
    crown.rotation.y = floors * twistPerFloor;
    rootGroup.add(crown);

    const roofGeo = new THREE.BoxGeometry(
      towerWidth * 0.9,
      0.06,
      towerWidth * 0.9,
    );
    const roof = new THREE.Mesh(roofGeo, slabMat);
    roof.position.y = 0.03;
    crown.add(roof);
    crown.add(edges(roofGeo, accentLineMat, roof));

    const frameGeo = new THREE.BoxGeometry(
      towerWidth * 0.9,
      0.9,
      towerWidth * 0.9,
    );
    const frame = new THREE.Object3D();
    frame.position.y = 0.45;
    crown.add(edges(frameGeo, accentLineMat, frame));

    const plantGeo = new THREE.BoxGeometry(1.8, 0.6, 1.8);
    const plant = new THREE.Mesh(plantGeo, glassMat);
    plant.position.y = 0.36;
    crown.add(plant);
    crown.add(edges(plantGeo, mullionMat, plant));

    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.06, 2.0, 8),
      slabMat,
    );
    mast.position.y = 1.66;
    crown.add(mast);

    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0xfb7185,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 12, 8),
      beaconMat,
    );
    beacon.position.y = 2.7;
    crown.add(beacon);

    // Annex: dashed wireframe block, the next building still in design
    const annexFloors = 7;
    const annexSize = 2.4;
    const annexHeight = annexFloors * floorHeight;
    const annexLevels: number[] = [];
    const half = annexSize / 2;
    for (let i = 0; i <= annexFloors; i++) {
      const ly = i * floorHeight;
      const corners = [
        [-half, -half],
        [half, -half],
        [half, half],
        [-half, half],
      ];
      corners.forEach(([x, z], c) => {
        const [nx, nz] = corners[(c + 1) % 4];
        annexLevels.push(x, ly, z, nx, ly, nz);
        if (i < annexFloors) annexLevels.push(x, ly, z, x, ly + floorHeight, z);
      });
    }
    const annexGeo = new THREE.BufferGeometry();
    annexGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(annexLevels, 3),
    );
    const annex = new THREE.LineSegments(
      annexGeo,
      new THREE.LineDashedMaterial({
        color: 0x38bdf8,
        dashSize: 0.16,
        gapSize: 0.1,
        transparent: true,
        opacity: 0.65,
      }),
    );
    annex.computeLineDistances();
    annex.position.set(-5.2, 0, -1.4);
    rootGroup.add(annex);

    const annexVolume = new THREE.Mesh(
      new THREE.BoxGeometry(annexSize, annexHeight, annexSize),
      new THREE.MeshBasicMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.05,
        depthWrite: false,
      }),
    );
    annexVolume.position.set(-5.2, annexHeight / 2, -1.4);
    rootGroup.add(annexVolume);

    // 7. Scanner: ring plus a faint section plane sweeping the tower
    const scanner = new THREE.Group();
    scene.add(scanner);
    const scannerRing = new THREE.Mesh(
      new THREE.RingGeometry(3.0, 3.1, 96),
      new THREE.MeshBasicMaterial({
        color: 0x2dd4bf,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    scannerRing.rotation.x = Math.PI / 2;
    scanner.add(scannerRing);
    const sectionPlane = new THREE.Mesh(
      new THREE.CircleGeometry(3.0, 64),
      new THREE.MeshBasicMaterial({
        color: 0x14b8a6,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.07,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    sectionPlane.rotation.x = Math.PI / 2;
    scanner.add(sectionPlane);

    // 8. Data particles drifting up around the model
    const particleCount = 140;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3.2 + Math.random() * 5;
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = Math.random() * 14;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
      particleSpeeds[i] = 0.006 + Math.random() * 0.014;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3),
    );
    const particles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({
        color: 0x5eead4,
        size: 0.07,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    scene.add(particles);

    // 9. Gentle pointer parallax (listens on window; the canvas stays non-interactive)
    const pointer = { x: 0, y: 0 };
    const handlePointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    if (!reduceMotion)
      window.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });

    // 10. Animation loop (pauses off-screen; single static frame for reduced motion)
    let scanDirection = 1;
    let scanY = podiumHeight;
    const maxY = topY;
    const minY = podiumHeight;

    const renderLoop = () => {
      if (!isVisible) return;
      if (!reduceMotion) animId = requestAnimationFrame(renderLoop);

      rootGroup.rotation.y += 0.004;

      scanY += 0.028 * scanDirection;
      beaconMat.opacity =
        0.35 + 0.65 * Math.max(0, Math.sin(performance.now() / 260));
      if (scanY > maxY) {
        scanY = maxY;
        scanDirection = -1;
      } else if (scanY < minY) {
        scanY = minY;
        scanDirection = 1;
      }
      scanner.position.y = scanY;
      scannerRing.rotation.z += 0.012;
      for (const { y, mat } of floorEdges) {
        const proximity = Math.max(0, 1 - Math.abs(scanY - y) / 0.75);
        mat.opacity = 0.55 + proximity * 0.45;
        mat.color.setHex(proximity > 0.35 ? 0xccfbf1 : 0x5eead4);
      }

      for (let i = 0; i < particleCount; i++) {
        const yIndex = i * 3 + 1;
        particlePositions[yIndex] += particleSpeeds[i];
        if (particlePositions[yIndex] > 14) particlePositions[yIndex] = 0;
      }
      particleGeo.attributes.position.needsUpdate = true;
      particles.rotation.y -= 0.0015;

      camera.position.x +=
        (cameraBase.x + pointer.x * 1.6 - camera.position.x) * 0.04;
      camera.position.y +=
        (cameraBase.y - pointer.y * 1.0 - camera.position.y) * 0.04;
      camera.lookAt(lookTarget);

      renderer.render(scene, camera);
    };

    // 11. Intersection Observer (halts the loop when out of viewport)
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const visible = entry?.isIntersecting ?? false;
        if (visible && !isVisible) {
          isVisible = true;
          animId = requestAnimationFrame(renderLoop);
        } else if (!visible && isVisible) {
          isVisible = false;
          if (animId) cancelAnimationFrame(animId);
        }
      },
      { threshold: 0.05 },
    );
    intersectionObserver.observe(container);

    // 12. Document Visibility (pause when browser tab is inactive)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isVisible = false;
        if (animId) cancelAnimationFrame(animId);
      } else {
        isVisible = true;
        animId = requestAnimationFrame(renderLoop);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 13. Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (reduceMotion) renderer.render(scene, camera);
    });
    resizeObserver.observe(container);

    animId = requestAnimationFrame(renderLoop);

    // 14. Cleanup on unmount
    return () => {
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pointermove", handlePointerMove);
      if (animId) cancelAnimationFrame(animId);

      scene.traverse((obj) => {
        if (
          obj instanceof THREE.Mesh ||
          obj instanceof THREE.LineSegments ||
          obj instanceof THREE.Points
        ) {
          if (obj.geometry) obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else if (obj.material) {
            obj.material.dispose();
          }
        }
      });
      glowTexture.dispose();

      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative h-[380px] sm:h-[440px] lg:h-[480px] w-full select-none pointer-events-none">
      {/* Soft teal halo behind the model so it sits in the hero's light, not in a box */}
      <div
        aria-hidden="true"
        className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.16),transparent_70%)] blur-2xl"
      />

      {/* Three.js Canvas Container - pointer-events-none ensures no scroll/drag interference */}
      <div
        ref={containerRef}
        className="relative h-full w-full pointer-events-none"
        style={{ maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }}
      />

      {/* Top Header HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-2 sm:p-4">
        <div className="flex items-center gap-2 rounded-full border border-teal-500/25 bg-brand-ink/60 px-3 py-1 backdrop-blur-md">
          <span className="flex size-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="font-mono text-[11px] font-bold text-teal-300">
            BIM4C DIGITAL TWIN
          </span>
          <span className="text-[10px] font-semibold text-slate-400">
            · LIVE MODEL
          </span>
        </div>

        <Link
          href={ROUTES.bimViewer}
          className="pointer-events-auto inline-flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/15 px-3 py-1 text-xs font-bold text-teal-300 hover:bg-teal-500/25 transition-colors backdrop-blur-md"
        >
          <Maximize2 className="size-3.5" />
          <span className="hidden sm:inline">
            {ui(locale).bimHero3DCanvas.fullBIMViewer}
          </span>
        </Link>
      </div>

      {/* Ambient Bottom Tag */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center p-2 sm:p-4">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-brand-ink/60 px-2.5 py-1 backdrop-blur-md">
          <Layers className="size-3.5 text-teal-400" />
          <span className="text-[11px] font-medium text-slate-300">
            {ui(locale).bimHero3DCanvas.multidisciplinary3DModelAutoOrbit}
          </span>
        </div>
      </div>
    </div>
  );
}
