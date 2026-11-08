"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { C } from "../../app/components/theme";
import { LogoMark } from "../../app/components/ui/LogoMark";
import { useRouter } from "next/navigation";
import type { AuthMethod } from "../shared/types";

interface AuthPageProps {
  onSignIn: (provider: Exclude<AuthMethod, "Email">) => void;
  onEmailAuth: (email: string, password: string, isSignUp: boolean) => Promise<void>;
  signingIn: AuthMethod | null;
  authError: string;
  authMessage: string;
  configurationError: string;
}

export function GoogleG() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.71v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.61z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 009 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 013.68 9c0-.59.1-1.17.27-1.7V4.97H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.03l2.99-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  );
}

export function AppleLogo() {
  return (
    <svg width="15" height="15" viewBox="0 0 384 512" fill="#fff">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141 0 184.8 0 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-57.7-90-57.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Auth page (Google / Apple SSO) — a dedicated page, not a modal
// ---------------------------------------------------------------------------
export function AuthPage({
  onSignIn,
  onEmailAuth,
  signingIn,
  authError,
  authMessage,
  configurationError,
}: AuthPageProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div style={{ background: C.cream }} className="min-h-full flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm text-center">
        <LogoMark size={44} />
        <h1 className="text-xl font-bold mt-3" style={{ color: C.navy }}>
          Welcome to Booklod
        </h1>
        <p className="text-sm mt-1.5" style={{ color: C.muted }}>
          Your books. Your reading. Your archive.
        </p>

        <div className="space-y-3 mt-8 text-left">
          <button
            onClick={() => onSignIn("Google")}
            disabled={!!signingIn || !!configurationError}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl py-3 text-sm font-medium bg-white disabled:opacity-60"
            style={{ border: `1px solid ${C.tan}`, color: C.navy }}
          >
            {signingIn === "Google" ? <Loader2 size={16} className="animate-spin" /> : <GoogleG />}
            Continue with Google
          </button>
          <button
            onClick={() => onSignIn("Apple")}
            disabled={!!signingIn || !!configurationError}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl py-3 text-sm font-medium text-white disabled:opacity-60"
            style={{ background: C.navy }}
          >
            {signingIn === "Apple" ? <Loader2 size={16} className="animate-spin" /> : <AppleLogo />}
            Continue with Apple
          </button>
        </div>

        <div className="my-6 flex items-center gap-3 text-xs" style={{ color: C.muted }}>
          <span className="h-px flex-1" style={{ background: C.tan }} />
          or continue with email
          <span className="h-px flex-1" style={{ background: C.tan }} />
        </div>
        <form
          className="space-y-3 text-left"
          onSubmit={(event) => {
            event.preventDefault();
            onEmailAuth(email, password, isSignUp);
          }}
        >
          <label className="block text-xs font-medium" style={{ color: C.navy }}>
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: C.tan }}
              disabled={!!signingIn || !!configurationError}
            />
          </label>
          <label className="block text-xs font-medium" style={{ color: C.navy }}>
            Password
            <input
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: C.tan }}
              disabled={!!signingIn || !!configurationError}
            />
          </label>
          <button
            type="submit"
            disabled={!!signingIn || !!configurationError}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: C.green }}
          >
            {signingIn === "Email" ? (
              <Loader2 size={16} className="mx-auto animate-spin" />
            ) : isSignUp ? (
              "Create account"
            ) : (
              "Sign in"
            )}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setIsSignUp((current) => !current)}
          className="mt-3 text-xs font-medium"
          style={{ color: C.green }}
        >
          {isSignUp ? "Already have an account? Sign in" : "New to Booklod? Create an account"}
        </button>
        {configurationError && (
          <p role="alert" className="mt-4 rounded-xl p-3 text-left text-xs" style={{ background: C.orangeT, color: C.navy }}>
            {configurationError}
          </p>
        )}
        {authError && (
          <p role="alert" className="mt-4 rounded-xl p-3 text-left text-xs" style={{ background: C.orangeT, color: C.navy }}>
            {authError}
          </p>
        )}
        {authMessage && (
          <p role="status" className="mt-4 rounded-xl p-3 text-left text-xs" style={{ background: C.greenT, color: C.navy }}>
            {authMessage}
          </p>
        )}

        <button
          onClick={() => router.push("/")}
          className="text-sm font-medium mt-8"
          style={{ color: C.green }}
        >
          ← Back to Booklod
        </button>
      </div>
    </div>
  );
}
