import type { ReactNode } from "react";
import { colors } from "@/config/brand";
import { SiteFooter } from "@/features/marketing/components/site-footer";
import { SiteHeader } from "@/features/marketing/components/site-header";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh" style={{ background: colors.cream }}>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
