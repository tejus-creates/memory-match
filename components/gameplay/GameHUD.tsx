"use client";

import { useState } from "react";
import { useStore } from "zustand/react";
import type { StoreApi } from "zustand/vanilla";
import type { GameStore, GameMode } from "@/lib/engine/game-state";
import { Avatar } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/IconButton";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { avatars } from "@/themes/holi/avatars";
import { copy } from "@/themes/holi/copy";

interface GameHUDProps {
  store: StoreApi<GameStore>;
  onPause: () => void;
  onRestart: () => void;
  onQuit: () => void;
  mode: GameMode;
}

const avatarMap = new Map(avatars.map((a) => [a.id, a]));

/* ── Hamburger menu icon ── */
function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="5" x2="17" y2="5" />
      <line x1="3" y1="10" x2="17" y2="10" />
      <line x1="3" y1="15" x2="17" y2="15" />
    </svg>
  );
}

/* ── Pause icon ── */
function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="7" y1="4" x2="7" y2="16" />
      <line x1="13" y1="4" x2="13" y2="16" />
    </svg>
  );
}

/* ── Format time as M:SS ── */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ── Mobile menu modal (matches desktop PauseModal style) ── */
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { Player } from "@/lib/engine/game-state";

function MobileMenuModal({
  isOpen,
  onClose,
  onRestart,
  onQuit,
  mode,
  players,
  accuracy,
  streak,
  bestStreak,
  flips,
  timer,
}: {
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
  onQuit: () => void;
  mode: GameMode;
  players: Player[];
  accuracy: string;
  streak: number;
  bestStreak: number;
  flips: number;
  timer: number;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="Game menu" maxWidth={360} variant="frosted">
      <div className="flex flex-col items-center gap-4">
        <h2
          className="font-display text-lg"
          style={{ color: "var(--c-parchment)" }}
        >
          {copy.pauseModal.heading}
        </h2>

        {/* Stats */}
        {mode === "2p" ? (
          /* 2P: per-player stats */
          <div className="w-full flex flex-col gap-3">
            {players.map((player) => {
              const av = avatarMap.get(player.avatarId);
              return (
                <div key={player.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <Avatar src={av?.image ?? "/avatars/avatars_0002_flame.webp"} name={av?.name ?? player.name} size={28} />
                    <span className="font-display text-sm" style={{ color: "var(--c-parchment)" }}>
                      {player.name}
                    </span>
                    <span className="font-body text-sm font-bold tabular-nums ml-auto" style={{ color: "var(--c-marigold)" }}>
                      {player.score} matches
                    </span>
                  </div>
                </div>
              );
            })}
            <div
              className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2"
              style={{ borderTop: "1px solid var(--border-thin)" }}
            >
              <StatRow label={copy.gameplay.timeLabel} value={formatTime(timer)} />
              <StatRow label={copy.gameplay.turnLabel} value={String(flips)} />
              <StatRow label={copy.gameplay.accuracyLabel} value={accuracy} />
            </div>
          </div>
        ) : (
          /* 1P: all stats */
          <div className="w-full grid grid-cols-2 gap-x-4 gap-y-1">
            <StatRow label={copy.gameplay.accuracyLabel} value={accuracy} />
            <StatRow label={copy.gameplay.streakLabel} value={String(streak)} />
            <StatRow label={copy.gameplay.bestStreakLabel} value={String(bestStreak)} />
            <StatRow label={copy.gameplay.turnLabel} value={String(flips)} />
            <StatRow label={copy.gameplay.timeLabel} value={formatTime(timer)} />
          </div>
        )}

        {/* Actions — same as PauseModal */}
        <div className="flex flex-col gap-3 w-full pt-2">
          <Button variant="primary" onClick={onClose} className="w-full">
            {copy.pauseModal.resumeButton}
          </Button>
          <Button
            variant="secondary"
            onClick={() => { onRestart(); onClose(); }}
            className="w-full"
          >
            Restart
          </Button>
          <Button
            variant="secondary"
            onClick={() => { onQuit(); onClose(); }}
            className="w-full"
          >
            {copy.pauseModal.quitButton}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-body text-xs" style={{ color: "var(--text-secondary-light)" }}>
        {label}
      </span>
      <span className="font-body text-sm tabular-nums" style={{ color: "var(--c-parchment)" }}>
        {value}
      </span>
    </div>
  );
}

/* ── Inline stat (desktop 1P center) ── */
function InlineStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-baseline gap-1">
      <span className="font-body text-xs" style={{ color: "var(--text-secondary-light)" }}>
        {label}
      </span>
      <span className="font-body text-sm tabular-nums" style={{ color: "var(--c-parchment)" }}>
        {value}
      </span>
    </span>
  );
}

/* ── Player chip (2P mode) ── */
function PlayerChip({
  name,
  avatarId,
  score,
  isActive,
  size,
}: {
  name: string;
  avatarId: string;
  score: number;
  isActive: boolean;
  size: number;
}) {
  const av = avatarMap.get(avatarId);
  return (
    <div
      className="relative flex items-center gap-2 shrink-0 rounded-[var(--radius-button)] px-2 py-1.5 transition-all duration-200"
      style={{
        opacity: isActive ? 1 : 0.5,
        backgroundColor: isActive ? "rgba(216, 154, 44, 0.15)" : "transparent",
      }}
    >
      <Avatar src={av?.image ?? "/avatars/avatars_0002_flame.webp"} name={av?.name ?? name} size={size} />
      <span
        className="font-display text-base sm:text-lg truncate max-w-[56px] sm:max-w-[110px]"
        style={{ color: "var(--text-primary-light)" }}
      >
        {name}
      </span>
      <span
        className="font-body text-sm tabular-nums ml-2"
        style={{ color: isActive ? "var(--c-marigold)" : "var(--text-secondary-light)" }}
      >
        Matches: {score}
      </span>
    </div>
  );
}

/* ── Main HUD ── */

export function GameHUD({ store, onPause, onRestart, onQuit, mode }: GameHUDProps) {
  const players = useStore(store, (s) => s.players);
  const activePlayerId = useStore(store, (s) => s.activePlayerId);
  const board = useStore(store, (s) => s.board);
  const difficulty = useStore(store, (s) => s.difficulty);
  const flips = useStore(store, (s) => s.flips);
  const streak = useStore(store, (s) => s.streak);
  const bestStreak = useStore(store, (s) => s.bestStreak);
  const timer = useStore(store, (s) => s.timer);

  const [menuOpen, setMenuOpen] = useState(false);

  const matchedPairs = board.filter((c) => c.isMatched).length / 2;
  const accuracy = flips > 0 ? `${Math.round((matchedPairs * 2) / flips * 100)}%` : "—";

  const activePlayer = players.find((p) => p.id === activePlayerId);
  const avatarData = activePlayer ? avatarMap.get(activePlayer.avatarId) : null;

  const barStyle = {
    height: 68,
    background: "rgba(42, 24, 16, 0.4)",
    borderBottom: "0.5px solid rgba(244, 232, 208, 0.25)",
  };
  const barClassName = "backdrop-blur-[4px]";

  /* ── 1P MODE ── */
  if (mode === "1p") {
    return (
      <div className="shrink-0 relative">
        <div className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 ${barClassName}`} style={barStyle}>
          {/* Player info */}
          <div className="flex items-center gap-2 shrink-0">
            {avatarData && (
              <Avatar src={avatarData.image} name={avatarData.name} size={44} />
            )}
            <span
              className="font-display text-base sm:text-lg truncate max-w-[80px] sm:max-w-[140px]"
              style={{ color: "var(--text-primary-light)" }}
            >
              {activePlayer?.name ?? "Player"}
            </span>
          </div>

          {/* Desktop: inline stats */}
          <div className="hidden sm:flex flex-1 items-center justify-center gap-4 min-w-0">
            <InlineStat label={copy.gameplay.accuracyLabel} value={accuracy} />
            <span style={{ color: "var(--border-thin)" }}>·</span>
            <InlineStat label={copy.gameplay.streakLabel} value={String(streak)} />
            <span style={{ color: "var(--border-thin)" }}>·</span>
            <InlineStat label={copy.gameplay.bestStreakLabel} value={String(bestStreak)} />
          </div>

          {/* Mobile: spacer */}
          <div className="flex-1 sm:hidden" />

          {/* Controls */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Desktop: pause button */}
            <div className="hidden sm:block">
              <IconButton aria-label="Pause game" onClick={onPause}>
                <PauseIcon />
              </IconButton>
            </div>
            {/* Mobile: hamburger menu */}
            <div className="sm:hidden">
              <IconButton aria-label="Game menu" onClick={() => { if (!menuOpen) store.getState().pause(); setMenuOpen(!menuOpen); }}>
                <MenuIcon />
              </IconButton>
            </div>
            <SoundToggle />
          </div>
        </div>

        {/* Mobile menu modal */}
        <MobileMenuModal
          isOpen={menuOpen}
          onClose={() => { setMenuOpen(false); store.getState().resume(); }}
          onRestart={onRestart}
          onQuit={onQuit}
          mode={mode}
          players={players}
          accuracy={accuracy}
          streak={streak}
          bestStreak={bestStreak}
          flips={flips}
          timer={timer}
        />
      </div>
    );
  }

  /* ── 2P MODE — single top bar: Player 1 | controls | Player 2 ── */
  return (
    <div className="shrink-0 relative">
      <div className={`relative flex items-center justify-between px-4 sm:px-6 ${barClassName}`} style={barStyle}>
        {/* Player 1 — left */}
        <div className="shrink-0">
          {players[0] && (
            <PlayerChip
              name={players[0].name}
              avatarId={players[0].avatarId}
              score={players[0].score}
              isActive={players[0].id === activePlayerId}
              size={36}
            />
          )}
        </div>

        {/* Center controls — absolutely positioned so they stay centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1">
          <div className="hidden sm:block">
            <IconButton aria-label="Pause game" onClick={onPause}>
              <PauseIcon />
            </IconButton>
          </div>
          <div className="sm:hidden">
            <IconButton aria-label="Game menu" onClick={() => { if (!menuOpen) store.getState().pause(); setMenuOpen(!menuOpen); }}>
              <MenuIcon />
            </IconButton>
          </div>
          <SoundToggle />
        </div>

        {/* Player 2 — right */}
        <div className="shrink-0">
          {players[1] && (
            <PlayerChip
              name={players[1].name}
              avatarId={players[1].avatarId}
              score={players[1].score}
              isActive={players[1].id === activePlayerId}
              size={36}
            />
          )}
        </div>
      </div>

      {/* Mobile menu modal */}
      <MobileMenuModal
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onRestart={onRestart}
        onQuit={onQuit}
        mode={mode}
        players={players}
        accuracy={accuracy}
        streak={streak}
        bestStreak={bestStreak}
        flips={flips}
        timer={timer}
      />
    </div>
  );
}
