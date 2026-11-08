"use client";
import { BookOpen } from "lucide-react";
import { C } from "../../../app/components/theme";



// ---------------------------------------------------------------------------
// Blog page — placeholder; no fabricated posts
// ---------------------------------------------------------------------------
export function BlogPage() {
  return (
    <section className="px-4 sm:px-6 py-16 sm:py-24 text-center">
      <div className="max-w-md mx-auto">
        <div
          className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: C.greenT }}
        >
          <BookOpen size={20} style={{ color: C.green }} />
        </div>
        <h1 className="text-xl font-semibold" style={{ color: C.navy }}>Blog</h1>
        <p className="text-sm mt-2" style={{ color: C.muted }}>
          Nothing published yet — check back soon for reading tips and product updates.
        </p>
      </div>
    </section>
  );
}
