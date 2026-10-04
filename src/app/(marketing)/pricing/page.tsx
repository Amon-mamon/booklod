import type { Metadata } from "next";
import { PricingPage } from "@/features/marketing/components/pricing-page";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple pricing. Buy room for your shelf once, or go unlimited with Plus.",
};

export default function Page() {
  return <PricingPage />;
}
