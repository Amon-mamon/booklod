"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/features/auth/context/auth-provider";
import { ToastProvider } from "./toast-provider";

/** Providers needed on every page (public site + app). Books are scoped to /app. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
