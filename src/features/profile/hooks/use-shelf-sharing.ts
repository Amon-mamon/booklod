"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/features/auth/context/auth-provider";
import type { Profile } from "@/features/auth/types";
import { useBooks } from "@/features/books/context/books-provider";
import { generateShareCode } from "@/features/sharing/lib/share-code";
import { publishSharedShelf, unpublishSharedShelf } from "@/features/sharing/services/shared-shelf-client";
import { useToast } from "@/providers/toast-provider";

const COPIED_FLASH_MS = 1500;

/** "Share Your Shelf" (Plus): publish / unpublish / refresh / copy code. */
export function useShelfSharing(profile: Profile) {
  const { updateProfile } = useAuth();
  const { books } = useBooks();
  const { showToast } = useToast();
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const toggleShare = useCallback(async () => {
    setSharing(true);
    if (!profile.shareEnabled) {
      const code = profile.shareCode || generateShareCode();
      await publishSharedShelf(code, profile.name, books);
      await updateProfile({ shareEnabled: true, shareCode: code });
      showToast("Shelf sharing turned on");
    } else {
      if (profile.shareCode) await unpublishSharedShelf(profile.shareCode);
      await updateProfile({ shareEnabled: false });
      showToast("Shelf sharing turned off");
    }
    setSharing(false);
  }, [profile.shareEnabled, profile.shareCode, profile.name, books, updateProfile, showToast]);

  const refreshShare = useCallback(async () => {
    if (!profile.shareCode) return;
    setSharing(true);
    await publishSharedShelf(profile.shareCode, profile.name, books);
    setSharing(false);
    showToast("Shared shelf refreshed");
  }, [profile.shareCode, profile.name, books, showToast]);

  const copyCode = useCallback(() => {
    if (!profile.shareCode) return;
    navigator.clipboard?.writeText(profile.shareCode).catch(() => {});
    setCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), COPIED_FLASH_MS);
  }, [profile.shareCode]);

  return { sharing, copied, toggleShare, refreshShare, copyCode };
}
