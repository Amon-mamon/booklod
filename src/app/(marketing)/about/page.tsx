import type { Metadata } from "next";
import { AboutPage } from "@/features/marketing/components/about-page";

export const metadata: Metadata = {
  title: "About",
  description: "The story behind Booklod — a simple personal book tracker built for readers.",
};

export default function Page() {
  return <AboutPage />;
}
