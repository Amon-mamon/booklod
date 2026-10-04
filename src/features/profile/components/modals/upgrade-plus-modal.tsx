"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";
import { Modal } from "@/components/ui/modal";
import { colors } from "@/config/brand";

const PLUS_FEATURES = [
  "Unlimited book slots",
  "Cover photos synced across devices",
  "Full digest history & export",
  "Share Your Shelf — invite-only, no public feed",
] as const;

const SIMULATED_LATENCY_MS = 500;

interface UpgradePlusModalProps {
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function UpgradePlusModal({ onClose, onConfirm }: UpgradePlusModalProps) {
  const [subscribing, setSubscribing] = useState(false);

  async function handleConfirm() {
    setSubscribing(true);
    await new Promise((r) => setTimeout(r, SIMULATED_LATENCY_MS));
    await onConfirm();
    setSubscribing(false);
    onClose();
  }

  return (
    <Modal onClose={subscribing ? undefined : onClose}>
      <div className="text-center mb-4">
        <LogoMark size={36} />
        <h3 className="text-lg font-bold mt-2" style={{ color: colors.navy }}>Booklod Plus</h3>
        <p className="text-xs mt-1" style={{ color: colors.muted }}>₱99/month · billed monthly</p>
      </div>
      <ul className="space-y-2 mb-5">
        {PLUS_FEATURES.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm" style={{ color: colors.navy }}>
            <Check size={15} style={{ color: colors.green, marginTop: 2, flexShrink: 0 }} />
            {f}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={subscribing}
        className="w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ background: colors.orange }}
      >
        {subscribing && <Loader2 size={15} className="animate-spin" />}
        Simulate Subscribe
      </button>
      <button
        type="button"
        onClick={onClose}
        disabled={subscribing}
        className="w-full py-2.5 text-sm font-medium mt-1"
        style={{ color: colors.muted }}
      >
        Not now
      </button>
      <p className="text-[11px] text-center mt-2" style={{ color: colors.faint }}>
        Demo only — this preview doesn&apos;t process real payments. Subscribing here just simulates the Plus plan.
      </p>
    </Modal>
  );
}
