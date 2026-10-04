/** Single source of truth for every URL in the app. */
export const ROUTES = {
  home: "/",
  about: "/about",
  blog: "/blog",
  pricing: "/pricing",
  privacy: "/privacy",
  terms: "/terms",
  signIn: "/signin",
  homeSections: {
    howItWorks: "/#preview",
    features: "/#features",
  },
  app: {
    root: "/booklod",
    library: "/booklod/library",
    digest: "/booklod/digest",
    profile: "/booklod/profile",
    newBook: "/booklod/books/new",
    book: (id: string) => `/booklod/books/${encodeURIComponent(id)}`,
    editBook: (id: string, opts?: { lend?: boolean }) =>
      `/booklod/books/${encodeURIComponent(id)}/edit${opts?.lend ? "?lend=1" : ""}`,
  },
} as const;
