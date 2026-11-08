import type { CSSProperties } from "react";
import { C } from "../theme";

export const inputClass =
  "w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-[#5B8467]";

export const inputStyle: CSSProperties & { "--tw-ring-color"?: string } = {
  borderColor: C.tan,
  color: C.navy,
  "--tw-ring-color": C.green,
};
