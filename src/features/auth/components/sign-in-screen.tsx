"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui/page-loader";
import { ROUTES } from "@/config/routes";
import { useAuth } from "../context/auth-provider";
import type { SignInProvider } from "../types";
import { AuthPage } from "./auth-page";

export function SignInScreen() {
  const { profile, status, signIn } = useAuth();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState<SignInProvider | null>(null);

  // Already signed in (or just finished signing in) — continue into the app.
  useEffect(() => {
    if (status === "ready" && profile) router.replace(ROUTES.app.library);
  }, [status, profile, router]);

  async function handleSignIn(provider: SignInProvider) {
    setSigningIn(provider);
    await signIn(provider);
    setSigningIn(null);
  }

  if (status === "loading" || profile) return <PageLoader />;
  return <AuthPage onSignIn={handleSignIn} signingIn={signingIn} />;
}
