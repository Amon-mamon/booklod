import { describe, expect, it } from "vitest";
import { ApiError } from "../http";
import { parseBook, parseLibraryReplace, parseProfilePatch, parseYear } from "../validation";

describe("parseBook", () => {
  it("keeps known fields and applies defaults", () => {
    const book = parseBook({ title: "  Dune ", author: "Frank Herbert", unknown: "x" }, "b_1", 5);
    expect(book).toMatchObject({
      id: "b_1",
      title: "Dune",
      author: "Frank Herbert",
      format: "Physical",
      readingStatus: "toread",
      ownershipStatus: "have",
      createdAt: 5,
    });
    expect(book).not.toHaveProperty("unknown");
  });

  it("requires a title", () => {
    expect(() => parseBook({ title: "  " }, "b_1")).toThrow(ApiError);
    expect(() => parseBook(null, "b_1")).toThrow(/book/);
  });

  it("rejects invalid enums, dates, and numbers", () => {
    expect(() => parseBook({ title: "A", format: "Scroll" }, "b")).toThrow(/format/);
    expect(() => parseBook({ title: "A", startDate: "05/11/2026" }, "b")).toThrow(/startDate/);
    expect(() => parseBook({ title: "A", pageCount: -2 }, "b")).toThrow(/pageCount/);
  });

  it("clears ownership for non-physical formats", () => {
    const book = parseBook({ title: "A", format: "Kindle", ownershipStatus: "lent", ownershipDetail: "Sam" }, "b");
    expect(book.ownershipStatus).toBe("");
    expect(book.ownershipDetail).toBe("");
  });

  it("accepts data-URL and https covers but not other schemes", () => {
    expect(parseBook({ title: "A", coverUrl: "data:image/jpeg;base64,AAA" }, "b").coverUrl).toBeTruthy();
    expect(parseBook({ title: "A", coverUrl: "https://covers.openlibrary.org/x.jpg" }, "b").coverUrl).toBeTruthy();
    expect(() => parseBook({ title: "A", coverUrl: "javascript:alert(1)" }, "b")).toThrow(/coverUrl/);
  });
});

describe("parseProfilePatch", () => {
  it("only accepts editable fields", () => {
    expect(parseProfilePatch({ name: " Ana ", notifications: { bookUpdates: false } })).toEqual({
      name: "Ana",
      notifications: { bookUpdates: false },
    });
    expect(() => parseProfilePatch({ shareCode: "X" })).toThrow(/Nothing to update/);
    expect(() => parseProfilePatch({ plan: "Gold Plan!" })).toThrow(/plan/);
  });
});

describe("parseLibraryReplace", () => {
  it("rejects duplicate ids and bad revisions", () => {
    expect(() => parseLibraryReplace({ books: [{ id: "a", title: "x" }, { id: "a", title: "y" }], expectedRevision: 0 })).toThrow(/duplicated/);
    expect(() => parseLibraryReplace({ books: [], expectedRevision: -1 })).toThrow(/expectedRevision/);
  });
});

describe("parseYear", () => {
  it("defaults to the current year and validates input", () => {
    expect(parseYear(null)).toBe(new Date().getFullYear());
    expect(parseYear("2025")).toBe(2025);
    expect(() => parseYear("20x5")).toThrow(ApiError);
  });
});
