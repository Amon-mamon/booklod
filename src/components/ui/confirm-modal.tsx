"use client";

import { AlertTriangle } from "lucide-react";
import { colors } from "@/config/brand";
import { Modal } from "./modal";

interface ConfirmModalProps {
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** Generic confirmation for destructive / negative-consequence actions. */
export function ConfirmModal({
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <Modal onClose={onClose}>
      {danger && (
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
          style={{ background: colors.dangerTint }}
        >
          <AlertTriangle size={18} style={{ color: colors.danger }} />
        </div>
      )}
      <h3 className="text-base font-semibold mb-2" style={{ color: colors.navy }}>{title}</h3>
      {body && <p className="text-sm leading-relaxed" style={{ color: colors.muted }}>{body}</p>}
      <div className="flex gap-2 mt-5">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl border py-2.5 text-sm font-medium"
          style={{ borderColor: colors.tan, color: colors.navy }}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white"
          style={{ background: danger ? colors.danger : colors.orange }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
