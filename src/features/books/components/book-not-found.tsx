import Link from "next/link";
import { BookOpen } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { colors } from "@/config/brand";
import { ROUTES } from "@/config/routes";

export function BookNotFound() {
  return (
    <div className="max-w-xl mx-auto pt-4">
      <EmptyState icon={BookOpen} title="Book not found" subtitle="It may have been deleted." />
      <div className="text-center mt-4">
        <Link href={ROUTES.app.library} className="text-sm font-medium" style={{ color: colors.green }}>
          ← Back to your library
        </Link>
      </div>
    </div>
  );
}
