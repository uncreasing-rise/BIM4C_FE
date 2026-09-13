"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  RotateCw,
  Maximize2,
  Scan,
  Grid,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/lib/i18n/context";

export function BimHero3DCanvas() {
  const { locale } = useLanguage();
  const isVi = locale === "vi";

  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // References for animation
  const scannerRingRef = useRef<THREE.Mesh | null>(null);
  const wireframeGroupRef = useRef<THREE.Group | null>(null);
  const solidGroupRef = useRef<THREE.Group | null>(null);

  // UI State
  const [wireframeOnly, setWireframeOnly] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  // Initialize Lightweight Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#030712");
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(16, 12, 18);
    cameraRef.current = camera;

    // 3. Renderer (Lightweight, no heavy shadow maps)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 5, 0);
    controls.minDistance = 10;
    controls.maxDistance = 35;
    controls.maxPolarAngle = Math.PI / 2;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;
    controlsRef.current = controls;

    // 5. Clean Architectural Lights (2 lightweight lights)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x2dd4bf, 1.8);
    dirLight.position.set(15, 25, 15);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-15, 10, -15);
    scene.add(rimLight);

    // 6. Base Blueprint Grid Floor
    const grid = new THREE.GridHelper(24, 24, 0x14b8a6, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);

    // 7. Lightweight Parametric BIM High-Rise Tower (< 30 simple meshes)
    const solidGroup = new THREE.Group();
    const wireframeGroup = new THREE.Group();
    solidGroupRef.current = solidGroup;
    wireframeGroupRef.current = wireframeGroup;
    scene.add(solidGroup);
    scene.add(wireframeGroup);

    const floors = 8;
    const floorHeight = 1.2;
    const baseWidth = 6.5;

    // Shared Lightweight Materials
    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.3,
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0f766e,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.65,
    });

    const edgeLineMat = new THREE.LineBasicMaterial({
      color: 0x5eead4,
      linewidth: 1,
    });

    // Central Structural Core
    const coreGeo = new THREE.BoxGeometry(2.2, floors * floorHeight + 1, 2.2);
    const coreMesh = new THREE.Mesh(coreGeo, concreteMat);
    coreMesh.position.set(0, (floors * floorHeight + 1) / 2, 0);
    solidGroup.add(coreMesh);

    const coreEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(coreGeo),
      new THREE.LineBasicMaterial({ color: 0x2dd4bf, transparent: true, opacity: 0.5 }),
    );
    coreEdges.position.copy(coreMesh.position);
    wireframeGroup.add(coreEdges);

    // Stacked & Subtle Twisted Floor Plates
    for (let i = 0; i < floors; i++) {
      const y = i * floorHeight + 0.6;
      const taper = 1 - (i / floors) * 0.35;
      const twist = (i / floors) * 0.35; // subtle twist curve

      const w = baseWidth * taper;
      const slabGeo = new THREE.BoxGeometry(w, 0.15, w);
      const glassGeo = new THREE.BoxGeometry(w * 0.95, floorHeight - 0.15, w * 0.95);

      // Floor Slab
      const slab = new THREE.Mesh(slabGeo, concreteMat);
      slab.position.set(0, y, 0);
      slab.rotation.y = twist;
      solidGroup.add(slab);

      // Glass Enclosure
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.set(0, y + (floorHeight - 0.15) / 2, 0);
      glass.rotation.y = twist;
      solidGroup.add(glass);

      // Blueprint Wireframe Edges
      const slabEdges = new THREE.LineSegments(new THREE.EdgesGeometry(slabGeo), edgeLineMat);
      slabEdges.position.copy(slab.position);
      slabEdges.rotation.copy(slab.rotation);
      wireframeGroup.add(slabEdges);

      const glassEdges = new THREE.LineSegments(
        new THREE.EdgesGeometry(glassGeo),
        new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 }),
      );
      glassEdges.position.copy(glass.position);
      glassEdges.rotation.copy(glass.rotation);
      wireframeGroup.add(glassEdges);
    }

    // 8. LiDAR Scanning Holographic Ring
    const ringGeo = new THREE.RingGeometry(4.8, 5.0, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const scannerRing = new THREE.Mesh(ringGeo, ringMat);
    scannerRing.rotation.x = Math.PI / 2;
    scannerRing.position.y = 2;
    scene.add(scannerRing);
    scannerRingRef.current = scannerRing;

    // 9. Silky Smooth Animation Loop
    let scanDirection = 1;
    let scanY = 1.0;

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      controls.update();

      // Animate LiDAR Scan Ring
      scanY += 0.04 * scanDirection;
      if (scanY > floors * floorHeight) {
        scanY = floors * floorHeight;
        scanDirection = -1;
      } else if (scanY < 0.5) {
        scanY = 0.5;
        scanDirection = 1;
      }

      if (scannerRingRef.current) {
        scannerRingRef.current.position.y = scanY;
        scannerRingRef.current.rotation.z += 0.015;
      }

      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // 10. Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      controls.dispose();
      renderer.dispose();
      // Dispose materials & geometries
      concreteMat.dispose();
      glassMat.dispose();
      edgeLineMat.dispose();
      ringMat.dispose();
    };
  }, []);

  // Toggle Wireframe Visibility
  useEffect(() => {
    if (solidGroupRef.current) {
      solidGroupRef.current.visible = !wireframeOnly;
    }
  }, [wireframeOnly]);

  // Toggle Auto Rotate
  const toggleRotate = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !autoRotate;
      setAutoRotate(!autoRotate);
    }
  }, [autoRotate]);

  // Reset Camera
  const resetCamera = useCallback(() => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(16, 12, 18);
      controlsRef.current.target.set(0, 5, 0);
      controlsRef.current.update();
    }
  }, []);

  return (
    <div className="relative h-[380px] sm:h-[440px] lg:h-[480px] w-full select-none overflow-hidden rounded-3xl border border-white/15 bg-slate-950/80 shadow-2xl backdrop-blur-2xl">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="h-full w-full cursor-grab active:cursor-grabbing" />

      {/* Minimal Top Header HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-teal-500/30 bg-slate-950/80 px-3 py-1 backdrop-blur-md shadow-md">
          <span className="flex size-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="font-mono text-[11px] font-bold text-teal-300">
            BIM4C DIGITAL TWIN
          </span>
          <span className="text-[10px] font-semibold text-slate-400">· 60FPS</span>
        </div>

        <Link
          href={ROUTES.bimViewer}
          className="pointer-events-auto inline-flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/15 px-3 py-1 text-xs font-bold text-teal-300 hover:bg-teal-500/25 transition-colors backdrop-blur-md"
        >
          <Maximize2 className="size-3.5" />
          <span className="hidden sm:inline">{isVi ? "Xem BIM Đầy đủ" : "Full BIM Viewer"}</span>
        </Link>
      </div>

      {/* Minimal Bottom Control Bar */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between p-4 bg-gradient-to-t from-slate-950/80 to-transparent">
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-950/80 p-1 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setWireframeOnly(!wireframeOnly)}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              wireframeOnly
                ? "bg-primary text-white"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Grid className="size-3.5" />
            <span>{wireframeOnly ? (isVi ? "Dạng Đặc" : "Solid") : (isVi ? "Khung Dây (CAD)" : "Wireframe")}</span>
          </button>

          <button
            type="button"
            onClick={toggleRotate}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              autoRotate
                ? "bg-teal-500/20 text-teal-300"
                : "text-slate-400 hover:text-white"
            }`}
            title={isVi ? "Tự động xoay" : "Auto Rotate"}
          >
            <RotateCw className={`size-3.5 ${autoRotate ? "animate-spin" : ""}`} style={{ animationDuration: "12s" }} />
            <span className="hidden sm:inline">{isVi ? "Xoay" : "Rotate"}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={resetCamera}
          className="pointer-events-auto rounded-xl border border-white/10 bg-slate-900/80 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          {isVi ? "Đặt lại góc" : "Reset"}
        </button>
      </div>
    </div>
  );
}
