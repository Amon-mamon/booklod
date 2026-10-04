"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { booksRepository } from "../services/books-repository";
import type { Book } from "../types";

type BooksStatus = "loading" | "ready";

interface BooksContextValue {
  books: Book[];
  status: BooksStatus;
  /** True when the last write to storage failed (changes still live in memory). */
  saveError: boolean;
  getBook: (id: string) => Book | undefined;
  saveBook: (book: Book) => "created" | "updated";
  removeBook: (id: string) => void;
  /** Clears in-memory books (e.g. after account deletion). */
  reset: () => void;
}

const BooksContext = createContext<BooksContextValue | null>(null);

export function BooksProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [status, setStatus] = useState<BooksStatus>("loading");
  const [saveError, setSaveError] = useState(false);
  // Always holds the latest list so callbacks stay stable and never read stale state.
  const booksRef = useRef<Book[]>([]);

  useEffect(() => {
    let cancelled = false;
    booksRepository.load().then((stored) => {
      if (cancelled) return;
      booksRef.current = stored;
      setBooks(stored);
      setStatus("ready");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: Book[]) => {
    booksRef.current = next;
    setBooks(next);
    setSaveError(!(await booksRepository.save(next)));
  }, []);

  const getBook = useCallback((id: string) => booksRef.current.find((b) => b.id === id), []);

  const saveBook = useCallback(
    (book: Book) => {
      const current = booksRef.current;
      const exists = current.some((b) => b.id === book.id);
      void persist(exists ? current.map((b) => (b.id === book.id ? book : b)) : [book, ...current]);
      return exists ? ("updated" as const) : ("created" as const);
    },
    [persist]
  );

  const removeBook = useCallback(
    (id: string) => {
      void persist(booksRef.current.filter((b) => b.id !== id));
    },
    [persist]
  );

  const reset = useCallback(() => {
    booksRef.current = [];
    setBooks([]);
  }, []);

  const value = useMemo(
    () => ({ books, status, saveError, getBook, saveBook, removeBook, reset }),
    [books, status, saveError, getBook, saveBook, removeBook, reset]
  );

  return <BooksContext.Provider value={value}>{children}</BooksContext.Provider>;
}

export function useBooks(): BooksContextValue {
  const ctx = useContext(BooksContext);
  if (!ctx) throw new Error("useBooks must be used inside <BooksProvider>");
  return ctx;
}
