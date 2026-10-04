"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";
import { Wordmark } from "@/components/ui/wordmark";
import { colors } from "@/config/brand";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/features/auth/context/auth-provider";

const NAV_LINKS = [
  { label: "How It Works", href: ROUTES.homeSections.howItWorks },
  { label: "Features", href: ROUTES.homeSections.features },
  { label: "Pricing", href: ROUTES.pricing },
  { label: "About", href: ROUTES.about },
  { label: "Blog", href: ROUTES.blog },
] as const;

export function SiteHeader() {
  const { profile, status } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className="sticky top-0 z-30 backdrop-blur border-b"
      style={{ borderColor: colors.tan, background: "rgba(247,242,232,0.92)" }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3.5">
        <Link href={ROUTES.home} className="flex items-center gap-2">
          <LogoMark size={28} />
          <span className="text-base font-bold" style={{ color: colors.navy }}>
            <Wordmark />
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: colors.navy }}>
          {NAV_LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="hover:opacity-70 transition">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2 sm:gap-3 min-w-[11rem] justify-end">
          {status === "ready" && (
            <>
              <Link
                href={profile ? ROUTES.app.profile : ROUTES.signIn}
                className="text-sm font-medium px-2"
                style={{ color: colors.navy }}
              >
                {profile ? "Profile" : "Sign In"}
              </Link>
              <Link
                href={profile ? ROUTES.app.library : ROUTES.signIn}
                className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm whitespace-nowrap"
                style={{ background: colors.orange }}
              >
                {profile ? "Open App" : "Get Started Free"}
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden p-2 rounded-lg"
          style={{ color: colors.navy }}
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden px-4 sm:px-6 pb-4 flex flex-col gap-1 border-t" style={{ borderColor: colors.tan }}>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={closeMenu}
              className="text-left py-2.5 text-sm font-medium"
              style={{ color: colors.navy }}
            >
              {l.label}
            </Link>
          ))}
          <div className="h-px my-1" style={{ background: colors.tan }} />
          <Link
            href={profile ? ROUTES.app.profile : ROUTES.signIn}
            onClick={closeMenu}
            className="text-left py-2.5 text-sm font-medium"
            style={{ color: colors.navy }}
          >
            {profile ? "Profile" : "Sign In"}
          </Link>
          <Link
            href={profile ? ROUTES.app.library : ROUTES.signIn}
            onClick={closeMenu}
            className="mt-1 rounded-full px-4 py-2.5 text-sm font-semibold text-white text-center"
            style={{ background: colors.orange }}
          >
            {profile ? "Open App" : "Get Started Free"}
          </Link>
        </div>
      )}
    </header>
  );
}
