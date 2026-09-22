"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Hook to execute GSAP animations scoped to a container element.
 * Automatically handles gsap.context() lifecycle and garbage collection on unmount.
 */
export function useGsapContext(
  animationCallback: (context: gsap.Context) => void,
  dependencies: React.DependencyList = [],
  scopeRef?: React.RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const scope = scopeRef?.current || undefined;
    const ctx = gsap.context(() => {
      animationCallback(ctx);
    }, scope);

    return () => {
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}

/**
 * Hook for smooth magnetic attraction on hover (SaaS Stripe/Linear-style buttons)
 */
export function useMagnetic<T extends HTMLElement = HTMLElement>(
  strength = 0.25,
  ease = "power2.out",
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onPointerMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      gsap.to(el, {
        x: deltaX,
        y: deltaY,
        duration: 0.35,
        ease,
        overwrite: "auto",
      });
    };

    const onPointerLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.4)",
        overwrite: "auto",
      });
    };

    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerleave", onPointerLeave);

    return () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onPointerLeave);
      gsap.killTweensOf(el);
    };
  }, [strength, ease]);

  return ref;
}

/**
 * Hook for 3D perspective tilt effect on interactive cards
 */
export function use3DTilt<T extends HTMLElement = HTMLElement>(
  maxTilt = 12,
  perspective = 1000,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.set(el, { transformPerspective: perspective });

    const onPointerMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const xRatio = (e.clientX - rect.left) / rect.width - 0.5;
      const yRatio = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(el, {
        rotateY: xRatio * maxTilt,
        rotateX: -yRatio * maxTilt,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const onPointerLeave = () => {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.5)",
        overwrite: "auto",
      });
    };

    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerleave", onPointerLeave);

    return () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onPointerLeave);
      gsap.killTweensOf(el);
    };
  }, [maxTilt, perspective]);

  return ref;
}
