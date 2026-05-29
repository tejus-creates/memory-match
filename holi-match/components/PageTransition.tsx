"use client";

import type { ReactNode } from "react";

/**
 * Page transition wrapper. On Next 16 + React 19 this used <ViewTransition>;
 * on Next 15 it renders a plain wrapper with the vt-name attribute so
 * CSS-based view transitions still work where supported.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "contents" }} {...{ "vt-name": "page-content", "vt-update": "none" } as Record<string, string>}>
      {children}
    </div>
  );
}
