import type {
  AdminPlan,
  AdminUserDetail,
  AdminUserSummary,
  AppSettings,
  Plan,
  BookEdition,
  BookInput,
  BookRecord,
  BookSearchResult,
  BooklodProfile,
  LibrarySnapshot,
  ProfilePatch,
  ReadingDigest,
  SharedShelf,
} from "@/types/booklod";
import { apiRequest } from "./client";

// One function per API endpoint. See book-app/app/api/v1 for the server side.

export const profileApi = {
  get: () =>
    apiRequest<{ user: { id: string; email: string }; profile: BooklodProfile; isAdmin?: boolean }>("GET", "/me"),
  update: (patch: ProfilePatch) => apiRequest<{ profile: BooklodProfile }>("PATCH", "/me", { body: patch }),
  deleteData: () => apiRequest<void>("DELETE", "/me"),
};

export const libraryApi = {
  list: () => apiRequest<LibrarySnapshot>("GET", "/library"),
  get: (id: string) => apiRequest<{ book: BookRecord; revision: number }>("GET", `/library/books/${encodeURIComponent(id)}`),
  create: (book: BookInput) => apiRequest<{ book: BookRecord; revision: number }>("POST", "/library/books", { body: { book } }),
  update: (id: string, book: BookInput) =>
    apiRequest<{ book: BookRecord; revision: number }>("PUT", `/library/books/${encodeURIComponent(id)}`, { body: { book } }),
  remove: (id: string) => apiRequest<{ revision: number }>("DELETE", `/library/books/${encodeURIComponent(id)}`),
};

export const digestApi = {
  get: (year?: number) => apiRequest<ReadingDigest>("GET", "/digest", { query: { year } }),
};

export const shareApi = {
  publish: () => apiRequest<{ profile: BooklodProfile }>("POST", "/share"),
  stop: () => apiRequest<{ profile: BooklodProfile }>("DELETE", "/share"),
  view: (code: string) =>
    apiRequest<{ shelf: SharedShelf }>("GET", `/shared-shelves/${encodeURIComponent(code)}`, { auth: false }),
};

export const booksApi = {
  search: (title: string) => apiRequest<{ results: BookSearchResult[] }>("GET", "/books/search", { query: { title } }),
  editions: (workKey: string) => apiRequest<{ editions: BookEdition[] }>("GET", "/books/editions", { query: { workKey } }),
};

export const catalogApi = {
  plans: () => apiRequest<{ plans: Plan[] }>("GET", "/plans", { auth: false }),
  settings: () => apiRequest<{ settings: AppSettings }>("GET", "/settings", { auth: false }),
};

// Admin endpoints. The server checks public.admins on every call; hiding the
// screens in the app is only for convenience.
export const adminApi = {
  listUsers: (search: string, limit: number, offset: number) =>
    apiRequest<{ users: AdminUserSummary[]; total: number }>("GET", "/admin/users", { query: { search, limit, offset } }),
  getUser: (id: string) => apiRequest<{ user: AdminUserDetail }>("GET", `/admin/users/${encodeURIComponent(id)}`),
  createUser: (body: { email: string; password?: string; name?: string; planId?: string }) =>
    apiRequest<{ user: AdminUserDetail }>("POST", "/admin/users", { body }),
  updateUser: (id: string, body: Record<string, unknown>) =>
    apiRequest<{ user: AdminUserDetail }>("PATCH", `/admin/users/${encodeURIComponent(id)}`, { body }),
  deleteUser: (id: string) => apiRequest<void>("DELETE", `/admin/users/${encodeURIComponent(id)}`),

  listPlans: () => apiRequest<{ plans: AdminPlan[] }>("GET", "/admin/plans"),
  createPlan: (body: Record<string, unknown>) => apiRequest<{ plan: AdminPlan }>("POST", "/admin/plans", { body }),
  updatePlan: (id: string, body: Record<string, unknown>) =>
    apiRequest<{ plan: AdminPlan }>("PATCH", `/admin/plans/${encodeURIComponent(id)}`, { body }),
  deletePlan: (id: string) => apiRequest<void>("DELETE", `/admin/plans/${encodeURIComponent(id)}`),

  getSettings: () => apiRequest<{ settings: AppSettings }>("GET", "/admin/settings"),
  updateSettings: (body: Partial<AppSettings>) => apiRequest<{ settings: AppSettings }>("PATCH", "/admin/settings", { body }),
};
