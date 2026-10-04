"use client";

import { FieldLabel, TextArea, TextInput } from "@/components/ui/form-field";
import { colors } from "@/config/brand";
import { READING_ENTRIES } from "../../constants";
import type { BookFormState } from "../../hooks/use-book-form";

type ReadingSectionProps = Pick<
  BookFormState,
  "values" | "setField" | "handleReadingStatusChange" | "dateWarning" | "pageWarning"
>;

export function ReadingSection({
  values,
  setField,
  handleReadingStatusChange,
  dateWarning,
  pageWarning,
}: ReadingSectionProps) {
  const { readingStatus } = values;
  return (
    <div className="mb-4">
      <FieldLabel>Reading Status</FieldLabel>
      <div className="flex gap-2 mb-3">
        {READING_ENTRIES.map(([key, r]) => {
          const active = readingStatus === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleReadingStatusChange(key)}
              className="flex-1 rounded-xl border py-2 text-sm font-medium transition"
              style={{
                borderColor: active ? r.color : colors.tan,
                background: active ? r.color : "white",
                color: active ? "white" : colors.navy,
              }}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {(readingStatus === "reading" || readingStatus === "done") && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <FieldLabel optional>Start Date</FieldLabel>
            <TextInput type="date" value={values.startDate} onChange={(e) => setField("startDate", e.target.value)} />
          </div>
          {readingStatus === "done" && (
            <div>
              <FieldLabel optional>End Date</FieldLabel>
              <TextInput type="date" value={values.endDate} onChange={(e) => setField("endDate", e.target.value)} />
            </div>
          )}
        </div>
      )}
      {dateWarning && (
        <p className="text-xs mb-3 text-amber-600">
          End date is before start date — that&apos;s okay if you&apos;re backfilling from memory.
        </p>
      )}

      {readingStatus === "reading" && (
        <div className="mb-1">
          <FieldLabel optional>Last Page Read</FieldLabel>
          <TextInput
            type="number"
            min="0"
            placeholder="e.g. 142"
            value={values.lastPageRead}
            onChange={(e) => setField("lastPageRead", e.target.value)}
          />
          {pageWarning && (
            <p className="text-xs mt-1 text-amber-600">
              That&apos;s past this edition&apos;s page count ({values.pageCount}) — saved anyway.
            </p>
          )}
        </div>
      )}

      {readingStatus === "done" && (
        <div className="mt-3">
          <FieldLabel optional>Review</FieldLabel>
          <TextArea
            rows={3}
            placeholder="What did you think? (emoji welcome ✨)"
            value={values.review}
            onChange={(e) => setField("review", e.target.value)}
            maxLength={4000}
          />
        </div>
      )}
    </div>
  );
}
