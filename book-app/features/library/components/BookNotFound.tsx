"use client";
import { useRouter } from "next/navigation";
import { C } from "../../../app/components/theme";

export function BookNotFound() {
  const router = useRouter();
  return (
    <div className="max-w-xl mx-auto text-center py-16">
      <p className="text-sm" style={{ color: C.muted }}>This book isn&apos;t in your library.</p>
      <button onClick={() => router.push("/app/library")} className="text-sm font-medium mt-4" style={{ color: C.green }}>
        ← Back to library
      </button>
    </div>
  );
}
