"use client";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { C } from "../../../app/components/theme";
import { useRouter } from "next/navigation";
import { formatPrice, loadPlans, loadSettings, type PublicPlan } from "../../profile/data/profile-repository";

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

// ---------------------------------------------------------------------------
// Pricing page
// ---------------------------------------------------------------------------
export function PricingCard({
  badge,
  badgeColor,
  name,
  price,
  priceNote,
  subtext,
  features,
  cta,
  onCta,
  highlight = false,
}: PricingCardProps) {
  return (
    <div
      className="relative rounded-3xl p-6 sm:p-7 flex flex-col"
      style={{
        background: highlight ? C.navy : "white",
        border: highlight ? "none" : `1px solid ${C.tan}`,
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
      <h3 className="text-lg font-bold" style={{ color: highlight ? "white" : C.navy }}>{name}</h3>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-3xl sm:text-4xl font-bold" style={{ color: highlight ? "white" : C.navy }}>{price}</span>
        {priceNote && (
          <span className="text-sm" style={{ color: highlight ? "#B9C2C9" : C.muted }}>{priceNote}</span>
        )}
      </div>
      <p className="text-sm mt-1.5" style={{ color: highlight ? "#B9C2C9" : C.muted }}>{subtext}</p>

      <ul className="mt-5 space-y-2.5 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm" style={{ color: highlight ? "white" : C.navy }}>
            <Check size={15} style={{ color: highlight ? C.orange : C.green, marginTop: 2, flexShrink: 0 }} />
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={onCta}
        className="mt-6 w-full rounded-full py-3 text-sm font-semibold whitespace-nowrap"
        style={{
          background: highlight ? C.orange : C.navyT,
          color: highlight ? "white" : C.navy,
        }}
      >
        {cta}
      </button>
    </div>
  );
}


export function PricingPage() {
  const router = useRouter();
  const [yearly, setYearly] = useState(false);
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [footnote, setFootnote] = useState("");

  // Prices, names and features are edited by admins in the plans table.
  // The hard-coded values below are only a fallback if it can't be reached.
  useEffect(() => {
    let active = true;
    loadPlans().then((next) => active && setPlans(next)).catch(() => undefined);
    loadSettings().then((next) => active && setFootnote(next.pricing_footnote)).catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const byId = (id: string) => plans.find((p) => p.id === id);
  const starter = byId("starter");
  const plusMonthly = byId("plus");
  const plusYearly = byId("plus_yearly");
  const plus = yearly ? plusYearly : plusMonthly;
  const pack = byId("capacity_pack");
  const perMonth = plusYearly ? formatPrice({ ...plusYearly, priceCents: Math.round(plusYearly.priceCents / 12) }) : "₱75";
  const savePercent =
    plusMonthly && plusYearly && plusMonthly.priceCents > 0
      ? Math.round((1 - plusYearly.priceCents / (plusMonthly.priceCents * 12)) * 100)
      : 25;

  function goStart() {
    router.push("/signin");
  }

  return (
    <div>
      <section className="px-4 sm:px-6 pt-14 sm:pt-20 pb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: C.navy }}>
          Simple pricing. Your books, always yours.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed" style={{ color: C.muted }}>
          Buy room for your shelf once, or go unlimited with Plus. Either way — canceling or
          running low on slots never removes a book you already added.
        </p>

        <div className="inline-flex items-center gap-1 rounded-full p-1 mt-8" style={{ background: C.navyT }}>
          <button
            onClick={() => setYearly(false)}
            className="rounded-full px-4 py-1.5 text-xs font-semibold transition"
            style={{ background: !yearly ? "white" : "transparent", color: C.navy }}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className="rounded-full px-4 py-1.5 text-xs font-semibold transition"
            style={{ background: yearly ? "white" : "transparent", color: C.navy }}
          >
            Yearly {savePercent > 0 && <span style={{ color: C.green }}>· save {savePercent}%</span>}
          </button>
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 items-start pt-4">
          <PricingCard
            name={starter?.name ?? "Starter"}
            price={starter ? formatPrice(starter) : "₱99"}
            priceNote="one-time"
            subtext={starter?.bookLimit ? `${starter.bookLimit} permanent book slots` : "20 permanent book slots"}
            features={starter?.features.length ? starter.features : [
              "All core tracking — read status, ownership, notes",
              "Title search & auto-fill",
              "Reading digest & Books by Month",
              "Slots never expire, never re-billed",
            ]}
            cta="Get Starter"
            onCta={goStart}
          />
          <PricingCard
            badge="MOST FLEXIBLE"
            badgeColor={C.green}
            highlight
            name={plusMonthly?.name ?? "Booklod Plus"}
            price={plus ? formatPrice(plus) : yearly ? "₱899" : "₱99"}
            priceNote={yearly ? "/year" : "/month"}
            subtext={yearly ? `≈ ${perMonth}/month, billed yearly` : "Cancel anytime"}
            features={plus?.features.length ? plus.features : [
              "Unlimited book slots",
              "Cover photos synced across devices",
              "Full digest history & export",
              "Share Your Shelf — invite-only, no public feed",
              "Coming soon: shareable digest cards, reading streaks",
            ]}
            cta="Get Plus"
            onCta={goStart}
          />
          <PricingCard
            name={pack?.name ?? "Capacity Pack"}
            price={pack ? formatPrice(pack) : "₱349"}
            priceNote="one-time"
            subtext="+100 permanent slots — stack as many as you need"
            features={pack?.features.length ? pack.features : [
              "Same core tracking as Starter",
              "Cheapest way to grow past 20 books",
              "Stackable — buy again anytime",
              "No subscription required",
            ]}
            cta="Add Capacity"
            onCta={goStart}
          />
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-2xl mx-auto rounded-2xl p-5 sm:p-6" style={{ background: C.greenT }}>
          <p className="text-sm font-semibold mb-1" style={{ color: C.navy }}>
            Honest math, since we did it ourselves first
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#2E4A3B" }}>
            Stacking Capacity Packs is cheaper than Plus if all you need is storage — Plus only
            pays for itself once you actually want your cover photos following you across devices,
            full digest export, or shelf sharing. We&apos;d rather you pick the one that fits, not the
            one that sounds bigger.
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-20">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs" style={{ color: "#B0AA9C" }}>
            {footnote ||
              "This preview simulates purchases and subscriptions for demo purposes — no real payment is processed. Prices shown in Philippine pesos."}
          </p>
        </div>
      </section>
    </div>
  );
}
