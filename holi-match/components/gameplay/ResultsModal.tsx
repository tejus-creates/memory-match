"use client";

import { useState, useEffect } from "react";
import { useStore } from "zustand/react";
import type { StoreApi } from "zustand/vanilla";
import type { GameStore, GameMode } from "@/lib/engine/game-state";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Avatar } from "@/components/ui/Avatar";
import { avatars } from "@/themes/holi/avatars";
import { copy } from "@/themes/holi/copy";

const avatarMap = new Map(avatars.map((a) => [a.id, a]));

interface ResultsModalProps {
  isOpen: boolean;
  store: StoreApi<GameStore>;
  mode: GameMode;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex flex-col items-center gap-1 rounded-[var(--radius-button)] px-3 py-2"
      style={{
        backgroundColor: "rgba(244, 232, 208, 0.14)",
        border: "1.5px solid rgba(184, 150, 106, 0.45)",
      }}
    >
      <span
        className="font-display text-lg tabular-nums"
        style={{ color: "var(--c-parchment)" }}
      >
        {value}
      </span>
      <span
        className="font-body text-xs"
        style={{ color: "var(--text-secondary-light)" }}
      >
        {label}
      </span>
    </div>
  );
}

export function ResultsModal({
  isOpen,
  store,
  mode,
  onPlayAgain,
  onMainMenu,
}: ResultsModalProps) {
  const players = useStore(store, (s) => s.players);
  const flips = useStore(store, (s) => s.flips);
  const timer = useStore(store, (s) => s.timer);
  const bestStreak = useStore(store, (s) => s.bestStreak);
  const board = useStore(store, (s) => s.board);

  const [step, setStep] = useState<1 | 2>(1);

  // Reset to step 1 whenever the modal opens
  useEffect(() => {
    if (isOpen) setStep(1);
  }, [isOpen]);

  const matchedPairs = board.filter((c) => c.isMatched).length / 2;
  const accuracy = flips > 0 ? `${Math.round((matchedPairs * 2) / flips * 100)}%` : "—";

  const secondaryBtnClass = "w-full";

  /* ── Step 2: CTA ── */
  if (step === 2) {
    return (
      <Modal isOpen={isOpen} onClose={onPlayAgain} ariaLabel="Learn about Holi" maxWidth={400} variant="frosted">
        <div className="flex flex-col items-center gap-5 text-center">
          {/* Placeholder for HAF Holi Toolkit graphic */}
          <div
            className="flex items-center justify-center rounded-[var(--radius-card)]"
            style={{
              width: 200,
              height: 200,
              backgroundColor: "rgba(244, 232, 208, 0.14)",
              border: "1.5px solid rgba(184, 150, 106, 0.45)",
            }}
          >
            <span
              className="font-display text-sm px-4"
              style={{ color: "var(--text-secondary-light)" }}
            >
              HAF Holi Toolkit
            </span>
          </div>

          {/* CTA button */}
          <Button
            variant="primary"
            className="w-full max-w-[280px]"
            onClick={() => window.open("https://www.hinduamerican.org/holi", "_blank")}
          >
            {copy.results.learnCta}
          </Button>

          {/* Navigation */}
          <div className="flex flex-col gap-3 w-full max-w-[280px]">
            <Button variant="secondary" onClick={onPlayAgain} className={secondaryBtnClass}>
              {copy.results.playAgain}
            </Button>
            <Button variant="secondary" onClick={onMainMenu} className={secondaryBtnClass}>
              {copy.results.backToMenu}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  /* ── Step 1: Stats (2P) ── */
  if (mode === "2p") {
    const p1 = players[0];
    const p2 = players[1];
    const isTie = p1 && p2 && p1.score === p2.score;
    const winner = p1 && p2 ? (p1.score >= p2.score ? p1 : p2) : p1;
    const winnerAvatar = winner ? avatarMap.get(winner.avatarId) : null;

    return (
      <Modal isOpen={isOpen} onClose={() => setStep(2)} ariaLabel="Game results" maxWidth={480} variant="frosted">
        <div className="flex flex-col items-center gap-5 text-center">
          <EyebrowLabel color="marigold">{copy.results.gameOver}</EyebrowLabel>

          {/* Winner banner */}
          <div className="flex items-center gap-3">
            {winnerAvatar && !isTie && (
              <Avatar src={winnerAvatar.image} name={winnerAvatar.name} size={48} />
            )}
            <DisplayHeading size="lg" color="parchment">
              {isTie
                ? copy.results.tieBanner
                : copy.results.winnerBanner.replace("{name}", winner?.name ?? "Player")}
            </DisplayHeading>
          </div>

          {/* Both players' scores */}
          <div className="flex items-center justify-center gap-6 w-full">
            {players.map((player) => {
              const av = avatarMap.get(player.avatarId);
              const isWinner = !isTie && player.id === winner?.id;
              return (
                <div
                  key={player.id}
                  className="flex flex-col items-center gap-2 rounded-[var(--radius-button)] px-4 py-3"
                  style={{
                    border: isWinner
                      ? "2px solid var(--c-marigold)"
                      : "1.5px solid rgba(184, 150, 106, 0.45)",
                    backgroundColor: isWinner
                      ? "rgba(216, 154, 44, 0.18)"
                      : "rgba(244, 232, 208, 0.14)",
                  }}
                >
                  {av && <Avatar src={av.image} name={av.name} size={40} />}
                  <span
                    className="font-display text-sm"
                    style={{ color: "var(--c-parchment)" }}
                  >
                    {player.name}
                  </span>
                  <span
                    className="font-display text-xl"
                    style={{ color: isWinner ? "var(--c-marigold)" : "var(--c-parchment)" }}
                  >
                    {player.score}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-4">
            <StatCard label={copy.results.totalTime} value={formatTime(timer)} />
            <StatCard label={copy.results.totalMoves} value={String(flips)} />
          </div>

          {/* Continue to CTA */}
          <Button variant="primary" onClick={() => setStep(2)} className="w-full max-w-[280px]">
            {copy.results.continueButton}
          </Button>
        </div>
      </Modal>
    );
  }

  /* ── Step 1: Stats (1P) ── */
  return (
    <Modal isOpen={isOpen} onClose={() => setStep(2)} ariaLabel="Game results" maxWidth={440} variant="frosted">
      <div className="flex flex-col items-center gap-5 text-center">
        <EyebrowLabel color="marigold">{copy.results.gameComplete}</EyebrowLabel>

        <DisplayHeading size="lg" underline color="parchment">
          {copy.results.heading}
        </DisplayHeading>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <StatCard label={copy.results.totalTime} value={formatTime(timer)} />
          <StatCard label={copy.results.totalMoves} value={String(flips)} />
          <StatCard label={copy.gameplay.accuracyLabel} value={accuracy} />
          <StatCard label={copy.gameplay.bestStreakLabel} value={String(bestStreak)} />
        </div>

        {/* Continue to CTA */}
        <Button variant="primary" onClick={() => setStep(2)} className="w-full max-w-[280px]">
          {copy.results.continueButton}
        </Button>
      </div>
    </Modal>
  );
}
