import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { catalogApi, profileApi, shareApi } from "@/api/endpoints";
import { queryKeys } from "@/features/library/hooks/useLibrary";
import type { BooklodProfile, ProfilePatch } from "@/types/booklod";

export function useProfile(enabled = true) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: async () => {
      const { profile, isAdmin } = await profileApi.get();
      queryClient.setQueryData(IS_ADMIN_KEY, isAdmin === true);
      return profile;
    },
    enabled,
  });
}

export const IS_ADMIN_KEY = ["isAdmin"] as const;

/** Filled in by useProfile from GET /me. Only used to show the admin entry. */
export function useIsAdmin(): boolean {
  const { data } = useQuery<boolean>({ queryKey: IS_ADMIN_KEY, queryFn: () => false, enabled: false });
  return data === true;
}

/** Public plan catalogue (prices are edited by admins). */
export function usePlans() {
  return useQuery({ queryKey: ["plans"], queryFn: async () => (await catalogApi.plans()).plans, staleTime: 5 * 60_000 });
}

/** Public app settings (announcement banner, support email). */
export function useAppSettings() {
  return useQuery({ queryKey: ["settings"], queryFn: async () => (await catalogApi.settings()).settings, staleTime: 5 * 60_000 });
}

export function formatPrice(plan: { priceCents: number; currency: string }): string {
  const amount = plan.priceCents / 100;
  try {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: plan.currency,
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${plan.currency} ${amount}`;
  }
}

export function intervalLabel(interval: string): string {
  return interval === "month" ? "/month" : interval === "year" ? "/year" : " one-time";
}

function useSetProfile() {
  const queryClient = useQueryClient();
  return (profile: BooklodProfile) => queryClient.setQueryData(queryKeys.profile, profile);
}

export function useUpdateProfile() {
  const setProfile = useSetProfile();
  return useMutation({
    mutationFn: (patch: ProfilePatch) => profileApi.update(patch),
    onSuccess: ({ profile }) => setProfile(profile),
  });
}

export function useShareShelf() {
  const setProfile = useSetProfile();
  return useMutation({
    mutationFn: (action: "publish" | "stop") => (action === "publish" ? shareApi.publish() : shareApi.stop()),
    onSuccess: ({ profile }) => setProfile(profile),
  });
}

// No cache clear here: clearing while the Profile screen is mounted would
// refetch GET /me and recreate the profile. The caller signs out next, and
// AuthProvider clears the cache when the session ends.
export function useDeleteAccountData() {
  return useMutation({ mutationFn: () => profileApi.deleteData() });
}
