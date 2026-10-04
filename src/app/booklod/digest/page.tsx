import type { Metadata } from "next";
import { DigestScreen } from "@/features/digest/components/digest-screen";

export const metadata: Metadata = { title: "Digest" };

export default function Page() {
  return <DigestScreen />;
}
