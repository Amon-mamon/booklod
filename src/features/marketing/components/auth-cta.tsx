"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/features/auth/context/auth-provider";

interface AuthCtaProps {
  authedLabel: string;
  guestLabel: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Primary call-to-action that adapts to auth state: signed-in visitors go
 * straight to the library, everyone else to sign-in. While the session is
 * still loading it renders the guest variant (which self-corrects: /signin
 * forwards signed-in users to the app).
 */
export function AuthCta({ authedLabel, guestLabel, className, style }: AuthCtaProps) {
  const { profile } = useAuth();
  return (
    <Link href={profile ? ROUTES.app.library : ROUTES.signIn} className={className} style={style}>
      {profile ? authedLabel : guestLabel}
    </Link>
  );
}
