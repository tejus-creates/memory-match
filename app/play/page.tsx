"use client";

import {
  Suspense,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useStore } from "zustand";
import { Card } from "@/components/ui/Card";
import type { CardState } from "@/components/ui/Card";
import { MatchModal } from "@/components/ui/MatchModal";
import { GameHUD } from "@/components/gameplay/GameHUD";
import { PauseModal } from "@/components/gameplay/PauseModal";
import { getGamePrefs, getPlayerPrefs } from "@/lib/engine/storage";
import {
  createGameStore,
  type Card as EngineCard,
  type Difficulty,
} from "@/lib/engine/game-state";
import { decks } from "@/themes/holi/decks";
import { cards as cardPool } from "@/themes/holi/cards";
import { playSound, warmContext } from "@/lib/sound";

/* ─── Fixed grid structures per orientation ─── */

type GridShape = { cols: number; rows: number };

/** Landscape / wide viewport (desktop): wider grids */
const GRID_LANDSCAPE: Record<number, GridShape> = {
  12: { cols: 4, rows: 3 },
  24: { cols: 6, rows: 4 },
  40: { cols: 8, rows: 5 },
  56: { cols: 8, rows: 7 },
};

/** Portrait / narrow viewport (phone): taller, narrower grids */
const GRID_PORTRAIT: Record<number, GridShape> = {
  12: { cols: 3, rows: 4 },
  24: { cols: 4, rows: 6 },
  40: { cols: 5, rows: 8 },
  56: { cols: 7, rows: 8 },
};

/** Absolute max cell size — prevents cards from becoming comically large */
const MAX_CELL_SIZE = 160;
/** Gap between cells in px */
const GRID_GAP = 8;
/** Vertical space reserved for the HUD/header chrome */
const HUD_RESERVE = 60;
/** Horizontal padding on each side — tighter on phones, generous on desktop */
const PAD_X_DESKTOP = 40;
const PAD_X_MOBILE = 10;
/** Vertical padding above and below the grid */
const PAD_Y = 32;

function padX(): number {
  return window.innerWidth < 640 ? PAD_X_MOBILE : PAD_X_DESKTOP;
}

/**
 * Compute the largest square cell size that fits the entire grid
 * within the viewport on BOTH axes, then cap at MAX_CELL_SIZE.
 */
function computeCellSize(
  cols: number,
  rows: number,
): number {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const availW = vw - padX() * 2;
  const availH = vh - HUD_RESERVE - PAD_Y * 2;

  const fitW = (availW - (cols - 1) * GRID_GAP) / cols;
  const fitH = (availH - (rows - 1) * GRID_GAP) / rows;

  // Use the binding constraint — whichever axis is tighter
  return Math.min(fitW, fitH, MAX_CELL_SIZE);
}

/**
 * Hook: responsive cell size that fits both axes.
 * Recomputes on resize so the board always fits without scrolling.
 */
function useCellSize(cols: number, rows: number): number {
  const [size, setSize] = useState(80); // safe default before mount

  useEffect(() => {
    function recalc() {
      setSize(computeCellSize(cols, rows));
    }
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [cols, rows]);

  return size;
}

/* ─── Card content lookup ─── */

const cardContentMap = new Map(cardPool.map((c) => [c.id, c]));

/** Strip the `::N` pair-index suffix added by dealCards for reused cards */
function baseCardId(id: string): string {
  const sep = id.indexOf("::");
  return sep === -1 ? id : id.slice(0, sep);
}

function getCardContent(id: string) {
  return cardContentMap.get(baseCardId(id));
}

/* ─── Map engine card state → visual Card state ─── */

function toCardState(card: EngineCard, flippedUids: Set<string>): CardState {
  if (card.isMatched) return "matched";
  if (card.isFlipped || flippedUids.has(card.uid)) return "active";
  return "face-down";
}

/* ─── Valid pair counts ─── */
const VALID_PAIRS = [6, 12, 20, 28] as const;

/* ─── No-match resolve delay (ms) ─── */
const MISMATCH_DELAY = 1200;

/* ─── Inner component ─── */

function PlayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resolveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mounted, setMounted] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine pair count from query param or saved prefs
  // Only read localStorage after mount (client-side)
  const pairsOverride = searchParams.get("pairs");

  const pairs = useMemo(() => {
    if (pairsOverride) {
      const n = parseInt(pairsOverride, 10);
      if (VALID_PAIRS.includes(n as (typeof VALID_PAIRS)[number])) return n;
    }
    if (!mounted) return 6; // stable default for SSR + first client render
    const prefs = getGamePrefs();
    if (prefs?.difficulty) {
      const d = prefs.difficulty;
      if (VALID_PAIRS.includes(d as (typeof VALID_PAIRS)[number])) return d;
    }
    return 6;
  }, [pairsOverride, mounted]);

  const totalCards = pairs * 2;

  // Choose grid structure ONCE at init based on viewport orientation,
  // then lock it for the game session (never changes during play).
  const [grid, setGrid] = useState<GridShape>({ cols: 4, rows: 3 });
  const gridInitRef = useRef(false);

  useEffect(() => {
    if (!mounted) return;
    if (gridInitRef.current) return; // already locked
    gridInitRef.current = true;
    const isPortrait = window.innerHeight > window.innerWidth;
    const table = isPortrait ? GRID_PORTRAIT : GRID_LANDSCAPE;
    setGrid(table[totalCards] ?? { cols: 4, rows: 3 });
  }, [totalCards, mounted]);

  // Determine deck back image — only read prefs after mount
  const deckImage = useMemo(() => {
    if (!mounted) return decks[0].image;
    const prefs = getGamePrefs();
    if (prefs?.deckId) {
      const deck = decks.find((d) => d.id === prefs.deckId);
      if (deck) return deck.image;
    }
    return decks[0].image;
  }, [mounted]);

  // Create store eagerly (pure — safe in useMemo)
  const store = useMemo(() => createGameStore(getCardContent), []);

  // Init game on mount / when pairs change — only after mounted
  useEffect(() => {
    if (!mounted) return;

    const p1 = getPlayerPrefs(1);
    const prefs = getGamePrefs();

    store.getState().initGame({
      mode: "1p",
      players: [
        {
          name: p1?.name ?? "Player 1",
          avatarId: p1?.avatarId ?? "flame",
        },
      ],
      deckId: prefs?.deckId ?? decks[0].id,
      difficulty: pairs as Difficulty,
      cardPool: cardPool.map((c) => c.id),
    });

    return () => {
      if (resolveTimerRef.current) clearTimeout(resolveTimerRef.current);
    };
  }, [pairs, store, mounted]);

  // Subscribe to store for re-renders
  const board = useStore(store, (s) => s.board);
  const flippedCards = useStore(store, (s) => s.flippedCards);
  const status = useStore(store, (s) => s.status);
  const flips = useStore(store, (s) => s.flips);
  const showingMatchModal = useStore(store, (s) => s.showingMatchModal);

  // Timer tick — drives the game clock; tick() is a no-op when paused/won
  useEffect(() => {
    if (!mounted) return;
    const id = setInterval(() => store.getState().tick(), 1000);
    return () => clearInterval(id);
  }, [mounted, store]);

  // Pause / resume handlers
  const handlePause = useCallback(() => {
    store.getState().pause();
    setPauseOpen(true);
    playSound("tap");
  }, [store]);

  const handleResume = useCallback(() => {
    store.getState().resume();
    setPauseOpen(false);
  }, [store]);

  const handleRestart = useCallback(() => {
    setPauseOpen(false);
    const p1 = getPlayerPrefs(1);
    const prefs = getGamePrefs();
    store.getState().initGame({
      mode: "1p",
      players: [
        {
          name: p1?.name ?? "Player 1",
          avatarId: p1?.avatarId ?? "flame",
        },
      ],
      deckId: prefs?.deckId ?? decks[0].id,
      difficulty: pairs as Difficulty,
      cardPool: cardPool.map((c) => c.id),
    });
  }, [store, pairs]);

  const handleQuit = useCallback(() => {
    setPauseOpen(false);
    store.getState().reset();
    router.push("/menu");
  }, [store, router]);

  // Gate modal visibility with a local flag so we can delay appearance
  // by ~250ms after the match registers (the engine sets showingMatchModal
  // immediately in flipCard; we hold it back for a beat).
  const [modalReady, setModalReady] = useState(false);
  const modalIsOpen = !!showingMatchModal && modalReady;

  // Keep a snapshot of the last non-null modal content so props stay
  // valid during the Modal's 150ms exit animation (avoids <img src="">).
  const matchModalContentRef = useRef(showingMatchModal);
  if (showingMatchModal) {
    matchModalContentRef.current = showingMatchModal;
  }
  const modalContent = matchModalContentRef.current;

  const flippedUids = useMemo(
    () => new Set(flippedCards.map((c) => c.uid)),
    [flippedCards],
  );

  // Track which cards are currently shaking (mismatch animation)
  const [shakingUids, setShakingUids] = useState<Set<string>>(new Set());
  const shakeTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Handle match / mismatch resolution
  useEffect(() => {
    if (flippedCards.length !== 2) return;

    const [first, second] = flippedCards;
    const isMatch = first.id === second.id;

    const FLIP_DURATION = 300;

    if (isMatch) {
      // Sequence: flip completes → match sound (pulse) → 250ms beat →
      // modal appears + chime fire together.
      const BEAT_DELAY = 250;

      const pulseStart = setTimeout(() => {
        playSound("match");
      }, FLIP_DURATION);

      const modalAppear = setTimeout(() => {
        playSound("chime");
        setModalReady(true);
      }, FLIP_DURATION + BEAT_DELAY);

      shakeTimersRef.current = [pulseStart, modalAppear];
    } else {
      // Wait for flip to finish → shake + sound fire together → flip back
      const SHAKE_DURATION = 500;

      // 1. After both cards are fully face-up, shake + sound start together
      const shakeStart = setTimeout(() => {
        setShakingUids(new Set([first.uid, second.uid]));
        playSound("mismatch");
      }, FLIP_DURATION);

      // 2. After shake finishes, clear it
      const shakeEnd = setTimeout(() => {
        setShakingUids(new Set());
      }, FLIP_DURATION + SHAKE_DURATION);

      shakeTimersRef.current = [shakeStart, shakeEnd];

      // 3. Flip back shortly after shake ends
      const t = setTimeout(() => {
        store.getState().resolveNoMatch();
      }, FLIP_DURATION + SHAKE_DURATION + 200);
      resolveTimerRef.current = t;
    }

    return () => {
      if (resolveTimerRef.current) clearTimeout(resolveTimerRef.current);
      shakeTimersRef.current.forEach(clearTimeout);
    };
  }, [flippedCards, store]);

  // Win detection
  useEffect(() => {
    if (status === "won") {
      playSound("win");
      // eslint-disable-next-line no-console
      console.log(`[Game Won] Flips: ${flips}, Pairs: ${pairs}`);
    }
  }, [status, flips, pairs]);

  // Dismiss match modal → resolve match → cards settle
  const handleDismissMatch = useCallback(() => {
    setModalReady(false);
    store.getState().dismissMatchModal();
  }, [store]);

  // Handle card tap
  const handleFlip = useCallback(
    (uid: string) => {
      const state = store.getState();
      if (state.status !== "playing") return;
      if (state.flippedCards.length >= 2) return;
      if (state.showingMatchModal) return; // block flips while modal is open

      // Pre-warm AudioContext during this user gesture so sounds
      // scheduled in upcoming timeouts (match/mismatch) don't lag.
      warmContext();
      playSound("flip");
      state.flipCard(uid);
    },
    [store],
  );

  // Responsive cell size: fits both width AND height
  const cellSize = useCellSize(grid.cols, grid.rows);

  // ── Pre-mount placeholder: identical on server + first client render ──
  if (!mounted) {
    return (
      <main className="relative flex h-dvh flex-col overflow-hidden">
        <div
          className="shrink-0"
          style={{
            height: HUD_RESERVE,
            background: "rgba(42, 24, 16, 0.55)",
            borderBottom: "1px solid var(--border-thin)",
          }}
        />
        <div className="flex flex-1 items-center justify-center">
          <span
            className="font-[var(--font-body)] text-sm"
            style={{ color: "var(--text-secondary-light)" }}
          >
            Loading&hellip;
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden">
      {/* ── Game HUD ── */}
      <GameHUD store={store} onPause={handlePause} />

      {/* TEMPORARY: card-count test buttons */}
      <div className="absolute top-[62px] right-2 z-40 flex gap-1.5">
        {VALID_PAIRS.map((p) => (
          <a
            key={p}
            href={`/play?pairs=${p}`}
            className={[
              "rounded px-2 py-1 font-[var(--font-body)] text-xs transition-colors",
              p === pairs
                ? "bg-[var(--c-marigold)] text-[var(--c-ink)]"
                : "bg-[var(--surface-overlay)] text-[var(--text-primary-light)] hover:bg-[var(--c-marigold)]/30",
            ].join(" ")}
          >
            {p * 2}
          </a>
        ))}
      </div>

      {/* Centering region: flex-1 takes all remaining height,
       *  items-center + justify-center dead-centers the grid */}
      <div className="flex flex-1 items-center justify-center">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${grid.cols}, ${cellSize}px)`,
            gridAutoRows: `${cellSize}px`,
            gap: `${GRID_GAP}px`,
            flexShrink: 0,
          }}
        >
          {board.map((card) => {
            const content = cardContentMap.get(baseCardId(card.id));
            const cardState = toCardState(card, flippedUids);
            const canFlip =
              cardState === "face-down" &&
              status === "playing" &&
              flippedCards.length < 2;

            return (
              <div
                key={card.uid}
                style={{ aspectRatio: "1", minWidth: 0 }}
              >
                <Card
                  state={cardState}
                  frontImage={content?.image ?? ""}
                  backImage={deckImage}
                  name={content?.name ?? card.id}
                  onClick={canFlip ? () => handleFlip(card.uid) : undefined}
                  disabled={!canFlip}
                  shaking={shakingUids.has(card.uid)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Match modal — educational content on successful match */}
      <MatchModal
        isOpen={modalIsOpen}
        onClose={handleDismissMatch}
        image={modalContent?.image ?? ""}
        name={modalContent?.name ?? ""}
        blurb={modalContent?.blurb ?? ""}
      />

      {/* Pause modal */}
      <PauseModal
        isOpen={pauseOpen}
        onResume={handleResume}
        onRestart={handleRestart}
        onQuit={handleQuit}
      />

      {/* Debug overlay */}
      <div className="fixed bottom-2 left-2 z-50 rounded bg-black/70 px-2 py-1 font-[var(--font-body)] text-[11px] text-white/80">
        {board.length} cards · {grid.cols}×{grid.rows} · {Math.round(cellSize)}px
        {" · "}flips: {flips}
        {" · "}status: {status}
        {status === "won" && " 🎉"}
      </div>
    </main>
  );
}

/* ─── Page export with Suspense boundary ─── */

export default function PlayPage() {
  return (
    <Suspense>
      <PlayContent />
    </Suspense>
  );
}
