import {
  Archive,
  Book as BookIcon,
  BookMarked,
  Gift,
  MapPin,
  Tablet,
  Users,
  type LucideIcon,
} from "lucide-react";
import { colors } from "@/config/brand";
import type { BookFormat, OwnershipStatus, ReadingStatus } from "./types";

export interface OwnershipMeta {
  label: string;
  icon: LucideIcon;
  color: string;
  tint: string;
  /** Label for the free-text detail field that goes with this status. */
  field: string;
}

export const OWNERSHIP: Record<OwnershipStatus, OwnershipMeta> = {
  have: { label: "Have It", icon: MapPin, color: colors.green, tint: colors.greenT, field: "Place of storage" },
  lent: { label: "Lent Out", icon: Users, color: colors.navy, tint: colors.navyT, field: "Who borrowed it" },
  given: { label: "Given Away", icon: Gift, color: colors.navy, tint: colors.navyT, field: "Given to" },
  none: { label: "No Longer Have It", icon: Archive, color: colors.muted, tint: colors.neutralTint, field: "Notes" },
};

export interface ReadingMeta {
  label: string;
  color: string;
  tint: string;
}

export const READING: Record<ReadingStatus, ReadingMeta> = {
  toread: { label: "To Read", color: colors.navy, tint: colors.navyT },
  reading: { label: "Reading", color: colors.orange, tint: colors.orangeT },
  done: { label: "Done Reading", color: colors.green, tint: colors.greenT },
};

export interface FormatMeta {
  icon: LucideIcon;
  label: string;
}

export const FORMATS: Record<BookFormat, FormatMeta> = {
  Physical: { icon: BookIcon, label: "Physical" },
  "E-book": { icon: Tablet, label: "E-book" },
  Kindle: { icon: BookMarked, label: "Kindle" },
};

// Typed entry lists — `Object.entries` alone loses the key type.
export const OWNERSHIP_ENTRIES = Object.entries(OWNERSHIP) as [OwnershipStatus, OwnershipMeta][];
export const READING_ENTRIES = Object.entries(READING) as [ReadingStatus, ReadingMeta][];
export const FORMAT_ENTRIES = Object.entries(FORMATS) as [BookFormat, FormatMeta][];
