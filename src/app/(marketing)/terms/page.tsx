import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { PlaceholderPage } from "@/features/marketing/components/placeholder-page";

export const metadata: Metadata = { title: "Terms of Service" };

export default function Page() {
  return (
    <PlaceholderPage
      icon={FileText}
      title="Terms of Service"
      message="This preview doesn't have a published terms of service yet — check back soon."
    />
  );
}
