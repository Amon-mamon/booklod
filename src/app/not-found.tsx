import Link from "next/link";
import { BookOpen } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { colors } from "@/config/brand";
import { ROUTES } from "@/config/routes";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4" style={{ background: colors.cream }}>
      <div className="w-full max-w-sm">
        <EmptyState icon={BookOpen} title="Page not found" subtitle="That page doesn't exist." />
        <div className="text-center mt-4">
          <Link href={ROUTES.home} className="text-sm font-medium" style={{ color: colors.green }}>
            ← Back to Booklod
          </Link>
        </div>
      </div>
    </div>
  );
}
