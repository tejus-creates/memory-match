"use client";

import { useStore } from "zustand/react";
import type { StoreApi } from "zustand/vanilla";
import type { GameStore } from "@/lib/engine/game-state";
import { Avatar } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/IconButton";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { avatars } from "@/themes/holi/avatars";

interface GameHUDProps {
  store: StoreApi<GameStore>;
  onPause: () => void;
}

const avatarMap = new Map(avatars.map((a) => [a.id, a]));

export function GameHUD({ store, onPause }: GameHUDProps) {
  const players = useStore(store, (s) => s.players);
  const activePlayerId = useStore(store, (s) => s.activePlayerId);
  const board = useStore(store, (s) => s.board);
  const difficulty = useStore(store, (s) => s.difficulty);
  const mode = useStore(store, (s) => s.mode);

  const matchedPairs = board.filter((c) => c.isMatched).length / 2;
  const totalPairs = difficulty;
  const progressPercent = totalPairs > 0 ? (matchedPairs / totalPairs) * 100 : 0;

  const activePlayer = players.find((p) => p.id === activePlayerId);
  const avatarData = activePlayer ? avatarMap.get(activePlayer.avatarId) : null;

  return (
    <div
      className="shrink-0 flex items-center gap-2 sm:gap-3 px-3 sm:px-4"
      style={{
        height: 60,
        background: "rgba(42, 24, 16, 0.55)",
        borderBottom: "1px solid var(--border-thin)",
      }}
    >
      {/* Current player */}
      <div className="flex items-center gap-2 shrink-0">
        {avatarData && (
          <Avatar src={avatarData.image} name={avatarData.name} size={40} selected={mode === "2p"} />
        )}
        <span
          className="font-display text-base sm:text-lg truncate max-w-[88px] sm:max-w-[140px]"
          style={{ color: "var(--text-primary-light)" }}
        >
          {activePlayer?.name ?? "Player"}
        </span>
      </div>

      {/* Progress bar + count — centered, capped at ~50% strip width */}
      <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
        <div
          className="h-3 rounded-full overflow-hidden"
          style={{
            width: "clamp(60px, 35vw, 400px)",
            flexShrink: 1,
            backgroundColor: "rgba(244, 232, 208, 0.15)",
          }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: "var(--c-marigold)",
              transition: "width 400ms ease-out",
            }}
          />
        </div>
        <span
          className="font-body text-xs tabular-nums shrink-0"
          style={{ color: "var(--text-secondary-light)" }}
        >
          {matchedPairs}&thinsp;/&thinsp;{totalPairs}
        </span>
      </div>

      {/* Pause + Sound controls */}
      <div className="flex items-center gap-1 shrink-0">
        <IconButton aria-label="Pause game" onClick={onPause}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="7" y1="4" x2="7" y2="16" />
            <line x1="13" y1="4" x2="13" y2="16" />
          </svg>
        </IconButton>
        <SoundToggle />
      </div>
    </div>
  );
}
