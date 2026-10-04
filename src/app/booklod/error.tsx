"use client";

import { AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { colors } from "@/config/brand";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-xl mx-auto pt-4">
      <EmptyState icon={AlertTriangle} title="Something went wrong" subtitle="Your library data is safe." />
      <div className="text-center mt-4">
        <button type="button" onClick={reset} className="text-sm font-medium" style={{ color: colors.green }}>
          Try again
        </button>
      </div>
    </div>
  );
}
