import path from "path";

import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import noRelativeImports from "eslint-plugin-no-relative-import-paths";

//TODO: Fix when plugin is updated to v4
//import tailwind from "eslint-plugin-tailwindcss";

export default tseslint.config(
  /*...tailwind.configs["flat/recommended"],*/ {
    settings: {
      react: { version: "18.3" },
      tailwindcss: {
        whitelist: ["g_id_[a-z]+", "fa-[a-z-]+"],
        config: path.join(import.meta.dirname, "tailwind.config.js"),
      },
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    ],
    files: ["**/*.{ts,tsx}"],
    ignores: ["dist"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "no-relative-import-paths": noRelativeImports,
      prettier: eslintConfigPrettier,
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
);
