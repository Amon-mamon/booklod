"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { useToast } from "@/providers/toast-provider";
import { useBooks } from "../context/books-provider";
import type { Book } from "../types";
import { BookForm } from "./book-form/book-form";

export function AddBookScreen() {
  const router = useRouter();
  const { books, saveBook } = useBooks();
  const { showToast } = useToast();

  function handleSave(book: Book) {
    saveBook(book);
    showToast("Book added to your library");
    router.replace(ROUTES.app.book(book.id));
  }

  return (
    <BookForm
      existingBooks={books}
      onCancel={() => router.push(ROUTES.app.library)}
      onSave={handleSave}
      onViewDuplicate={(book) => router.push(ROUTES.app.book(book.id))}
    />
  );
}
