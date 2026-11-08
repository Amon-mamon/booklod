"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { C } from "../../../app/components/theme";
import { Pill } from "../../../app/components/ui/Pill";
import { READING } from "../../shared/shared";
import { loadSharedShelf } from "../data/profile-repository";
import { getErrorMessage } from "../../shared/types";
import type { BookFormat, ReadingStatus } from "../../shared/types";
import type { ModalProps } from "./modal-types";



export interface SharedShelf {
  ownerName: string;
  books: Array<{
    title: string;
    author?: string;
    format?: BookFormat;
    readingStatus?: ReadingStatus;
  }>;
}


function isSharedShelf(value: unknown): value is SharedShelf {
  if (
    typeof value !== "object" ||
    value === null ||
    !("ownerName" in value) ||
    typeof value.ownerName !== "string" ||
    !("books" in value) ||
    !Array.isArray(value.books)
  ) {
    return false;
  }

  const formats: readonly BookFormat[] = ["Physical", "E-book", "Kindle"];
  const statuses: readonly ReadingStatus[] = ["toread", "reading", "done"];
  return value.books.every((book: unknown) => {
    if (
      typeof book !== "object" ||
      book === null ||
      !("title" in book) ||
      typeof book.title !== "string"
    ) {
      return false;
    }

    return (
      (!("author" in book) || typeof book.author === "string") &&
      (!("format" in book) ||
        typeof book.format === "string" &&
          formats.some((format) => format === book.format)) &&
      (!("readingStatus" in book) ||
        typeof book.readingStatus === "string" &&
          statuses.some((status) => status === book.readingStatus))
    );
  });
}



export function ViewSharedShelfModal({ onClose }: ModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shelf, setShelf] = useState<SharedShelf | null>(null);

  async function handleLookup() {
    const clean = code.trim().toUpperCase();
    if (!clean) return;
    setLoading(true);
    setError("");
    setShelf(null);
    try {
      const result = await loadSharedShelf(clean);
      if (isSharedShelf(result)) setShelf(result);
      else if (result) setError("The shared shelf response was invalid.");
      else setError("No shared shelf found for this code — check it and try again.");
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Unable to load that shared shelf."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(27,42,58,0.45)" }}
      onClick={onClose}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-semibold mb-1" style={{ color: C.navy }}>View a Shared Shelf</h3>
        <p className="text-xs mb-3" style={{ color: C.muted }}>
          Enter the code someone shared with you from their Booklod Plus account.
        </p>
        <div className="flex gap-2 mb-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="32-character shelf code"
            maxLength={32}
            className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none tracking-widest text-center font-semibold"
            style={{ borderColor: C.tan, color: C.navy }}
          />
          <button
            onClick={handleLookup}
            disabled={loading || !code.trim()}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: C.orange }}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : "View"}
          </button>
        </div>
        {error && <p className="text-xs mb-2" style={{ color: "#B23A3A" }}>{error}</p>}

        {shelf && (
          <div className="overflow-y-auto flex-1 -mx-1 px-1">
            <p className="text-xs font-medium mb-2" style={{ color: C.muted }}>
              {shelf.ownerName}&apos;s shelf · {shelf.books.length} books
            </p>
            <div className="space-y-2">
              {shelf.books.map((b, i) => {
                const reading = READING[b.readingStatus || "toread"];
                return (
                  <div key={i} className="rounded-lg px-3 py-2" style={{ background: C.cream }}>
                    <p className="text-sm font-medium" style={{ color: C.navy }}>{b.title}</p>
                    {b.author && <p className="text-xs" style={{ color: C.muted }}>{b.author}</p>}
                    <Pill color={reading.tint} textColor={reading.color} style={{ marginTop: 4 }}>
                      {reading.label}
                    </Pill>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button onClick={onClose} className="w-full rounded-xl py-2.5 text-sm font-semibold text-white mt-4" style={{ background: C.navy }}>
          Close
        </button>
      </div>
    </div>
  );
}
