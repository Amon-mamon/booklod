"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useApp } from "../../../../../features/app/AppShell";
import { BookForm } from "../../../../../features/library/components/BookForm";
import { BookNotFound } from "../../../../../features/library/components/BookNotFound";

export default function EditBookRoute() {
  const router = useRouter();
  const lend = useSearchParams().get("lend") === "1";
  const { bookId } = useParams<{ bookId: string }>();
  const { books, saveBook, requestDeleteBook, showToast } = useApp();
  const book = books.find((b) => b.id === decodeURIComponent(bookId));
  if (!book) return <BookNotFound />;
  const base = `/app/library/${encodeURIComponent(book.id)}`;
  return (
    <BookForm
      initial={lend ? { ...book, ownershipStatus: "lent" } : book}
      onCancel={() => router.push(base)}
      onSave={saveBook}
      onDelete={requestDeleteBook}
      existingBooks={books}
      onViewDuplicate={(dup) => router.push(`/app/library/${encodeURIComponent(dup.id)}`)}
      showToast={showToast}
    />
  );
}
