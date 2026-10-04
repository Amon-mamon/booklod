import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";
import { Wordmark } from "@/components/ui/wordmark";
import { colors } from "@/config/brand";
import { BookCard } from "@/features/books/components/book-card";
import { Digest } from "@/features/digest/components/digest";
import { SAMPLE_BOOKS, SAMPLE_YEAR } from "../data/sample-books";

function PreviewFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-3xl overflow-hidden mx-auto w-full max-w-[340px] shadow-lg"
      style={{ border: `1px solid ${colors.tan}`, background: colors.cream }}
    >
      <div className="flex gap-1.5 px-4 pt-3.5 pb-1">
        <span className="w-2 h-2 rounded-full" style={{ background: colors.tan }} />
        <span className="w-2 h-2 rounded-full" style={{ background: colors.tan }} />
        <span className="w-2 h-2 rounded-full" style={{ background: colors.tan }} />
      </div>
      <div className="px-3.5 pb-4 pt-1">{children}</div>
    </div>
  );
}

function PreviewHeader() {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-1.5">
        <LogoMark size={20} />
        <span className="text-sm font-bold" style={{ color: colors.navy }}>
          <Wordmark />
        </span>
      </div>
      <span
        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
        style={{ background: colors.orange }}
      >
        <Plus size={11} /> Add Book
      </span>
    </div>
  );
}

export function LibraryPreview() {
  return (
    <PreviewFrame>
      <PreviewHeader />
      <div className="space-y-2">
        {SAMPLE_BOOKS.slice(0, 4).map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>
    </PreviewFrame>
  );
}

export function DigestPreview() {
  return (
    <PreviewFrame>
      <PreviewHeader />
      <Digest books={SAMPLE_BOOKS} year={SAMPLE_YEAR} />
    </PreviewFrame>
  );
}
