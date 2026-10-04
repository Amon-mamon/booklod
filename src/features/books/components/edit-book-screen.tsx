"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ROUTES } from "@/config/routes";
import { useToast } from "@/providers/toast-provider";
import { useBooks } from "../context/books-provider";
import type { Book } from "../types";
import { BookForm } from "./book-form/book-form";
import { BookNotFound } from "./book-not-found";

interface EditBookScreenProps {
  id: string;
  /** "Lend it" shortcut: opens the form with ownership pre-set to Lent Out (not saved until Save). */
  lend?: boolean;
}

export function EditBookScreen({ id, lend }: EditBookScreenProps) {
  const router = useRouter();
  const { books, getBook, saveBook, removeBook } = useBooks();
  const { showToast } = useToast();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const book = getBook(id);
  const initial = useMemo<Book | undefined>(
    () => (book && lend ? { ...book, ownershipStatus: "lent" } : book),
    [book, lend]
  );

  function handleSave(next: Book) {
    saveBook(next);
    showToast("Book updated");
    router.replace(ROUTES.app.book(next.id));
  }

  function handleConfirmDelete() {
    setDeleted(true); // avoid flashing "not found" while navigating away
    removeBook(id);
    showToast("Book deleted");
    router.replace(ROUTES.app.library);
  }

  if (deleted) return null;
  if (!initial) return <BookNotFound />;

  return (
    <>
      <BookForm
        initial={initial}
        existingBooks={books}
        onCancel={() => router.push(ROUTES.app.book(id))}
        onSave={handleSave}
        onDelete={() => setConfirmingDelete(true)}
        onViewDuplicate={(b) => router.push(ROUTES.app.book(b.id))}
      />
      {confirmingDelete && (
        <ConfirmModal
          title="Delete this book?"
          body="Its reading history will be lost. This can't be undone."
          confirmLabel="Delete"
          danger
          onConfirm={handleConfirmDelete}
          onClose={() => setConfirmingDelete(false)}
        />
      )}
    </>
  );
}
