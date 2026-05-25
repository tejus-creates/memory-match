"use client";

import { useState, useCallback, useEffect } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { playSound, isMuted, toggleMute } from "@/lib/sound";

interface SoundToggleProps {
  className?: string;
}

export function SoundToggle({ className }: SoundToggleProps) {
  const [muted, setMuted] = useState(true); // default to muted icon to avoid flash
  useEffect(() => setMuted(isMuted()), []);

  const handleToggle = useCallback(() => {
    const nowMuted = toggleMute();
    setMuted(nowMuted);
    if (!nowMuted) playSound("tap");
  }, []);

  return (
    <IconButton
      aria-label={muted ? "Unmute sound" : "Mute sound"}
      onClick={handleToggle}
      className={className}
    >
      {muted ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M19.07 4.93a10 10 0 010 14.14" />
          <path d="M15.54 8.46a5 5 0 010 7.07" />
        </svg>
      )}
    </IconButton>
  );
}
