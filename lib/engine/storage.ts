/**
 * Single localStorage helper module.
 * All game persistence flows through here — no direct localStorage calls elsewhere.
 */

const PREFIX = "mm_"; // memory-match prefix to avoid collisions

function getItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

function removeItem(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PREFIX + key);
}

/* ─── Player preferences ─── */

export interface PlayerPrefs {
  name: string;
  avatarId: string;
}

export function getPlayerPrefs(slot: 1 | 2): PlayerPrefs | null {
  return getItem<PlayerPrefs>(`player_${slot}`);
}

export function savePlayerPrefs(slot: 1 | 2, prefs: PlayerPrefs): void {
  setItem(`player_${slot}`, prefs);
}

/* ─── Game preferences ─── */

export interface GamePrefs {
  deckId: string;
  difficulty: number;
  soundEnabled: boolean;
}

export function getGamePrefs(): GamePrefs | null {
  return getItem<GamePrefs>("game_prefs");
}

export function saveGamePrefs(prefs: GamePrefs): void {
  setItem("game_prefs", prefs);
}

/* ─── In-progress game save ─── */

export function getSavedGame<T>(): T | null {
  return getItem<T>("saved_game");
}

export function saveGame<T>(state: T): void {
  setItem("saved_game", state);
}

export function clearSavedGame(): void {
  removeItem("saved_game");
}
