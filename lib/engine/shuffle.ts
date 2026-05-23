/**
 * Fisher-Yates (Knuth) shuffle — in-place, returns the same array reference.
 * Optionally accepts a random function for deterministic testing.
 */
export function shuffle<T>(
  array: T[],
  random: () => number = Math.random
): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Select `count` cards from the source array to form pairs,
 * duplicate each to create pairs, assign unique IDs and positions,
 * then shuffle the result.
 *
 * When `count` exceeds the number of unique source cards, cards are
 * reused (appearing as multiple distinct pairs) so the game can run
 * at any difficulty even with a small card pool.
 */
export function dealCards(
  sourceIds: string[],
  count: number,
  random: () => number = Math.random
): { id: string; uid: string; position: number }[] {
  if (sourceIds.length === 0) {
    throw new Error("Cannot deal from an empty card pool");
  }

  // Build a selection of `count` cards, cycling through the shuffled
  // pool as many times as needed.
  const shuffled = shuffle([...sourceIds], random);
  const picked: { sourceId: string; pairIndex: number }[] = [];
  for (let i = 0; i < count; i++) {
    picked.push({ sourceId: shuffled[i % shuffled.length], pairIndex: i });
  }

  // Create pairs. When a source card is reused, each occurrence gets a
  // unique `id` (sourceId + pairIndex) so the engine's match-by-id logic
  // only matches the two cards within the SAME pair, not across pairs.
  // The original sourceId can be recovered by stripping the `::N` suffix.
  const pairs = picked.flatMap(({ sourceId, pairIndex }) => {
    // Only append suffix when the pool is being reused
    const id = count > sourceIds.length
      ? `${sourceId}::${pairIndex}`
      : sourceId;
    return [
      { id, uid: `${id}-a` },
      { id, uid: `${id}-b` },
    ];
  });

  // Shuffle and assign positions
  return shuffle(pairs, random).map((card, index) => ({
    ...card,
    position: index,
  }));
}
