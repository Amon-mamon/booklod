import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { BookRecord } from "../../../features/shared/types";
import { buildDigest } from "../services/digest";
import { addBookOp, deleteBookOp, mutateLibrary, replaceBookOp } from "../services/library";
import { toEditions } from "../services/openlibrary";

const books: BookRecord[] = [
  { id: "a", title: "Done Jan", readingStatus: "done", endDate: "2026-01-10" },
  { id: "b", title: "Done Mar", readingStatus: "done", endDate: "2026-03-02" },
  { id: "c", title: "Done last year", readingStatus: "done", endDate: "2025-12-31" },
  { id: "d", title: "Reading", readingStatus: "reading", startDate: "2026-03-01" },
  { id: "e", title: "Queue", readingStatus: "toread" },
  { id: "f", title: "Lent", format: "Physical", ownershipStatus: "lent", readingStatus: "toread" },
];

describe("buildDigest", () => {
  it("matches the web digest rules", () => {
    const digest = buildDigest(books, 2026);
    expect(digest.totals).toEqual({ finished: 2, reading: 1, toRead: 2, lentOut: 1 });
    expect(digest.finished.map((b) => b.id)).toEqual(["b", "a"]);
    expect(digest.months[0]).toMatchObject({ label: "Jan", finished: 1, reading: 0 });
    expect(digest.months[2]).toMatchObject({ label: "Mar", finished: 1, reading: 1 });
  });
});

describe("library operations", () => {
  it("adds, replaces (keeping createdAt), and deletes", () => {
    const added = addBookOp({ id: "z", title: "New" })(books);
    expect(added[0].id).toBe("z");
    expect(() => addBookOp({ id: "a", title: "Dup" })(books)).toThrow(/already exists/);

    const withCreated = [{ id: "a", title: "Old", createdAt: 1 }];
    expect(replaceBookOp({ id: "a", title: "New", createdAt: 99 })(withCreated)[0]).toMatchObject({ title: "New", createdAt: 1 });
    expect(() => replaceBookOp({ id: "missing", title: "x" })(books)).toThrow(/not found/);

    expect(deleteBookOp("a")(books).some((b) => b.id === "a")).toBe(false);
  });

  it("re-applies the operation on a revision conflict", async () => {
    const snapshots = [
      { books: [{ id: "a", title: "A" }], revision: 1 },
      { books: [{ id: "a", title: "A" }, { id: "other", title: "From another device" }], revision: 2 },
    ];
    let loads = 0;
    const rpc = vi.fn().mockResolvedValueOnce({ data: null, error: null }).mockResolvedValueOnce({ data: 3, error: null });
    const supabase = {
      from: () => ({
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: snapshots[Math.min(loads++, 1)], error: null }) }),
        }),
      }),
      rpc,
    } as unknown as SupabaseClient;

    const result = await mutateLibrary(supabase, "user", addBookOp({ id: "new", title: "Mine" }));
    expect(result.revision).toBe(3);
    expect(result.books.map((b) => b.id)).toEqual(["new", "a", "other"]);
    expect(rpc).toHaveBeenLastCalledWith("save_library_snapshot", expect.objectContaining({ p_expected_revision: 2 }));
  });
});

describe("library limits", () => {
  it("refuses to add a book past the 5000-book cap", () => {
    const full = Array.from({ length: 5000 }, (_, i) => ({ id: `b${i}`, title: "T" })) as BookRecord[];
    expect(() => addBookOp({ id: "new", title: "One more" })(full)).toThrow(/at most 5000/);
    expect(addBookOp({ id: "new", title: "Fits" })(full.slice(1))).toHaveLength(5000);
  });
});

describe("toEditions", () => {
  it("dedupes and normalises Open Library editions", () => {
    const entry = { title: "X", publish_date: "2001", physical_format: "Paperback", publishers: ["P"], isbn_13: ["978"] };
    const editions = toEditions([entry, { ...entry }, { title: "X", publish_date: "2010" }]);
    expect(editions).toHaveLength(2);
    expect(editions[0]).toMatchObject({ format: "Paperback", publisher: "P", isbn13: "978" });
  });
});
