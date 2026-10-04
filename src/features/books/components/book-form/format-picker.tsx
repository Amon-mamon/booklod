"use client";

import { FieldLabel } from "@/components/ui/form-field";
import { colors } from "@/config/brand";
import { FORMAT_ENTRIES } from "../../constants";
import type { BookFormat } from "../../types";

export function FormatPicker({ value, onChange }: { value: BookFormat; onChange: (format: BookFormat) => void }) {
  return (
    <div className="mb-4">
      <FieldLabel>Format</FieldLabel>
      <div className="flex gap-2">
        {FORMAT_ENTRIES.map(([key, f]) => {
          const Icon = f.icon;
          const active = value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border py-2 text-sm font-medium transition"
              style={{
                borderColor: active ? colors.green : colors.tan,
                background: active ? colors.green : "white",
                color: active ? "white" : colors.navy,
              }}
            >
              <Icon size={15} /> {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
