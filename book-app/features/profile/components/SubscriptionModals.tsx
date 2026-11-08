"use client";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { C } from "../../../app/components/theme";
import { LogoMark } from "../../../app/components/ui/LogoMark";
import type { ConfirmActionModalProps } from "./modal-types";
import { formatPrice, intervalLabel, type PublicPlan } from "../data/profile-repository";

const DEFAULT_PLUS_FEATURES = [
  "Unlimited book slots",
  "Cover photos synced across devices",
  "Full digest history & export",
  "Share Your Shelf — invite-only, no public feed",
];




// ---------------------------------------------------------------------------
// Profile / Settings
// ---------------------------------------------------------------------------
export function UpgradePlusModal({ onClose, onConfirm, plan }: ConfirmActionModalProps & { plan?: PublicPlan }) {
  const priceLine = plan
    ? `${formatPrice(plan)}${plan.billingInterval === "one_time" ? " one-time" : intervalLabel(plan.billingInterval)}`
    : "₱99/month · billed monthly";
  const features = plan?.features.length ? plan.features : DEFAULT_PLUS_FEATURES;
  const [subscribing, setSubscribing] = useState(false);
  async function handleConfirm() {
    setSubscribing(true);
    await new Promise((r) => setTimeout(r, 500));
    await onConfirm();
    setSubscribing(false);
    onClose();
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(27,42,58,0.45)" }}
      onClick={subscribing ? undefined : onClose}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-4">
          <LogoMark size={36} />
          <h3 className="text-lg font-bold mt-2" style={{ color: C.navy }}>{plan?.name || "Booklod Plus"}</h3>
          <p className="text-xs mt-1" style={{ color: C.muted }}>{priceLine}</p>
        </div>
        <ul className="space-y-2 mb-5">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm" style={{ color: C.navy }}>
              <Check size={15} style={{ color: C.green, marginTop: 2, flexShrink: 0 }} />
              {f}
            </li>
          ))}
        </ul>
        <button
          onClick={handleConfirm}
          disabled={subscribing}
          className="w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: C.orange }}
        >
          {subscribing && <Loader2 size={15} className="animate-spin" />}
          Simulate Subscribe
        </button>
        <button onClick={onClose} disabled={subscribing} className="w-full py-2.5 text-sm font-medium mt-1" style={{ color: C.muted }}>
          Not now
        </button>
        <p className="text-[11px] text-center mt-2" style={{ color: "#B0AA9C" }}>
          Demo only — this preview doesn&apos;t process real payments. Subscribing here just simulates the Plus plan.
        </p>
      </div>
    </div>
  );
}



export function CancelPlusModal({ onClose, onConfirm }: ConfirmActionModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(27,42,58,0.45)" }}
      onClick={onClose}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-semibold mb-2" style={{ color: C.navy }}>Cancel Booklod Plus?</h3>
        <p className="text-sm leading-relaxed" style={{ color: C.muted }}>
          Your books, covers, and notes stay exactly as they are — nothing is deleted. You&apos;ll drop
          back to your Starter plan (20 slots) and lose cross-device cover syncing and shelf
          sharing going forward.
        </p>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 rounded-xl border py-2.5 text-sm font-medium" style={{ borderColor: C.tan, color: C.navy }}>
            Keep Plus
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white"
            style={{ background: "#B23A3A" }}
          >
            Cancel Plan
          </button>
        </div>
      </div>
    </div>
  );
}
