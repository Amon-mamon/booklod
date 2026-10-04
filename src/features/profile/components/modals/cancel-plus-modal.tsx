"use client";

import { Modal } from "@/components/ui/modal";
import { colors } from "@/config/brand";

interface CancelPlusModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export function CancelPlusModal({ onClose, onConfirm }: CancelPlusModalProps) {
  return (
    <Modal onClose={onClose}>
      <h3 className="text-base font-semibold mb-2" style={{ color: colors.navy }}>Cancel Booklod Plus?</h3>
      <p className="text-sm leading-relaxed" style={{ color: colors.muted }}>
        Your books, covers, and notes stay exactly as they are — nothing is deleted. You&apos;ll drop back to your
        Starter plan (20 slots) and lose cross-device cover syncing and shelf sharing going forward.
      </p>
      <div className="flex gap-2 mt-5">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl border py-2.5 text-sm font-medium"
          style={{ borderColor: colors.tan, color: colors.navy }}
        >
          Keep Plus
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white"
          style={{ background: colors.danger }}
        >
          Cancel Plan
        </button>
      </div>
    </Modal>
  );
}
