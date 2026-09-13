"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n/context";

type TowerPoint = {
  x: number;
  y: number;
  z: number;
  size: number;
  bright: boolean;
};

function TowerCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const points: TowerPoint[] = [];
    for (let floor = 0; floor < 28; floor += 1) {
      for (let window = 0; window < 22; window += 1) {
        const side = window % 2;
        const u = (Math.floor(window / 2) / 10.5 - 0.5) * 1.15;
        const y = 0.72 - floor * 0.052;
        points.push({
          x: side ? 0.56 : u,
          y: y + (((floor + window) % 3) - 1) * 0.002,
          z: side ? u : 0.23,
          size: 0.9 + ((floor + window) % 3) * 0.22,
          bright: (floor + window) % 9 === 0,
        });
      }
    }
    for (let i = 0; i < 160; i += 1) {
      const angle = i * 2.399;
      const radius = 0.72 + (i % 7) * 0.055;
      points.push({
        x: Math.cos(angle) * radius,
        y: 0.75 - (i % 24) * 0.055,
        z: Math.sin(angle) * radius,
        size: 0.65 + (i % 3) * 0.25,
        bright: i % 8 === 0,
      });
    }
    points.sort((a, b) => a.z - b.z);
    let rotation = -0.18;
    let frame = 0;
    let active = true;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    const draw = () => {
      if (!active) {
        frame = 0;
        return;
      }
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      rotation += reduced ? 0.0004 : 0.0022;
      ctx.clearRect(0, 0, width, height);
      const glow = ctx.createRadialGradient(
        width * 0.52,
        height * 0.44,
        8,
        width * 0.52,
        height * 0.5,
        width * 0.65,
      );
      glow.addColorStop(0, "#174c50aa");
      glow.addColorStop(1, "#071f2700");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
      const angle = rotation + pointer.current.x * 0.24;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const project = (x: number, y: number, z: number) => {
        const rx = x * cos - z * sin;
        const rz = x * sin + z * cos;
        const depth = 1 / (1.72 - rz * 0.34);
        return {
          x: width * 0.52 + rx * width * 0.38 * depth,
          y:
            height * 0.2 +
            (y + pointer.current.y * rz * 0.08) * height * 0.57 * depth,
          depth,
        };
      };
      const base = project(0, 0.78, 0);
      ctx.strokeStyle = "#8bd8cb55";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(
        base.x,
        height * 0.81,
        width * 0.34,
        height * 0.075,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.strokeStyle = "#d5ed9c66";
      ctx.beginPath();
      ctx.moveTo(width * 0.52, height * 0.1);
      ctx.lineTo(width * 0.52, height * 0.84);
      ctx.stroke();
      points.forEach((point) => {
        const p = project(point.x, point.y, point.z);
        ctx.fillStyle = point.bright
          ? "#d5ed9c"
          : p.depth > 0.66
            ? "#8bd8cb"
            : "#3e928f";
        ctx.globalAlpha = Math.min(1, 0.35 + p.depth * 0.7);
        ctx.beginPath();
        ctx.arc(p.x, p.y, point.size * p.depth, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };
    const visibility = new IntersectionObserver(
      ([entry]) => {
        active = Boolean(entry?.isIntersecting);
        if (active && !frame) frame = requestAnimationFrame(draw);
      },
      { threshold: 0.05 },
    );
    visibility.observe(canvas);
    frame = requestAnimationFrame(draw);
    const move = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.current.x = (event.clientX - rect.left) / rect.width - 0.5;
      pointer.current.y = (event.clientY - rect.top) / rect.height - 0.5;
    };
    canvas.addEventListener("pointermove", move);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibility.disconnect();
      canvas.removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="point-cloud-canvas tower-canvas"
      aria-label="3D BIM tower scan simulation"
    />
  );
}

export function HeroSlideShowcase() {
  const { locale } = useLanguage();
  const vi = locale === "vi";
  return (
    <div
      className="point-cloud-showcase tower-showcase"
      role="img"
      aria-label={
        vi
          ? "Mô phỏng tòa nhà 3D từ dữ liệu quét laser"
          : "3D BIM tower generated from laser scan data"
      }
    >
      <div className="point-cloud-stage tower-stage">
        <TowerCanvas />
        <div className="point-cloud-grid" aria-hidden="true" />
        <span className="point-cloud-label point-cloud-label-top">
          LIVE MODEL / TOWER 01
        </span>
        <span className="point-cloud-label point-cloud-label-bottom">
          X 042.61 &nbsp; Y 118.04 &nbsp; Z 006.92
        </span>
        <span className="point-cloud-cross" aria-hidden="true">
          +
        </span>
        <div className="point-cloud-meta">
          <strong>SCAN 01</strong>
          <span>{vi ? "28 tầng" : "28 floors"}</span>
          <span>{vi ? "Độ chính xác" : "Accuracy"} ±2mm</span>
        </div>
      </div>
    </div>
  );
}
