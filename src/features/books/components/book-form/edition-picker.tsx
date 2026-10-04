"use client";

import { Loader2 } from "lucide-react";
import { FieldLabel } from "@/components/ui/form-field";
import { colors } from "@/config/brand";
import type { EditionOption } from "../../services/open-library";

interface EditionPickerProps {
  options: EditionOption[];
  loading: boolean;
  onSelect: (edition: EditionOption) => void;
}

export function EditionPicker({ options, loading, onSelect }: EditionPickerProps) {
  return (
    <div className="mb-4">
      <FieldLabel optional>Choose a different edition</FieldLabel>
      {loading ? (
        <div className="flex items-center gap-2 text-xs" style={{ color: colors.muted }}>
          <Loader2 size={13} className="animate-spin" /> Looking up editions...
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {options.map((ed, i) => (
            <button
              key={ed.key || i}
              type="button"
              onClick={() => onSelect(ed)}
              className="flex-shrink-0 rounded-lg border px-2.5 py-1.5 text-left"
              style={{ borderColor: colors.tan }}
            >
              <p className="text-xs font-medium" style={{ color: colors.navy }}>{ed.format || "Edition"}</p>
              <p className="text-[11px]" style={{ color: colors.muted }}>
                {[ed.publishDate, ed.publisher].filter(Boolean).join(" · ") || "—"}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
