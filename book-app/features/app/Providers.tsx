"use client";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider } from "../auth/useAuth";
import { useGoogleFont } from "../shared/shared";

export function Providers({ children }: { children: ReactNode }) {
  useGoogleFont();
  const router = useRouter();
  // Old links used hash routes (/#/app/library); send them to the real path.
  useEffect(() => {
    if (window.location.hash.startsWith("#/")) router.replace(window.location.hash.slice(1));
  }, [router]);
  return <AuthProvider>{children}</AuthProvider>;
}
