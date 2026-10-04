"use client";

import { ArrowLeft } from "lucide-react";
import { FieldLabel, TextArea, TextInput } from "@/components/ui/form-field";
import { colors } from "@/config/brand";
import { useBookForm } from "../../hooks/use-book-form";
import type { Book } from "../../types";
import { CoverUpload } from "./cover-upload";
import { DuplicateBanner } from "./duplicate-banner";
import { EditionDetails } from "./edition-details";
import { EditionPicker } from "./edition-picker";
import { FormActionBar } from "./form-action-bar";
import { FormatPicker } from "./format-picker";
import { OwnershipPicker } from "./ownership-picker";
import { ReadingSection } from "./reading-section";
import { TitleSearchField } from "./title-search-field";

interface BookFormProps {
  /** Present when editing an existing book. */
  initial?: Book | null;
  existingBooks: Book[];
  onCancel: () => void;
  onSave: (book: Book) => void;
  /** Provide (with `initial`) to show the delete button. */
  onDelete?: (id: string) => void;
  onViewDuplicate?: (book: Book) => void;
}

/**
 * Add / Edit book form. State and side effects live in `useBookForm`;
 * this component only composes the sections.
 */
export function BookForm({ initial, existingBooks, onCancel, onSave, onDelete, onViewDuplicate }: BookFormProps) {
  const form = useBookForm({ initial, existingBooks, onSave });
  const { values, setField, search, editions } = form;

  return (
    <div className="max-w-xl mx-auto pb-28">
      <div className="flex items-center gap-3 mb-5">
        <button
          type="button"
          onClick={onCancel}
          aria-label="Back"
          className="p-2 rounded-full hover:bg-black/5 transition"
          style={{ color: colors.navy }}
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-semibold" style={{ color: colors.navy }}>
          {form.isEdit ? "Edit Book" : "Add Book"}
        </h2>
      </div>

      <TitleSearchField
        value={values.title}
        onChange={form.handleTitleChange}
        hasError={form.titleError}
        searchState={search.searchState}
        suggestions={search.suggestions}
        isOpen={search.isOpen}
        onFocus={search.open}
        onSelect={form.applySuggestion}
        onDismiss={search.close}
      />

      {values.subtitle && (
        <p className="text-xs -mt-3 mb-4" style={{ color: colors.muted }}>{values.subtitle}</p>
      )}

      {form.duplicate && <DuplicateBanner book={form.duplicate} onView={onViewDuplicate} />}

      {(editions.loading || editions.options.length > 0) && (
        <EditionPicker options={editions.options} loading={editions.loading} onSelect={form.applyEdition} />
      )}

      <CoverUpload
        coverUrl={values.coverUrl}
        busy={form.busy}
        upload={form.coverUpload}
        onRemove={() => setField("coverUrl", "")}
      />

      <div className="mb-4">
        <FieldLabel optional>Author</FieldLabel>
        <TextInput
          placeholder="e.g. Erin Morgenstern"
          value={values.author}
          onChange={(e) => setField("author", e.target.value)}
        />
      </div>

      <FormatPicker value={values.format} onChange={(format) => setField("format", format)} />

      {values.format === "Physical" && (
        <OwnershipPicker
          status={values.ownershipStatus}
          detail={values.ownershipDetail}
          onStatusChange={(s) => setField("ownershipStatus", s)}
          onDetailChange={(d) => setField("ownershipDetail", d)}
        />
      )}

      <ReadingSection
        values={values}
        setField={setField}
        handleReadingStatusChange={form.handleReadingStatusChange}
        dateWarning={form.dateWarning}
        pageWarning={form.pageWarning}
      />

      <div className="mb-4">
        <FieldLabel optional>Notes</FieldLabel>
        <TextArea
          rows={2}
          placeholder="Anything you want to remember about this book"
          value={values.notes}
          onChange={(e) => setField("notes", e.target.value)}
          maxLength={4000}
        />
      </div>

      <EditionDetails values={values} setField={setField} />

      <FormActionBar
        onCancel={onCancel}
        onSave={form.submit}
        saveDisabled={form.busy}
        onDelete={initial && onDelete ? () => onDelete(initial.id) : undefined}
      />
    </div>
  );
}
