"use client";

import { useEffect } from "react";
import { initAudio } from "@/lib/sound";

/**
 * Global audio unlock — mounts once in the root layout.
 * Attaches interaction listeners so the very first tap/click/keypress
 * anywhere in the app resumes the AudioContext. Persists across
 * all route changes (never unmounts).
 */
export function AudioUnlock() {
  useEffect(() => {
    initAudio();
  }, []);
  return null;
}
