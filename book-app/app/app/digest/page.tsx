"use client";
import { useApp } from "../../../features/app/AppShell";
import { Digest } from "../../../features/library/components/ReadingDigest";

export default function DigestRoute() {
  return <Digest books={useApp().books} />;
}
