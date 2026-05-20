import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@/themes/active": path.resolve(__dirname, "themes/holi"),
    },
  },
  test: {
    globals: true,
    environment: "node",
  },
});
