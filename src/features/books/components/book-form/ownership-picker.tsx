"use client";

import { FieldLabel, TextInput } from "@/components/ui/form-field";
import { colors } from "@/config/brand";
import { OWNERSHIP, OWNERSHIP_ENTRIES } from "../../constants";
import type { OwnershipStatus } from "../../types";

interface OwnershipPickerProps {
  status: OwnershipStatus;
  detail: string;
  onStatusChange: (status: OwnershipStatus) => void;
  onDetailChange: (detail: string) => void;
}

/** Ownership controls — only rendered for physical books. */
export function OwnershipPicker({ status, detail, onStatusChange, onDetailChange }: OwnershipPickerProps) {
  const detailLabel = OWNERSHIP[status].field;
  return (
    <div className="mb-4">
      <FieldLabel>Ownership Status</FieldLabel>
      <div className="grid grid-cols-2 gap-2 mb-2">
        {OWNERSHIP_ENTRIES.map(([key, o]) => {
          const Icon = o.icon;
          const active = status === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onStatusChange(key)}
              className="flex items-center gap-1.5 rounded-xl border py-2 px-2 text-sm font-medium transition"
              style={{
                borderColor: active ? o.color : colors.tan,
                background: active ? o.color : "white",
                color: active ? "white" : colors.navy,
              }}
            >
              <Icon size={14} /> {o.label}
            </button>
          );
        })}
      </div>
      <FieldLabel optional>{detailLabel}</FieldLabel>
      <TextInput placeholder={detailLabel} value={detail} onChange={(e) => onDetailChange(e.target.value)} />
    </div>
  );
}
