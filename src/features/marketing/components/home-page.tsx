import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { colors } from "@/config/brand";
import { ROUTES } from "@/config/routes";
import { AuthCta } from "./auth-cta";
import { DigestPreview, LibraryPreview } from "./previews";
import { BENEFITS } from "../data/benefits";

export function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="px-4 sm:px-6 pt-10 sm:pt-14 lg:pt-20 pb-12 sm:pb-16">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center gap-10 sm:gap-12">
          <div className="min-w-0 text-center sm:text-left" style={{ flex: "0 1 44%" }}>
            <h1 className="font-bold leading-[1.08] text-4xl sm:text-4xl md:text-5xl lg:text-5xl">
              <span className="block" style={{ color: colors.navy }}>Your books.</span>
              <span className="block" style={{ color: colors.green }}>Your reading.</span>
              <span className="block" style={{ color: colors.orange }}>Your archive.</span>
            </h1>
            <p
              className="mx-auto sm:mx-0 mt-5 sm:mt-6 max-w-md text-base sm:text-base lg:text-lg leading-relaxed"
              style={{ color: colors.muted }}
            >
              A personal book tracker to log what you've read, what you own, and your reading history.
            </p>
            <div className="mt-7 sm:mt-8 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              {/* Hero CTA always reads "Open App"; destination still depends on auth state */}
              <AuthCta
                authedLabel="Open App"
                guestLabel="Open App"
                className="rounded-full px-7 py-3 text-sm font-semibold text-white shadow-sm whitespace-nowrap"
                style={{ background: colors.orange }}
              />
              <Link
                href={ROUTES.homeSections.howItWorks}
                className="flex items-center justify-center gap-1 rounded-full px-7 py-3 text-sm font-semibold border whitespace-nowrap"
                style={{ borderColor: colors.green, color: colors.green }}
              >
                See How It Works <ChevronRight size={15} />
              </Link>
            </div>
          </div>

          <div className="min-w-0 flex justify-center sm:justify-end" style={{ flex: "0 1 56%" }}>
            <Image
              src="/images/hero.webp"
              width={1100}
              height={719}
              priority
              sizes="(min-width: 640px) 480px, 100vw"
              alt="The Booklod app on a phone showing My Library and the 2026 Reading Digest, next to a stack of books, an open book, and a cup of coffee"
              className="h-auto"
              style={{ width: "100%", maxWidth: 480 }}
            />
          </div>
        </div>
      </section>

      {/* Product preview */}
      <section id="preview" className="px-4 sm:px-6 pb-16 sm:pb-20 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-14">
            <div>
              <LibraryPreview />
              <div className="text-center mt-5 max-w-xs mx-auto">
                <h3 className="text-lg font-semibold" style={{ color: colors.navy }}>
                  Track every book you own and read.
                </h3>
                <p className="text-sm mt-1.5" style={{ color: colors.muted }}>
                  Covers, authors, reading status, and ownership — your whole shelf in one clean list.
                </p>
              </div>
            </div>
            <div>
              <DigestPreview />
              <div className="text-center mt-5 max-w-xs mx-auto">
                <h3 className="text-lg font-semibold" style={{ color: colors.navy }}>
                  See your reading history at a glance.
                </h3>
                <p className="text-sm mt-1.5" style={{ color: colors.muted }}>
                  Finished, reading, to-read, and lent-out counts, plus a month-by-month breakdown.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="features" className="px-4 sm:px-6 pb-16 sm:pb-20 scroll-mt-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-2xl bg-white p-5" style={{ border: `1px solid ${colors.tan}` }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                style={{ background: colors.greenT }}
              >
                <b.icon size={18} style={{ color: colors.green }} />
              </div>
              <h4 className="font-semibold text-sm mb-1" style={{ color: colors.navy }}>{b.title}</h4>
              <p className="text-sm leading-relaxed" style={{ color: colors.muted }}>{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 sm:px-6 pb-14">
        <div
          className="max-w-4xl mx-auto rounded-3xl px-6 sm:px-12 py-12 sm:py-14 text-center"
          style={{ background: colors.navy }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Your reading life, all in one place.
          </h2>
          <p className="text-sm sm:text-base mt-2.5" style={{ color: "#C3CBD2" }}>
            Start tracking your books for free.
          </p>
          <AuthCta
            authedLabel="Open App"
            guestLabel="Get Started Free"
            className="inline-block mt-6 w-full sm:w-auto rounded-full px-7 py-3 text-sm font-semibold shadow-sm"
            style={{ background: colors.orange, color: "white" }}
          />
        </div>
      </section>
    </>
  );
}
