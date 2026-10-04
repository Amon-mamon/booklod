"use client";

import { Trash2 } from "lucide-react";
import { colors } from "@/config/brand";

interface FormActionBarProps {
  onCancel: () => void;
  onSave: () => void;
  /** Provide to show the delete button (edit mode only). */
  onDelete?: () => void;
  saveDisabled?: boolean;
}

export function FormActionBar({ onCancel, onSave, onDelete, saveDisabled }: FormActionBarProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t px-4 py-3 flex gap-3 max-w-xl mx-auto"
      style={{ borderColor: colors.tan }}
    >
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete book"
          className="p-2.5 rounded-xl border flex items-center justify-center"
          style={{ borderColor: colors.error, color: colors.error }}
        >
          <Trash2 size={18} />
        </button>
      )}
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 rounded-xl border py-2.5 text-sm font-medium"
        style={{ borderColor: colors.tan, color: colors.navy }}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={saveDisabled}
        className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        style={{ background: colors.orange }}
      >
        Save Book
      </button>
    </div>
  );
}
