/**
 * Sound system — synth tones now, swappable to audio files later.
 *
 * Public API:
 *   playSound(type)  — fire-and-forget, respects mute
 *   toggleMute()     — flip mute state, persists to localStorage
 *   isMuted()        — read current mute state
 *
 * ═══════════════════════════════════════════════════════════════
 * HOW TO SWAP SYNTH → AUDIO FILES
 * ═══════════════════════════════════════════════════════════════
 * 1. Replace the `synthPlayers` map below with an `audioPlayers` map
 *    that creates and plays HTMLAudioElement or AudioBuffer instances.
 *    Each entry is keyed by SoundType and returns a function that
 *    plays the sound using the same AudioContext (or new Audio()).
 * 2. The public API (playSound, toggleMute, isMuted) stays identical.
 *    Game code calls playSound('match') and never knows the source.
 * 3. If using Audio elements, preload them on game start for instant
 *    playback. If using AudioBuffer, fetch + decodeAudioData on init.
 * ═══════════════════════════════════════════════════════════════
 */

import { getGamePrefs, saveGamePrefs } from "@/lib/engine/storage";

/* ─── Types ─── */

export type SoundType = "flip" | "match" | "mismatch" | "tap" | "chime" | "win";

/* ─── Singleton AudioContext + autoplay unlock ─── */

let ctx: AudioContext | null = null;
let unlocked = false;

function getContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  return ctx;
}

/**
 * Browsers block AudioContext until first user gesture.
 * Call this once — it attaches a one-shot listener that resumes
 * the context on the first click/touch/keydown.
 */
export function initAudio(): void {
  if (typeof window === "undefined") return;
  if (unlocked) return;

  const unlock = () => {
    const c = getContext();
    if (c.state === "suspended") {
      c.resume();
    }
    unlocked = true;
    window.removeEventListener("click", unlock, true);
    window.removeEventListener("touchstart", unlock, true);
    window.removeEventListener("keydown", unlock, true);
  };

  window.addEventListener("click", unlock, true);
  window.addEventListener("touchstart", unlock, true);
  window.addEventListener("keydown", unlock, true);
}

/* ─── Mute state (persisted via existing storage helper) ─── */

let muted: boolean | null = null;

function loadMute(): boolean {
  if (muted !== null) return muted;
  const prefs = getGamePrefs();
  // soundEnabled defaults to true when no prefs exist
  muted = prefs ? !prefs.soundEnabled : false;
  return muted;
}

export function isMuted(): boolean {
  return loadMute();
}

export function toggleMute(): boolean {
  muted = !loadMute();
  const prefs = getGamePrefs();
  if (prefs) {
    saveGamePrefs({ ...prefs, soundEnabled: !muted });
  } else {
    saveGamePrefs({ deckId: "", difficulty: 12, soundEnabled: !muted });
  }
  return muted;
}

/* ─── Master volume (0–1) ─── */

const MASTER_VOLUME = 0.25;

/* ─── Synth helpers ─── */

function playTone(
  freq: number,
  duration: number,
  opts?: {
    type?: OscillatorType;
    volume?: number;
    attack?: number;
    decay?: number;
    delay?: number;
  },
) {
  const c = getContext();
  if (c.state === "suspended") return; // not yet unlocked

  const o = opts ?? {};
  const vol = (o.volume ?? 1) * MASTER_VOLUME;
  const attack = o.attack ?? 0.01;
  const decay = o.decay ?? duration * 0.5;
  const startAt = c.currentTime + (o.delay ?? 0);

  const osc = c.createOscillator();
  const gain = c.createGain();

  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(freq, startAt);
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(vol, startAt + attack);
  gain.gain.linearRampToValueAtTime(0, startAt + attack + decay);

  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(startAt);
  osc.stop(startAt + duration);
}

function playNoise(duration: number, volume: number = 0.3) {
  const c = getContext();
  if (c.state === "suspended") return;

  const vol = volume * MASTER_VOLUME;
  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }

  const source = c.createBufferSource();
  source.buffer = buffer;

  // Bandpass filter to make it a soft click, not white noise
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1200;
  filter.Q.value = 0.7;

  const gain = c.createGain();
  gain.gain.setValueAtTime(vol, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  source.start();
  source.stop(c.currentTime + duration);
}

/* ─── Synth sound definitions ─── */
/* SWAP POINT: replace these functions with audio file playback */

const synthPlayers: Record<SoundType, () => void> = {
  flip() {
    // Short filtered noise click
    playNoise(0.05, 0.4);
  },

  tap() {
    // Subtle UI tick — higher, softer
    playTone(800, 0.06, { type: "sine", volume: 0.3, attack: 0.003, decay: 0.04 });
  },

  match() {
    // Pleasant rising chime — three ascending notes
    playTone(523, 0.25, { type: "sine", volume: 0.5, attack: 0.01, decay: 0.2 });
    playTone(659, 0.25, { type: "sine", volume: 0.5, attack: 0.01, decay: 0.2, delay: 0.1 });
    playTone(784, 0.35, { type: "sine", volume: 0.6, attack: 0.01, decay: 0.3, delay: 0.2 });
  },

  mismatch() {
    // Soft descending "nope" — two gentle notes down
    playTone(440, 0.2, { type: "sine", volume: 0.35, attack: 0.01, decay: 0.18 });
    playTone(349, 0.3, { type: "sine", volume: 0.3, attack: 0.01, decay: 0.25, delay: 0.12 });
  },

  chime() {
    // Soft bell for modal appearing
    playTone(880, 0.4, { type: "sine", volume: 0.3, attack: 0.005, decay: 0.35 });
    playTone(1320, 0.3, { type: "sine", volume: 0.15, attack: 0.005, decay: 0.25, delay: 0.05 });
  },

  win() {
    // Short celebratory flourish — ascending arpeggio
    playTone(523, 0.2, { type: "sine", volume: 0.45, attack: 0.01, decay: 0.18 });
    playTone(659, 0.2, { type: "sine", volume: 0.45, attack: 0.01, decay: 0.18, delay: 0.12 });
    playTone(784, 0.2, { type: "sine", volume: 0.5, attack: 0.01, decay: 0.18, delay: 0.24 });
    playTone(1047, 0.4, { type: "sine", volume: 0.55, attack: 0.01, decay: 0.35, delay: 0.36 });
  },
};

/* ─── Public API ─── */

export function playSound(type: SoundType): void {
  if (typeof window === "undefined") return;
  if (loadMute()) return;
  synthPlayers[type]();
}
