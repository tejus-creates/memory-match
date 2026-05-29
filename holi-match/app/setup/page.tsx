"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Panel } from "@/components/ui/Panel";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { playSound } from "@/lib/sound";
import { assetPrefix } from "@/lib/asset-prefix";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { avatars } from "@/themes/holi/avatars";
import {
  getPlayerPrefs,
  savePlayerPrefs,
} from "@/lib/engine/storage";
import { navigateForward, navigateBack } from "@/lib/navigation";
import { PageTransition } from "@/components/PageTransition";
import type { GameMode } from "@/lib/engine/game-state";

function SetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mode = (searchParams.get("mode") as GameMode) || "1p";
  const is2P = mode === "2p";

  // Which player we're currently setting up (1 or 2)
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");

  // Load saved prefs for the current step on mount / step change
  useEffect(() => {
    const saved = getPlayerPrefs(step);
    if (saved) {
      setName(saved.name === `Player ${step}` ? "" : saved.name);
      setSelectedAvatar(saved.avatarId);
    } else {
      setName("");
      setSelectedAvatar(avatars[0]?.id ?? "");
    }
  }, [step]);

  const handleAvatarSelect = useCallback((avatarId: string) => {
    playSound("tap");
    setSelectedAvatar(avatarId);
  }, []);

  const handleContinue = useCallback(() => {
    playSound("tap");

    // Save this player's data
    const playerName = name.trim() || `Player ${step}`;
    savePlayerPrefs(step, { name: playerName, avatarId: selectedAvatar });

    if (is2P && step === 1) {
      // Advance to Player 2
      setStep(2);
    } else {
      // Done — go to deck selection
      navigateForward(router, `/deck?mode=${mode}`);
    }
  }, [name, step, selectedAvatar, is2P, mode, router]);

  const handleBack = useCallback(() => {
    playSound("tap");
    if (is2P && step === 2) {
      // Go back to Player 1
      setStep(1);
    } else {
      navigateBack(router, "/");
    }
  }, [is2P, step, router]);

  const stepLabel = is2P ? `Player ${step} of 2` : "Player 1";

  return (
    <PageTransition>
    <main
      className="flex flex-1 flex-col items-center justify-between px-[var(--space-4)] py-[var(--space-10)]"
    >
      {/* ── Top bar: back-left, sound-right ── */}
      <div className="w-full flex items-center justify-between mb-[var(--space-4)]" style={{ maxWidth: 480 }}>
        <IconButton
          aria-label={is2P && step === 2 ? "Back to Player 1" : "Back to home"}
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
        {/* Step indicator */}
        <EyebrowLabel color="marigold">{stepLabel}</EyebrowLabel>

        {/* Heading */}
        <DisplayHeading size="lg" color="parchment">
          Pick a name and avatar
        </DisplayHeading>

        {/* Name input */}
        <div className="w-full max-w-[320px]">
          <Input
            key={`name-input-${step}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Player ${step}`}
            maxLength={12}
            autoFocus
            autoComplete="off"
            style={{
              backgroundColor: "rgba(244, 232, 208, 0.12)",
              color: "var(--c-parchment)",
            }}
            className="!text-[var(--c-parchment)] !placeholder:text-[rgba(244,232,208,0.45)] !border-[rgba(184,150,106,0.5)]"
          />
        </div>

        {/* Avatar grid */}
        <div className="w-full max-w-[320px]">
          <div
            className="grid gap-[var(--space-3)] justify-items-center"
            style={{
              gridTemplateColumns: "repeat(3, 1fr)",
            }}
          >
            {avatars.map((avatar) => (
              <div key={avatar.id} className="flex flex-col items-center gap-[var(--space-1)]">
                <Avatar
                  src={avatar.image}
                  name={avatar.name}
                  size={64}
                  selected={selectedAvatar === avatar.id}
                  onClick={() => handleAvatarSelect(avatar.id)}
                />
                <span
                  className="font-body text-center leading-tight"
                  style={{
                    fontSize: "var(--text-xs)",
                    color:
                      selectedAvatar === avatar.id
                        ? "var(--c-marigold)"
                        : "var(--text-secondary-light)",
                  }}
                >
                  {avatar.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Continue button */}
        <Button
          variant="primary"
          className="w-full max-w-[320px]"
          onClick={handleContinue}
          disabled={!selectedAvatar}
        >
          Continue
        </Button>
      </Panel>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Footer — HAF branding ── */}
      <footer className="flex flex-col items-center gap-[var(--space-3)] pt-[var(--space-6)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={assetPrefix("/branding/HAFLogo2019_RGB_white.webp")}
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

export default function SetupPage() {
  return (
    <Suspense>
      <SetupContent />
    </Suspense>
  );
}
