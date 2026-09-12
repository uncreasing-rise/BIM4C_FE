"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type {
  BimElementData,
  BimModelDefinition,
  BimTool,
  BimViewPreset,
  ActiveMeasurement,
  BimDiscipline,
} from "./types";

interface BimCanvasProps {
  model: BimModelDefinition;
  activeTool: BimTool;
  selectedElementId: string | null;
  onSelectElement: (element: BimElementData | null) => void;
  visibleLayers: Record<BimDiscipline, boolean>;
  clipPlanes: { x: number; y: number; z: number; enabled: boolean };
  explodeFactor: number;
  activeClashPoint: [number, number, number] | null;
  activeViewPreset: BimViewPreset | null;
  onFpsUpdate?: (fps: number) => void;
  onMeasurementChange?: (measurement: ActiveMeasurement | null) => void;
  activeMeasurement: ActiveMeasurement | null;
}

export function BimCanvas({
  model,
  activeTool,
  selectedElementId,
  onSelectElement,
  visibleLayers,
  clipPlanes,
  explodeFactor,
  activeClashPoint,
  activeViewPreset,
  onFpsUpdate,
  onMeasurementChange,
  activeMeasurement,
}: BimCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshesMapRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const initialPositionsRef = useRef<Map<string, THREE.Vector3>>(new Map());
  const animationFrameIdRef = useRef<number | null>(null);
  const measurementLineRef = useRef<THREE.Line | null>(null);
  const measurementPointsRef = useRef<THREE.Mesh[]>([]);
  const clashMarkersRef = useRef<THREE.Group | null>(null);

  // Clipping Planes
  const planeXRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(-1, 0, 0), 50));
  const planeYRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, -1, 0), 50));
  const planeZRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 0, -1), 50));

  // Initialize Scene, Renderer, Lights, Grid
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#090d16");
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(...model.defaultCamera.position);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(...model.defaultCamera.target);
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controlsRef.current = controls;

    // 5. Lighting Setup (Clean Architectural Lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.6);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.4);
    sunLight.position.set(40, 60, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 150;
    const d = 30;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x06b6d4, 0.4);
    fillLight.position.set(-30, 20, -30);
    scene.add(fillLight);

    // 6. Architectural Grid Floor
    const gridHelper = new THREE.GridHelper(60, 60, 0x0ea5e9, 0x1e293b);
    gridHelper.position.y = -1.2;
    scene.add(gridHelper);

    // 7. Render & FPS Loop
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const animate = (currentTime: number) => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      controls.update();

      // Pulse clash markers if any
      if (clashMarkersRef.current) {
        const time = currentTime * 0.003;
        clashMarkersRef.current.children.forEach((marker) => {
          const scale = 1 + Math.sin(time) * 0.15;
          marker.scale.set(scale, scale, scale);
        });
      }

      renderer.render(scene, camera);

      // FPS tracking
      frameCount++;
      if (currentTime - lastFpsUpdate >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastFpsUpdate));
        if (onFpsUpdate) onFpsUpdate(fps);
        frameCount = 0;
        lastFpsUpdate = currentTime;
      }
    };
    animate(performance.now());

    // 8. Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      controls.dispose();
      renderer.dispose();
    };
  }, [model.defaultCamera, onFpsUpdate]);

  // Build BIM Meshes whenever model changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old meshes
    meshesMapRef.current.forEach((mesh) => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else {
        mesh.material.dispose();
      }
    });
    meshesMapRef.current.clear();
    initialPositionsRef.current.clear();

    const activePlanes = [planeXRef.current, planeYRef.current, planeZRef.current];

    model.elements.forEach((elem) => {
      let geometry: THREE.BufferGeometry;
      const [sx, sy, sz] = elem.size;

      if (elem.geometryType === "cylinder") {
        geometry = new THREE.CylinderGeometry(sx / 2, sx / 2, sy, 24);
      } else if (elem.geometryType === "pipe") {
        geometry = new THREE.CylinderGeometry(sz / 2, sz / 2, sx, 16);
        geometry.rotateZ(Math.PI / 2);
      } else if (elem.geometryType === "truss") {
        geometry = new THREE.BoxGeometry(sx, sy, sz);
      } else {
        geometry = new THREE.BoxGeometry(sx, sy, sz);
      }

      const isTransparent = elem.ifcType === "IfcCurtainWall";
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(elem.color),
        roughness: isTransparent ? 0.1 : 0.45,
        metalness: elem.discipline === "mep" ? 0.6 : elem.discipline === "structure" ? 0.2 : 0.1,
        transparent: isTransparent,
        opacity: isTransparent ? 0.4 : 1.0,
        clippingPlanes: activePlanes,
        clipShadows: true,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...elem.position);
      mesh.castShadow = !isTransparent;
      mesh.receiveShadow = true;
      mesh.userData = { id: elem.id, element: elem };

      scene.add(mesh);
      meshesMapRef.current.set(elem.id, mesh);
      initialPositionsRef.current.set(elem.id, new THREE.Vector3(...elem.position));
    });

    // Create Clash Markers
    if (clashMarkersRef.current) {
      scene.remove(clashMarkersRef.current);
    }
    const clashGroup = new THREE.Group();
    model.clashes.forEach((clash) => {
      const markerGeo = new THREE.SphereGeometry(0.45, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        wireframe: true,
      });
      const markerMesh = new THREE.Mesh(markerGeo, markerMat);
      markerMesh.position.set(...clash.point);
      markerMesh.userData = { clash };
      clashGroup.add(markerMesh);
    });
    scene.add(clashGroup);
    clashMarkersRef.current = clashGroup;
  }, [model]);

  // Update Layer Visibilities
  useEffect(() => {
    meshesMapRef.current.forEach((mesh) => {
      const elem = mesh.userData.element as BimElementData;
      if (elem) {
        mesh.visible = visibleLayers[elem.discipline] ?? true;
      }
    });

    if (clashMarkersRef.current) {
      clashMarkersRef.current.visible = visibleLayers.clash;
    }
  }, [visibleLayers]);

  // Update Clipping Planes
  useEffect(() => {
    if (!clipPlanes.enabled) {
      planeXRef.current.constant = 1000;
      planeYRef.current.constant = 1000;
      planeZRef.current.constant = 1000;
    } else {
      planeXRef.current.constant = clipPlanes.x;
      planeYRef.current.constant = clipPlanes.y;
      planeZRef.current.constant = clipPlanes.z;
    }
  }, [clipPlanes]);

  // Update Exploded View
  useEffect(() => {
    meshesMapRef.current.forEach((mesh, id) => {
      const initPos = initialPositionsRef.current.get(id);
      if (!initPos) return;

      const elem = mesh.userData.element as BimElementData;
      // Displace upwards based on vertical position and explode factor
      const yMultiplier = Math.max(0.2, initPos.y * 0.45);
      const xMultiplier = Math.sign(initPos.x) * Math.abs(initPos.x * 0.15);
      const zMultiplier = Math.sign(initPos.z) * Math.abs(initPos.z * 0.15);

      mesh.position.set(
        initPos.x + xMultiplier * explodeFactor,
        initPos.y + yMultiplier * explodeFactor * 2.5,
        initPos.z + zMultiplier * explodeFactor,
      );
    });
  }, [explodeFactor]);

  // Highlight Selected Element
  useEffect(() => {
    meshesMapRef.current.forEach((mesh, id) => {
      const isSelected = id === selectedElementId;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat) {
        if (isSelected) {
          mat.emissive = new THREE.Color(0x06b6d4);
          mat.emissiveIntensity = 0.6;
        } else {
          mat.emissive = new THREE.Color(0x000000);
          mat.emissiveIntensity = 0;
        }
      }
    });
  }, [selectedElementId]);

  // Focus on Clash point
  useEffect(() => {
    if (activeClashPoint && cameraRef.current && controlsRef.current) {
      const [cx, cy, cz] = activeClashPoint;
      controlsRef.current.target.set(cx, cy, cz);
      cameraRef.current.position.set(cx + 6, cy + 4, cz + 6);
      controlsRef.current.update();
    }
  }, [activeClashPoint]);

  // Change Camera Preset View
  useEffect(() => {
    if (!activeViewPreset || !cameraRef.current || !controlsRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;

    const target = new THREE.Vector3(...model.defaultCamera.target);
    controls.target.copy(target);

    switch (activeViewPreset) {
      case "top":
        camera.position.set(0, 45, 0.001);
        break;
      case "front":
        camera.position.set(0, target.y, 40);
        break;
      case "right":
        camera.position.set(40, target.y, 0);
        break;
      case "isometric":
        camera.position.set(30, 25, 30);
        break;
      case "perspective":
      default:
        camera.position.set(...model.defaultCamera.position);
        break;
    }
    controls.update();
  }, [activeViewPreset, model.defaultCamera]);

  // Render Measurement Visuals
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clean up previous measurement
    if (measurementLineRef.current) {
      scene.remove(measurementLineRef.current);
      measurementLineRef.current.geometry.dispose();
      (measurementLineRef.current.material as THREE.Material).dispose();
      measurementLineRef.current = null;
    }
    measurementPointsRef.current.forEach((pt) => {
      scene.remove(pt);
      pt.geometry.dispose();
      (pt.material as THREE.Material).dispose();
    });
    measurementPointsRef.current = [];

    if (!activeMeasurement?.p1) return;

    const sphereGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0x14b8a6 });

    // Point 1
    const s1 = new THREE.Mesh(sphereGeo, sphereMat);
    s1.position.set(activeMeasurement.p1.x, activeMeasurement.p1.y, activeMeasurement.p1.z);
    scene.add(s1);
    measurementPointsRef.current.push(s1);

    // Point 2 & Line
    if (activeMeasurement.p2) {
      const s2 = new THREE.Mesh(sphereGeo, sphereMat);
      s2.position.set(activeMeasurement.p2.x, activeMeasurement.p2.y, activeMeasurement.p2.z);
      scene.add(s2);
      measurementPointsRef.current.push(s2);

      const points = [
        new THREE.Vector3(activeMeasurement.p1.x, activeMeasurement.p1.y, activeMeasurement.p1.z),
        new THREE.Vector3(activeMeasurement.p2.x, activeMeasurement.p2.y, activeMeasurement.p2.z),
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineDashedMaterial({
        color: 0x14b8a6,
        dashSize: 0.5,
        gapSize: 0.2,
        linewidth: 2,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      scene.add(line);
      measurementLineRef.current = line;
    }
  }, [activeMeasurement]);

  const pointerDownPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      const camera = cameraRef.current;
      const scene = sceneRef.current;
      if (!container || !camera || !scene) return;

      // Only treat as click/selection if pointer didn't drag/orbit (movement < 6px)
      const dx = Math.abs(e.clientX - pointerDownPosRef.current.x);
      const dy = Math.abs(e.clientY - pointerDownPosRef.current.y);
      if (Math.hypot(dx, dy) > 6) return;

      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      const meshes = Array.from(meshesMapRef.current.values()).filter((m) => m.visible);
      const intersects = raycaster.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0];
        const elemData = hit.object.userData.element as BimElementData;

        // If in measurement mode
        if (activeTool === "measure") {
          const pt = { x: hit.point.x, y: hit.point.y, z: hit.point.z };
          if (!activeMeasurement || !activeMeasurement.p1 || (activeMeasurement.p1 && activeMeasurement.p2)) {
            if (onMeasurementChange) {
              onMeasurementChange({ p1: pt });
            }
          } else if (activeMeasurement.p1 && !activeMeasurement.p2) {
            const p1 = activeMeasurement.p1;
            const p2 = pt;
            const distDx = Math.abs(p2.x - p1.x);
            const distDy = Math.abs(p2.y - p1.y);
            const distDz = Math.abs(p2.z - p1.z);
            const dist = Math.sqrt(distDx * distDx + distDy * distDy + distDz * distDz);
            if (onMeasurementChange) {
              onMeasurementChange({
                p1,
                p2,
                distance: parseFloat(dist.toFixed(3)),
                deltaX: parseFloat(distDx.toFixed(3)),
                deltaY: parseFloat(distDy.toFixed(3)),
                deltaZ: parseFloat(distDz.toFixed(3)),
              });
            }
          }
          return;
        }

        // Selection mode
        if (elemData) {
          onSelectElement(elemData);
        }
      } else {
        if (activeTool !== "measure") {
          onSelectElement(null);
        }
      }
    },
    [activeTool, activeMeasurement, onMeasurementChange, onSelectElement],
  );

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className="relative size-full cursor-grab active:cursor-grabbing select-none"
    />
  );
}
