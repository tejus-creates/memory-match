import type { ReactNode } from "react";

interface PanelProps {
  children: ReactNode;
  /** Additional classes for layout overrides (e.g. gap, flex direction) */
  className?: string;
  /** Max width in px — defaults to 480 */
  maxWidth?: number;
}

/**
 * Semi-transparent warm surface that floats over the Holi background.
 * Used on splash, menu, setup, deck selection, difficulty — any screen
 * that needs a readable content area without a full modal overlay.
 */
export function Panel({ children, className = "", maxWidth = 480 }: PanelProps) {
  return (
    <div
      className={[
        "w-[calc(100%-var(--space-8))]",
        "rounded-[var(--radius-modal)]",
        "border-[1.5px] border-[var(--border-default)]",
        "bg-[rgba(42,24,16,0.55)]",
        "backdrop-blur-[12px]",
        "p-[var(--space-6)] sm:p-[var(--space-8)]",
        className,
      ].join(" ")}
      style={{ maxWidth }}
    >
      {children}
    </div>
  );
}
