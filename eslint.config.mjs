import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // The marketing copy is full of apostrophes/quotes; escaping each one hurts readability.
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
