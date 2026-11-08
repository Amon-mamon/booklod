import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";
import { env } from "@/config/env";
import { secureStorage } from "@/lib/secure-storage";

// The mobile app signs in with Supabase Auth directly (same project as the
// web app) and sends the access token to the Booklod API as a Bearer token.
export const supabase = createClient(env.supabaseUrl || "https://not-configured.supabase.co", env.supabaseAnonKey || "missing", {
  auth: {
    // Native: encrypted Keychain/Keystore. Web: supabase-js default (localStorage).
    storage: Platform.OS === "web" ? undefined : secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: "pkce",
  },
});

// Only refresh tokens while the app is in the foreground.
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
