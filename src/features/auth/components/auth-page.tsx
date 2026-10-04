"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";
import { colors } from "@/config/brand";
import { ROUTES } from "@/config/routes";
import type { SignInProvider } from "../types";
import { AppleIcon, GoogleIcon } from "./provider-icons";

interface AuthPageProps {
  onSignIn: (provider: SignInProvider) => void;
  signingIn: SignInProvider | null;
}

export function AuthPage({ onSignIn, signingIn }: AuthPageProps) {
  return (
    <div
      style={{ background: colors.cream }}
      className="min-h-dvh flex flex-col items-center justify-center px-4 py-16"
    >
      <div className="w-full max-w-sm text-center">
        <LogoMark size={44} />
        <h1 className="text-xl font-bold mt-3" style={{ color: colors.navy }}>
          Welcome to Booklod
        </h1>
        <p className="text-sm mt-1.5" style={{ color: colors.muted }}>
          Your books. Your reading. Your archive.
        </p>

        <div className="space-y-3 mt-8 text-left">
          <button
            type="button"
            onClick={() => onSignIn("Google")}
            disabled={!!signingIn}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl py-3 text-sm font-medium bg-white disabled:opacity-60"
            style={{ border: `1px solid ${colors.tan}`, color: colors.navy }}
          >
            {signingIn === "Google" ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => onSignIn("Apple")}
            disabled={!!signingIn}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl py-3 text-sm font-medium text-white disabled:opacity-60"
            style={{ background: colors.navy }}
          >
            {signingIn === "Apple" ? <Loader2 size={16} className="animate-spin" /> : <AppleIcon />}
            Continue with Apple
          </button>
        </div>

        <p className="text-xs mt-5" style={{ color: colors.faint }}>
          Demo sign-in for this preview — no real Google or Apple account is accessed.
        </p>

        <Link
          href={ROUTES.home}
          className="inline-block text-sm font-medium mt-8"
          style={{ color: colors.green }}
        >
          ← Back to Booklod
        </Link>
      </div>
    </div>
  );
}
