"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Maximize2, Layers } from "lucide-react";
import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/lib/i18n/context";

export function BimHero3DCanvas() {
  const { locale } = useLanguage();
  const isVi = locale === "vi";

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isVisible = true;
    let animId: number | null = null;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#030712");

    // 2. Camera (Isometric Architectural Angle)
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 80);
    camera.position.set(16, 13, 18);
    camera.lookAt(0, 4.5, 0);

    // 3. Ultra-lightweight WebGL Renderer (Capped pixel ratio, no stencil buffer)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "default",
      stencil: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.domElement.style.pointerEvents = "none";
    container.replaceChildren(renderer.domElement);

    // 4. Lightweight Lights (1 ambient + 2 low-overhead directional lights)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x2dd4bf, 1.8);
    dirLight.position.set(15, 25, 15);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    rimLight.position.set(-15, 10, -15);
    scene.add(rimLight);

    // 5. Blueprint Grid Floor
    const grid = new THREE.GridHelper(22, 20, 0x14b8a6, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);

    // 6. Parametric BIM Tower Model Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const floors = 7;
    const floorHeight = 1.25;
    const baseWidth = 6.2;

    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.2,
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0f766e,
      roughness: 0.15,
      metalness: 0.7,
      transparent: true,
      opacity: 0.6,
    });

    const edgeLineMat = new THREE.LineBasicMaterial({
      color: 0x5eead4,
      transparent: true,
      opacity: 0.9,
    });

    const glassEdgeMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.5,
    });

    // Central Structural Core
    const coreGeo = new THREE.BoxGeometry(2.0, floors * floorHeight + 0.8, 2.0);
    const coreMesh = new THREE.Mesh(coreGeo, concreteMat);
    coreMesh.position.set(0, (floors * floorHeight + 0.8) / 2, 0);
    rootGroup.add(coreMesh);

    const coreEdges = new THREE.LineSegments(new THREE.EdgesGeometry(coreGeo), edgeLineMat);
    coreEdges.position.copy(coreMesh.position);
    rootGroup.add(coreEdges);

    // Stacked Floor Plates with Blueprint Wireframe Edges
    for (let i = 0; i < floors; i++) {
      const y = i * floorHeight + 0.6;
      const taper = 1 - (i / floors) * 0.32;
      const twist = (i / floors) * 0.3;

      const w = baseWidth * taper;
      const slabGeo = new THREE.BoxGeometry(w, 0.14, w);
      const glassGeo = new THREE.BoxGeometry(w * 0.94, floorHeight - 0.14, w * 0.94);

      // Slabs
      const slab = new THREE.Mesh(slabGeo, concreteMat);
      slab.position.set(0, y, 0);
      slab.rotation.y = twist;
      rootGroup.add(slab);

      const slabEdges = new THREE.LineSegments(new THREE.EdgesGeometry(slabGeo), edgeLineMat);
      slabEdges.position.copy(slab.position);
      slabEdges.rotation.copy(slab.rotation);
      rootGroup.add(slabEdges);

      // Glass Enclosure
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.set(0, y + (floorHeight - 0.14) / 2, 0);
      glass.rotation.y = twist;
      rootGroup.add(glass);

      const glassEdges = new THREE.LineSegments(new THREE.EdgesGeometry(glassGeo), glassEdgeMat);
      glassEdges.position.copy(glass.position);
      glassEdges.rotation.copy(glass.rotation);
      rootGroup.add(glassEdges);
    }

    // 7. LiDAR Scan Laser Ring
    const ringGeo = new THREE.RingGeometry(4.4, 4.65, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    });
    const scannerRing = new THREE.Mesh(ringGeo, ringMat);
    scannerRing.rotation.x = Math.PI / 2;
    scannerRing.position.y = 1.5;
    scene.add(scannerRing);

    // 8. Controlled Smooth Animation Loop (Optimized, pauses off-screen)
    let scanDirection = 1;
    let scanY = 1.0;
    const maxY = floors * floorHeight;
    const minY = 0.6;

    const renderLoop = () => {
      if (!isVisible) return;

      animId = requestAnimationFrame(renderLoop);

      // Smooth ambient rotation
      rootGroup.rotation.y += 0.005;

      // LiDAR laser scanner vertical sweep
      scanY += 0.035 * scanDirection;
      if (scanY > maxY) {
        scanY = maxY;
        scanDirection = -1;
      } else if (scanY < minY) {
        scanY = minY;
        scanDirection = 1;
      }
      scannerRing.position.y = scanY;
      scannerRing.rotation.z += 0.012;

      renderer.render(scene, camera);
    };

    // 9. Intersection Observer (Automatically halts loop when out of viewport)
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
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // 10. Document Visibility (Pause when browser tab is inactive)
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

    // 11. Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // Start initial loop
    animId = requestAnimationFrame(renderLoop);

    // 12. Cleanup on unmount
    return () => {
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (animId) cancelAnimationFrame(animId);

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
          if (obj.geometry) obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else if (obj.material) {
            obj.material.dispose();
          }
        }
      });

      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative h-[380px] sm:h-[440px] lg:h-[480px] w-full select-none overflow-hidden rounded-3xl border border-white/15 bg-slate-950/80 shadow-2xl backdrop-blur-2xl pointer-events-none">
      {/* Three.js Canvas Container - pointer-events-none ensures no scroll/drag interference */}
      <div ref={containerRef} className="h-full w-full pointer-events-none" />

      {/* Top Header HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4">
        <div className="flex items-center gap-2 rounded-full border border-teal-500/30 bg-slate-950/80 px-3 py-1 backdrop-blur-md shadow-md">
          <span className="flex size-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="font-mono text-[11px] font-bold text-teal-300">
            BIM4C DIGITAL TWIN
          </span>
          <span className="text-[10px] font-semibold text-slate-400">· LIVE MODEL</span>
        </div>

        <Link
          href={ROUTES.bimViewer}
          className="pointer-events-auto inline-flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/15 px-3 py-1 text-xs font-bold text-teal-300 hover:bg-teal-500/25 transition-colors backdrop-blur-md shadow-sm"
        >
          <Maximize2 className="size-3.5" />
          <span className="hidden sm:inline">{isVi ? "Xem BIM Đầy đủ" : "Full BIM Viewer"}</span>
        </Link>
      </div>

      {/* Ambient Bottom Tag */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between p-4 bg-gradient-to-t from-slate-950/80 to-transparent">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/60 px-2.5 py-1 backdrop-blur-md">
          <Layers className="size-3.5 text-teal-400" />
          <span className="text-[11px] font-medium text-slate-300">
            {isVi ? "Mô hình 3D đa bộ môn (Tự động xoay)" : "Multidisciplinary 3D Model (Auto-Orbit)"}
          </span>
        </div>
      </div>
    </div>
  );
}
