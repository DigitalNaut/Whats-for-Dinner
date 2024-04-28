/// <reference types="vitest" />

import { defineConfig, configDefaults } from "vitest/config";
import svgr from "vite-plugin-svgr";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), svgr()],
  test: {
    globals: true,
    environment: "happy-dom",
    exclude: [...configDefaults.exclude],
    setupFiles: ["src/components/testing/setupTests.ts"],
  },
  resolve: {
    alias: {
      src: resolve(__dirname, "src"),
    },
  },
});
