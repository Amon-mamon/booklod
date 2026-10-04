"use client";

import { useBooks } from "@/features/books/context/books-provider";
import { Digest } from "./digest";

export function DigestScreen() {
  const { books } = useBooks();
  return <Digest books={books} />;
}
