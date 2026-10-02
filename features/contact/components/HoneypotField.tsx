/**
 * A field people never see and spam bots fill in; the API quietly drops
 * submissions that have it (backend HoneypotInterceptor). Moved off screen
 * rather than display:none, which many bots skip, and kept out of the tab
 * order, autofill and screen readers.
 */
export const HONEYPOT_NAME = "website";

export function HoneypotField() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" name={HONEYPOT_NAME} tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}

/** The honeypot's value from a submitted form, to send along with it. */
export const honeypotValue = (data: FormData) => String(data.get(HONEYPOT_NAME) ?? "");
