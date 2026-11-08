"use client";
import { useEffect } from "react";
import { MapPin, Users, Gift, Archive, Book, Tablet, BookMarked } from "lucide-react";
import { C } from "../../app/components/theme";
import type { BookFormat, BookRecord, OwnershipStatus, ReadingStatus } from "./types";
import type { LucideIcon } from "lucide-react";

export const DEFAULT_NOTIFICATIONS = {
  readingReminders: true,
  bookUpdates: true,
  productUpdates: false,
};

interface OwnershipMetadata {
  label: string;
  icon: LucideIcon;
  color: string;
  tint: string;
  field: string;
}

export const OWNERSHIP: Record<Exclude<OwnershipStatus, "">, OwnershipMetadata> = {
  have: { label: "Have It", icon: MapPin, color: C.green, tint: C.greenT, field: "Place of storage" },
  lent: { label: "Lent Out", icon: Users, color: C.navy, tint: C.navyT, field: "Who borrowed it" },
  given: { label: "Given Away", icon: Gift, color: C.navy, tint: C.navyT, field: "Given to" },
  none: { label: "No Longer Have It", icon: Archive, color: C.muted, tint: "#EDEAE3", field: "Notes" },
};

export const READING: Record<ReadingStatus, { label: string; color: string; tint: string }> = {
  toread: { label: "To Read", color: C.navy, tint: C.navyT },
  reading: { label: "Reading", color: C.orange, tint: C.orangeT },
  done: { label: "Done Reading", color: C.green, tint: C.greenT },
};

// Overall "vibe" color for a book — drives icon-badge tint on cards.
export function statusColor(
  book: Pick<BookRecord, "readingStatus" | "format" | "ownershipStatus">,
) {
  if (book.readingStatus === "reading") return { color: C.orange, tint: C.orangeT };
  if (book.format === "Physical" && (book.ownershipStatus === "lent" || book.ownershipStatus === "given"))
    return { color: C.navy, tint: C.navyT };
  if (book.readingStatus === "done") return { color: C.green, tint: C.greenT };
  return { color: C.navy, tint: C.navyT };
}

export const FORMATS: Record<BookFormat, { icon: LucideIcon; label: string }> = {
  Physical: { icon: Book, label: "Physical" },
  "E-book": { icon: Tablet, label: "E-book" },
  Kindle: { icon: BookMarked, label: "Kindle" },
};

export function uid() {
  return "b_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function fmtDate(d?: string) {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// Resize + re-encode an uploaded image so the final data URL lands around
// TARGET_BYTES, trying progressively smaller dimensions/quality.
export const TARGET_BYTES = 235 * 1024;

// ~230KB, safely under the 200-250KB budget

export function dataUrlBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] || "";
  return Math.ceil((base64.length * 3) / 4);
}

export function loadImage(src: string, crossOrigin = false): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Shared canvas-based compressor: takes a loaded HTMLImageElement, returns a
// JPEG data URL trimmed toward TARGET_BYTES.
export function compressLoadedImage(img: HTMLImageElement): string {
  let maxDim = 1000;
  let quality = 0.85;
  let result = "";

  for (let attempt = 0; attempt < 8; attempt++) {
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Unable to create an image processing context.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const candidate = canvas.toDataURL("image/jpeg", quality);
    result = candidate;
    if (dataUrlBytes(candidate) <= TARGET_BYTES) break;
    // Still too big — shrink quality first, then dimensions.
    if (quality > 0.5) {
      quality -= 0.12;
    } else {
      maxDim = Math.round(maxDim * 0.8);
      quality = 0.7;
    }
  }
  return result;
}

export async function compressImageFile(file: File): Promise<string> {
  if (!file.type || !file.type.startsWith("image/")) {
    throw new Error("unsupported-type");
  }
  const readAsDataUrl = () =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== "string") {
          reject(new Error("Unable to read the selected image."));
          return;
        }
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const originalDataUrl = await readAsDataUrl();
  const img = await loadImage(originalDataUrl);
  return compressLoadedImage(img);
}

// Cache a cover pulled from an external source (e.g. Open Library) as a
// compressed local data URL, so the Library never depends on the external
// host being up. Some external image hosts don't send CORS headers, which
// taints the canvas and blocks re-encoding — if that happens we fall back
// to the original remote URL so the cover still displays, it just isn't
// cached/compressed locally.
export async function compressImageFromUrl(url: string): Promise<string> {
  try {
    const img = await loadImage(url, true);
    return compressLoadedImage(img);
  } catch {
    return url;
  }
}

// Search result ranking lives in a server-safe module so the API can reuse it.
export { normTitle, scoreBookDoc, splitIsbns } from "../../lib/books/ranking";
export type { OpenLibrarySearchDoc } from "../../lib/books/ranking";

// In-page scroll targets on the homepage (Features / How It Works). If the
// user triggers these from another page, we navigate home first and let the
// homepage's mount effect pick up the pending target.
export let pendingScrollTarget: string | null = null;
export function consumePendingScrollTarget(): string | null {
  const target = pendingScrollTarget;
  pendingScrollTarget = null;
  return target;
}

export function goToSection(target: string, push: (path: string) => void) {
  pendingScrollTarget = target;
  if (window.location.pathname !== "/") {
    push("/");
  } else {
    window.dispatchEvent(new Event("booklod:scroll-request"));
  }
}

// ---------------------------------------------------------------------------
// Font loader
// ---------------------------------------------------------------------------
export function useGoogleFont() {
  useEffect(() => {
    if (document.getElementById("booklod-font")) return;
    const link = document.createElement("link");
    link.id = "booklod-font";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);
}
