import type { LucideIcon } from "lucide-react";
import { colors } from "@/config/brand";

interface PlaceholderPageProps {
  icon: LucideIcon;
  title: string;
  message: string;
}

/** Honest "not published yet" page — no fabricated content. */
export function PlaceholderPage({ icon: Icon, title, message }: PlaceholderPageProps) {
  return (
    <section className="px-4 sm:px-6 py-16 sm:py-24 text-center">
      <div className="max-w-md mx-auto">
        <div
          className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: colors.greenT }}
        >
          <Icon size={20} style={{ color: colors.green }} />
        </div>
        <h1 className="text-xl font-semibold" style={{ color: colors.navy }}>{title}</h1>
        <p className="text-sm mt-2" style={{ color: colors.muted }}>{message}</p>
      </div>
    </section>
  );
}
