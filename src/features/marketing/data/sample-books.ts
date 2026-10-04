import type { Book } from "@/features/books/types";

/** Pinned so the landing-page digest preview always shows the sample data. */
export const SAMPLE_YEAR = 2026;

export const SAMPLE_BOOKS: Book[] = [
  {
    id: "s1", title: "Atomic Habits", author: "James Clear", format: "Physical",

    ownershipStatus: "have", ownershipDetail: "Desk shelf", readingStatus: "reading",
    startDate: "2026-08-03", endDate: "", lastPageRead: 142, review: "", notes: "",
  },
  {
    id: "s2", title: "The Song of Achilles", author: "Madeline Miller", format: "Physical",
    ownershipStatus: "lent", ownershipDetail: "Kim", readingStatus: "done",
    startDate: "2026-06-01", endDate: "2026-06-12", lastPageRead: "", review: "", notes: "",
  },
  {
    id: "s3", title: "Educated", author: "Tara Westover", format: "Physical",
    ownershipStatus: "have", ownershipDetail: "Living room", readingStatus: "done",
    startDate: "2026-08-01", endDate: "2026-08-15", lastPageRead: "", review: "", notes: "",
  },
  {
    id: "s4", title: "Circe", author: "Madeline Miller", format: "Kindle",
    ownershipStatus: "", ownershipDetail: "", readingStatus: "done",
    startDate: "2026-07-20", endDate: "2026-07-30", lastPageRead: "", review: "", notes: "",
  },
  {
    id: "s5", title: "Project Hail Mary", author: "Andy Weir", format: "Physical",
    ownershipStatus: "have", ownershipDetail: "Nightstand", readingStatus: "toread",
    startDate: "", endDate: "", lastPageRead: "", review: "", notes: "",
  },
];
