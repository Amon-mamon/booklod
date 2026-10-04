import Link from "next/link";
import { Wordmark } from "@/components/ui/wordmark";
import { colors } from "@/config/brand";
import { ROUTES } from "@/config/routes";

export function SiteFooter() {
  return (
    <footer className="px-4 sm:px-6 py-8 text-center border-t" style={{ borderColor: colors.tan }}>
      <p className="text-sm font-medium" style={{ color: colors.navy }}>
        <Wordmark />
      </p>
      <p className="text-xs mt-1.5 max-w-xs mx-auto" style={{ color: colors.muted }}>
        A personal book tracker to log what you&apos;ve read, what you own, and your reading history.
      </p>
      <div className="flex items-center justify-center gap-4 mt-3 text-xs" style={{ color: colors.muted }}>
        <Link href={ROUTES.about} className="hover:opacity-70 transition">About</Link>
        <Link href={ROUTES.blog} className="hover:opacity-70 transition">Blog</Link>
      </div>
    </footer>
  );
}
