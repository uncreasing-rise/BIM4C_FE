/**
 * Lets the browser paint and handle input between slices of long work.
 *
 * setTimeout(0) is clamped to about once per second in background tabs, which
 * turned a 3-second model build into 25 seconds whenever the user switched
 * tabs while a file loaded. scheduler.yield and MessageChannel are not
 * throttled that way.
 */
type SchedulerLike = { yield?: () => Promise<void> };

let channel: MessageChannel | null = null;
const waiting: (() => void)[] = [];

export function yieldToBrowser(): Promise<void> {
  const scheduler = (globalThis as { scheduler?: SchedulerLike }).scheduler;
  if (scheduler?.yield) return scheduler.yield();
  if (typeof MessageChannel === "undefined")
    return new Promise((resolve) => setTimeout(resolve, 0));
  if (!channel) {
    channel = new MessageChannel();
    channel.port1.onmessage = () => waiting.shift()?.();
    // Node (tests, tooling) would otherwise stay alive for the open port.
    for (const port of [channel.port1, channel.port2])
      (port as MessagePort & { unref?: () => void }).unref?.();
  }
  return new Promise((resolve) => {
    waiting.push(resolve);
    channel!.port2.postMessage(null);
  });
}

/** A slicer: resolves immediately until `budgetMs` of work has passed, then yields. */
export function timeSlicer(budgetMs = 12) {
  let last = performance.now();
  return async () => {
    if (performance.now() - last < budgetMs) return;
    await yieldToBrowser();
    last = performance.now();
  };
}
