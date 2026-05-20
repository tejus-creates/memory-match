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
 * Select `count` unique cards from the source array,
 * duplicate each to create pairs, assign unique IDs and positions,
 * then shuffle the result.
 */
export function dealCards(
  sourceIds: string[],
  count: number,
  random: () => number = Math.random
): { id: string; uid: string; position: number }[] {
  if (count > sourceIds.length) {
    throw new Error(
      `Cannot deal ${count} pairs from ${sourceIds.length} unique cards`
    );
  }

  // Pick `count` unique cards at random
  const picked = shuffle([...sourceIds], random).slice(0, count);

  // Create pairs — each card ID appears twice with unique uid
  const pairs = picked.flatMap((id) => [
    { id, uid: `${id}-a` },
    { id, uid: `${id}-b` },
  ]);

  // Shuffle and assign positions
  return shuffle(pairs, random).map((card, index) => ({
    ...card,
    position: index,
  }));
}
