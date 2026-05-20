import { describe, it, expect, beforeEach } from "vitest";
import {
  createGameStore,
  calculateStars,
  type GameStore,
} from "../game-state";
import type { CardContent } from "../types";

/* ─── Test fixtures ─── */

const testCards: CardContent[] = [
  { id: "a", name: "Card A", image: "/a.webp", blurb: "Blurb A", category: "test" },
  { id: "b", name: "Card B", image: "/b.webp", blurb: "Blurb B", category: "test" },
  { id: "c", name: "Card C", image: "/c.webp", blurb: "Blurb C", category: "test" },
  { id: "d", name: "Card D", image: "/d.webp", blurb: "Blurb D", category: "test" },
  { id: "e", name: "Card E", image: "/e.webp", blurb: "Blurb E", category: "test" },
  { id: "f", name: "Card F", image: "/f.webp", blurb: "Blurb F", category: "test" },
];

const cardContentMap = new Map(testCards.map((c) => [c.id, c]));
const cardPool = testCards.map((c) => c.id);

function getCardContent(id: string) {
  return cardContentMap.get(id);
}

function initStore(
  opts: { mode?: "1p" | "2p"; difficulty?: 6 | 10 | 15 | 20 } = {}
) {
  const store = createGameStore(getCardContent);
  store.getState().initGame({
    mode: opts.mode ?? "1p",
    players:
      opts.mode === "2p"
        ? [
            { name: "Alice", avatarId: "flame" },
            { name: "Bob", avatarId: "water-drop" },
          ]
        : [{ name: "Alice", avatarId: "flame" }],
    deckId: "krishna",
    difficulty: opts.difficulty ?? 6,
    cardPool,
  });
  return store;
}

/** Find two unmatched cards that form a pair on the board */
function findPair(store: ReturnType<typeof createGameStore>) {
  const board = store.getState().board.filter((c) => !c.isMatched);
  for (let i = 0; i < board.length; i++) {
    for (let j = i + 1; j < board.length; j++) {
      if (board[i].id === board[j].id) {
        return [board[i], board[j]];
      }
    }
  }
  throw new Error("No pair found");
}

/** Find two unmatched cards that do NOT match */
function findNonPair(store: ReturnType<typeof createGameStore>) {
  const board = store.getState().board.filter((c) => !c.isMatched);
  for (let i = 0; i < board.length; i++) {
    for (let j = i + 1; j < board.length; j++) {
      if (board[i].id !== board[j].id) {
        return [board[i], board[j]];
      }
    }
  }
  throw new Error("All cards match — impossible with >1 pair");
}

/* ─── Tests ─── */

describe("createGameStore", () => {
  describe("initGame", () => {
    it("sets up the board with correct number of cards", () => {
      const store = initStore({ difficulty: 6 });
      const state = store.getState();
      expect(state.board).toHaveLength(12); // 6 pairs = 12 cards
      expect(state.status).toBe("playing");
      expect(state.timer).toBe(0);
      expect(state.flips).toBe(0);
    });

    it("creates correct number of players for 1P", () => {
      const store = initStore({ mode: "1p" });
      expect(store.getState().players).toHaveLength(1);
      expect(store.getState().players[0].id).toBe(1);
    });

    it("creates correct number of players for 2P", () => {
      const store = initStore({ mode: "2p" });
      const players = store.getState().players;
      expect(players).toHaveLength(2);
      expect(players[0].id).toBe(1);
      expect(players[1].id).toBe(2);
    });

    it("all cards start face-down and unmatched", () => {
      const store = initStore();
      for (const card of store.getState().board) {
        expect(card.isFlipped).toBe(false);
        expect(card.isMatched).toBe(false);
      }
    });

    it("each card ID appears exactly twice on the board", () => {
      const store = initStore();
      const counts = new Map<string, number>();
      for (const card of store.getState().board) {
        counts.set(card.id, (counts.get(card.id) ?? 0) + 1);
      }
      for (const count of counts.values()) {
        expect(count).toBe(2);
      }
    });
  });

  describe("flipCard", () => {
    it("flips a face-down card", () => {
      const store = initStore();
      const card = store.getState().board[0];
      store.getState().flipCard(card.uid);

      const updated = store.getState().board.find((c) => c.uid === card.uid)!;
      expect(updated.isFlipped).toBe(true);
      expect(store.getState().flips).toBe(1);
      expect(store.getState().flippedCards).toHaveLength(1);
    });

    it("does not flip an already-flipped card", () => {
      const store = initStore();
      const card = store.getState().board[0];
      store.getState().flipCard(card.uid);
      store.getState().flipCard(card.uid); // same card again

      expect(store.getState().flips).toBe(1);
      expect(store.getState().flippedCards).toHaveLength(1);
    });

    it("does not flip a matched card", () => {
      const store = initStore();
      const [a, b] = findPair(store);

      store.getState().flipCard(a.uid);
      store.getState().flipCard(b.uid);
      // Both matched now
      store.getState().dismissMatchModal();

      // Try flipping the matched card
      store.getState().flipCard(a.uid);
      expect(store.getState().flippedCards).toHaveLength(0);
    });

    it("does not allow a third flip while two are pending", () => {
      const store = initStore();
      const [a, b] = findNonPair(store);
      const third = store
        .getState()
        .board.find((c) => c.uid !== a.uid && c.uid !== b.uid)!;

      store.getState().flipCard(a.uid);
      store.getState().flipCard(b.uid);
      store.getState().flipCard(third.uid); // should be ignored

      expect(store.getState().flips).toBe(2);
      expect(store.getState().flippedCards).toHaveLength(2);
    });

    it("does not flip when game is paused", () => {
      const store = initStore();
      store.getState().pause();

      const card = store.getState().board[0];
      store.getState().flipCard(card.uid);
      expect(store.getState().flips).toBe(0);
    });
  });

  describe("match detection", () => {
    it("marks matching cards as matched and increments score", () => {
      const store = initStore();
      const [a, b] = findPair(store);

      store.getState().flipCard(a.uid);
      store.getState().flipCard(b.uid);

      const state = store.getState();
      const cardA = state.board.find((c) => c.uid === a.uid)!;
      const cardB = state.board.find((c) => c.uid === b.uid)!;
      expect(cardA.isMatched).toBe(true);
      expect(cardB.isMatched).toBe(true);
      expect(state.players[0].score).toBe(1);
    });

    it("shows match modal with card content on match", () => {
      const store = initStore();
      const [a, b] = findPair(store);

      store.getState().flipCard(a.uid);
      store.getState().flipCard(b.uid);

      const modal = store.getState().showingMatchModal;
      expect(modal).not.toBeNull();
      expect(modal!.id).toBe(a.id);
    });

    it("dismissing modal clears it and resets flippedCards", () => {
      const store = initStore();
      const [a, b] = findPair(store);

      store.getState().flipCard(a.uid);
      store.getState().flipCard(b.uid);
      store.getState().dismissMatchModal();

      expect(store.getState().showingMatchModal).toBeNull();
      expect(store.getState().flippedCards).toHaveLength(0);
    });
  });

  describe("no-match handling", () => {
    it("flips cards back on resolveNoMatch", () => {
      const store = initStore();
      const [a, b] = findNonPair(store);

      store.getState().flipCard(a.uid);
      store.getState().flipCard(b.uid);
      store.getState().resolveNoMatch();

      const cardA = store.getState().board.find((c) => c.uid === a.uid)!;
      const cardB = store.getState().board.find((c) => c.uid === b.uid)!;
      expect(cardA.isFlipped).toBe(false);
      expect(cardB.isFlipped).toBe(false);
      expect(store.getState().flippedCards).toHaveLength(0);
    });

    it("resets streak on no-match", () => {
      const store = initStore();

      // First, make a match to build streak
      const [a, b] = findPair(store);
      store.getState().flipCard(a.uid);
      store.getState().flipCard(b.uid);
      store.getState().dismissMatchModal();
      expect(store.getState().streak).toBe(1);

      // Now miss
      const nonPair = findNonPair(store);
      store.getState().flipCard(nonPair[0].uid);
      store.getState().flipCard(nonPair[1].uid);
      store.getState().resolveNoMatch();

      expect(store.getState().streak).toBe(0);
      expect(store.getState().bestStreak).toBe(1);
    });
  });

  describe("2P turn handoff", () => {
    it("starts with player 1", () => {
      const store = initStore({ mode: "2p" });
      expect(store.getState().activePlayerId).toBe(1);
    });

    it("switches to player 2 on no-match", () => {
      const store = initStore({ mode: "2p" });
      const [a, b] = findNonPair(store);

      store.getState().flipCard(a.uid);
      store.getState().flipCard(b.uid);
      store.getState().resolveNoMatch();

      expect(store.getState().activePlayerId).toBe(2);
    });

    it("keeps same player on match", () => {
      const store = initStore({ mode: "2p" });
      const [a, b] = findPair(store);

      store.getState().flipCard(a.uid);
      store.getState().flipCard(b.uid);
      store.getState().dismissMatchModal();

      expect(store.getState().activePlayerId).toBe(1);
    });

    it("alternates turns on consecutive misses", () => {
      const store = initStore({ mode: "2p" });

      const miss1 = findNonPair(store);
      store.getState().flipCard(miss1[0].uid);
      store.getState().flipCard(miss1[1].uid);
      store.getState().resolveNoMatch();
      expect(store.getState().activePlayerId).toBe(2);

      const miss2 = findNonPair(store);
      store.getState().flipCard(miss2[0].uid);
      store.getState().flipCard(miss2[1].uid);
      store.getState().resolveNoMatch();
      expect(store.getState().activePlayerId).toBe(1);
    });

    it("does not switch player in 1P mode on no-match", () => {
      const store = initStore({ mode: "1p" });
      const [a, b] = findNonPair(store);

      store.getState().flipCard(a.uid);
      store.getState().flipCard(b.uid);
      store.getState().resolveNoMatch();

      expect(store.getState().activePlayerId).toBe(1);
    });
  });

  describe("win condition", () => {
    it("sets status to won when all cards matched", () => {
      const store = initStore({ difficulty: 6 });
      const board = store.getState().board;

      // Match all pairs
      const paired = new Map<string, string[]>();
      for (const card of board) {
        const list = paired.get(card.id) ?? [];
        list.push(card.uid);
        paired.set(card.id, list);
      }

      for (const [, uids] of paired) {
        store.getState().flipCard(uids[0]);
        store.getState().flipCard(uids[1]);
        store.getState().dismissMatchModal();
      }

      expect(store.getState().status).toBe("won");
    });

    it("scores correctly for the winning player in 2P", () => {
      const store = initStore({ mode: "2p", difficulty: 6 });
      const board = store.getState().board;

      const paired = new Map<string, string[]>();
      for (const card of board) {
        const list = paired.get(card.id) ?? [];
        list.push(card.uid);
        paired.set(card.id, list);
      }

      // Player 1 matches all pairs (keeps turn on match)
      for (const [, uids] of paired) {
        store.getState().flipCard(uids[0]);
        store.getState().flipCard(uids[1]);
        store.getState().dismissMatchModal();
      }

      const state = store.getState();
      expect(state.status).toBe("won");
      expect(state.players[0].score).toBe(6);
      expect(state.players[1].score).toBe(0);
    });
  });

  describe("pause / resume", () => {
    it("pauses the game", () => {
      const store = initStore();
      store.getState().pause();
      expect(store.getState().status).toBe("paused");
    });

    it("resumes the game", () => {
      const store = initStore();
      store.getState().pause();
      store.getState().resume();
      expect(store.getState().status).toBe("playing");
    });

    it("does not pause if not playing", () => {
      const store = createGameStore(getCardContent);
      store.getState().pause();
      expect(store.getState().status).toBe("idle");
    });
  });

  describe("timer", () => {
    it("increments on tick while playing", () => {
      const store = initStore();
      store.getState().tick();
      store.getState().tick();
      expect(store.getState().timer).toBe(2);
    });

    it("does not increment while paused", () => {
      const store = initStore();
      store.getState().tick();
      store.getState().pause();
      store.getState().tick();
      store.getState().tick();
      expect(store.getState().timer).toBe(1);
    });
  });

  describe("reset", () => {
    it("returns to idle state", () => {
      const store = initStore();
      store.getState().tick();
      store.getState().reset();

      const state = store.getState();
      expect(state.status).toBe("idle");
      expect(state.board).toHaveLength(0);
      expect(state.timer).toBe(0);
      expect(state.flips).toBe(0);
    });
  });
});

describe("calculateStars", () => {
  it("returns 3 stars for perfect play", () => {
    // 6 pairs, perfect = 12 flips, 1.5x = 18
    expect(calculateStars(12, 6)).toBe(3);
    expect(calculateStars(18, 6)).toBe(3);
  });

  it("returns 2 stars for decent play", () => {
    // 6 pairs, 2x perfect = 24
    expect(calculateStars(19, 6)).toBe(2);
    expect(calculateStars(24, 6)).toBe(2);
  });

  it("returns 1 star for completing the game", () => {
    expect(calculateStars(25, 6)).toBe(1);
    expect(calculateStars(100, 6)).toBe(1);
  });
});
