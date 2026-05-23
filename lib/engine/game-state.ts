import { createStore } from "zustand/vanilla";
import type { CardContent } from "./types";
import { dealCards } from "./shuffle";

/* ─── Domain types ─── */

export type Player = {
  id: 1 | 2;
  name: string;
  avatarId: string;
  score: number;
};

export type Card = {
  id: string; // matches CardContent.id
  uid: string; // unique per card instance (pairs share id)
  isFlipped: boolean;
  isMatched: boolean;
  position: number;
};

export type GameStatus = "idle" | "playing" | "paused" | "won";
export type Difficulty = 6 | 12 | 20 | 28;
export type GameMode = "1p" | "2p";

export type GameState = {
  mode: GameMode;
  players: Player[];
  activePlayerId: 1 | 2;
  deckId: string;
  difficulty: Difficulty;
  board: Card[];
  flippedCards: Card[];
  timer: number;
  flips: number;
  streak: number;
  bestStreak: number;
  status: GameStatus;
  showingMatchModal: CardContent | null;
};

/* ─── Actions ─── */

export type GameActions = {
  initGame: (opts: {
    mode: GameMode;
    players: Pick<Player, "name" | "avatarId">[];
    deckId: string;
    difficulty: Difficulty;
    cardPool: string[]; // all available card IDs from theme
  }) => void;

  flipCard: (uid: string) => void;
  resolveMatch: () => void;
  resolveNoMatch: () => void;
  dismissMatchModal: () => void;

  pause: () => void;
  resume: () => void;

  tick: () => void; // called by a 1s interval while playing
  reset: () => void;
};

export type GameStore = GameState & GameActions;

/* ─── Initial state ─── */

const initialState: GameState = {
  mode: "1p",
  players: [],
  activePlayerId: 1,
  deckId: "",
  difficulty: 6,
  board: [],
  flippedCards: [],
  timer: 0,
  flips: 0,
  streak: 0,
  bestStreak: 0,
  status: "idle",
  showingMatchModal: null,
};

/* ─── Helpers ─── */

function calculateStars(flips: number, pairs: number): number {
  const perfect = pairs * 2;
  if (flips <= perfect * 1.5) return 3;
  if (flips <= perfect * 2) return 2;
  return 1;
}

export { calculateStars };

/* ─── Store factory ─── */

export function createGameStore(
  getCardContent?: (id: string) => CardContent | undefined
) {
  return createStore<GameStore>()((set, get) => ({
    ...initialState,

    initGame({ mode, players, deckId, difficulty, cardPool }) {
      const dealt = dealCards(cardPool, difficulty);
      const board: Card[] = dealt.map((c) => ({
        id: c.id,
        uid: c.uid,
        isFlipped: false,
        isMatched: false,
        position: c.position,
      }));

      set({
        ...initialState,
        mode,
        players: players.map((p, i) => ({
          id: (i + 1) as 1 | 2,
          name: p.name,
          avatarId: p.avatarId,
          score: 0,
        })),
        activePlayerId: 1,
        deckId,
        difficulty,
        board,
        flippedCards: [],
        status: "playing",
      });
    },

    flipCard(uid: string) {
      const { board, flippedCards, status } = get();
      if (status !== "playing") return;
      if (flippedCards.length >= 2) return;

      const card = board.find((c) => c.uid === uid);
      if (!card || card.isFlipped || card.isMatched) return;

      const updatedBoard = board.map((c) =>
        c.uid === uid ? { ...c, isFlipped: true } : c
      );
      const updatedFlipped = [...flippedCards, { ...card, isFlipped: true }];

      set({
        board: updatedBoard,
        flippedCards: updatedFlipped,
        flips: get().flips + 1,
      });

      // If two cards are now flipped, check for match
      if (updatedFlipped.length === 2) {
        const [first, second] = updatedFlipped;
        if (first.id === second.id) {
          // Match found
          const matchedBoard = updatedBoard.map((c) =>
            c.id === first.id ? { ...c, isMatched: true } : c
          );

          const { players, activePlayerId, streak } = get();
          const updatedPlayers = players.map((p) =>
            p.id === activePlayerId ? { ...p, score: p.score + 1 } : p
          );
          const newStreak = streak + 1;

          const content = getCardContent?.(first.id) ?? null;

          set({
            board: matchedBoard,
            players: updatedPlayers,
            streak: newStreak,
            bestStreak: Math.max(get().bestStreak, newStreak),
            showingMatchModal: content,
          });
        }
        // No match case: UI calls resolveNoMatch() after the 1.2s delay
      }
    },

    resolveMatch() {
      const { board, mode, activePlayerId } = get();
      const allMatched = board.every((c) => c.isMatched);

      if (allMatched) {
        set({
          flippedCards: [],
          showingMatchModal: null,
          status: "won",
        });
        return;
      }

      // In 2P, matcher keeps their turn. In 1P, there's only one player.
      set({
        flippedCards: [],
        showingMatchModal: null,
        // activePlayerId stays the same — matcher gets another turn
      });
    },

    resolveNoMatch() {
      const { board, flippedCards, mode, activePlayerId } = get();
      if (flippedCards.length !== 2) return;

      const [first, second] = flippedCards;
      const updatedBoard = board.map((c) =>
        c.uid === first.uid || c.uid === second.uid
          ? { ...c, isFlipped: false }
          : c
      );

      const nextPlayer: 1 | 2 =
        mode === "2p" ? (activePlayerId === 1 ? 2 : 1) : activePlayerId;

      set({
        board: updatedBoard,
        flippedCards: [],
        activePlayerId: nextPlayer,
        streak: 0,
      });
    },

    dismissMatchModal() {
      const state = get();
      if (!state.showingMatchModal) return;

      // Check win, then resolve
      state.resolveMatch();
    },

    pause() {
      if (get().status === "playing") {
        set({ status: "paused" });
      }
    },

    resume() {
      if (get().status === "paused") {
        set({ status: "playing" });
      }
    },

    tick() {
      if (get().status === "playing") {
        set({ timer: get().timer + 1 });
      }
    },

    reset() {
      set({ ...initialState });
    },
  }));
}
