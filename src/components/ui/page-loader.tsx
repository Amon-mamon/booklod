import { Loader2 } from "lucide-react";
import { colors } from "@/config/brand";

export function PageLoader() {
  return (
    <div
      className="w-full min-h-dvh flex items-center justify-center py-24"
      style={{ background: colors.cream }}
      role="status"
      aria-label="Loading"
    >
      <Loader2 className="animate-spin" style={{ color: colors.green }} size={22} />
    </div>
  );
}
