"use client";

import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

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
  const vi = locale === "vi";
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
                ? vi
                  ? "Dừng tự chuyển slide"
                  : "Pause slideshow"
                : vi
                  ? "Bật tự chuyển slide"
                  : "Play slideshow"
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
          aria-label={vi ? "Slide trước" : "Previous slide"}
        >
          <ArrowLeft className="size-4" />
        </button>
        <button
          type="button"
          className="slide-arrow"
          onClick={() => onSelect(active + 1)}
          aria-label={vi ? "Slide tiếp theo" : "Next slide"}
        >
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
