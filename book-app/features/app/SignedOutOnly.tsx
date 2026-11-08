"use client";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { C } from "../../app/components/theme";
import { useAuth } from "../auth/useAuth";

// Landing, marketing and sign-in pages: signed-in users go straight to the app.
export function SignedOutOnly({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, authReady } = useAuth();
  useEffect(() => {
    if (authReady && user) router.replace("/app/library");
  }, [authReady, user, router]);

  if (!authReady || user) {
    return (
      <div style={{ background: C.cream }} className="w-full min-h-full flex items-center justify-center py-24">
        <Loader2 className="animate-spin" style={{ color: C.green }} size={22} />
      </div>
    );
  }
  return <>{children}</>;
}
