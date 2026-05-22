import type { ReactNode } from "react";

interface PanelProps {
  children: ReactNode;
  /** Additional classes for layout overrides (e.g. gap, flex direction) */
  className?: string;
  /** Max width in px — defaults to 480 */
  maxWidth?: number;
  /**
   * Background fill opacity (0–1). Controls how much of the Holi background
   * bleeds through. Lower = softer wash, higher = more contrast for small text.
   * Menu uses the default; bump up for screens with body copy (e.g. setup).
   */
  fillOpacity?: number;
  /** Adds a soft warm drop shadow for a floating feel. Use on menu-flow screens. */
  elevated?: boolean;
}

/**
 * Semi-transparent warm surface that floats over the Holi background.
 * Used on splash, menu, setup, deck selection, difficulty — any screen
 * that needs a readable content area without a full modal overlay.
 */
export function Panel({ children, className = "", maxWidth = 480, fillOpacity = 0.4, elevated = false }: PanelProps) {
  return (
    <div
      className={[
        "w-[calc(100%-var(--space-8))]",
        "rounded-[var(--radius-modal)]",
        "backdrop-blur-[4px]",
        "p-[var(--space-6)] sm:p-[var(--space-8)]",
        className,
      ].join(" ")}
      style={{
        maxWidth,
        backgroundColor: `rgba(42, 24, 16, ${fillOpacity})`,
        boxShadow: elevated ? "0 6px 20px rgba(42, 24, 16, 0.3)" : undefined,
      }}
    >
      {children}
    </div>
  );
}
