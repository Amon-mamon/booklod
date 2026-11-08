"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { C } from "../../../app/components/theme";
import { consumePendingScrollTarget, goToSection } from "../../shared/shared";
import { HERO_IMAGE } from "../hero-image";
import { LibraryPreview, DigestPreview, BENEFITS } from "../components/Previews";



export function HomePage() {
  const router = useRouter();
  const navigate = router.push;
  const previewRef = useRef<HTMLElement | null>(null);
  const featuresRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function tryScroll() {
      const target = consumePendingScrollTarget();
      if (!target) return;
      const ref = target === "features" ? featuresRef : previewRef;
      setTimeout(() => {
        if (ref.current) {
          ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
    }
    tryScroll();
    window.addEventListener("booklod:scroll-request", tryScroll);
    return () => window.removeEventListener("booklod:scroll-request", tryScroll);
  }, []);

  const primaryLabel = "Get Started Free";
  const primaryTarget = "/signin";
  const heroCtaLabel = "Open App";

  return (
    <>
      {/* Hero */}
      <section className="px-4 sm:px-6 pt-10 sm:pt-14 lg:pt-20 pb-12 sm:pb-16">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center gap-10 sm:gap-12">
          <div className="min-w-0 text-center sm:text-left" style={{ flex: "0 1 44%" }}>
            <h1 className="font-bold leading-[1.08] text-4xl sm:text-4xl md:text-5xl lg:text-5xl">
              <span className="block" style={{ color: C.navy }}>Your books.</span>
              <span className="block" style={{ color: C.green }}>Your reading.</span>
              <span className="block" style={{ color: C.orange }}>Your archive.</span>
            </h1>
            <p
              className="mx-auto sm:mx-0 mt-5 sm:mt-6 max-w-md text-base sm:text-base lg:text-lg leading-relaxed"
              style={{ color: C.muted }}
            >
              A personal book tracker to log what you&apos;ve read, what you own, and your reading history.
            </p>
            <div className="mt-7 sm:mt-8 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <button
                onClick={() => navigate(primaryTarget)}
                className="rounded-full px-7 py-3 text-sm font-semibold text-white shadow-sm whitespace-nowrap"
                style={{ background: C.orange }}
              >
                {heroCtaLabel}
              </button>
              <button
                onClick={() => goToSection("preview", navigate)}
                className="flex items-center justify-center gap-1 rounded-full px-7 py-3 text-sm font-semibold border whitespace-nowrap"
                style={{ borderColor: C.green, color: C.green }}
              >
                See How It Works <ChevronRight size={15} />
              </button>
            </div>
          </div>

          <div className="min-w-0 flex justify-center sm:justify-end" style={{ flex: "0 1 56%" }}>
            <img
              src={HERO_IMAGE}
              alt="The Booklod app on a phone showing My Library and the 2026 Reading Digest, next to a stack of books, an open book, and a cup of coffee"
              className="h-auto"
              style={{ width: "100%", maxWidth: 480 }}
            />
          </div>
        </div>
      </section>

      {/* Product preview */}
      <section ref={previewRef} className="px-4 sm:px-6 pb-16 sm:pb-20 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-14">
            <div>
              <LibraryPreview />
              <div className="text-center mt-5 max-w-xs mx-auto">
                <h3 className="text-lg font-semibold" style={{ color: C.navy }}>
                  Track every book you own and read.
                </h3>
                <p className="text-sm mt-1.5" style={{ color: C.muted }}>
                  Covers, authors, reading status, and ownership — your whole shelf in one clean list.
                </p>
              </div>
            </div>
            <div>
              <DigestPreview />
              <div className="text-center mt-5 max-w-xs mx-auto">
                <h3 className="text-lg font-semibold" style={{ color: C.navy }}>
                  See your reading history at a glance.
                </h3>
                <p className="text-sm mt-1.5" style={{ color: C.muted }}>
                  Finished, reading, to-read, and lent-out counts, plus a month-by-month breakdown.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section ref={featuresRef} className="px-4 sm:px-6 pb-16 sm:pb-20 scroll-mt-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-2xl bg-white p-5" style={{ border: `1px solid ${C.tan}` }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                style={{ background: C.greenT }}
              >
                <b.icon size={18} style={{ color: C.green }} />
              </div>
              <h4 className="font-semibold text-sm mb-1" style={{ color: C.navy }}>{b.title}</h4>
              <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 sm:px-6 pb-14">
        <div
          className="max-w-4xl mx-auto rounded-3xl px-6 sm:px-12 py-12 sm:py-14 text-center"
          style={{ background: C.navy }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Your reading life, all in one place.
          </h2>
          <p className="text-sm sm:text-base mt-2.5" style={{ color: "#C3CBD2" }}>
            Start tracking your books for free.
          </p>
          <button
            onClick={() => navigate(primaryTarget)}
            className="mt-6 w-full sm:w-auto rounded-full px-7 py-3 text-sm font-semibold shadow-sm"
            style={{ background: C.orange, color: "white" }}
          >
            {primaryLabel}
          </button>
        </div>
      </section>
    </>
  );
}
