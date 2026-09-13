"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, PointerEvent } from "react";

/** Shared carousel behavior: local keyboard controls, deliberate swipes and opt-out autoplay. */
export function useSlideshow(count: number, interval = 7000) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(true);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const index = count ? active % count : 0;
  const running =
    playing && !hovered && !focused && visible && !reduced && count > 1;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduced(media.matches);
    const updateVisibility = () => setVisible(!document.hidden);
    updateMotion();
    updateVisibility();
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(
      () => setActive((value) => (value + 1) % count),
      interval,
    );
    return () => window.clearTimeout(timer);
  }, [active, count, interval, running]);

  const select = useCallback(
    (value: number) => {
      if (!count) return;
      setPlaying(false);
      setActive((value + count) % count);
    },
    [count],
  );

  return {
    active: index,
    running,
    playing: playing && !reduced,
    reduced,
    select,
    toggle: () => setPlaying((value) => !value),
    handlers: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onFocusCapture: () => setFocused(true),
      onBlurCapture: (event: FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      },
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        if (
          (event.target as HTMLElement).closest("input, textarea, select") ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey
        )
          return;
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          select(index + (event.key === "ArrowRight" ? 1 : -1));
        }
      },
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        swiped.current = false;
        pointer.current = event.isPrimary
          ? { x: event.clientX, y: event.clientY }
          : null;
      },
      onPointerUp: (event: PointerEvent<HTMLElement>) => {
        if (!pointer.current) return;
        const dx = event.clientX - pointer.current.x;
        const dy = event.clientY - pointer.current.y;
        pointer.current = null;
        if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          swiped.current = true;
          select(index + (dx < 0 ? 1 : -1));
        }
      },
      onPointerCancel: () => {
        pointer.current = null;
      },
      onClickCapture: (event: React.MouseEvent<HTMLElement>) => {
        if (swiped.current) {
          event.preventDefault();
          event.stopPropagation();
          swiped.current = false;
        }
      },
      onDragStart: (event: React.DragEvent<HTMLElement>) =>
        event.preventDefault(),
    },
  };
}
