/** `tel:` link for a display number such as "+84 93 2468 099"; null when it has no digits. */
export function telHref(phone?: string | null): string | null {
  const digits = phone?.replace(/[^\d+]/g, "") ?? "";
  return /\d/.test(digits) ? `tel:${digits}` : null;
}

/** Non-empty, trimmed entries only, so deleted or blank list items never render. */
export function filled<T>(
  items: (T | null | undefined)[] | null | undefined,
): T[] {
  return (items ?? []).filter((item): item is T =>
    typeof item === "string" ? item.trim() !== "" : item != null,
  );
}
