"use client";

import { AlertDialog } from "radix-ui";
import { AlertTriangle } from "lucide-react";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ConfirmOptions {
  title: string;
  /** Explain the consequence (reversible? what else is affected?). */
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
}

/**
 * Accessible replacement for window.confirm(). Render `dialog` once in the
 * component, then `if (!(await confirm({...}))) return;`.
 */
export function useConfirm() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback(
    (next: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        resolver.current?.(false);
        resolver.current = resolve;
        setOptions(next);
      }),
    [],
  );
  const settle = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setOptions(null);
  };
  const danger = (options?.tone ?? "danger") === "danger";

  const dialog = (
    <AlertDialog.Root open={options !== null} onOpenChange={(open) => !open && settle(false)}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[60] bg-slate-900/40 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-[61] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-5 shadow-xl focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="flex gap-3">
            {danger && (
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-red-50 text-red-600" aria-hidden="true">
                <AlertTriangle className="size-4" />
              </span>
            )}
            <div className="min-w-0">
              <AlertDialog.Title className="text-base font-semibold text-slate-900">{options?.title}</AlertDialog.Title>
              {options?.description && (
                <AlertDialog.Description className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {options.description}
                </AlertDialog.Description>
              )}
            </div>
          </div>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel className={buttonVariants({ variant: "outline" })} onClick={() => settle(false)}>
              {options?.cancelLabel ?? "Hủy"}
            </AlertDialog.Cancel>
            <AlertDialog.Action
              className={cn(buttonVariants({ variant: danger ? "destructive" : "default" }), danger && "bg-red-600 text-white hover:bg-red-700")}
              onClick={() => settle(true)}
            >
              {options?.confirmLabel ?? (danger ? "Xóa" : "Đồng ý")}
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );

  return { confirm, dialog };
}
