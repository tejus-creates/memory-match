"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Panel } from "@/components/ui/Panel";
import { playSound } from "@/lib/sound";

export default function MenuPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const handleMode = useCallback(
    (mode: "1p" | "2p") => {
      playSound("tap");
      router.push(`/setup?mode=${mode}`);
    },
    [router]
  );

  const handleBack = useCallback(() => {
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
      {/* ── Back button — top-left ── */}
      <div className="w-full" style={{ maxWidth: 480 }}>
        <Link href="/" onClick={handleBack}>
          <IconButton aria-label="Back to splash" className="mb-[var(--space-4)]">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </IconButton>
        </Link>
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Panel with title + mode buttons ── */}
      <Panel className="flex flex-col items-center gap-[var(--space-8)]" elevated>
        {/* Title graphic — smaller than splash */}
        <div className="w-full max-w-[min(360px,70vw)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/branding/vibrant_holi_memories_title.png"
            alt="Vibrant Holi Memories"
            className="w-full h-auto"
          />
        </div>

        {/* Mode selection buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-[var(--space-4)] w-full max-w-[360px]">
          <Button
            variant="primary"
            className="w-full sm:flex-1"
            onClick={() => handleMode("1p")}
          >
            1 Player
          </Button>
          <Button
            variant="primary"
            className="w-full sm:flex-1"
            onClick={() => handleMode("2p")}
          >
            2 Players
          </Button>
        </div>
      </Panel>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Footer — HAF branding ── */}
      <footer className="flex flex-col items-center gap-[var(--space-3)] pt-[var(--space-6)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/branding/HAFLogo2019_RGB_white.png"
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
  );
}
