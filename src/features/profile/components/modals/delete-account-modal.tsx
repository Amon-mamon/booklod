"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { colors } from "@/config/brand";
import type { SignInProvider } from "@/features/auth/types";

interface DeleteAccountModalProps {
  provider: SignInProvider;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

/** Two-step destructive confirmation: acknowledge, then type DELETE. */
export function DeleteAccountModal({ provider, onClose, onConfirm }: DeleteAccountModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const canDelete = confirmText.trim().toUpperCase() === "DELETE";

  async function handleFinalDelete() {
    setDeleting(true);
    await onConfirm();
  }

  return (
    <Modal onClose={deleting ? undefined : onClose}>
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
        style={{ background: colors.dangerTint }}
      >
        <AlertTriangle size={18} style={{ color: colors.danger }} />
      </div>
      {step === 1 ? (
        <>
          <h3 className="text-base font-semibold mb-2" style={{ color: colors.navy }}>
            Are you sure you want to delete your account?
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: colors.muted }}>
            This will permanently delete your Booklod account and all associated data, including your personal
            library, reading history, book records, and profile information. This action cannot be undone.
          </p>
          <p className="text-xs mt-3" style={{ color: colors.muted }}>
            This only removes your Booklod account — your {provider} account itself is not affected.
          </p>
          <div className="flex gap-2 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border py-2.5 text-sm font-medium"
              style={{ borderColor: colors.tan, color: colors.navy }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white"
              style={{ background: colors.danger }}
            >
              Delete My Account
            </button>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-base font-semibold mb-2" style={{ color: colors.navy }}>
            Confirm permanent deletion
          </h3>
          <p className="text-sm leading-relaxed mb-3" style={{ color: colors.muted }}>
            Type DELETE below to permanently erase your account and library data.
          </p>
          <input
            autoFocus
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            aria-label="Type DELETE to confirm"
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none tracking-wide"
            style={{ borderColor: colors.tan, color: colors.navy }}
          />
          <div className="flex gap-2 mt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="flex-1 rounded-xl border py-2.5 text-sm font-medium disabled:opacity-50"
              style={{ borderColor: colors.tan, color: colors.navy }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleFinalDelete}
              disabled={!canDelete || deleting}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-1.5"
              style={{ background: colors.danger }}
            >
              {deleting && <Loader2 size={14} className="animate-spin" />}
              Permanently Delete
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
