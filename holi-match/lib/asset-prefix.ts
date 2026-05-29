/**
 * Returns the basePath so asset URLs resolve correctly on GitHub Pages
 * (or any deployment with a non-root basePath).
 */
export function assetPrefix(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${base}${path}`;
}
