"use client";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "../../../../features/app/AppShell";
import { BookDetail } from "../../../../features/library/components/BookDetail";
import { BookNotFound } from "../../../../features/library/components/BookNotFound";

export default function BookRoute() {
  const router = useRouter();
  const { bookId } = useParams<{ bookId: string }>();
  const book = useApp().books.find((b) => b.id === decodeURIComponent(bookId));
  if (!book) return <BookNotFound />;
  const base = `/app/library/${encodeURIComponent(book.id)}`;
  return (
    <BookDetail
      book={book}
      onBack={() => router.push("/app/library")}
      onEdit={() => router.push(`${base}/edit`)}
      onQuickLend={() => router.push(`${base}/edit?lend=1`)}
    />
  );
}
