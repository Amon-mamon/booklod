"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchBooks, type OpenLibraryDoc } from "../services/open-library";

export type SearchState = "idle" | "searching" | "results" | "empty" | "error";

const SEARCH_MIN_CHARS = 5;
const DEBOUNCE_MS = 400;

/**
 * Debounced Open Library title search.
 * - Cancels in-flight requests when the title changes (no stale results).
 * - `dismissFor(title)` closes the dropdown and suppresses the search that
 *   would otherwise fire when a suggestion is applied to the title field.
 */
export function useBookSearch(title: string, enabled: boolean) {
  const [suggestions, setSuggestions] = useState<OpenLibraryDoc[]>([]);
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [isOpen, setIsOpen] = useState(false);
  const suppressedTitleRef = useRef<string | null>(null);

  useEffect(() => {
    if (suppressedTitleRef.current === title) return;
    suppressedTitleRef.current = null;

    if (!enabled || title.trim().length < SEARCH_MIN_CHARS) {
      setSuggestions([]);
      setSearchState("idle");
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearchState("searching");
      setIsOpen(true);
      try {
        const ranked = await searchBooks(title, controller.signal);
        setSuggestions(ranked);
        setSearchState(ranked.length ? "results" : "empty");
      } catch {
        if (controller.signal.aborted) return;
        setSuggestions([]);
        setSearchState("error");
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [title, enabled]);

  const open = useCallback(() => {
    if (searchState !== "idle") setIsOpen(true);
  }, [searchState]);

  const close = useCallback(() => setIsOpen(false), []);

  const dismissFor = useCallback((nextTitle: string) => {
    suppressedTitleRef.current = nextTitle;
    setIsOpen(false);
    setSuggestions([]);
    setSearchState("idle");
  }, []);

  return { suggestions, searchState, isOpen, open, close, dismissFor };
}
