"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { playSound } from "@/lib/sound";
import { getSavedGame } from "@/lib/engine/storage";
import { navigateForward } from "@/lib/navigation";
import { assetPrefix } from "@/lib/asset-prefix";
import { PageTransition } from "@/components/PageTransition";
import { useGsapLift } from "@/lib/use-gsap-lift";

export default function SplashPage() {
  const router = useRouter();
  const [hasSavedGame, setHasSavedGame] = useState(false);

  useEffect(() => {
    setHasSavedGame(getSavedGame() !== null);
  }, []);

  const handleMode = useCallback(
    (mode: "1p" | "2p") => {
      playSound("tap");
      navigateForward(router, `/setup?mode=${mode}`);
    },
    [router]
  );

  const liftOpts = {
    y: 3,
    scale: 1.04,
    duration: 0.18,
    ease: "power2.out" as const,
    settleDuration: 0.25,
    settleEase: "power2.inOut" as const,
    liftShadow: "0 3px 0 var(--c-magenta-dark), 0 4px 8px rgba(42, 24, 16, 0.12)",
    restShadow: "0 2px 0 var(--c-magenta-dark)",
  };
  const { ref: mode1Ref } = useGsapLift<HTMLButtonElement>(liftOpts);
  const { ref: mode2Ref } = useGsapLift<HTMLButtonElement>(liftOpts);

  const handleContinue = useCallback(() => {
    playSound("tap");
    navigateForward(router, "/play");
  }, [router]);

  return (
    <PageTransition>
    <main
      className="flex flex-1 flex-col items-center justify-between px-[var(--space-4)] py-[var(--space-10)]"
    >
      {/* ── Sound toggle — top-right ── */}
      <div className="w-full flex justify-end" style={{ maxWidth: 640 }}>
        <SoundToggle />
      </div>

      {/* ── Top spacer ── */}
      <div className="flex-1" />

      {/* ── Title graphic ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={assetPrefix("/branding/vibrant_holi_memories_title.webp")}
        alt="Vibrant Holi Memories"
        style={{ maxWidth: "min(600px, 85vw)", width: "100%", height: "auto" }}
      />

      {/* ── Spacer — centers buttons between title and footer ── */}
      <div className="flex-1" />

      {/* ── Mode buttons + continue ── */}
      <div className="flex flex-col items-center gap-[var(--space-5)]">
        <div className="flex items-start justify-center gap-[var(--space-4)]">
          <button
            ref={mode1Ref}
            type="button"
            onClick={() => handleMode("1p")}
            className="flex flex-col items-center justify-center cursor-pointer rounded-[var(--radius-button)] bg-[var(--c-magenta)] shadow-[0_2px_0_var(--c-magenta-dark)]"
            style={{ width: 80, height: 80 }}
          >
            <span
              className="font-display leading-[1]"
              style={{ fontSize: "var(--text-xl)", color: "var(--c-parchment)" }}
            >
              1
            </span>
            <span
              className="font-body"
              style={{ fontSize: "var(--text-xs)", color: "rgba(244, 232, 208, 0.8)" }}
            >
              Player
            </span>
          </button>

          <button
            ref={mode2Ref}
            type="button"
            onClick={() => handleMode("2p")}
            className="flex flex-col items-center justify-center cursor-pointer rounded-[var(--radius-button)] bg-[var(--c-magenta)] shadow-[0_2px_0_var(--c-magenta-dark)]"
            style={{ width: 80, height: 80 }}
          >
            <span
              className="font-display leading-[1]"
              style={{ fontSize: "var(--text-xl)", color: "var(--c-parchment)" }}
            >
              2
            </span>
            <span
              className="font-body"
              style={{ fontSize: "var(--text-xs)", color: "rgba(244, 232, 208, 0.8)" }}
            >
              Players
            </span>
          </button>
        </div>

        {/* Continue saved game */}
        {hasSavedGame && (
          <Button
            variant="secondary"
            className=""
            onClick={handleContinue}
          >
            Continue last game
          </Button>
        )}
      </div>

      {/* ── Bottom spacer ── */}
      <div className="flex-1" />

      {/* Footer */}
      <footer className="flex flex-col items-center gap-[var(--space-3)] pt-[var(--space-6)]">
        <Image
          src={assetPrefix("/branding/HAFLogo2019_RGB_white.webp")}
          alt="Hindu American Foundation"
          width={140}
          height={40}
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
