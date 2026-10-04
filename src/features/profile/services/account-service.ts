import { profileRepository } from "@/features/auth/services/profile-repository";
import { booksRepository } from "@/features/books/services/books-repository";
import { unpublishSharedShelf } from "@/features/sharing/services/shared-shelf-client";
import type { Profile } from "@/features/auth/types";

/**
 * Permanently removes everything tied to the account (library, reading
 * history, profile). Only touches Booklod data — not the user's Google/Apple
 * account. Also takes down a published shared shelf so no data is left public.
 */
export async function deleteAccountData(profile: Profile): Promise<void> {
  if (profile.shareEnabled && profile.shareCode) {
    await unpublishSharedShelf(profile.shareCode);
  }
  await Promise.all([booksRepository.clear(), profileRepository.clear()]);
}
