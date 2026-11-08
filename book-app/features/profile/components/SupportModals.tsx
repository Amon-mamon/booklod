"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import { C } from "../../../app/components/theme";
import { ModalProps } from "./modal-types";




export function FeedbackModal({ onClose }: ModalProps) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(27,42,58,0.45)" }}
      onClick={onClose}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
        {sent ? (
          <div className="text-center py-4">
            <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: C.greenT }}>
              <Check size={18} style={{ color: C.green }} />
            </div>
            <p className="text-sm font-medium" style={{ color: C.navy }}>Thanks for the feedback!</p>
            <button onClick={onClose} className="mt-4 text-sm font-semibold" style={{ color: C.green }}>Close</button>
          </div>
        ) : (
          <>
            <h3 className="text-base font-semibold mb-1" style={{ color: C.navy }}>Suggestions & Feedback</h3>
            <p className="text-xs mb-3" style={{ color: C.muted }}>
              Tell us what&apos;s working, what&apos;s not, or what you&apos;d like to see.
            </p>
            <textarea
              rows={4}
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your feedback..."
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
              style={{ borderColor: C.tan, color: C.navy }}
              maxLength={2000}
            />
            <p className="text-[11px] mt-1.5" style={{ color: "#B0AA9C" }}>
              This preview doesn&apos;t send feedback anywhere yet — this is a placeholder for where it would go.
            </p>
            <div className="flex gap-2 mt-4">
              <button onClick={onClose} className="flex-1 rounded-xl border py-2.5 text-sm font-medium" style={{ borderColor: C.tan, color: C.navy }}>
                Cancel
              </button>
              <button
                onClick={() => text.trim() && setSent(true)}
                disabled={!text.trim()}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: C.orange }}
              >
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}



export function HelpModal({ onClose, supportEmail = "" }: ModalProps & { supportEmail?: string }) {
  const items = [
    { title: "Adding a book", body: "Tap Add Book, search by title, and select a match — or enter details manually." },
    { title: "Tracking what you own", body: "Set a book's ownership to Have It, Lent Out, Given Away, or No Longer Have It from its detail page." },
    { title: "Your reading digest", body: "The Digest tab shows what you've finished, what's in progress, and a month-by-month view." },
  ];
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(27,42,58,0.45)" }}
      onClick={onClose}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-semibold mb-3" style={{ color: C.navy }}>Help & Support</h3>
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.title}>
              <p className="text-sm font-medium" style={{ color: C.navy }}>{it.title}</p>
              <p className="text-xs mt-0.5" style={{ color: C.muted }}>{it.body}</p>
            </div>
          ))}
          {supportEmail && (
            <div>
              <p className="text-sm font-medium" style={{ color: C.navy }}>Still stuck?</p>
              <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                Email us at{" "}
                <a href={`mailto:${supportEmail}`} className="underline" style={{ color: C.green }}>
                  {supportEmail}
                </a>
              </p>
            </div>
          )}
        </div>
        <button onClick={onClose} className="w-full rounded-xl py-2.5 text-sm font-semibold text-white mt-5" style={{ background: C.navy }}>
          Close
        </button>
      </div>
    </div>
  );
}
