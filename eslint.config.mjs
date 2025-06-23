import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:@typescript-eslint/recommended"
  ),
  {
    rules: {
      // Not enforcing explicit return types as per user preference
      "@typescript-eslint/explicit-function-return-type": "off",
      // Disabled consistent usage of type imports as per user preference
      "@typescript-eslint/consistent-type-imports": "error",
      // Disallow unused variables and parameters
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      // Enforce using `import type` for Types
      "@typescript-eslint/no-import-type-side-effects": "error",
    },
  },
];

export default eslintConfig;
