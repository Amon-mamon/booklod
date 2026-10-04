/**
 * Persistence seam.
 *
 * The original app called `window.storage` — an API that only exists inside the
 * Claude artifact sandbox. Everything now goes through this interface so the
 * backing store can be swapped (IndexedDB, REST API, Supabase, ...) without
 * touching feature code.
 */
export interface KeyValueStorage {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

export const localStorageAdapter: KeyValueStorage = {
  async get(key) {
    return window.localStorage.getItem(key);
  },
  async set(key, value) {
    window.localStorage.setItem(key, value);
  },
  async remove(key) {
    window.localStorage.removeItem(key);
  },
};

/** The active adapter. Browser-only: only call from effects / event handlers. */
export const storage: KeyValueStorage = localStorageAdapter;
