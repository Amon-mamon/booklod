"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { colors } from "@/config/brand";

export function FeedbackModal({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <Modal onClose={onClose}>
      {sent ? (
        <div className="text-center py-4">
          <div
            className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center"
            style={{ background: colors.greenT }}
          >
            <Check size={18} style={{ color: colors.green }} />
          </div>
          <p className="text-sm font-medium" style={{ color: colors.navy }}>Thanks for the feedback!</p>
          <button type="button" onClick={onClose} className="mt-4 text-sm font-semibold" style={{ color: colors.green }}>
            Close
          </button>
        </div>
      ) : (
        <>
          <h3 className="text-base font-semibold mb-1" style={{ color: colors.navy }}>Suggestions &amp; Feedback</h3>
          <p className="text-xs mb-3" style={{ color: colors.muted }}>
            Tell us what&apos;s working, what&apos;s not, or what you&apos;d like to see.
          </p>
          <textarea
            rows={4}
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your feedback..."
            aria-label="Your feedback"
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
            style={{ borderColor: colors.tan, color: colors.navy }}
            maxLength={2000}
          />
          {/* TODO: send to a real endpoint (e.g. POST /api/feedback). */}
          <p className="text-[11px] mt-1.5" style={{ color: colors.faint }}>
            This preview doesn&apos;t send feedback anywhere yet — this is a placeholder for where it would go.
          </p>
          <div className="flex gap-2 mt-4">
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
              onClick={() => text.trim() && setSent(true)}
              disabled={!text.trim()}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: colors.orange }}
            >
              Submit
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
