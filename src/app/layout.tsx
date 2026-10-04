import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { colors } from "@/config/brand";
import { AppProviders } from "@/providers/app-providers";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

const DESCRIPTION =
  "A personal book tracker to log what you've read, what you own, and your reading history.";

export const metadata: Metadata = {
  title: { default: "Booklod — Your books. Your reading. Your archive.", template: "%s · Booklod" },
  description: DESCRIPTION,
  openGraph: { title: "Booklod", description: DESCRIPTION, type: "website" },
};

export const viewport: Viewport = {
  themeColor: colors.cream,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
