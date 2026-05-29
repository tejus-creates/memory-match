"use client";

import { Suspense, useEffect, useState, useCallback, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Panel } from "@/components/ui/Panel";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { playSound } from "@/lib/sound";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { copy } from "@/themes/holi/copy";
import { getGamePrefs, saveGamePrefs } from "@/lib/engine/storage";
import { navigateForward, navigateBack } from "@/lib/navigation";
import { PageTransition } from "@/components/PageTransition";
import type { GameMode } from "@/lib/engine/game-state";
import { useGsapLift } from "@/lib/use-gsap-lift";

/* ─── Difficulty levels from theme ─── */

const LEVEL_KEYS = ["easy", "medium", "hard", "expert"] as const;
type LevelKey = (typeof LEVEL_KEYS)[number];

function getInitialLevel(): LevelKey {
  if (typeof window === "undefined") return "medium";
  const saved = getGamePrefs();
  if (saved?.difficulty) {
    // Match saved pair count back to a level key
    const match = LEVEL_KEYS.find(
      (k) => copy.difficulty.levels[k].pairs === saved.difficulty
    );
    if (match) return match;
  }
  return "medium";
}

/* ─── Powder mound SVG clusters ─── */

const MOUND_COLORS = [
  "var(--c-magenta)",
  "var(--c-marigold)",
  "var(--c-peacock)",
  "var(--c-sindoor)",
];

/**
 * A single powder-mound dome path centered at (cx, cy).
 * hw = half-width, h = height of the dome.
 */
function moundPath(cx: number, cy: number, hw: number, h: number): string {
  return `M${cx - hw},${cy} Q${cx - hw},${cy - h} ${cx},${cy - h} Q${cx + hw},${cy - h} ${cx + hw},${cy} Z`;
}

/**
 * Mound layout configs within a 36×36 square viewBox.
 * Each layout fills the box as fully as possible while keeping
 * mounds proportional and the arrangement readable.
 */
const MOUND_LAYOUTS: Record<
  number,
  { cx: number; cy: number; hw: number; h: number }[]
> = {
  // 1: single large mound, centered
  1: [{ cx: 18, cy: 32, hw: 14, h: 22 }],
  // 2: two side-by-side, filling the width
  2: [
    { cx: 10, cy: 32, hw: 9, h: 18 },
    { cx: 26, cy: 32, hw: 9, h: 18 },
  ],
  // 3: pyramid — 2 top row, 1 centered below
  3: [
    { cx: 10, cy: 19, hw: 8, h: 14 },
    { cx: 26, cy: 19, hw: 8, h: 14 },
    { cx: 18, cy: 33, hw: 8, h: 14 },
  ],
  // 4: 2×2 grid
  4: [
    { cx: 10, cy: 19, hw: 8, h: 14 },
    { cx: 26, cy: 19, hw: 8, h: 14 },
    { cx: 10, cy: 33, hw: 8, h: 14 },
    { cx: 26, cy: 33, hw: 8, h: 14 },
  ],
};

function PowderMounds({ count }: { count: 1 | 2 | 3 | 4 }) {
  const positions = MOUND_LAYOUTS[count];
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      {positions.map((pos, i) => (
        <path
          key={i}
          d={moundPath(pos.cx, pos.cy, pos.hw, pos.h)}
          fill={MOUND_COLORS[i % MOUND_COLORS.length]}
          opacity={0.85}
        />
      ))}
    </svg>
  );
}

const LEVEL_MOUND_COUNT: Record<LevelKey, 1 | 2 | 3 | 4> = {
  easy: 1,
  medium: 2,
  hard: 3,
  expert: 4,
};

/* ─── Difficulty option with GSAP lift ─── */

function DifficultyOption({
  isSelected,
  onClick,
  children,
}: {
  isSelected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const { ref } = useGsapLift<HTMLButtonElement>({
    y: 2,
    scale: 1.01,
    duration: 0.16,
    ease: "power2.out",
    settleDuration: 0.22,
    settleEase: "power2.inOut",
    liftShadow: "0 2px 6px rgba(42, 24, 16, 0.15)",
    restShadow: "none",
  });

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left rounded-[var(--radius-button)]",
        "px-[var(--space-5)] py-[var(--space-3)]",
        "border-[1.5px]",
        "cursor-pointer",
        "transition-[border-color,background-color] duration-100 ease-out",
        "focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]",
      ].join(" ")}
      style={{
        borderColor: isSelected
          ? "var(--c-marigold)"
          : "rgba(184, 150, 106, 0.3)",
        backgroundColor: isSelected
          ? "rgba(216, 154, 44, 0.18)"
          : "rgba(42, 24, 16, 0.35)",
      }}
    >
      {children}
    </button>
  );
}

/* ─── Component ─── */

function DifficultyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as GameMode) || "1p";

  const [selected, setSelected] = useState<LevelKey>("medium");

  // Load saved difficulty on mount
  useEffect(() => {
    setSelected(getInitialLevel());
  }, []);

  const handleSelect = useCallback((key: LevelKey) => {
    playSound("tap");
    setSelected(key);
  }, []);

  const handleContinue = useCallback(() => {
    playSound("tap");
    const existing = getGamePrefs();
    saveGamePrefs({
      deckId: existing?.deckId ?? "",
      difficulty: copy.difficulty.levels[selected].pairs,
      soundEnabled: existing?.soundEnabled ?? true,
    });
    navigateForward(router, `/play?mode=${mode}`);
  }, [selected, mode, router]);

  const handleBack = useCallback(() => {
    playSound("tap");
    navigateBack(router, `/deck?mode=${mode}`);
  }, [mode, router]);

  return (
    <PageTransition>
    <main
      className="flex flex-1 flex-col items-center justify-between px-[var(--space-4)] py-[var(--space-10)]"
    >
      {/* ── Top bar: back-left, sound-right ── */}
      <div className="w-full flex items-center justify-between mb-[var(--space-4)]" style={{ maxWidth: 480 }}>
        <IconButton
          aria-label="Back to deck selection"
          onClick={handleBack}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </IconButton>
        <SoundToggle />
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Panel ── */}
      <Panel
        className="flex flex-col items-center gap-[var(--space-5)]"
        elevated
      >
        {/* Heading */}
        <DisplayHeading size="lg" color="parchment">
          {copy.difficulty.heading}
        </DisplayHeading>

        {/* Difficulty options */}
        <div className="w-full flex flex-col gap-[var(--space-2)]">
          {LEVEL_KEYS.map((key) => {
            const level = copy.difficulty.levels[key];
            const isSelected = selected === key;
            return (
              <DifficultyOption
                key={key}
                isSelected={isSelected}
                onClick={() => handleSelect(key)}
              >
                <div className="flex items-center gap-[var(--space-3)]">
                  {/* Left: mound icon */}
                  <PowderMounds count={LEVEL_MOUND_COUNT[key]} />

                  {/* Middle: label + description */}
                  <div className="flex flex-col gap-[var(--space-1)] flex-1 min-w-0">
                    <span
                      className="font-display leading-[1.2]"
                      style={{
                        fontSize: "var(--text-lg)",
                        color: isSelected
                          ? "var(--c-marigold)"
                          : "var(--c-parchment)",
                      }}
                    >
                      {level.label}
                    </span>
                    <span
                      className="font-body"
                      style={{
                        fontSize: "var(--text-sm)",
                        color: "var(--text-secondary-light)",
                      }}
                    >
                      {level.description}
                    </span>
                  </div>

                  {/* Right: big pair number + "pairs" label */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <span
                      className="font-display leading-[1]"
                      style={{
                        fontSize: "var(--text-xl)",
                        color: isSelected
                          ? "var(--c-marigold)"
                          : "var(--c-parchment)",
                      }}
                    >
                      {level.pairs}
                    </span>
                    <span
                      className="font-body"
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--text-secondary-light)",
                      }}
                    >
                      pairs
                    </span>
                  </div>
                </div>
              </DifficultyOption>
            );
          })}
        </div>

        {/* Continue button */}
        <Button
          variant="primary"
          className="w-full max-w-[320px]"
          onClick={handleContinue}
        >
          Start Game
        </Button>
      </Panel>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Footer — HAF branding ── */}
      <footer className="flex flex-col items-center gap-[var(--space-3)] pt-[var(--space-6)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/branding/HAFLogo2019_RGB_white.webp"
          alt="Hindu American Foundation"
          className="h-[32px] w-auto opacity-70"
        />
        <div
          className="text-center font-body leading-relaxed"
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--text-secondary-light)",
          }}
        >
          <p>Created by Tejus Shah</p>
          <p>&copy;2026 Hindu American Foundation &middot; hinduamerican.org</p>
        </div>
      </footer>
    </main>
    </PageTransition>
  );
}

export default function DifficultyPage() {
  return (
    <Suspense>
      <DifficultyContent />
    </Suspense>
  );
}
