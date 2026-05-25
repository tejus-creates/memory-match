import type { NextConfig } from "next";
import path from "path";

const theme = process.env.THEME || "holi";
const themeDir = `./themes/${theme}`;

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.18", "192.168.1.0/24", "10.0.0.0/8"],
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
