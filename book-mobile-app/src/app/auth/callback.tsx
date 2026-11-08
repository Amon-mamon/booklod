import { useEffect, useState } from "react";
import { Redirect, useLocalSearchParams } from "expo-router";
import { LoadingView } from "@/components/ui/primitives";
import { supabase } from "@/lib/supabase";
import { isOAuthInFlight, useAuth } from "@/providers/AuthProvider";

// Deep links land here (booklod://auth/callback?code=...), e.g. from the
// email-confirmation link. OAuth sign-in exchanges its code in AuthProvider.
export default function AuthCallback() {
  const { session } = useAuth();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [exchangeFailed, setFailed] = useState(false);
  const failed = exchangeFailed || (!session && !code);

  useEffect(() => {
    if (session || !code) return;
    if (isOAuthInFlight()) {
      // AuthProvider is already exchanging this code; wait for the session.
      const timer = setTimeout(() => setFailed(true), 15_000);
      return () => clearTimeout(timer);
    }
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) setFailed(true);
    });
  }, [code, session]);

  if (session) return <Redirect href="/library" />;
  if (failed) return <Redirect href="/sign-in" />;
  return <LoadingView />;
}
