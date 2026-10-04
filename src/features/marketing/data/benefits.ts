import { BarChart2, Book, Clock, Search, type LucideIcon } from "lucide-react";

export interface Benefit {
  icon: LucideIcon;
  title: string;
  body: string;
}

export const BENEFITS: Benefit[] = [
  { icon: Book, title: "Track Every Book", body: "Log books you've read, are reading, own, or want to read." },
  { icon: Search, title: "Know What You Own", body: "Check your personal collection before buying another copy." },
  { icon: Clock, title: "Remember Your Reading", body: "Keep a record of what you've read and where you left off." },
  { icon: BarChart2, title: "See Your Reading History", body: "Understand your reading year with simple stats and monthly insights." },
];
