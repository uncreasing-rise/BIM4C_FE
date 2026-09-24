"use client";

import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

import { ui } from "@/lib/i18n/ui";
export function SlideControls({
  active,
  count,
  playing,
  reduced,
  onSelect,
  onToggle,
}: {
  active: number;
  count: number;
  playing: boolean;
  reduced: boolean;
  onSelect: (index: number) => void;
  onToggle: () => void;
}) {
  const { locale } = useLanguage();
  if (count < 2) return null;
  return (
    <div className="slide-controls">
      <span className="slide-count">
        <strong>{String(active + 1).padStart(2, "0")}</strong>
        <span>/ {String(count).padStart(2, "0")}</span>
      </span>
      <div className="flex items-center gap-1.5">
        {!reduced && (
          <button
            type="button"
            className="slide-arrow"
            onClick={onToggle}
            aria-label={
              playing
                ? ui(locale).slideControls.pauseSlideshow
                : ui(locale).slideControls.playSlideshow
            }
          >
            {playing ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
          </button>
        )}
        <button
          type="button"
          className="slide-arrow"
          onClick={() => onSelect(active - 1)}
          aria-label={ui(locale).slideControls.previousSlide}
        >
          <ArrowLeft className="size-4" />
        </button>
        <button
          type="button"
          className="slide-arrow"
          onClick={() => onSelect(active + 1)}
          aria-label={ui(locale).slideControls.nextSlide}
        >
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
