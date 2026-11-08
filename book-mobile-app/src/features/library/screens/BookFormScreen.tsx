import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { Camera, ChevronDown, ChevronUp, Image as ImageIcon, Trash2 } from "lucide-react-native";
import { booksApi } from "@/api/endpoints";
import { errorMessage } from "@/api/client";
import { BackHeader, Screen } from "@/components/layout/Screen";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Banner, Choice, FieldLabel, LoadingView } from "@/components/ui/primitives";
import { ConfirmSheet } from "@/components/ui/Sheet";
import { TextField } from "@/components/ui/TextField";
import { pickCompressedImage } from "@/lib/images";
import { useToast } from "@/providers/ToastProvider";
import { C, radius } from "@/theme";
import type { BookEdition, BookFormat, BookInput, BookRecord, BookSearchResult, ReadingStatus } from "@/types/booklod";
import { FORMATS, OWNERSHIP, READING, type OwnedStatus } from "@/utils/book-meta";
import { todayISO } from "@/utils/dates";
import { BookLookup } from "../components/BookLookup";
import { DateField } from "../components/DateField";
import { useBook, useDeleteBook, useLibrary, useSaveBook } from "../hooks/useLibrary";

type FormState = Required<Omit<BookInput, "isbn">>;

function initialState(book?: BookRecord, lend?: boolean): FormState {
  return {
    title: book?.title || "",
    subtitle: book?.subtitle || "",
    author: book?.author || "",
    format: book?.format || "Physical",
    ownershipStatus: lend ? "lent" : book?.ownershipStatus || "have",
    ownershipDetail: lend ? "" : book?.ownershipDetail || "",
    readingStatus: book?.readingStatus || "toread",
    startDate: book?.startDate || "",
    endDate: book?.endDate || "",
    lastPageRead: book?.lastPageRead ?? "",
    review: book?.review || "",
    notes: book?.notes || "",
    publisher: book?.publisher || "",
    edition: book?.edition || "",
    editionFormat: book?.editionFormat || "",
    pubDate: book?.pubDate || "",
    isbn10: book?.isbn10 || (book?.isbn?.length === 10 ? book.isbn : ""),
    isbn13: book?.isbn13 || (book?.isbn?.length === 13 ? book.isbn : ""),
    pageCount: book?.pageCount ?? "",
    language: book?.language || "",
    description: book?.description || "",
    coverUrl: book?.coverUrl || "",
    externalSource: book?.externalSource || "",
    externalId: book?.externalId || "",
  };
}

/** Route wrapper: waits for the book (edit) before mounting the form. */
export function BookFormScreen() {
  const { id, lend } = useLocalSearchParams<{ id?: string; lend?: string }>();
  const { book, isLoading } = useBook(id);
  if (id && isLoading) return <LoadingView />;
  if (id && !book) {
    return (
      <Screen>
        <BackHeader title="Edit Book" />
        <Banner message="This book couldn't be found. It may have been deleted on another device." />
      </Screen>
    );
  }
  return <BookForm key={book?.id || "new"} initial={book} lend={lend === "1"} />;
}

function BookForm({ initial, lend }: { initial?: BookRecord; lend: boolean }) {
  const isEdit = Boolean(initial);
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { data: library } = useLibrary();
  const saveBook = useSaveBook();
  const deleteBook = useDeleteBook();

  const [form, setForm] = useState<FormState>(() => initialState(initial, lend));
  const [titleError, setTitleError] = useState(false);
  const [showEdition, setShowEdition] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [editions, setEditions] = useState<BookEdition[]>([]);
  const [loadingEditions, setLoadingEditions] = useState(false);
  const [duplicate, setDuplicate] = useState<BookRecord | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const prevStatus = useRef<ReadingStatus>(form.readingStatus);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  function changeReadingStatus(next: ReadingStatus) {
    const prev = prevStatus.current;
    setForm((f) => {
      const patch: Partial<FormState> = { readingStatus: next };
      if (next === "reading" && prev !== "reading" && !f.startDate) patch.startDate = todayISO();
      if (next === "done" && prev !== "done" && !f.endDate) {
        patch.endDate = todayISO();
        if (prev !== "reading" && !f.startDate) patch.startDate = todayISO();
      }
      return { ...f, ...patch };
    });
    prevStatus.current = next;
  }

  async function applyResult(r: BookSearchResult) {
    setForm((f) => ({
      ...f,
      title: r.title || f.title,
      subtitle: r.subtitle,
      author: r.authors.join(", ") || f.author,
      publisher: r.publisher,
      pubDate: r.firstPublishYear ? String(r.firstPublishYear) : "",
      isbn10: r.isbn10,
      isbn13: r.isbn13,
      pageCount: r.pageCount ? String(r.pageCount) : "",
      language: r.language,
      edition: "",
      editionFormat: "",
      coverUrl: r.coverUrl,
      externalSource: r.workKey ? "openlibrary" : "",
      externalId: r.workKey,
    }));
    setDuplicate(
      library?.books.find((b) => r.workKey && b.externalSource === "openlibrary" && b.externalId === r.workKey && b.id !== initial?.id) || null,
    );
    setEditions([]);
    if (!r.workKey) return;
    setLoadingEditions(true);
    try {
      setEditions((await booksApi.editions(r.workKey)).editions);
    } catch {
      setEditions([]);
    } finally {
      setLoadingEditions(false);
    }
  }

  function applyEdition(ed: BookEdition) {
    setForm((f) => ({
      ...f,
      publisher: ed.publisher || f.publisher,
      pubDate: ed.publishDate || f.pubDate,
      isbn10: ed.isbn10 || f.isbn10,
      isbn13: ed.isbn13 || f.isbn13,
      pageCount: ed.pageCount ? String(ed.pageCount) : f.pageCount,
      editionFormat: ed.format || f.editionFormat,
    }));
  }

  async function pickCover() {
    setImageBusy(true);
    try {
      const dataUrl = await pickCompressedImage();
      if (dataUrl) {
        set("coverUrl", dataUrl);
        toast("Cover photo added");
      }
    } catch (error) {
      toast(errorMessage(error, "Couldn't process that image — please try another one."), "error");
    } finally {
      setImageBusy(false);
    }
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setTitleError(true);
      return;
    }
    try {
      const payload: BookInput = {
        ...form,
        ownershipStatus: form.format === "Physical" ? form.ownershipStatus : "",
        ownershipDetail: form.format === "Physical" ? form.ownershipDetail : "",
        lastPageRead: form.lastPageRead === "" ? "" : Number(form.lastPageRead),
        pageCount: form.pageCount === "" ? "" : Number(form.pageCount),
      };
      const { book } = await saveBook.mutateAsync({ id: initial?.id, book: payload });
      toast(isEdit ? "Book updated" : "Book added to your library");
      if (isEdit) router.back();
      else router.replace(`/books/${book.id}`);
    } catch (error) {
      toast(errorMessage(error, "Unable to save this book."), "error");
    }
  }

  async function handleDelete() {
    if (!initial) return;
    try {
      await deleteBook.mutateAsync(initial.id);
      setConfirmDelete(false);
      toast("Book deleted");
      router.dismissTo("/library");
    } catch (error) {
      setConfirmDelete(false);
      toast(errorMessage(error, "Unable to delete this book."), "error");
    }
  }

  const activeOwnership = OWNERSHIP[(form.ownershipStatus || "have") as OwnedStatus];
  const dateWarning = Boolean(form.startDate && form.endDate && form.endDate < form.startDate);
  const pageWarning = Boolean(form.pageCount && form.lastPageRead && Number(form.lastPageRead) > Number(form.pageCount));

  return (
    <Screen>
      <BackHeader title={isEdit ? "Edit Book" : "Add Book"} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={insets.top}>
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <BookLookup
            title={form.title}
            titleError={titleError}
            searchEnabled={!isEdit}
            duplicateBook={duplicate}
            editions={editions}
            loadingEditions={loadingEditions}
            onTitleChange={(v) => {
              set("title", v);
              setTitleError(false);
              setDuplicate(null);
            }}
            onApplyResult={applyResult}
            onApplyEdition={applyEdition}
            onViewDuplicate={(b) => router.push(`/books/${b.id}`)}
          />

          {/* Cover */}
          <View style={styles.field}>
            <FieldLabel optional>Cover Image</FieldLabel>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={styles.cover}>
                {form.coverUrl ? (
                  <Image source={{ uri: form.coverUrl }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                ) : (
                  <ImageIcon size={20} color={C.muted} />
                )}
              </View>
              <View style={{ gap: 8 }}>
                <Button
                  label={form.coverUrl ? "Replace photo" : "Upload photo"}
                  variant="outline"
                  small
                  icon={<Camera size={13} color={C.navy} />}
                  loading={imageBusy}
                  onPress={pickCover}
                />
                {form.coverUrl ? (
                  <Pressable onPress={() => set("coverUrl", "")} hitSlop={6}>
                    <AppText size={12} color={C.muted}>
                      Remove
                    </AppText>
                  </Pressable>
                ) : null}
              </View>
            </View>
            <AppText size={12} color={C.muted} style={{ marginTop: 6 }}>
              One photo per book — it&apos;s resized automatically to keep things fast.
            </AppText>
          </View>

          <View style={styles.field}>
            <FieldLabel optional>Author</FieldLabel>
            <TextField value={form.author} onChangeText={(v) => set("author", v)} placeholder="e.g. Erin Morgenstern" />
          </View>

          {/* Format */}
          <View style={styles.field}>
            <FieldLabel>Format</FieldLabel>
            <View style={styles.row}>
              {(Object.keys(FORMATS) as BookFormat[]).map((key) => (
                <Choice key={key} label={FORMATS[key].label} icon={FORMATS[key].icon} active={form.format === key} onPress={() => set("format", key)} style={{ flex: 1 }} />
              ))}
            </View>
          </View>

          {/* Ownership */}
          {form.format === "Physical" ? (
            <View style={styles.field}>
              <FieldLabel>Ownership Status</FieldLabel>
              <View style={styles.grid}>
                {(Object.keys(OWNERSHIP) as OwnedStatus[]).map((key) => (
                  <Choice
                    key={key}
                    label={OWNERSHIP[key].label}
                    icon={OWNERSHIP[key].icon}
                    active={form.ownershipStatus === key}
                    activeColor={OWNERSHIP[key].color}
                    onPress={() => set("ownershipStatus", key)}
                    style={styles.gridItem}
                  />
                ))}
              </View>
              <FieldLabel optional>{activeOwnership.field}</FieldLabel>
              <TextField value={form.ownershipDetail} onChangeText={(v) => set("ownershipDetail", v)} placeholder={activeOwnership.field} />
            </View>
          ) : null}

          {/* Reading */}
          <View style={styles.field}>
            <FieldLabel>Reading Status</FieldLabel>
            <View style={[styles.row, { marginBottom: 12 }]}>
              {(Object.keys(READING) as ReadingStatus[]).map((key) => (
                <Choice
                  key={key}
                  label={READING[key].label}
                  active={form.readingStatus === key}
                  activeColor={READING[key].color}
                  onPress={() => changeReadingStatus(key)}
                  style={{ flex: 1 }}
                />
              ))}
            </View>
            {form.readingStatus !== "toread" ? (
              <View style={[styles.row, { marginBottom: 12 }]}>
                <DateField label="Start Date" value={form.startDate} onChange={(v) => set("startDate", v)} />
                {form.readingStatus === "done" ? <DateField label="End Date" value={form.endDate} onChange={(v) => set("endDate", v)} /> : null}
              </View>
            ) : null}
            {dateWarning ? (
              <AppText size={12} color={C.warning} style={{ marginBottom: 12 }}>
                End date is before start date — that&apos;s okay if you&apos;re backfilling from memory.
              </AppText>
            ) : null}
            {form.readingStatus === "reading" ? (
              <View>
                <FieldLabel optional>Last Page Read</FieldLabel>
                <TextField value={String(form.lastPageRead)} onChangeText={(v) => set("lastPageRead", v.replace(/[^0-9]/g, ""))} keyboardType="number-pad" placeholder="e.g. 142" />
                {pageWarning ? (
                  <AppText size={12} color={C.warning} style={{ marginTop: 4 }}>
                    That&apos;s past this edition&apos;s page count ({form.pageCount}) — saved anyway.
                  </AppText>
                ) : null}
              </View>
            ) : null}
            {form.readingStatus === "done" ? (
              <View>
                <FieldLabel optional>Review</FieldLabel>
                <TextField value={form.review} onChangeText={(v) => set("review", v)} multiline maxLength={4000} placeholder="What did you think? (emoji welcome ✨)" />
              </View>
            ) : null}
          </View>

          <View style={styles.field}>
            <FieldLabel optional>Notes</FieldLabel>
            <TextField value={form.notes} onChangeText={(v) => set("notes", v)} multiline maxLength={4000} placeholder="Anything you want to remember about this book" />
          </View>

          {/* Edition details */}
          <View style={styles.edition}>
            <Pressable onPress={() => setShowEdition((s) => !s)} style={styles.editionToggle} accessibilityRole="button" accessibilityState={{ expanded: showEdition }}>
              <AppText weight="medium">
                Edition details <AppText size={12} color={C.subtle}>(optional)</AppText>
              </AppText>
              {showEdition ? <ChevronUp size={16} color={C.navy} /> : <ChevronDown size={16} color={C.navy} />}
            </Pressable>
            {showEdition ? (
              <View style={{ paddingHorizontal: 12, paddingBottom: 12, gap: 12 }}>
                <Labeled label="Subtitle" value={form.subtitle} onChange={(v) => set("subtitle", v)} />
                <View style={styles.row}>
                  <Labeled label="Publisher" value={form.publisher} onChange={(v) => set("publisher", v)} />
                  <Labeled label="Edition" value={form.edition} onChange={(v) => set("edition", v)} placeholder="e.g. 1st Edition" />
                </View>
                <View style={styles.row}>
                  <Labeled label="Binding / Format" value={form.editionFormat} onChange={(v) => set("editionFormat", v)} placeholder="e.g. Paperback" />
                  <Labeled label="Publication Date" value={form.pubDate} onChange={(v) => set("pubDate", v)} />
                </View>
                <View style={styles.row}>
                  <Labeled label="ISBN-13" value={form.isbn13} onChange={(v) => set("isbn13", v)} numeric />
                  <Labeled label="ISBN-10" value={form.isbn10} onChange={(v) => set("isbn10", v)} />
                </View>
                <View style={styles.row}>
                  <Labeled label="Page Count" value={String(form.pageCount)} onChange={(v) => set("pageCount", v.replace(/[^0-9]/g, ""))} numeric />
                  <Labeled label="Language" value={form.language} onChange={(v) => set("language", v)} />
                </View>
                <View>
                  <FieldLabel optional>Description</FieldLabel>
                  <TextField value={form.description} onChangeText={(v) => set("description", v)} multiline maxLength={4000} />
                </View>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Actions */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        {isEdit ? (
          <Pressable onPress={() => setConfirmDelete(true)} style={styles.deleteButton} accessibilityRole="button" accessibilityLabel="Delete book">
            <Trash2 size={18} color="#D64545" />
          </Pressable>
        ) : null}
        <Button label="Cancel" variant="outline" onPress={() => router.back()} style={{ flex: 1 }} />
        <Button label="Save Book" onPress={handleSave} loading={saveBook.isPending} disabled={imageBusy} style={{ flex: 1 }} />
      </View>

      <ConfirmSheet
        visible={confirmDelete}
        title="Delete this book?"
        body="Its reading history will be lost. This can't be undone."
        confirmLabel="Delete"
        danger
        loading={deleteBook.isPending}
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </Screen>
  );
}

function Labeled({ label, value, onChange, placeholder, numeric }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; numeric?: boolean }) {
  return (
    <View style={{ flex: 1 }}>
      <FieldLabel optional>{label}</FieldLabel>
      <TextField value={value} onChangeText={onChange} placeholder={placeholder} keyboardType={numeric ? "number-pad" : "default"} />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 16 },
  row: { flexDirection: "row", gap: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  gridItem: { width: "48.5%", justifyContent: "flex-start" },
  cover: { width: 64, height: 88, borderRadius: radius.md, backgroundColor: C.cream, borderWidth: 1, borderColor: C.tan, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  edition: { borderWidth: 1, borderColor: C.tan, borderRadius: radius.md, marginBottom: 16 },
  editionToggle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 12 },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 12,
    marginHorizontal: -16,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.97)",
    borderTopWidth: 1,
    borderTopColor: C.tan,
  },
  deleteButton: { width: 44, borderWidth: 1, borderColor: "#D64545", borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
});
