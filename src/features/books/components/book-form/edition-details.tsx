"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FieldLabel, TextArea, TextInput } from "@/components/ui/form-field";
import { colors } from "@/config/brand";
import type { BookFormState } from "../../hooks/use-book-form";

type EditionDetailsProps = Pick<BookFormState, "values" | "setField">;

/** Collapsible "Edition details (optional)" section. */
export function EditionDetails({ values, setField }: EditionDetailsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-4 rounded-xl border" style={{ borderColor: colors.tan }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium"
        style={{ color: colors.navy }}
      >
        Edition details <span className="font-normal text-xs" style={{ color: colors.subtle }}>(optional)</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <div className="px-3 pb-3 grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <FieldLabel optional>Subtitle</FieldLabel>
            <TextInput value={values.subtitle} onChange={(e) => setField("subtitle", e.target.value)} />
          </div>
          <div>
            <FieldLabel optional>Publisher</FieldLabel>
            <TextInput value={values.publisher} onChange={(e) => setField("publisher", e.target.value)} />
          </div>
          <div>
            <FieldLabel optional>Edition</FieldLabel>
            <TextInput
              placeholder="e.g. 1st Edition, Revised Edition"
              value={values.edition}
              onChange={(e) => setField("edition", e.target.value)}
            />
          </div>
          <div>
            <FieldLabel optional>Binding / Format</FieldLabel>
            <TextInput
              placeholder="e.g. Paperback, Hardcover"
              value={values.editionFormat}
              onChange={(e) => setField("editionFormat", e.target.value)}
            />
          </div>
          <div>
            <FieldLabel optional>Publication Date</FieldLabel>
            <TextInput value={values.pubDate} onChange={(e) => setField("pubDate", e.target.value)} />
          </div>
          <div>
            <FieldLabel optional>ISBN-13</FieldLabel>
            <TextInput value={values.isbn13} onChange={(e) => setField("isbn13", e.target.value)} />
          </div>
          <div>
            <FieldLabel optional>ISBN-10</FieldLabel>
            <TextInput value={values.isbn10} onChange={(e) => setField("isbn10", e.target.value)} />
          </div>
          <div>
            <FieldLabel optional>Page Count</FieldLabel>
            <TextInput
              type="number"
              min="0"
              value={values.pageCount}
              onChange={(e) => setField("pageCount", e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <FieldLabel optional>Language</FieldLabel>
            <TextInput value={values.language} onChange={(e) => setField("language", e.target.value)} />
          </div>
          <div className="col-span-2">
            <FieldLabel optional>Description</FieldLabel>
            <TextArea
              rows={3}
              value={values.description}
              onChange={(e) => setField("description", e.target.value)}
              maxLength={4000}
            />
          </div>
        </div>
      )}
    </div>
  );
}
