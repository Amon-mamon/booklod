"use client";
import { useRouter } from "next/navigation";
import { useApp } from "../../../features/app/AppShell";
import { Library } from "../../../features/library/pages/LibraryPage";

export default function LibraryRoute() {
  const router = useRouter();
  const { books } = useApp();
  return <Library books={books} onOpen={(book) => router.push(`/app/library/${encodeURIComponent(book.id)}`)} />;
}
