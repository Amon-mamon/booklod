import type { Metadata } from "next";
import { AddBookScreen } from "@/features/books/components/add-book-screen";

export const metadata: Metadata = { title: "Add book" };

export default function Page() {
  return <AddBookScreen />;
}
