"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { colors } from "@/config/brand";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/features/auth/context/auth-provider";

interface PricingCardProps {
  badge?: string;
  badgeColor?: string;
  name: string;
  price: string;
  priceNote?: string;
  subtext: string;
  features: string[];
  cta: string;
  onCta: () => void;
  highlight?: boolean;
}

function PricingCard({ badge, badgeColor, name, price, priceNote, subtext, features, cta, onCta, highlight }: PricingCardProps) {
  return (
    <div
      className="relative rounded-3xl p-6 sm:p-7 flex flex-col"
      style={{
        background: highlight ? colors.navy : "white",
        border: highlight ? "none" : `1px solid ${colors.tan}`,
        boxShadow: highlight ? "0 20px 40px -12px rgba(27,42,58,0.35)" : "none",
      }}
    >
      {badge && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[11px] font-semibold text-white whitespace-nowrap"
          style={{ background: badgeColor }}
        >
          {badge}
        </span>
      )}
      <h3 className="text-lg font-bold" style={{ color: highlight ? "white" : colors.navy }}>{name}</h3>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-3xl sm:text-4xl font-bold" style={{ color: highlight ? "white" : colors.navy }}>{price}</span>
        {priceNote && (
          <span className="text-sm" style={{ color: highlight ? "#B9C2C9" : colors.muted }}>{priceNote}</span>
        )}
      </div>
      <p className="text-sm mt-1.5" style={{ color: highlight ? "#B9C2C9" : colors.muted }}>{subtext}</p>

      <ul className="mt-5 space-y-2.5 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm" style={{ color: highlight ? "white" : colors.navy }}>
            <Check size={15} style={{ color: highlight ? colors.orange : colors.green, marginTop: 2, flexShrink: 0 }} />
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={onCta}
        className="mt-6 w-full rounded-full py-3 text-sm font-semibold whitespace-nowrap"
        style={{
          background: highlight ? colors.orange : colors.navyT,
          color: highlight ? "white" : colors.navy,
        }}
      >
        {cta}
      </button>
    </div>
  );
}

export function PricingPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [yearly, setYearly] = useState(false);
  const isPlus = profile?.plan === "plus";

  function goStart(target: string) {
    router.push(profile ? target : ROUTES.signIn);
  }

  return (
    <div>
      <section className="px-4 sm:px-6 pt-14 sm:pt-20 pb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: colors.navy }}>
          Simple pricing. Your books, always yours.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed" style={{ color: colors.muted }}>
          Buy room for your shelf once, or go unlimited with Plus. Either way — canceling or
          running low on slots never removes a book you already added.
        </p>

        <div className="inline-flex items-center gap-1 rounded-full p-1 mt-8" style={{ background: colors.navyT }}>
          <button
            onClick={() => setYearly(false)}
            className="rounded-full px-4 py-1.5 text-xs font-semibold transition"
            style={{ background: !yearly ? "white" : "transparent", color: colors.navy }}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className="rounded-full px-4 py-1.5 text-xs font-semibold transition"
            style={{ background: yearly ? "white" : "transparent", color: colors.navy }}
          >
            Yearly <span style={{ color: colors.green }}>· save 25%</span>
          </button>
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 items-start pt-4">
          <PricingCard
            name="Starter"
            price="₱99"
            priceNote="one-time"
            subtext="20 permanent book slots"
            features={[
              "All core tracking — read status, ownership, notes",
              "Title search & auto-fill",
              "Reading digest & Books by Month",
              "Slots never expire, never re-billed",
            ]}
            cta="Get Starter"
            onCta={() => goStart(ROUTES.app.library)}
          />
          <PricingCard
            badge="MOST FLEXIBLE"
            badgeColor={colors.green}
            highlight
            name="Booklod Plus"
            price={yearly ? "₱899" : "₱99"}
            priceNote={yearly ? "/year" : "/month"}
            subtext={yearly ? "≈ ₱75/month, billed yearly" : "Cancel anytime"}
            features={[
              "Unlimited book slots",
              "Cover photos synced across devices",
              "Full digest history & export",
              "Share Your Shelf — invite-only, no public feed",
              "Coming soon: shareable digest cards, reading streaks",
            ]}
            cta={isPlus ? "You're on Plus" : "Get Plus"}
            onCta={() => {
              if (isPlus) return;
              router.push(profile ? ROUTES.app.profile : ROUTES.signIn);
            }}
          />
          <PricingCard
            name="Capacity Pack"
            price="₱349"
            priceNote="one-time"
            subtext="+100 permanent slots — stack as many as you need"
            features={[
              "Same core tracking as Starter",
              "Cheapest way to grow past 20 books",
              "Stackable — buy again anytime",
              "No subscription required",
            ]}
            cta="Add Capacity"
            onCta={() => goStart(ROUTES.app.library)}
          />
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-2xl mx-auto rounded-2xl p-5 sm:p-6" style={{ background: colors.greenT }}>
          <p className="text-sm font-semibold mb-1" style={{ color: colors.navy }}>
            Honest math, since we did it ourselves first
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#2E4A3B" }}>
            Stacking Capacity Packs is cheaper than Plus if all you need is storage — Plus only
            pays for itself once you actually want your cover photos following you across devices,
            full digest export, or shelf sharing. We'd rather you pick the one that fits, not the
            one that sounds bigger.
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-20">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs" style={{ color: colors.faint }}>
            This preview simulates purchases and subscriptions for demo purposes — no real payment
            is processed. Prices shown in Philippine pesos.
          </p>
        </div>
      </section>
    </div>
  );
}
