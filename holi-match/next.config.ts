import type { NextConfig } from "next";
import path from "path";

const theme = process.env.THEME || "holi";
const themeDir = `./themes/${theme}`;

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repoName = process.env.REPO_NAME || "memory-match";
const basePath = isGitHubPages ? `/${repoName}` : "";

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  basePath,
  images: isGitHubPages ? { unoptimized: true } : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
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
