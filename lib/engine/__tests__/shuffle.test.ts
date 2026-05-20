import { describe, it, expect } from "vitest";
import { shuffle, dealCards } from "../shuffle";

describe("shuffle", () => {
  it("returns the same array reference", () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr);
    expect(result).toBe(arr);
  });

  it("preserves all elements", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    shuffle(arr);
    expect(arr.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("produces a deterministic result with a seeded random", () => {
    // Simple seeded PRNG for reproducibility
    let seed = 42;
    const seeded = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const a = [1, 2, 3, 4, 5];
    shuffle(a, seeded);

    seed = 42;
    const b = [1, 2, 3, 4, 5];
    shuffle(b, seeded);

    expect(a).toEqual(b);
  });

  it("actually shuffles (not identity) with high probability", () => {
    // Run multiple times — at least one should differ from sorted order
    const sorted = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let anyDifferent = false;
    for (let i = 0; i < 10; i++) {
      const arr = [...sorted];
      shuffle(arr);
      if (arr.some((v, idx) => v !== sorted[idx])) {
        anyDifferent = true;
        break;
      }
    }
    expect(anyDifferent).toBe(true);
  });
});

describe("dealCards", () => {
  const pool = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];

  it("deals the correct number of pairs", () => {
    const result = dealCards(pool, 5);
    expect(result).toHaveLength(10); // 5 pairs = 10 cards
  });

  it("each card ID appears exactly twice", () => {
    const result = dealCards(pool, 4);
    const counts = new Map<string, number>();
    for (const card of result) {
      counts.set(card.id, (counts.get(card.id) ?? 0) + 1);
    }
    for (const count of counts.values()) {
      expect(count).toBe(2);
    }
    expect(counts.size).toBe(4);
  });

  it("assigns unique uids to each card", () => {
    const result = dealCards(pool, 5);
    const uids = new Set(result.map((c) => c.uid));
    expect(uids.size).toBe(10);
  });

  it("assigns sequential positions", () => {
    const result = dealCards(pool, 3);
    const positions = result.map((c) => c.position).sort((a, b) => a - b);
    expect(positions).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("throws if requesting more pairs than available cards", () => {
    expect(() => dealCards(pool, 11)).toThrow();
  });
});
