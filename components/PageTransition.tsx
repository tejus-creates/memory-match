"use client";

import { ViewTransition } from "react";
import type { ReactNode } from "react";

/**
 * Wraps page content in React 19's <ViewTransition> for directional
 * slide animations on route navigation.
 *
 * - `name="page-content"` ensures old and new pages share a single
 *   transition group (one ::view-transition-old, one ::view-transition-new).
 * - `enter`/`exit` with "auto" for nav-forward/nav-back types tells React
 *   to participate in those transitions using browser-default animation.
 * - CSS in layout.tsx overrides the default with directional slides,
 *   keyed off [data-nav-direction] on <html> + the "page-content" name.
 * - `default="none"` suppresses animation for non-navigation transitions
 *   (Suspense reveals, initial hydration).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition
      name="page-content"
      enter={{
        "nav-forward": "auto",
        "nav-back": "auto",
        default: "none",
      }}
      exit={{
        "nav-forward": "auto",
        "nav-back": "auto",
        default: "none",
      }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
