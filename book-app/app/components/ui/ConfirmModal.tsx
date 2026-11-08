"use client";

import { AlertTriangle } from "lucide-react";
import { C } from "../theme";

interface ConfirmModalProps {
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      style={{ background: "rgba(27,42,58,0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5"
        onClick={(event) => event.stopPropagation()}
      >
        {danger && (
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FDECEC]">
            <AlertTriangle size={18} style={{ color: "#B23A3A" }} />
          </div>
        )}
        <h3 className="mb-2 text-base font-semibold" style={{ color: C.navy }}>
          {title}
        </h3>
        {body && (
          <p className="text-sm leading-relaxed" style={{ color: C.muted }}>
            {body}
          </p>
        )}
        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border py-2.5 text-sm font-medium"
            style={{ borderColor: C.tan, color: C.navy }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white"
            style={{ background: danger ? "#B23A3A" : C.orange }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
