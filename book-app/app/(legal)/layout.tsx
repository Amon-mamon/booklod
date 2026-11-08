"use client";
import { PublicLayout } from "../../features/marketing/components/PublicLayout";
import { useAuth } from "../../features/auth/useAuth";

// Privacy and terms are for everyone; signed-in users get a "Back to app" header.
export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return <PublicLayout signedIn={Boolean(user)}>{children}</PublicLayout>;
}
