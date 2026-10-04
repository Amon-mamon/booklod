"use client";

import { useEffect } from "react";
import { AlertTriangle, Check, X } from "lucide-react";
import { colors } from "@/config/brand";

export type ToastType = "success" | "error";

export interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

const AUTO_DISMISS_MS = 2800;

/** Brief, auto-dismissing confirmation. Rendered by `ToastProvider`. */
export function Toast({ toast, onDismiss }: { toast: ToastState | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;
  const isError = toast.type === "error";

  return (
    <div
      className="fixed left-1/2 z-[60] px-4"
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 84px)",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 420,
      }}
    >
      <div
        className="flex items-center gap-2.5 rounded-xl px-4 py-3 shadow-lg mx-auto"
        style={{ background: isError ? colors.danger : colors.navy, maxWidth: 380 }}
        role="status"
      >
        {isError ? (
          <AlertTriangle size={16} color="white" style={{ flexShrink: 0 }} />
        ) : (
          <Check size={16} color="white" style={{ flexShrink: 0 }} />
        )}
        <span className="text-sm font-medium text-white flex-1">{toast.message}</span>
        <button type="button" onClick={onDismiss} className="flex-shrink-0" aria-label="Dismiss">
          <X size={14} color="white" style={{ opacity: 0.7 }} />
        </button>
      </div>
    </div>
  );
}
