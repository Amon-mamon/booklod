# Booklod

Personal book tracker — Next.js (App Router) · TypeScript (strict) · Tailwind CSS v4.

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck && npm run lint && npm run build
```

## Architecture: feature-based

```
src/
├── app/                      Routing only — thin files that render a feature screen
│   ├── (marketing)/          /, /about, /pricing, /blog, /privacy, /terms (header + footer layout)
│   ├── signin/               /signin
│   ├── app/                  Authenticated area (guarded layout): /app/library, /digest, /profile,
│   │                         /books/new, /books/[id], /books/[id]/edit
│   └── api/shelves/[code]/   Shared-shelf API (GET / PUT / DELETE)
├── features/                 Everything about one domain lives together
│   ├── auth/                 AuthProvider, RequireAuth, sign-in UI, demo auth service
│   ├── books/                types, constants, BooksProvider, hooks, Open Library client, form + cards
│   ├── digest/               pure stat computation (lib/) + presentational chart/cards
│   ├── profile/              settings screen, modals, plan + sharing + delete-account hooks
│   ├── sharing/              share-code + snapshot validation, client for the shelves API
│   ├── marketing/            public pages, header/footer, sample data
│   └── app-shell/            authenticated chrome (header, tab bar)
├── components/ui/            Shared primitives (Modal, ConfirmModal, Toast, Pill, FormField …)
├── providers/                App-wide providers (toast, composed AppProviders)
├── lib/                      Cross-feature utilities (storage, image compression, date, id)
├── config/                   brand tokens + ROUTES (single source of truth for URLs)
└── server/                   Server-only code (shelf store)
```

Conventions
- **Dependency direction:** `app → features → components/lib/config`. Features may import another
  feature's *types/constants/hooks* (e.g. profile → books), never its internal components.
- **Screens vs. views:** `*-screen.tsx` wires context/router to a presentational component.
- **Logic out of JSX:** form state is in `useBookForm`, search in `useBookSearch`, digest math in `buildDigest`.
- **Persistence behind interfaces:** components never touch storage; they use repositories
  (`booksRepository`, `profileRepository`) over `lib/storage`.
- Server Components by default; `"use client"` only where state/effects/router are needed.

## Behaviour changes vs. the single-file SPA

| Area | Before | Now |
| --- | --- | --- |
| Routing | hash router + module-level scroll hack | real routes; `/#preview` / `/#features` native anchors |
| Book detail / add / edit | in-memory sub-views | URL-addressable, back button works, deep links work |
| "Lend it" | set state on a copy | `/app/books/:id/edit?lend=1` (still not saved until you press Save) |
| Storage | `window.storage` (Claude-artifact-only API) | `localStorage` via `KeyValueStorage` adapter (same keys) |
| Shared shelf | artifact shared storage | `/api/shelves/[code]` route + **in-memory dev store** |
| Hero image | 216 KB base64 string in JS | `public/images/hero.webp` via `next/image` |
| Font | injected `<link>` in an effect | `next/font` (self-hosted, no layout shift) |
| Share codes | `Math.random` | `crypto.getRandomValues` |
| Digest dates | `new Date("YYYY-MM-DD")` (UTC off-by-one for users west of UTC) | parsed from the string |
| Account deletion | cleared local data | also unpublishes a shared shelf |
| Modals | 7 copies of the backdrop markup, no Esc | one `Modal`, Esc closes |

## Before shipping (known demo seams)

1. **Auth is simulated** — `features/auth/services/demo-auth.ts`. Swap in Auth.js / Clerk / Supabase and
   enforce `/app/*` in `middleware.ts` (the client `RequireAuth` guard is UX, not security).
2. **Shelf store is in-memory** — `server/shelf-store.ts`. Implement `ShelfStore` with Redis/KV/DB.
   The PUT/DELETE endpoints are also unauthenticated (see TODO in the route) and need an owner check.
3. **Data is local to the browser.** Books/profile live in `localStorage`; add an API + DB for sync.
4. **Payments are simulated** (`UpgradePlusModal`, `usePlanActions`).
5. **Feedback form** posts nowhere yet.
6. Optional: move brand colours from inline styles to Tailwind theme tokens, and add tests for
   `buildDigest`, `filterBooks`, `scoreBookDoc`, `parseSharePayload` (all pure, easy to test).
