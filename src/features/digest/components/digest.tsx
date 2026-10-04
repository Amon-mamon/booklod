import { BarChart2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { colors } from "@/config/brand";
import { formatDate } from "@/lib/date";
import type { Book } from "@/features/books/types";
import { buildDigest, MONTH_LABELS } from "../lib/compute-digest";
import { MonthlyBarChart } from "./monthly-bar-chart";
import { StatCard } from "./stat-card";

interface DigestProps {
  books: Book[];
  /** Defaults to the current year. Marketing previews pin it so sample data stays visible. */
  year?: number;
}

/** Presentational reading digest — usable from server and client components. */
export function Digest({ books, year = new Date().getFullYear() }: DigestProps) {
  const digest = buildDigest(books, year);

  return (
    <div className="max-w-xl mx-auto pb-10">
      <h2 className="text-xl font-semibold mb-1" style={{ color: colors.navy }}>
        {year} Reading Digest
      </h2>
      <p className="text-sm mb-5" style={{ color: colors.muted }}>Your year in books, at a glance.</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard number={digest.finishedThisYear.length} label="Finished" color={colors.orange} tint={colors.orangeT} />
        <StatCard number={digest.reading.length} label="Reading" color={colors.green} tint={colors.greenT} />
        <StatCard number={digest.toRead.length} label="To Read" color={colors.navy} tint={colors.navyT} />
        <StatCard number={digest.lentOut.length} label="Lent Out" color={colors.navy} tint="white" bordered />
      </div>

      <div className="rounded-2xl bg-white p-4 mb-6" style={{ border: `1px solid ${colors.tan}` }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold" style={{ color: colors.navy }}>Books by Month</p>
          <div className="flex items-center gap-3 text-xs" style={{ color: colors.navy }}>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: colors.orange }} /> Finished
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: colors.green }} /> Reading
            </span>
          </div>
        </div>
        <MonthlyBarChart
          monthLabels={MONTH_LABELS}
          finishedCounts={digest.finishedByMonth}
          readingCounts={digest.readingByMonth}
        />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: colors.subtle }}>
        Finished this year
      </p>
      {digest.finishedThisYear.length === 0 ? (
        <EmptyState
          icon={BarChart2}
          title="Nothing finished yet this year"
          subtitle="Mark a book Done Reading and it'll show up here."
        />
      ) : (
        <div className="space-y-2">
          {digest.finishedThisYear.map((b) => (
            <div
              key={b.id}
              className="rounded-xl bg-white px-3.5 py-2.5 flex items-center justify-between"
              style={{ border: `1px solid ${colors.tan}` }}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: colors.navy }}>{b.title}</p>
                {b.author && <p className="text-xs truncate" style={{ color: "#8A8580" }}>{b.author}</p>}
              </div>
              <span className="text-xs flex-shrink-0 ml-2" style={{ color: colors.subtle }}>
                {formatDate(b.endDate)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
