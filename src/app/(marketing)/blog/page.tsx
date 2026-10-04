import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { PlaceholderPage } from "@/features/marketing/components/placeholder-page";

export const metadata: Metadata = { title: "Blog" };

export default function Page() {
  return (
    <PlaceholderPage
      icon={BookOpen}
      title="Blog"
      message="Nothing published yet — check back soon for reading tips and product updates."
    />
  );
}
