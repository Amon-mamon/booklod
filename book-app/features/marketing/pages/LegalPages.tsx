"use client";
import { Shield, FileText } from "lucide-react";
import { C } from "../../../app/components/theme";
import type { LucideIcon } from "lucide-react";



// ---------------------------------------------------------------------------
// Legal placeholders — honest "not published yet" pages rather than
// fabricated legal text, matching the Blog page's pattern.
// ---------------------------------------------------------------------------
export function LegalPlaceholderPage({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <section className="px-4 sm:px-6 py-16 sm:py-24 text-center">
      <div className="max-w-md mx-auto">
        <div
          className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: C.greenT }}
        >
          <Icon size={20} style={{ color: C.green }} />
        </div>
        <h1 className="text-xl font-semibold" style={{ color: C.navy }}>{title}</h1>
        <p className="text-sm mt-2" style={{ color: C.muted }}>
          This preview doesn&apos;t have a published {title.toLowerCase()} yet — check back soon.
        </p>
      </div>
    </section>
  );
}


export function PrivacyPage() {
  return <LegalPlaceholderPage icon={Shield} title="Privacy Policy" />;
}


export function TermsPage() {
  return <LegalPlaceholderPage icon={FileText} title="Terms of Service" />;
}
