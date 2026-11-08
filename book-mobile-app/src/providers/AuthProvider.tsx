import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { configurationError } from "@/config/env";
import { supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

export type OAuthProvider = "google" | "apple";

interface AuthContextValue {
  session: Session | null;
  ready: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<{ needsConfirmation: boolean }>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Add this URL to Supabase > Authentication > URL Configuration > Redirect URLs.
export const authRedirectUrl = Linking.createURL("auth/callback");

// While signInWithOAuth is exchanging its code, the deep link can also reach
// the /auth/callback route (Android). The route must not exchange the same
// PKCE code a second time.
let oauthInFlight = false;
export const isOAuthInFlight = () => oauthInFlight;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(Boolean(configurationError));
  const queryClient = useQueryClient();
  const userIdRef = useRef<string | null | undefined>(undefined);

  // Cached data belongs to one user. Drop it whenever the user changes or the
  // session ends for any reason (sign-out, expiry, revoked elsewhere).
  useEffect(() => {
    const userId = session?.user.id ?? null;
    if (userIdRef.current !== undefined && userIdRef.current !== userId) queryClient.clear();
    userIdRef.current = userId;
  }, [session, queryClient]);

  useEffect(() => {
    if (configurationError) return;
    let active = true;
    supabase.auth
      .getSession()
      .then(({ data }) => active && setSession(data.session))
      .finally(() => active && setReady(true));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: authRedirectUrl },
    });
    if (error) throw error;
    return { needsConfirmation: !data.session };
  }, []);

  const signInWithOAuth = useCallback(async (provider: OAuthProvider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: authRedirectUrl, skipBrowserRedirect: true },
    });
    if (error) throw error;
    if (!data.url) throw new Error("Couldn't start sign-in. Please try again.");

    oauthInFlight = true;
    try {
      const result = await WebBrowser.openAuthSessionAsync(data.url, authRedirectUrl);
      if (result.type !== "success") return; // user cancelled

      const { queryParams } = Linking.parse(result.url);
      const authError = queryParams?.error_description || queryParams?.error;
      if (authError) throw new Error(String(authError));
      const code = queryParams?.code;
      if (typeof code !== "string") throw new Error("Sign-in did not return an authorization code.");
      const exchange = await supabase.auth.exchangeCodeForSession(code);
      if (exchange.error) throw exchange.error;
    } finally {
      oauthInFlight = false;
    }
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const value = useMemo(
    () => ({ session, ready, signInWithEmail, signUpWithEmail, signInWithOAuth, signOut }),
    [session, ready, signInWithEmail, signUpWithEmail, signInWithOAuth, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>.");
  return ctx;
}
