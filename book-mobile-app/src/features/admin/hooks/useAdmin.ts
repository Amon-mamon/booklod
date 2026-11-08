import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/endpoints";
import type { AppSettings } from "@/types/booklod";

export const adminKeys = {
  users: (search: string, offset: number) => ["admin", "users", search, offset] as const,
  user: (id: string) => ["admin", "user", id] as const,
  plans: ["admin", "plans"] as const,
  settings: ["admin", "settings"] as const,
};

export const ADMIN_PAGE_SIZE = 25;

export function useAdminUsers(search: string, offset: number) {
  return useQuery({
    queryKey: adminKeys.users(search, offset),
    queryFn: () => adminApi.listUsers(search, ADMIN_PAGE_SIZE, offset),
  });
}

export function useAdminUser(id: string | undefined) {
  return useQuery({
    queryKey: adminKeys.user(id || ""),
    queryFn: async () => (await adminApi.getUser(id!)).user,
    enabled: Boolean(id && id !== "new"),
  });
}

export function useAdminPlans() {
  return useQuery({ queryKey: adminKeys.plans, queryFn: async () => (await adminApi.listPlans()).plans });
}

export function useAdminSettings() {
  return useQuery({ queryKey: adminKeys.settings, queryFn: async () => (await adminApi.getSettings()).settings });
}

/** Invalidates admin lists plus the public catalogue so price changes show up in the app. */
function useInvalidateAdmin() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin"] }),
      queryClient.invalidateQueries({ queryKey: ["plans"] }),
      queryClient.invalidateQueries({ queryKey: ["settings"] }),
      queryClient.invalidateQueries({ queryKey: ["profile"] }),
    ]);
}

export function useAdminMutation<TArgs, TResult>(fn: (args: TArgs) => Promise<TResult>) {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: fn, onSuccess: () => invalidate() });
}

export function useSaveSettings() {
  return useAdminMutation((patch: Partial<AppSettings>) => adminApi.updateSettings(patch));
}

export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(/\.00$/, "");
}

/** "129" or "129.50" -> 12900 / 12950. Null if not a valid amount. */
export function inputToCents(value: string): number | null {
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(value.trim())) return null;
  return Math.round(Number(value) * 100);
}
