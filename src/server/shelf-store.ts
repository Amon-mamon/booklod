import type { SharedShelfSnapshot } from "@/features/sharing/types";

export interface ShelfStore {
  get(code: string): Promise<SharedShelfSnapshot | null>;
  set(code: string, snapshot: SharedShelfSnapshot): Promise<void>;
  delete(code: string): Promise<void>;
}

/**
 * ⚠️ DEV / DEMO STORE — in-memory only.
 * Data is lost on restart and is NOT shared between serverless instances.
 * Replace with Redis / Vercel KV / your database before shipping:
 * implement `ShelfStore` and export it as `shelfStore`.
 */
const globalForStore = globalThis as unknown as { __booklodShelves?: Map<string, SharedShelfSnapshot> };
const shelves = (globalForStore.__booklodShelves ??= new Map());

export const shelfStore: ShelfStore = {
  async get(code) {
    return shelves.get(code) ?? null;
  },
  async set(code, snapshot) {
    shelves.set(code, snapshot);
  },
  async delete(code) {
    shelves.delete(code);
  },
};
