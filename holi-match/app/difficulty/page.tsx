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

/* ─── Flame icons — progressive fire intensity ─── */

function FlameIcon({ level }: { level: LevelKey }) {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      {level === "easy" && (
        /* Small candle flame — narrow, gentle, sits low */
        <>
          <path
            d="M18,14 C18,14 19.5,17 20.5,19 C22,21.5 22,24 20.5,26 C19.5,27.5 18,28 18,28 C18,28 16.5,27.5 15.5,26 C14,24 14,21.5 15.5,19 C16.5,17 18,14 18,14 Z"
            fill="var(--c-marigold)"
            opacity={0.9}
          />
          {/* Wick */}
          <line x1="18" y1="28" x2="18" y2="32" stroke="var(--c-brass)" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {level === "medium" && (
        /* Steady flame — taller, organic S-curve shape with inner core */
        <>
          <path
            d="M18,8 C18,8 21,13 23,17 C25,21 25,25 22,28 C20,30 18,30.5 18,30.5 C18,30.5 16,30 14,28 C11,25 11,21 13,17 C15,13 18,8 18,8 Z"
            fill="var(--c-sindoor)"
            opacity={0.85}
          />
          <path
            d="M18,16 C18,16 19.5,19 20,21 C20.5,23 20,25 19,26.5 C18.5,27 18,27 18,27 C18,27 17.5,27 17,26.5 C16,25 15.5,23 16,21 C16.5,19 18,16 18,16 Z"
            fill="var(--c-marigold)"
            opacity={0.9}
          />
        </>
      )}
      {level === "hard" && (
        /* Tall fire — wider base, flickering tips, inner glow */
        <>
          {/* Main body */}
          <path
            d="M18,4 C18,4 22,10 25,16 C28,22 27,27 23,30 C21,31.5 18,32 18,32 C18,32 15,31.5 13,30 C9,27 8,22 11,16 C14,10 18,4 18,4 Z"
            fill="var(--c-magenta)"
            opacity={0.85}
          />
          {/* Left flicker */}
          <path
            d="M13,16 C13,16 10,12 9.5,9 C8,12 9,16 12,18"
            fill="var(--c-sindoor)"
            opacity={0.8}
          />
          {/* Right flicker */}
          <path
            d="M23,16 C23,16 26,12 26.5,9 C28,12 27,16 24,18"
            fill="var(--c-sindoor)"
            opacity={0.8}
          />
          {/* Inner core */}
          <path
            d="M18,14 C18,14 20,18 21,21 C22,24 21,27 19.5,28.5 C19,29 18,29 18,29 C18,29 17,29 16.5,28.5 C15,27 14,24 15,21 C16,18 18,14 18,14 Z"
            fill="var(--c-marigold)"
            opacity={0.9}
          />
        </>
      )}
      {level === "expert" && (
        /* Blazing bonfire — wild, asymmetric, chaotic flames */
        <>
          {/* Wide ragged base — irregular edge */}
          <path
            d="M18,6 C20,10 26,14 29,20 C31,25 29,30 25,33 C22,34.5 14,34.5 11,33 C7,30 5,25 7,20 C10,14 16,10 18,6 Z"
            fill="var(--c-magenta)"
            opacity={0.85}
          />
          {/* Tall left tongue — leans outward */}
          <path
            d="M11,17 C10,14 7,8 4,3 C3,8 4,14 8,19 C9,20 11,19 11,17 Z"
            fill="var(--c-sindoor)"
            opacity={0.85}
          />
          {/* Short left tongue — lower, wider */}
          <path
            d="M9,22 C7,19 4,15 3,12 C2,16 3,21 7,24 C8,24.5 9,23.5 9,22 Z"
            fill="var(--c-magenta)"
            opacity={0.7}
          />
          {/* Tall right tongue — leaning right, tallest */}
          <path
            d="M25,14 C27,10 29,5 31,1 C33,7 32,13 28,18 C27,19 25,17 25,14 Z"
            fill="var(--c-sindoor)"
            opacity={0.85}
          />
          {/* Mid right tongue */}
          <path
            d="M27,20 C29,16 31,11 33,8 C34,13 33,19 29,23 C28,24 27,22 27,20 Z"
            fill="var(--c-magenta)"
            opacity={0.7}
          />
          {/* Center spike — slightly off-center left */}
          <path
            d="M15,12 C14,8 13,4 12,1 C11,5 12,10 15,14 Z"
            fill="var(--c-sindoor)"
            opacity={0.75}
          />
          {/* Inner blaze */}
          <path
            d="M18,14 C20,18 23,22 23,26 C23,29 21,31 18,31 C15,31 13,29 13,26 C13,22 16,18 18,14 Z"
            fill="var(--c-sindoor)"
            opacity={0.85}
          />
          {/* Hot core */}
          <path
            d="M18,21 C19,23 20,25 20,27 C20,28.5 19,29.5 18,29.5 C17,29.5 16,28.5 16,27 C16,25 17,23 18,21 Z"
            fill="var(--c-marigold)"
            opacity={0.95}
          />
          {/* Embers / sparks */}
          <circle cx="8" cy="8" r="1" fill="var(--c-marigold)" opacity={0.7} />
          <circle cx="28" cy="5" r="1.2" fill="var(--c-sindoor)" opacity={0.6} />
          <circle cx="22" cy="3" r="0.8" fill="var(--c-marigold)" opacity={0.8} />
          <circle cx="5" cy="14" r="0.8" fill="var(--c-marigold)" opacity={0.5} />
          <circle cx="32" cy="12" r="1" fill="var(--c-sindoor)" opacity={0.5} />
        </>
      )}
    </svg>
  );
}

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
                  {/* Left: flame icon */}
                  <FlameIcon level={key} />

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
