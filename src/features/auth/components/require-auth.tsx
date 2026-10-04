"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui/page-loader";
import { ROUTES } from "@/config/routes";
import { useAuth } from "../context/auth-provider";

/**
 * Client-side route guard: the authenticated app is never shown to a
 * logged-out visitor — they're sent to the public homepage.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { profile, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "ready" && !profile) router.replace(ROUTES.home);
  }, [status, profile, router]);

  if (status === "loading" || !profile) return <PageLoader />;
  return <>{children}</>;
}
