export function scrollToPageTop(): void {
  if (typeof window === "undefined") return;

  window.requestAnimationFrame(() => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  });
}

export function scrollToElementTop(element: Element | null, offset = 96): void {
  if (typeof window === "undefined" || !element) return;

  window.requestAnimationFrame(() => {
    const top = element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  });
}
