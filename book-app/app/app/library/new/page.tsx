"use client";
import { useRouter } from "next/navigation";
import { useApp } from "../../../../features/app/AppShell";
import { BookForm } from "../../../../features/library/components/BookForm";

export default function NewBookRoute() {
  const router = useRouter();
  const { books, saveBook, requestDeleteBook, showToast } = useApp();
  return (
    <BookForm
      initial={null}
      onCancel={() => router.push("/app/library")}
      onSave={saveBook}
      onDelete={requestDeleteBook}
      existingBooks={books}
      onViewDuplicate={(book) => router.push(`/app/library/${encodeURIComponent(book.id)}`)}
      showToast={showToast}
    />
  );
}
