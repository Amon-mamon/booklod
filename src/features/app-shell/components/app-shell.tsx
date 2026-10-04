"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PageLoader } from "@/components/ui/page-loader";
import { colors } from "@/config/brand";
import { ROUTES } from "@/config/routes";
import { useBooks } from "@/features/books/context/books-provider";
import { AppHeader } from "./app-header";
import { TAB_ROUTES, TabBar } from "./tab-bar";

/** Chrome for every authenticated screen: header, save-error banner, bottom tabs. */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { status, saveError } = useBooks();

  // Sub-views (book detail / add / edit) take over the screen — no tab bar.
  const isTabRoute = TAB_ROUTES.includes(pathname);
  const showAddBook = pathname === ROUTES.app.library || pathname === ROUTES.app.digest;

  if (status === "loading") return <PageLoader />;

  return (
    <div className="w-full min-h-dvh px-4 pt-5" style={{ background: colors.cream }}>
      <AppHeader showAddBook={showAddBook} />

      {saveError && (
        <div
          role="alert"
          className="max-w-xl mx-auto mb-3 text-xs rounded-lg px-3 py-2"
          style={{ background: colors.dangerTint, color: colors.danger }}
        >
          Couldn&apos;t save your last change. It&apos;s kept in this session — try again in a moment.
        </div>
      )}

      <main>{children}</main>

      {isTabRoute && <TabBar />}
      <div className="h-16" />
    </div>
  );
}
