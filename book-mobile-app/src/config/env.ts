// Expo inlines EXPO_PUBLIC_* variables at build time. See .env.example.
// They must be referenced as literal `process.env.EXPO_PUBLIC_X` for inlining to work.
export const env = {
  apiUrl: (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/+$/, ""),
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
  webUrl: (process.env.EXPO_PUBLIC_WEB_URL || process.env.EXPO_PUBLIC_API_URL || "").replace(/\/+$/, ""),
};

export const configurationError =
  !env.apiUrl || !env.supabaseUrl || !env.supabaseAnonKey
    ? "Booklod is not configured. Copy .env.example to .env.local, fill in EXPO_PUBLIC_API_URL, EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY, then restart Expo."
    : "";
