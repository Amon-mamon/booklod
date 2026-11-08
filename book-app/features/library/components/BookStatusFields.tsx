"use client";

import { C } from "../../../app/components/theme";
import { FieldLabel } from "../../../app/components/ui/FieldLabel";
import { inputClass, inputStyle } from "../../../app/components/ui/formStyles";
import { FORMATS, OWNERSHIP, READING } from "../../shared/shared";
import type { BookFormat, OwnershipStatus, ReadingStatus } from "../../shared/types";

interface BookStatusFieldsProps {
  format: BookFormat;
  ownershipStatus: OwnershipStatus;
  ownershipDetail: string;
  readingStatus: ReadingStatus;
  startDate: string;
  endDate: string;
  lastPageRead: number | string;
  review: string;
  notes: string;
  pageCount: number | string;
  dateWarning: boolean;
  pageWarning: boolean;
  onFormatChange: (format: BookFormat) => void;
  onOwnershipStatusChange: (status: Exclude<OwnershipStatus, "">) => void;
  onOwnershipDetailChange: (value: string) => void;
  onReadingStatusChange: (status: ReadingStatus) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onLastPageReadChange: (value: string) => void;
  onReviewChange: (value: string) => void;
  onNotesChange: (value: string) => void;
}

export function BookStatusFields({
  format,
  ownershipStatus,
  ownershipDetail,
  readingStatus,
  startDate,
  endDate,
  lastPageRead,
  review,
  notes,
  pageCount,
  dateWarning,
  pageWarning,
  onFormatChange,
  onOwnershipStatusChange,
  onOwnershipDetailChange,
  onReadingStatusChange,
  onStartDateChange,
  onEndDateChange,
  onLastPageReadChange,
  onReviewChange,
  onNotesChange,
}: BookStatusFieldsProps) {
  const activeOwnership = OWNERSHIP[ownershipStatus || "have"];

  return (
    <>
      <div className="mb-4">
        <FieldLabel>Format</FieldLabel>
        <div className="flex gap-2">
          {(Object.entries(FORMATS) as Array<[BookFormat, (typeof FORMATS)[BookFormat]]>).map(
            ([key, item]) => {
              const Icon = item.icon;
              const active = format === key;
              return (
                <button
                  key={key}
                  onClick={() => onFormatChange(key)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border py-2 text-sm font-medium transition"
                  style={{
                    borderColor: active ? C.green : C.tan,
                    background: active ? C.green : "white",
                    color: active ? "white" : C.navy,
                  }}
                >
                  <Icon size={15} /> {item.label}
                </button>
              );
            },
          )}
        </div>
      </div>

      {format === "Physical" && (
        <div className="mb-4">
          <FieldLabel>Ownership Status</FieldLabel>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {(Object.entries(OWNERSHIP) as Array<
              [Exclude<OwnershipStatus, "">, (typeof OWNERSHIP)[Exclude<OwnershipStatus, "">]]
            >).map(([key, item]) => {
              const Icon = item.icon;
              const active = ownershipStatus === key;
              return (
                <button
                  key={key}
                  onClick={() => onOwnershipStatusChange(key)}
                  className="flex items-center gap-1.5 rounded-xl border py-2 px-2 text-sm font-medium transition"
                  style={{
                    borderColor: active ? item.color : C.tan,
                    background: active ? item.color : "white",
                    color: active ? "white" : C.navy,
                  }}
                >
                  <Icon size={14} /> {item.label}
                </button>
              );
            })}
          </div>
          <FieldLabel optional>{activeOwnership.field}</FieldLabel>
          <input
            className={inputClass}
            style={inputStyle}
            placeholder={activeOwnership.field}
            value={ownershipDetail}
            onChange={(event) => onOwnershipDetailChange(event.target.value)}
          />
        </div>
      )}

      <div className="mb-4">
        <FieldLabel>Reading Status</FieldLabel>
        <div className="flex gap-2 mb-3">
          {(Object.entries(READING) as Array<[ReadingStatus, (typeof READING)[ReadingStatus]]>).map(
            ([key, item]) => {
              const active = readingStatus === key;
              return (
                <button
                  key={key}
                  onClick={() => onReadingStatusChange(key)}
                  className="flex-1 rounded-xl border py-2 text-sm font-medium transition"
                  style={{
                    borderColor: active ? item.color : C.tan,
                    background: active ? item.color : "white",
                    color: active ? "white" : C.navy,
                  }}
                >
                  {item.label}
                </button>
              );
            },
          )}
        </div>

        {(readingStatus === "reading" || readingStatus === "done") && (
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <FieldLabel optional>Start Date</FieldLabel>
              <input
                type="date"
                className={inputClass}
                style={inputStyle}
                value={startDate}
                onChange={(event) => onStartDateChange(event.target.value)}
              />
            </div>
            {readingStatus === "done" && (
              <div>
                <FieldLabel optional>End Date</FieldLabel>
                <input
                  type="date"
                  className={inputClass}
                  style={inputStyle}
                  value={endDate}
                  onChange={(event) => onEndDateChange(event.target.value)}
                />
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
            <input
              type="number"
              min="0"
              className={inputClass}
              style={inputStyle}
              placeholder="e.g. 142"
              value={lastPageRead}
              onChange={(event) => onLastPageReadChange(event.target.value)}
            />
            {pageWarning && (
              <p className="text-xs mt-1 text-amber-600">
                That&apos;s past this edition&apos;s page count ({pageCount}) — saved anyway.
              </p>
            )}
          </div>
        )}

        {readingStatus === "done" && (
          <div className="mt-3">
            <FieldLabel optional>Review</FieldLabel>
            <textarea
              className={inputClass}
              style={inputStyle}
              rows={3}
              placeholder="What did you think? (emoji welcome ✨)"
              value={review}
              onChange={(event) => onReviewChange(event.target.value)}
              maxLength={4000}
            />
          </div>
        )}
      </div>

      <div className="mb-4">
        <FieldLabel optional>Notes</FieldLabel>
        <textarea
          className={inputClass}
          style={inputStyle}
          rows={2}
          placeholder="Anything you want to remember about this book"
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          maxLength={4000}
        />
      </div>
    </>
  );
}
