// @ts-check
import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import noRelativeImports from "eslint-plugin-no-relative-import-paths";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tailwind from "eslint-plugin-tailwindcss";
import { globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

// TODO: Remove when eslint-plugin-tailwindcss@beta doesn't require an empty Tailwind JS config file
import { resolve } from "path";

export default tseslint.config([
  globalIgnores(["dist"]),
  prettier,
  {
    files: ["**/*.{ts,tsx,js}"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
      tailwind.configs["flat/recommended"],
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: { version: "detect" },
      tailwindcss: {
        //TODO: Whitelisting font-family classes until eslint-plugin-tailwindcss@beta supports it
        whitelist: ["g_id_[a-z]+", "fa-[a-z-]+", "font-\\w+"],
        config: resolve(import.meta.dirname, "./tailwind.config.js"),
      },
      env: {
        node: true,
      },
    },
    plugins: {
      react,
      "no-relative-import-paths": noRelativeImports,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
    },
  },
]);
