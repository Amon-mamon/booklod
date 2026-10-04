import type { Book } from "@/features/books/types";
import { buildSharePayload } from "../lib/snapshot";
import type { SharedShelfSnapshot } from "../types";

const endpoint = (code: string) => `/api/shelves/${encodeURIComponent(code)}`;

export async function publishSharedShelf(code: string, ownerName: string, books: Book[]): Promise<boolean> {
  try {
    const res = await fetch(endpoint(code), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildSharePayload(ownerName, books)),
    });
    return res.ok;
  } catch (error) {
    console.error("Shared shelf publish error", error);
    return false;
  }
}

export async function unpublishSharedShelf(code: string): Promise<void> {
  try {
    await fetch(endpoint(code), { method: "DELETE" });
  } catch {
    /* fine if it didn't exist */
  }
}

export async function loadSharedShelf(code: string): Promise<SharedShelfSnapshot | null> {
  try {
    const res = await fetch(endpoint(code), { cache: "no-store" });
    return res.ok ? ((await res.json()) as SharedShelfSnapshot) : null;
  } catch {
    return null;
  }
}
