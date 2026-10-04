"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchEditions, type EditionOption } from "../services/open-library";

/** Loads the alternative editions of a work; cancels on re-load / unmount. */
export function useEditionOptions() {
  const [options, setOptions] = useState<EditionOption[]>([]);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const clear = useCallback(() => {
    controllerRef.current?.abort();
    setOptions([]);
    setLoading(false);
  }, []);

  const load = useCallback(async (workKey: string) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setOptions([]);
    setLoading(true);
    try {
      const editions = await fetchEditions(workKey, controller.signal);
      if (!controller.signal.aborted) setOptions(editions);
    } catch {
      /* editions are a nice-to-have; ignore failures */
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  return { options, loading, load, clear };
}
