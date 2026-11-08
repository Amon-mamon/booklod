"use client";
import { useState } from "react";
import { X, Menu } from "lucide-react";
import { C } from "../../../app/components/theme";
import { LogoMark } from "../../../app/components/ui/LogoMark";
import { useRouter } from "next/navigation";
import { goToSection } from "../../shared/shared";
import type { ReactNode } from "react";



// ---------------------------------------------------------------------------
// Public site chrome. Marketing pages are signed-out only; signed-in users
// only see it on /privacy and /terms, with just a way back into the app.
// ---------------------------------------------------------------------------
export function SiteHeader({ signedIn = false }: { signedIn?: boolean }) {
  const router = useRouter();
  const navigate = router.push;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuLinks: Array<{ label: string; onClick: () => void }> = [
    { label: "How It Works", onClick: () => goToSection("preview", navigate) },
    { label: "Features", onClick: () => goToSection("features", navigate) },
    { label: "Pricing", onClick: () => navigate("/pricing") },
    { label: "About", onClick: () => navigate("/about") },
    { label: "Blog", onClick: () => navigate("/blog") },
  ];

  return (
    <header
      className="sticky top-0 z-30 backdrop-blur border-b"
      style={{ borderColor: C.tan, background: "rgba(247,242,232,0.92)" }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3.5">
        <button onClick={() => navigate(signedIn ? "/app/library" : "/")} className="flex items-center gap-2">
          <LogoMark size={28} />
          <span className="text-base font-bold" style={{ color: C.navy }}>
            Book<span style={{ color: C.green }}>l</span>
            <span style={{ color: C.orange }}>od</span>
          </span>
        </button>

        {signedIn ? (
          <button
            onClick={() => navigate("/app/library")}
            className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm whitespace-nowrap"
            style={{ background: C.orange }}
          >
            Back to app
          </button>
        ) : (
        <>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: C.navy }}>
          <button onClick={() => goToSection("preview", navigate)} className="hover:opacity-70 transition">How It Works</button>
          <button onClick={() => goToSection("features", navigate)} className="hover:opacity-70 transition">Features</button>
          <button onClick={() => navigate("/pricing")} className="hover:opacity-70 transition">Pricing</button>
          <button onClick={() => navigate("/about")} className="hover:opacity-70 transition">About</button>
          <button onClick={() => navigate("/blog")} className="hover:opacity-70 transition">Blog</button>
        </nav>

        <div className="hidden md:flex items-center gap-2 sm:gap-3">
          <button onClick={() => navigate("/signin")} className="text-sm font-medium px-2" style={{ color: C.navy }}>
            Sign In
          </button>
          <button
            onClick={() => navigate("/signin")}
            className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm whitespace-nowrap"
            style={{ background: C.orange }}
          >
            Get Started Free
          </button>
        </div>

        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden p-2 rounded-lg"
          style={{ color: C.navy }}
          aria-label="Menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        </>
        )}
      </div>

      {menuOpen && !signedIn && (
        <div className="md:hidden px-4 sm:px-6 pb-4 flex flex-col gap-1 border-t" style={{ borderColor: C.tan }}>
          {menuLinks.map(({ label, onClick }) => (
            <button
              key={label}
              onClick={() => {
                setMenuOpen(false);
                onClick();
              }}
              className="text-left py-2.5 text-sm font-medium"
              style={{ color: C.navy }}
            >
              {label}
            </button>
          ))}
          <div className="h-px my-1" style={{ background: C.tan }} />
          <button
            onClick={() => { setMenuOpen(false); navigate("/signin"); }}
            className="text-left py-2.5 text-sm font-medium"
            style={{ color: C.navy }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMenuOpen(false); navigate("/signin"); }}
            className="mt-1 rounded-full px-4 py-2.5 text-sm font-semibold text-white text-center"
            style={{ background: C.orange }}
          >
            Get Started Free
          </button>
        </div>
      )}
    </header>
  );
}


export function SiteFooter() {
  const router = useRouter();
  const navigate = router.push;
  return (
    <footer className="px-4 sm:px-6 py-8 text-center border-t" style={{ borderColor: C.tan }}>
      <p className="text-sm font-medium" style={{ color: C.navy }}>
        Book<span style={{ color: C.green }}>l</span>
        <span style={{ color: C.orange }}>od</span>
      </p>
      <p className="text-xs mt-1.5 max-w-xs mx-auto" style={{ color: C.muted }}>
        A personal book tracker to log what you&apos;ve read, what you own, and your reading history.
      </p>
      <div className="flex items-center justify-center gap-4 mt-3 text-xs" style={{ color: C.muted }}>
        <button onClick={() => navigate("/about")} className="hover:opacity-70 transition">About</button>
        <button onClick={() => navigate("/blog")} className="hover:opacity-70 transition">Blog</button>
      </div>
    </footer>
  );
}


export function PublicLayout({
  signedIn = false,
  children,
}: {
  signedIn?: boolean;
  children: ReactNode;
}) {
  return (
    <div style={{ background: C.cream, fontFamily: "'Poppins', sans-serif" }} className="w-full min-h-full">
      <SiteHeader signedIn={signedIn} />
      {children}
      {!signedIn && <SiteFooter />}
    </div>
  );
}
