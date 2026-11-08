"use client";
import { BarChart2 } from "lucide-react";
import { C } from "../../../app/components/theme";
import { fmtDate } from "../../shared/shared";
import { MonthlyBarChart } from "./MonthlyBarChart";
import type { BookRecord } from "../../shared/types";
import type { LucideIcon } from "lucide-react";



// ---------------------------------------------------------------------------
// Digest
// ---------------------------------------------------------------------------
export function Digest({ books }: { books: BookRecord[] }) {
  const year = new Date().getFullYear();
  const finishedThisYear = books
    .filter((b) => b.readingStatus === "done" && b.endDate && new Date(b.endDate).getFullYear() === year)
    .sort((a, b) => (b.endDate ?? "").localeCompare(a.endDate ?? ""));
  const reading = books.filter((b) => b.readingStatus === "reading");
  const toRead = books.filter((b) => b.readingStatus === "toread");
  const lentOut = books.filter((b) => b.format === "Physical" && b.ownershipStatus === "lent");

  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const finishedMonthCounts = Array<number>(12).fill(0);
  finishedThisYear.forEach((book) => {
    if (!book.endDate) return;
    finishedMonthCounts[new Date(book.endDate).getMonth()]++;
  });
  const readingMonthCounts = Array<number>(12).fill(0);
  books.forEach((b) => {
    if (b.readingStatus === "reading" && b.startDate && new Date(b.startDate).getFullYear() === year) {
      readingMonthCounts[new Date(b.startDate).getMonth()]++;
    }
  });

  return (
    <div className="max-w-xl mx-auto pb-10">
      <h2 className="text-xl font-semibold mb-1" style={{ color: C.navy }}>
        {year} Reading Digest
      </h2>
      <p className="text-sm mb-5" style={{ color: C.muted }}>
        Your year in books, at a glance.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard number={finishedThisYear.length} label="Finished" color={C.orange} tint={C.orangeT} />
        <StatCard number={reading.length} label="Reading" color={C.green} tint={C.greenT} />
        <StatCard number={toRead.length} label="To Read" color={C.navy} tint={C.navyT} />
        <StatCard number={lentOut.length} label="Lent Out" color={C.navy} tint="white" bordered />
      </div>

      <div className="rounded-2xl bg-white p-4 mb-6" style={{ border: `1px solid ${C.tan}` }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold" style={{ color: C.navy }}>Books by Month</p>
          <div className="flex items-center gap-3 text-xs" style={{ color: C.navy }}>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: C.orange }} /> Finished
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: C.green }} /> Reading
            </span>
          </div>
        </div>
        <MonthlyBarChart
          monthLabels={monthLabels}
          finishedCounts={finishedMonthCounts}
          readingCounts={readingMonthCounts}
        />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#9A958D" }}>
        Finished this year
      </p>
      {finishedThisYear.length === 0 ? (
        <EmptyState
          icon={BarChart2}
          title="Nothing finished yet this year"
          subtitle="Mark a book Done Reading and it'll show up here."
        />
      ) : (
        <div className="space-y-2">
          {finishedThisYear.map((b) => (
            <div
              key={b.id}
              className="rounded-xl bg-white px-3.5 py-2.5 flex items-center justify-between"
              style={{ border: `1px solid ${C.tan}` }}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: C.navy }}>{b.title}</p>
                {b.author && <p className="text-xs truncate" style={{ color: "#8A8580" }}>{b.author}</p>}
              </div>
              <span className="text-xs flex-shrink-0 ml-2" style={{ color: "#9A958D" }}>{fmtDate(b.endDate)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


interface StatCardProps {
  number: number | string;
  label: string;
  color: string;
  tint: string;
  bordered?: boolean;
}

export function StatCard({ number, label, color, tint, bordered }: StatCardProps) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: tint, border: bordered ? `1px solid ${C.tan}` : "none" }}
    >
      <p className="text-xs font-medium mb-1" style={{ color }}>{label}</p>
      <p className="text-2xl font-semibold" style={{ color: C.navy }}>{number}</p>
    </div>
  );
}


interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon: Icon, title, subtitle }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed py-10 px-6 text-center" style={{ borderColor: C.tan }}>
      <div
        className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
        style={{ background: C.cream }}
      >
        <Icon size={20} style={{ color: C.green }} />
      </div>
      <p className="text-sm font-medium" style={{ color: C.navy }}>{title}</p>
      {subtitle && <p className="text-xs mt-1" style={{ color: "#9A958D" }}>{subtitle}</p>}
    </div>
  );
}
