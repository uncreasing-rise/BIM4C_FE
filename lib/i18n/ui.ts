import type { Locale } from "./config";
import { uiEn, type UiStrings } from "./dictionaries/ui.en";
import { uiVi } from "./dictionaries/ui.vi";

/**
 * Component UI strings for a locale. Works in server and client components
 * alike (no hook), so it can be used anywhere `locale` is in scope.
 */
export function ui(locale: Locale | string): UiStrings {
  return locale === "vi" ? uiVi : uiEn;
}
