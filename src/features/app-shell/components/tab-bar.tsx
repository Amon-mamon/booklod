"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, Library as LibraryIcon, User, type LucideIcon } from "lucide-react";
import { colors } from "@/config/brand";
import { ROUTES } from "@/config/routes";

const TABS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: ROUTES.app.library, label: "Library", icon: LibraryIcon },
  { href: ROUTES.app.digest, label: "Digest", icon: BarChart2 },
  { href: ROUTES.app.profile, label: "Profile", icon: User },
];

export const TAB_ROUTES: string[] = TABS.map((t) => t.href);

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-center gap-1 py-2"
      style={{ borderColor: colors.tan }}
    >
      <div className="max-w-xl w-full flex gap-2 px-4">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition"
              style={{ color: active ? colors.orange : colors.subtle }}
            >
              <Icon size={19} />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
