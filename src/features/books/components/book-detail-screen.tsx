"use client";

import { useBooks } from "../context/books-provider";
import { BookDetail } from "./book-detail";
import { BookNotFound } from "./book-not-found";

export function BookDetailScreen({ id }: { id: string }) {
  const { getBook } = useBooks();
  const book = getBook(id);
  return book ? <BookDetail book={book} /> : <BookNotFound />;
}
