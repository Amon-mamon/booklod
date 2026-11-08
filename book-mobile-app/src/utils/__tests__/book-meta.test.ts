import { C } from "@/theme";
import type { BookRecord } from "@/types/booklod";
import { cardStatusText, filterBooks, statusColor } from "../book-meta";
import { fromISODate, toISODate } from "../dates";
import { niceMax } from "@/features/digest/components/MonthlyBarChart";

const books: BookRecord[] = [
  { id: "1", title: "Dune", author: "Frank Herbert", format: "Physical", ownershipStatus: "lent", ownershipDetail: "Sam", readingStatus: "done" },
  { id: "2", title: "Piranesi", author: "Susanna Clarke", format: "Kindle", readingStatus: "reading", lastPageRead: 42 },
  { id: "3", title: "Circe", format: "Physical", ownershipStatus: "have", readingStatus: "toread" },
];

describe("cardStatusText", () => {
  it("matches the web card labels", () => {
    expect(cardStatusText(books[0])).toBe("Lent to Sam");
    expect(cardStatusText(books[1])).toBe("Reading · p.42");
    expect(cardStatusText(books[2])).toBe("To Read");
    expect(cardStatusText({ id: "x", title: "x", format: "E-book", readingStatus: "done" })).toBe("Finished");
  });
});

describe("statusColor", () => {
  it("prioritises reading, then lent/given, then done", () => {
    expect(statusColor(books[1]).color).toBe(C.orange);
    expect(statusColor(books[0]).color).toBe(C.navy);
    expect(statusColor({ readingStatus: "done", format: "Kindle" }).color).toBe(C.green);
  });
});

describe("filterBooks", () => {
  it("filters by query, reading status, and ownership", () => {
    expect(filterBooks(books, "clarke", "All", "All").map((b) => b.id)).toEqual(["2"]);
    expect(filterBooks(books, "", "Reading", "All").map((b) => b.id)).toEqual(["2"]);
    expect(filterBooks(books, "", "All", "Lent Out").map((b) => b.id)).toEqual(["1"]);
    expect(filterBooks(books, "", "All", "Have It").map((b) => b.id)).toEqual(["3"]);
  });
});

describe("dates", () => {
  it("round-trips local ISO dates without timezone drift", () => {
    expect(toISODate(fromISODate("2026-01-31"))).toBe("2026-01-31");
  });
});

describe("niceMax", () => {
  it("rounds chart maxima up to friendly numbers", () => {
    expect(niceMax(0)).toBe(4);
    expect(niceMax(7)).toBe(10);
    expect(niceMax(13)).toBe(20);
  });
});
