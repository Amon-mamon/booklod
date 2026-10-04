import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/features/app-shell/components/app-shell";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { BooksProvider } from "@/features/books/context/books-provider";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <BooksProvider>
        <AppShell>{children}</AppShell>
      </BooksProvider>
    </RequireAuth>
  );
}
