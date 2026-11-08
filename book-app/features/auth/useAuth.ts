"use client";

import { createContext, createElement, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "../../lib/supabase/client";
import { getErrorMessage, type AuthMethod } from "../shared/types";

type OAuthProvider = Exclude<AuthMethod, "Email">;

function useAuthState() {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);
  const [authReady, setAuthReady] = useState(!configured);
  const [signingIn, setSigningIn] = useState<AuthMethod | null>(null);
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const configurationError = configured
    ? ""
    : "Supabase is not configured. Copy .env.example to .env.local, add your project URL and anon key, then restart the dev server.";

  useEffect(() => {
    let active = true;

    if (!configured) {
      return () => {
        active = false;
      };
    }

    const supabase = getSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setAuthError("");
      // Supabase re-emits SIGNED_IN / TOKEN_REFRESHED when the tab regains focus.
      // Keep the same user object when nothing about the user changed, so the
      // app doesn't reload all data, and never flip back into a loading state
      // here (nothing would ever turn it off again).
      const next = session?.user || null;
      setUser((prev) =>
        prev && next && prev.id === next.id && prev.updated_at === next.updated_at ? prev : next,
      );
    });

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) throw error;
        if (active) {
          setUser(data.session?.user || null);
          setLoading(Boolean(data.session?.user));
        }
      })
      .catch((error: unknown) => {
        if (active) setAuthError(getErrorMessage(error, "Unable to check your sign-in session."));
      })
      .finally(() => {
        if (active) {
          setAuthReady(true);
          setLoading(false);
        }
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [configured]);

  const signInWithProvider = useCallback(async (provider: OAuthProvider) => {
    setSigningIn(provider);
    setAuthError("");
    setAuthMessage("");
    try {
      const { error } = await getSupabaseClient().auth.signInWithOAuth({
        provider: provider === "Google" ? "google" : "apple",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (error: unknown) {
      setAuthError(getErrorMessage(error, `Unable to sign in with ${provider}.`));
      setSigningIn(null);
    }
  }, []);

  const authenticateWithEmail = useCallback(
    async (email: string, password: string, isSignUp: boolean) => {
      setSigningIn("Email");
      setAuthError("");
      setAuthMessage("");
      try {
        const supabase = getSupabaseClient();
        const { data, error } = isSignUp
          ? await supabase.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: window.location.origin },
            })
          : await supabase.auth.signInWithPassword({ email, password });

        if (error) throw error;
        if (isSignUp && !data.session) {
          setAuthMessage("Check your email to confirm your account, then sign in.");
        }
      } catch (error: unknown) {
        setAuthError(
          getErrorMessage(error, "Unable to authenticate with that email and password."),
        );
      } finally {
        setSigningIn(null);
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    const { error } = await getSupabaseClient().auth.signOut();
    if (error) throw error;
  }, []);

  return {
    user,
    loading,
    authReady,
    signingIn,
    authError,
    authMessage,
    configurationError,
    setAuthError,
    signInWithProvider,
    authenticateWithEmail,
    signOut,
  };
}

type AuthState = ReturnType<typeof useAuthState>;
const AuthContext = createContext<AuthState | null>(null);

// One auth subscription for the whole site, so moving between pages never re-checks the session.
export function AuthProvider({ children }: { children: ReactNode }) {
  return createElement(AuthContext.Provider, { value: useAuthState() }, children);
}

export function useAuth(): AuthState {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useAuth must be used inside <AuthProvider>.");
  return auth;
}
