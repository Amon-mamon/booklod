"use client";
import { Plus, Search, Book, Clock, BarChart2 } from "lucide-react";
import { C } from "../../../app/components/theme";
import { LogoMark } from "../../../app/components/ui/LogoMark";
import { BookCard } from "../../library/components/BookCard";
import { Digest } from "../../library/components/ReadingDigest";
import type { ReactNode } from "react";
import type { BookRecord } from "../../shared/types";



// ---------------------------------------------------------------------------
// Sample data + device-style frames reused for the public landing page
// ---------------------------------------------------------------------------
export const SAMPLE_BOOKS: BookRecord[] = [
  {
    id: "s1", title: "Atomic Habits", author: "James Clear", format: "Physical",

    ownershipStatus: "have", ownershipDetail: "Desk shelf", readingStatus: "reading",
    startDate: "2026-08-03", endDate: "", lastPageRead: 142, review: "", notes: "",
  },
  {
    id: "s2", title: "The Song of Achilles", author: "Madeline Miller", format: "Physical",
    ownershipStatus: "lent", ownershipDetail: "Kim", readingStatus: "done",
    startDate: "2026-06-01", endDate: "2026-06-12", lastPageRead: "", review: "", notes: "",
  },
  {
    id: "s3", title: "Educated", author: "Tara Westover", format: "Physical",
    ownershipStatus: "have", ownershipDetail: "Living room", readingStatus: "done",
    startDate: "2026-08-01", endDate: "2026-08-15", lastPageRead: "", review: "", notes: "",
  },
  {
    id: "s4", title: "Circe", author: "Madeline Miller", format: "Kindle",
    ownershipStatus: "", ownershipDetail: "", readingStatus: "done",
    startDate: "2026-07-20", endDate: "2026-07-30", lastPageRead: "", review: "", notes: "",
  },
  {
    id: "s5", title: "Project Hail Mary", author: "Andy Weir", format: "Physical",
    ownershipStatus: "have", ownershipDetail: "Nightstand", readingStatus: "toread",
    startDate: "", endDate: "", lastPageRead: "", review: "", notes: "",
  },
];


export function PreviewFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-3xl overflow-hidden mx-auto w-full max-w-[340px] shadow-lg"
      style={{ border: `1px solid ${C.tan}`, background: C.cream }}
    >
      <div className="flex gap-1.5 px-4 pt-3.5 pb-1">
        <span className="w-2 h-2 rounded-full" style={{ background: C.tan }} />
        <span className="w-2 h-2 rounded-full" style={{ background: C.tan }} />
        <span className="w-2 h-2 rounded-full" style={{ background: C.tan }} />
      </div>
      <div className="px-3.5 pb-4 pt-1">{children}</div>
    </div>
  );
}


export function PreviewHeader() {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-1.5">
        <LogoMark size={20} />
        <span className="text-sm font-bold" style={{ color: C.navy }}>
          Book<span style={{ color: C.green }}>l</span>
          <span style={{ color: C.orange }}>od</span>
        </span>
      </div>
      <span
        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
        style={{ background: C.orange }}
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
          <BookCard key={b.id} book={b} onClick={() => {}} />
        ))}
      </div>
    </PreviewFrame>
  );
}


export function DigestPreview() {
  return (
    <PreviewFrame>
      <PreviewHeader />
      <Digest books={SAMPLE_BOOKS} />
    </PreviewFrame>
  );
}


// ---------------------------------------------------------------------------
// Public landing page (logged-out entrance to the product)
// ---------------------------------------------------------------------------
export const BENEFITS = [
  { icon: Book, title: "Track Every Book", body: "Log books you've read, are reading, own, or want to read." },
  { icon: Search, title: "Know What You Own", body: "Check your personal collection before buying another copy." },
  { icon: Clock, title: "Remember Your Reading", body: "Keep a record of what you've read and where you left off." },
  { icon: BarChart2, title: "See Your Reading History", body: "Understand your reading year with simple stats and monthly insights." },
];
