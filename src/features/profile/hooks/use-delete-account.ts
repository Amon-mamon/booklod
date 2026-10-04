"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/features/auth/context/auth-provider";
import type { Profile } from "@/features/auth/types";
import { useBooks } from "@/features/books/context/books-provider";
import { deleteAccountData } from "../services/account-service";

export function useDeleteAccount(profile: Profile) {
  const router = useRouter();
  const { clearProfile } = useAuth();
  const { reset } = useBooks();

  return useCallback(async () => {
    await deleteAccountData(profile);
    reset();
    clearProfile();
    router.replace(ROUTES.home);
  }, [profile, reset, clearProfile, router]);
}
