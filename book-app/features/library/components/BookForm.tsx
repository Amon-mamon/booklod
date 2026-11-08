"use client";
import { useState, useEffect, useRef } from "react";
import { Trash2, ArrowLeft, ChevronDown, ChevronUp, Loader2, Image as ImageIcon, Camera } from "lucide-react";
import { C } from "../../../app/components/theme";
import { compressImageFile, compressImageFromUrl, scoreBookDoc, splitIsbns, todayISO, uid } from "../../shared/shared";
import { FieldLabel } from "../../../app/components/ui/FieldLabel";
import { inputClass, inputStyle } from "../../../app/components/ui/formStyles";
import type { BookFormat, BookRecord, OwnershipStatus, ReadingStatus } from "../../shared/types";
import type { OpenLibrarySearchDoc } from "../../shared/shared";
import { BookLookupFields } from "./BookLookupFields";
import { BookStatusFields } from "./BookStatusFields";
import type { BookEdition, BookSearchState } from "../types";

interface BookFormProps {
  initial?: BookRecord | null;
  onCancel: () => void;
  onSave: (book: BookRecord) => Promise<void>;
  onDelete: (id: string) => void;
  existingBooks?: BookRecord[];
  onViewDuplicate: (book: BookRecord) => void;
  showToast: (message: string, type?: "success" | "error") => void;
}

// ---------------------------------------------------------------------------
// Book Form (Add / Edit)
// ---------------------------------------------------------------------------
export function BookForm({
  initial,
  onCancel,
  onSave,
  onDelete,
  existingBooks = [],
  onViewDuplicate,
  showToast,
}: BookFormProps) {
  const isEdit = !!initial;
  const [title, setTitle] = useState(initial?.title || "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle || "");
  const [author, setAuthor] = useState(initial?.author || "");
  const [format, setFormat] = useState<BookFormat>(initial?.format || "Physical");
  const [ownershipStatus, setOwnershipStatus] = useState<OwnershipStatus>(initial?.ownershipStatus || "have");
  const [ownershipDetail, setOwnershipDetail] = useState(initial?.ownershipDetail || "");
  const [readingStatus, setReadingStatus] = useState<ReadingStatus>(initial?.readingStatus || "toread");
  const [startDate, setStartDate] = useState(initial?.startDate || "");
  const [endDate, setEndDate] = useState(initial?.endDate || "");
  const [lastPageRead, setLastPageRead] = useState(initial?.lastPageRead ?? "");
  const [review, setReview] = useState(initial?.review || "");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [publisher, setPublisher] = useState(initial?.publisher || "");
  const [edition, setEdition] = useState(initial?.edition || "");
  const [editionFormat, setEditionFormat] = useState(initial?.editionFormat || "");
  const [pubDate, setPubDate] = useState(initial?.pubDate || "");
  const [isbn10, setIsbn10] = useState(initial?.isbn10 || (initial?.isbn && initial.isbn.length === 10 ? initial.isbn : "") || "");
  const [isbn13, setIsbn13] = useState(initial?.isbn13 || (initial?.isbn && initial.isbn.length === 13 ? initial.isbn : "") || "");
  const [pageCount, setPageCount] = useState(initial?.pageCount || "");
  const [language, setLanguage] = useState(initial?.language || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl || "");
  const [externalSource, setExternalSource] = useState(initial?.externalSource || "");
  const [externalId, setExternalId] = useState(initial?.externalId || "");
  const [showEdition, setShowEdition] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [suggestions, setSuggestions] = useState<OpenLibrarySearchDoc[]>([]);
  const [searchState, setSearchState] = useState<BookSearchState>("idle");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchSeq = useRef(0);
  const skipNextSearch = useRef<boolean>(false);

  const [editionOptions, setEditionOptions] = useState<BookEdition[]>([]);
  const [loadingEditions, setLoadingEditions] = useState(false);
  const [dupBook, setDupBook] = useState<BookRecord | null>(null);

  const prevReadingStatus = useRef(readingStatus);

  const SEARCH_MIN_CHARS = 5;

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    if (!title || title.trim().length < SEARCH_MIN_CHARS || isEdit) return;
    if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    const requestId = ++searchSeq.current;
    debounceRef.current = setTimeout(async () => {
      setSearchState("searching");
      setShowSuggestions(true);
      try {
        const fields = "key,title,subtitle,author_name,first_publish_year,publisher,isbn,cover_i,language,edition_count,number_of_pages_median";
        const res = await fetch(
          `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&fields=${fields}&limit=15`
        );
        if (!res.ok) throw new Error("search-failed");
        const data = (await res.json()) as { docs?: OpenLibrarySearchDoc[] };
        if (requestId !== searchSeq.current) return; // a newer search started
        const docs = (data.docs || []).filter((doc) => doc.title);
        const ranked = docs
          .map((d) => ({ doc: d, score: scoreBookDoc(d, title) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 6)
          .map((x) => x.doc);
        setSuggestions(ranked);
        setSearchState(ranked.length ? "results" : "empty");
      } catch {
        if (requestId !== searchSeq.current) return;
        setSuggestions([]);
        setSearchState("error");
      }
    }, 400);
    return () => {
      if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  function findDuplicate(source: string, id: string): BookRecord | null {
    if (!id) return null;
    return existingBooks.find((b) => b.externalSource === source && b.externalId === id && b.id !== initial?.id) || null;
  }

  async function applySuggestion(doc: OpenLibrarySearchDoc) {
    skipNextSearch.current = true;
    const { isbn10: i10, isbn13: i13 } = splitIsbns(doc.isbn);
    setTitle(doc.title || title);
    setSubtitle(doc.subtitle || "");
    setAuthor((doc.author_name && doc.author_name.join(", ")) || author);
    setPublisher((doc.publisher && doc.publisher[0]) || "");
    setPubDate(doc.first_publish_year ? String(doc.first_publish_year) : "");
    setIsbn10(i10);
    setIsbn13(i13);
    setPageCount(doc.number_of_pages_median ? String(doc.number_of_pages_median) : "");
    setLanguage((doc.language && doc.language[0]) || "");
    setEditionFormat("");
    setEdition("");
    const workKey = doc.key || "";
    setExternalSource(workKey ? "openlibrary" : "");
    setExternalId(workKey);
    setShowSuggestions(false);
    setSuggestions([]);
    setEditionOptions([]);

    setDupBook(findDuplicate("openlibrary", workKey));

    if (doc.cover_i) {
      const remoteUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
      setCoverUrl(remoteUrl);
      setCompressing(true);
      compressImageFromUrl(`https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`)
        .then((cached) => setCoverUrl(cached))
        .catch(() => {})
        .finally(() => setCompressing(false));
    } else {
      setCoverUrl("");
    }

    if (workKey) {
      setLoadingEditions(true);
      fetch(`https://openlibrary.org${workKey}/editions.json?limit=20`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { entries?: Array<Record<string, unknown>> } | null) => {
          if (!data || !data.entries) return;
          const seen = new Set();
          const opts = data.entries
            .filter((entry) => typeof entry.title === "string")
            .filter((entry) => {
              const publishers = Array.isArray(entry.publishers) ? entry.publishers : [];
              const key = `${entry.publish_date || ""}|${entry.physical_format || ""}|${publishers[0] || ""}`;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            })
            .slice(0, 8)
            .map((entry) => ({
              key: typeof entry.key === "string" ? entry.key : undefined,
              format: typeof entry.physical_format === "string" ? entry.physical_format : "",
              publisher: Array.isArray(entry.publishers) && typeof entry.publishers[0] === "string" ? entry.publishers[0] : "",
              publishDate: typeof entry.publish_date === "string" ? entry.publish_date : "",
              isbn10: Array.isArray(entry.isbn_10) && typeof entry.isbn_10[0] === "string" ? entry.isbn_10[0] : "",
              isbn13: Array.isArray(entry.isbn_13) && typeof entry.isbn_13[0] === "string" ? entry.isbn_13[0] : "",
              pageCount: typeof entry.number_of_pages === "number" || typeof entry.number_of_pages === "string" ? entry.number_of_pages : "",
            }));
          setEditionOptions(opts);
        })
        .catch(() => {})
        .finally(() => setLoadingEditions(false));
    }
  }

  function applyEdition(ed: BookEdition) {
    if (ed.publisher) setPublisher(ed.publisher);
    if (ed.publishDate) setPubDate(ed.publishDate);
    if (ed.isbn10) setIsbn10(ed.isbn10);
    if (ed.isbn13) setIsbn13(ed.isbn13);
    if (ed.pageCount) setPageCount(String(ed.pageCount));
    if (ed.format) setEditionFormat(ed.format);
  }

  async function handleCoverFile(file: File | null | undefined) {
    if (!file) return;
    setImageError("");
    setCompressing(true);
    try {
      const compressed = await compressImageFile(file);
      setCoverUrl(compressed);
      if (showToast) showToast("Cover photo added");
    } catch (error: unknown) {
      setImageError(
        error instanceof Error && error.message === "unsupported-type"
          ? "That file type isn't supported — try a JPG, PNG, or WEBP image."
          : "Couldn't process that image — please try another file."
      );
    }
    setCompressing(false);
  }

  function handleReadingStatusChange(next: ReadingStatus) {
    const prev = prevReadingStatus.current;
    if (next === "reading" && prev !== "reading" && !startDate) {
      setStartDate(todayISO());
    }
    if (next === "done" && prev !== "done" && !endDate) {
      setEndDate(todayISO());
      if (prev !== "reading" && !startDate) setStartDate(todayISO());
    }
    prevReadingStatus.current = next;
    setReadingStatus(next);
  }

  async function handleSave() {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    const book: BookRecord = {
      id: initial?.id || uid(),
      title: title.trim(),
      subtitle: subtitle.trim(),
      author: author.trim(),
      format,
      ownershipStatus: format === "Physical" ? ownershipStatus : "",
      ownershipDetail: format === "Physical" ? ownershipDetail.trim() : "",
      readingStatus,
      startDate,
      endDate,
      lastPageRead: lastPageRead === "" ? "" : Number(lastPageRead),
      review,
      notes,
      publisher: publisher.trim(),
      edition: edition.trim(),
      editionFormat: editionFormat.trim(),
      pubDate: pubDate.trim(),
      isbn10: isbn10.trim(),
      isbn13: isbn13.trim(),
      pageCount,
      language: language.trim(),
      description: description.trim(),
      coverUrl,
      externalSource: externalSource || "",
      externalId: externalId || "",
      createdAt: initial?.createdAt || Date.now(),
    };
    setSaving(true);
    await onSave(book);
    setSaving(false);
  }

  const dateWarning = Boolean(startDate && endDate && endDate < startDate);
  const pageWarning = Boolean(pageCount && lastPageRead && Number(lastPageRead) > Number(pageCount));

  return (
    <div className="max-w-xl mx-auto pb-28">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onCancel}
          className="p-2 rounded-full hover:bg-black/5 transition"
          style={{ color: C.navy }}
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-semibold" style={{ color: C.navy }}>
          {isEdit ? "Edit Book" : "Add Book"}
        </h2>
      </div>

      <BookLookupFields
        title={title}
        titleError={titleError}
        searchState={searchState}
        showSuggestions={showSuggestions}
        suggestions={suggestions}
        duplicateBook={dupBook}
        loadingEditions={loadingEditions}
        editionOptions={editionOptions}
        onTitleChange={(value) => {
          setTitle(value);
          setTitleError(false);
          setDupBook(null);
          if (value.trim().length < SEARCH_MIN_CHARS) {
            setSuggestions([]);
            setSearchState("idle");
            setShowSuggestions(false);
          }
        }}
        onTitleFocus={() => searchState !== "idle" && setShowSuggestions(true)}
        onDismissSuggestions={() => setShowSuggestions(false)}
        onApplySuggestion={applySuggestion}
        onViewDuplicate={onViewDuplicate}
        onApplyEdition={applyEdition}
      />

      {/* Cover image upload */}
      <div className="mb-4">
        <FieldLabel optional>Cover Image</FieldLabel>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files && e.target.files[0];
            handleCoverFile(file);
            e.target.value = "";
          }}
        />
        <div className="flex items-center gap-3">
          <div
            className="rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
            style={{ width: 64, height: 88, background: C.cream, border: `1px solid ${C.tan}` }}
          >
            {compressing ? (
              <Loader2 size={18} className="animate-spin" style={{ color: C.green }} />
            ) : coverUrl ? (
              <img src={coverUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon size={20} style={{ color: C.muted }} />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              disabled={compressing}
              className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium"
              style={{ borderColor: C.tan, color: C.navy }}
            >
              <Camera size={13} />
              {coverUrl ? "Replace photo" : "Upload photo"}
            </button>
            {coverUrl && (
              <button
                type="button"
                onClick={() => setCoverUrl("")}
                className="text-xs text-left"
                style={{ color: C.muted }}
              >
                Remove
              </button>
            )}
          </div>
        </div>
        {imageError && <p className="text-xs mt-1.5 text-red-500">{imageError}</p>}
        <p className="text-xs mt-1.5" style={{ color: C.muted }}>
          One photo per book — it&apos;s resized automatically to keep things fast.
        </p>
      </div>

      <div className="mb-4">
        <FieldLabel optional>Author</FieldLabel>
        <input
          className={inputClass}
          style={{ ...inputStyle }}
          placeholder="e.g. Erin Morgenstern"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
      </div>

      <BookStatusFields
        format={format}
        ownershipStatus={ownershipStatus}
        ownershipDetail={ownershipDetail}
        readingStatus={readingStatus}
        startDate={startDate}
        endDate={endDate}
        lastPageRead={lastPageRead}
        review={review}
        notes={notes}
        pageCount={pageCount}
        dateWarning={dateWarning}
        pageWarning={pageWarning}
        onFormatChange={setFormat}
        onOwnershipStatusChange={setOwnershipStatus}
        onOwnershipDetailChange={setOwnershipDetail}
        onReadingStatusChange={handleReadingStatusChange}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onLastPageReadChange={setLastPageRead}
        onReviewChange={setReview}
        onNotesChange={setNotes}
      />

      {/* Edition details */}
      <div className="mb-4 rounded-xl border" style={{ borderColor: C.tan }}>
        <button
          onClick={() => setShowEdition((s) => !s)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium"
          style={{ color: C.navy }}
        >
          Edition details <span className="font-normal text-xs" style={{ color: "#9A958D" }}>(optional)</span>
          {showEdition ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showEdition && (
          <div className="px-3 pb-3 grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <FieldLabel optional>Subtitle</FieldLabel>
              <input className={inputClass} style={{ ...inputStyle }} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            </div>
            <div>
              <FieldLabel optional>Publisher</FieldLabel>
              <input className={inputClass} style={{ ...inputStyle }} value={publisher} onChange={(e) => setPublisher(e.target.value)} />
            </div>
            <div>
              <FieldLabel optional>Edition</FieldLabel>
              <input
                className={inputClass}
                style={{ ...inputStyle }}
                placeholder="e.g. 1st Edition, Revised Edition"
                value={edition}
                onChange={(e) => setEdition(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel optional>Binding / Format</FieldLabel>
              <input
                className={inputClass}
                style={{ ...inputStyle }}
                placeholder="e.g. Paperback, Hardcover"
                value={editionFormat}
                onChange={(e) => setEditionFormat(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel optional>Publication Date</FieldLabel>
              <input className={inputClass} style={{ ...inputStyle }} value={pubDate} onChange={(e) => setPubDate(e.target.value)} />
            </div>
            <div>
              <FieldLabel optional>ISBN-13</FieldLabel>
              <input className={inputClass} style={{ ...inputStyle }} value={isbn13} onChange={(e) => setIsbn13(e.target.value)} />
            </div>
            <div>
              <FieldLabel optional>ISBN-10</FieldLabel>
              <input className={inputClass} style={{ ...inputStyle }} value={isbn10} onChange={(e) => setIsbn10(e.target.value)} />
            </div>
            <div>
              <FieldLabel optional>Page Count</FieldLabel>
              <input type="number" min="0" className={inputClass} style={{ ...inputStyle }} value={pageCount} onChange={(e) => setPageCount(e.target.value)} />
            </div>
            <div className="col-span-2">
              <FieldLabel optional>Language</FieldLabel>
              <input className={inputClass} style={{ ...inputStyle }} value={language} onChange={(e) => setLanguage(e.target.value)} />
            </div>
            <div className="col-span-2">
              <FieldLabel optional>Description</FieldLabel>
              <textarea
                className={inputClass}
                style={{ ...inputStyle }}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={4000}
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t px-4 py-3 flex gap-3 max-w-xl mx-auto" style={{ borderColor: C.tan }}>
        {isEdit && (
          <button
            onClick={() => onDelete(initial.id)}
            className="p-2.5 rounded-xl border flex items-center justify-center"
            style={{ borderColor: "#D64545", color: "#D64545" }}
          >
            <Trash2 size={18} />
          </button>
        )}
        <button
          onClick={onCancel}
          className="flex-1 rounded-xl border py-2.5 text-sm font-medium"
          style={{ borderColor: C.tan, color: C.navy }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={compressing || saving}
          className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: C.orange }}
        >
          {saving ? "Saving..." : "Save Book"}
        </button>
      </div>
    </div>
  );
}
