---
name: gsap-motion
description: >-
  Enterprise GSAP (GreenSock) Animation System guidelines, reusable React hooks,
  declarative SaaS components, ScrollTrigger orchestration, and performance best practices.
---

# GSAP Motion Architecture Guide for Next.js & React

This skill outlines the standards, hooks, declarative components, and best practices for creating high-performance, SaaS-grade animations using **GSAP 3** and **ScrollTrigger** in modern Next.js App Router applications.

---

## 1. Core Architecture Principles

1. **Hydration-Safe Client Execution**:
   - Always run GSAP in client components (`"use client"`).
   - Use `useLayoutEffect` or `useEffect` for DOM mutations and ScrollTrigger attachments.
   - Always wrap browser-only plugin registration:
     ```ts
     if (typeof window !== "undefined") {
       gsap.registerPlugin(ScrollTrigger);
     }
     ```

2. **Garbage Collection & Lifecycle (gsap.context)**:
   - Always scope tweens and ScrollTriggers within `gsap.context()` to avoid memory leaks.
   - Return `ctx.revert()` in the React cleanup function.

3. **Accessibility First (prefers-reduced-motion)**:
   - Use `gsap.matchMedia()` to respect user OS accessibility settings.
   - Automatically clear transforms for users who prefer reduced motion.

---

## 2. Reusable Hooks (`@/components/motion/hooks/use-gsap.ts`)

### `useGsapContext(callback, dependencies, scopeRef)`
Executes GSAP animations with automatic context cleanup on component unmount.

```tsx
import { useGsapContext } from "@/components/motion";

export function MySection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGsapContext((ctx) => {
    gsap.from(".item", {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        once: true,
      },
    });
  }, [], containerRef);

  return <div ref={containerRef}><div className="item">1</div></div>;
}
```

### `useMagnetic(strength, ease)`
Creates a magnetic cursor attraction effect for interactive buttons and pills.

```tsx
const buttonRef = useMagnetic<HTMLButtonElement>(0.25);
return <button ref={buttonRef}>Click Me</button>;
```

### `use3DTilt(maxTilt, perspective)`
Creates a smooth 3D perspective tilt effect tracking cursor position over cards.

```tsx
const cardRef = use3DTilt<HTMLDivElement>(12, 1000);
return <div ref={cardRef}>3D Tilt Card</div>;
```

---

## 3. Declarative SaaS Motion Components

| Component | Import Path | Description |
| :--- | :--- | :--- |
| `<MotionSystem />` | `@/components/motion` | Global route-level orchestrator scanning `[data-motion]` attributes. |
| `<ScrollProgress />` | `@/components/motion` | Sleek gradient scroll progress indicator fixed to viewport top. |
| `<MagneticButton />` | `@/components/motion` | Interactive magnetic hover button wrapper. |
| `<CountUpNumber />` | `@/components/motion` | ScrollTrigger animated numeric counter with formatting. |
| `<TextReveal />` | `@/components/motion` | Split-text word stagger entrance animation. |
| `<CardTilt3D />` | `@/components/motion` | 3D cursor-tracking card tilt container. |

---

## 4. Declarative HTML Data-Attributes

Add `data-motion` attributes to standard HTML elements for automatic orchestration by `<MotionSystem />`:

- `data-motion="hero"`: Staggered entrance for hero elements (`y: 20 -> 0`, `opacity: 0 -> 1`).
- `data-motion="reveal"`: Fade-up reveal when element scrolls into view.
- `data-motion="tile"`: Staggered entrance for grid cards and bento tiles.
- `data-motion="parallax"`: Subtle vertical parallax scrolling (`yPercent: -2 -> 2`).
- `data-motion="magnetic"`: Auto-attaches magnetic pointer attraction.

---

## 5. Performance Checklist

- [x] Use `will-change: transform` sparingly on active animation targets.
- [x] Always set `clearProps: "transform,opacity"` after entrance tweens to allow responsive CSS transitions.
- [x] Call `ScrollTrigger.refresh()` after dynamic route transitions or DOM layout shifts.
- [x] Use `ease: "power2.out"` or `ease: "power3.out"` for natural SaaS spring physics.
