"use client";
import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { C } from "../../../app/components/theme";
import { getErrorMessage } from "../../shared/types";
import type { ConfirmActionModalProps } from "./modal-types";




export function DeleteAccountModal({ onClose, onConfirm }: ConfirmActionModalProps) {
  const [step, setStep] = useState(1);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const canDelete = confirmText.trim().toUpperCase() === "DELETE";

  async function handleFinalDelete() {
    setDeleting(true);
    setDeleteError("");
    try {
      await onConfirm();
    } catch (error: unknown) {
      setDeleteError(getErrorMessage(error, "Unable to delete your Booklod data."));
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(27,42,58,0.45)" }}
      onClick={deleting ? undefined : onClose}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ background: "#FDECEC" }}>
          <AlertTriangle size={18} style={{ color: "#B23A3A" }} />
        </div>
        {step === 1 ? (
          <>
            <h3 className="text-base font-semibold mb-2" style={{ color: C.navy }}>
              Delete your Booklod data?
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: C.muted }}>
              This permanently deletes your Booklod profile, library, and shared shelves. This action cannot be undone.
            </p>
            <p className="text-xs mt-3" style={{ color: C.muted }}>
              Your Supabase sign-in account is not deleted. You can sign in again later with an empty library.
            </p>
            <div className="flex gap-2 mt-5">
              <button onClick={onClose} className="flex-1 rounded-xl border py-2.5 text-sm font-medium" style={{ borderColor: C.tan, color: C.navy }}>
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white"
                style={{ background: "#B23A3A" }}
              >
                Delete My Data
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-base font-semibold mb-2" style={{ color: C.navy }}>
              Confirm permanent deletion
            </h3>
            <p className="text-sm leading-relaxed mb-3" style={{ color: C.muted }}>
              Type DELETE below to permanently erase your Booklod data.
            </p>
            <input
              autoFocus
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none tracking-wide"
              style={{ borderColor: C.tan, color: C.navy }}
            />
            {deleteError && (
              <p role="alert" className="mt-2 text-xs" style={{ color: "#B23A3A" }}>
                {deleteError}
              </p>
            )}
            <div className="flex gap-2 mt-5">
              <button
                onClick={onClose}
                disabled={deleting}
                className="flex-1 rounded-xl border py-2.5 text-sm font-medium disabled:opacity-50"
                style={{ borderColor: C.tan, color: C.navy }}
              >
                Cancel
              </button>
              <button
                onClick={handleFinalDelete}
                disabled={!canDelete || deleting}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-1.5"
                style={{ background: "#B23A3A" }}
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                Permanently Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
