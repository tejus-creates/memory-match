"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { initAudio, playSound, isMuted, toggleMute } from "@/lib/sound";
import { getSavedGame } from "@/lib/engine/storage";

export default function SplashPage() {
  const [muted, setMuted] = useState(true);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initAudio();
    setMuted(isMuted());
    setHasSavedGame(getSavedGame() !== null);
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const handleToggleMute = useCallback(() => {
    const nowMuted = toggleMute();
    setMuted(nowMuted);
    if (!nowMuted) playSound("tap");
  }, []);

  const handlePlay = useCallback(() => {
    playSound("tap");
  }, []);

  return (
    <main
      className="flex flex-1 flex-col items-center justify-between px-[var(--space-4)] py-[var(--space-10)]"
      style={{
        opacity: mounted ? 1 : 0,
        transition: "opacity 600ms ease-out",
      }}
    >
      {/* ── Top spacer ── */}
      <div className="flex-1" />

      {/* ── Title + buttons ── */}
      <div className="flex flex-col items-center gap-[var(--space-10)]" style={{ maxWidth: 600, width: "100%" }}>
        {/* Title graphic */}
        <div className="w-full max-w-[min(560px,85vw)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/branding/vibrant_holi_memories_title.png"
            alt="Vibrant Holi Memories"
            className="w-full h-auto"
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col items-center gap-[var(--space-4)] w-full max-w-[280px]">
          <Link href="/menu" className="w-full" onClick={handlePlay}>
            <Button variant="primary" className="w-full">
              Play
            </Button>
          </Link>

          {hasSavedGame && (
            <Link href="/play" className="w-full" onClick={handlePlay}>
              <Button
                variant="secondary"
                className="w-full !text-[var(--c-parchment)] !border-[rgba(244,232,208,0.8)] hover:!bg-[rgba(244,232,208,0.08)]"
              >
                Continue last game
              </Button>
            </Link>
          )}
        </div>

        {/* Sound toggle */}
        <IconButton
          aria-label={muted ? "Unmute sound" : "Mute sound"}
          onClick={handleToggleMute}
        >
          {muted ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M19.07 4.93a10 10 0 010 14.14" />
              <path d="M15.54 8.46a5 5 0 010 7.07" />
            </svg>
          )}
        </IconButton>
      </div>

      {/* ── Bottom spacer + footer ── */}
      <div className="flex-1" />

      {/* Footer — outside the panel */}
      <footer className="flex flex-col items-center gap-[var(--space-3)] pt-[var(--space-6)]">
        <Image
          src="/branding/HAFLogo2019_RGB_white.png"
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
  );
}
