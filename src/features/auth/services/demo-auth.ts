import { DEFAULT_NOTIFICATIONS, type Profile, type SignInProvider } from "../types";

const DEMO_LATENCY_MS = 700;

/**
 * DEMO ONLY — simulates an SSO round trip and fabricates a profile.
 * This is the seam to replace with a real provider (Auth.js, Clerk, Supabase…).
 * Once real auth lands, protect `/app/*` in `middleware.ts` instead of (or in
 * addition to) the client-side <RequireAuth /> guard.
 */
export async function demoSignIn(provider: SignInProvider): Promise<Profile> {
  await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
  const name = "Alex Rivera";
  return {
    name,
    email: provider === "Google" ? "alex.rivera@gmail.com" : "alex.rivera@icloud.com",
    provider,
    avatarInitial: name[0],
    photoUrl: "",
    notifications: DEFAULT_NOTIFICATIONS,
    plan: "starter",
    shareEnabled: false,
    shareCode: "",
  };
}
