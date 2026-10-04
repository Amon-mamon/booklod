import type { Metadata } from "next";
import { Shield } from "lucide-react";
import { PlaceholderPage } from "@/features/marketing/components/placeholder-page";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function Page() {
  return (
    <PlaceholderPage
      icon={Shield}
      title="Privacy Policy"
      message="This preview doesn't have a published privacy policy yet — check back soon."
    />
  );
}
