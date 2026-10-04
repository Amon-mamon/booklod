import Link from "next/link";
import { Plus } from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";
import { Wordmark } from "@/components/ui/wordmark";
import { colors } from "@/config/brand";
import { ROUTES } from "@/config/routes";

export function AppHeader({ showAddBook }: { showAddBook: boolean }) {
  return (
    <div className="max-w-xl mx-auto flex items-center justify-between mb-5">
      <Link href={ROUTES.home} className="flex items-center gap-2.5">
        <LogoMark/>
        <span className="text-lg font-bold leading-none" style={{ color: colors.navy }}>
          <Wordmark />
        </span>
      </Link>
      {showAddBook && (
        <Link
          href={ROUTES.app.newBook}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm"
          style={{ background: colors.orange }}
        >
          <Plus size={16} /> Add Book
        </Link>
      )}
    </div>
  );
}
