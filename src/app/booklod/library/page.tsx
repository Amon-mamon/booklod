import type { Metadata } from "next";
import { LibraryScreen } from "@/features/books/components/library-screen";

export const metadata: Metadata = { title: "Library" };

export default function Page() {
  return <LibraryScreen />;
}
