import type { NextConfig } from "next";
import path from "path";

const theme = process.env.THEME || "holi";
const themeDir = `./themes/${theme}`;

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  turbopack: {
    resolveAlias: {
      "@/themes/active": themeDir,
    },
  },
  webpack: (config) => {
    config.resolve.alias["@/themes/active"] = path.resolve(
      __dirname,
      `themes/${theme}`
    );
    return config;
  },
};

export default nextConfig;
