"use client";

import { useEffect } from "react";
import { AlertTriangle, Check, X } from "lucide-react";
import { C } from "../theme";
import type { ToastMessage } from "../../../features/shared/types";

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onDismiss, 2800);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

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
        className="mx-auto flex items-center gap-2.5 rounded-xl px-4 py-3 shadow-lg"
        style={{ background: toast.type === "error" ? "#B23A3A" : C.navy, maxWidth: 380 }}
        role={toast.type === "error" ? "alert" : "status"}
      >
        {toast.type === "error" ? (
          <AlertTriangle size={16} color="white" className="shrink-0" />
        ) : (
          <Check size={16} color="white" className="shrink-0" />
        )}
        <span className="flex-1 text-sm font-medium text-white">{toast.message}</span>
        <button onClick={onDismiss} className="shrink-0" aria-label="Dismiss">
          <X size={14} color="white" style={{ opacity: 0.7 }} />
        </button>
      </div>
    </div>
  );
}
