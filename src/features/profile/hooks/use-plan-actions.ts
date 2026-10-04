"use client";

import { useCallback } from "react";
import { useAuth } from "@/features/auth/context/auth-provider";
import type { Profile } from "@/features/auth/types";
import { unpublishSharedShelf } from "@/features/sharing/services/shared-shelf-client";
import { useToast } from "@/providers/toast-provider";

/** Plus subscription actions (simulated — no real payments). */
export function usePlanActions(profile: Profile) {
  const { updateProfile } = useAuth();
  const { showToast } = useToast();

  const upgrade = useCallback(async () => {
    await updateProfile({ plan: "plus" });
    showToast("Welcome to Booklod Plus!");
  }, [updateProfile, showToast]);

  const cancel = useCallback(async () => {
    if (profile.shareEnabled && profile.shareCode) await unpublishSharedShelf(profile.shareCode);
    await updateProfile({ plan: "starter", shareEnabled: false });
    showToast("Plus canceled — you're back on Starter");
  }, [profile.shareEnabled, profile.shareCode, updateProfile, showToast]);

  return { upgrade, cancel };
}
