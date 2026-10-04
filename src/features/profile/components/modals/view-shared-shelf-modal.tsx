"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Pill } from "@/components/ui/pill";
import { colors } from "@/config/brand";
import { READING } from "@/features/books/constants";
import { isValidShareCode } from "@/features/sharing/lib/share-code";
import { loadSharedShelf } from "@/features/sharing/services/shared-shelf-client";
import type { SharedShelfSnapshot } from "@/features/sharing/types";

export function ViewSharedShelfModal({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shelf, setShelf] = useState<SharedShelfSnapshot | null>(null);

  async function handleLookup() {
    const clean = code.trim().toUpperCase();
    if (!clean) return;
    setLoading(true);
    setError("");
    setShelf(null);
    const result = isValidShareCode(clean) ? await loadSharedShelf(clean) : null;
    if (result) setShelf(result);
    else setError("No shared shelf found for this code — check it and try again.");
    setLoading(false);
  }

  return (
    <Modal onClose={onClose} className="max-h-[80vh] flex flex-col">
      <h3 className="text-base font-semibold mb-1" style={{ color: colors.navy }}>View a Shared Shelf</h3>
      <p className="text-xs mb-3" style={{ color: colors.muted }}>
        Enter the code someone shared with you from their Booklod Plus account.
      </p>
      <div className="flex gap-2 mb-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleLookup()}
          placeholder="e.g. K7P2QX"
          aria-label="Shelf code"
          maxLength={6}
          className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none tracking-widest text-center font-semibold"
          style={{ borderColor: colors.tan, color: colors.navy }}
        />
        <button
          type="button"
          onClick={handleLookup}
          disabled={loading || !code.trim()}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: colors.orange }}
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : "View"}
        </button>
      </div>
      {error && <p className="text-xs mb-2" style={{ color: colors.danger }}>{error}</p>}

      {shelf && (
        <div className="overflow-y-auto flex-1 -mx-1 px-1">
          <p className="text-xs font-medium mb-2" style={{ color: colors.muted }}>
            {shelf.ownerName}&apos;s shelf · {shelf.books.length} books
          </p>
          <div className="space-y-2">
            {shelf.books.map((b, i) => {
              const reading = READING[b.readingStatus] || READING.toread;
              return (
                <div key={i} className="rounded-lg px-3 py-2" style={{ background: colors.cream }}>
                  <p className="text-sm font-medium" style={{ color: colors.navy }}>{b.title}</p>
                  {b.author && <p className="text-xs" style={{ color: colors.muted }}>{b.author}</p>}
                  <Pill color={reading.tint} textColor={reading.color} style={{ marginTop: 4 }}>
                    {reading.label}
                  </Pill>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onClose}
        className="w-full rounded-xl py-2.5 text-sm font-semibold text-white mt-4"
        style={{ background: colors.navy }}
      >
        Close
      </button>
    </Modal>
  );
}
