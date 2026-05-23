"use client";

/*
 * Card states — visual fingerprint guide:
 *
 *   face-down  → deck back showing, brass border, full brightness, clickable
 *   active     → illustration showing, orange border (--c-sindoor), full brightness, not clickable
 *                 (card is being evaluated — waiting for second flip)
 *   matched    → illustration showing, thin faded border, slightly dimmed (opacity 0.75),
 *                 settled flat (no lift, minimal shadow), not clickable
 *                 (pair already found — lies flat while artwork stays vivid)
 *   revealed   → illustration showing, brass border, full brightness, not clickable
 *                 (neutral reveal — used for end-of-game win celebration)
 *
 * Quick visual key:
 *   orange border = active (being decided right now)
 *   dimmed        = matched (done)
 *   brass border + full brightness = revealed (shown, neutral)
 *   deck back     = face-down (hidden)
 */

import { useCallback, type CSSProperties, type KeyboardEvent } from "react";

export type CardState = "face-down" | "active" | "matched" | "revealed";

interface CardProps {
  state: CardState;
  frontImage: string;
  backImage: string;
  name: string;
  onClick?: () => void;
  disabled?: boolean;
  /** When true, plays the mismatch shake animation */
  shaking?: boolean;
}

export function Card({
  state,
  frontImage,
  backImage,
  name,
  onClick,
  disabled = false,
  shaking = false,
}: CardProps) {
  const isFlipped = state !== "face-down";
  const isInteractive = !!onClick && !disabled && state === "face-down";

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (isInteractive && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onClick?.();
      }
    },
    [isInteractive, onClick],
  );

  const ariaLabel =
    state === "face-down"
      ? "Card, face down"
      : state === "matched"
        ? `Card, ${name}, matched`
        : state === "active"
          ? `Card, ${name}, active`
          : `Card, ${name}`;

  /* ── Outer: size + perspective + interaction ── */
  const outerClasses = [
    isInteractive
      ? [
          "cursor-pointer",
          "hover:scale-[1.05] hover:brightness-125",
          "active:scale-[0.97] active:duration-[80ms]",
          "transition-[transform,filter] duration-150 ease-out",
          "focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]",
          "focus-visible:rounded-[var(--radius-card)]",
        ].join(" ")
      : "",
  ].join(" ");

  /*
   * Use padding-bottom: 100% to enforce 1:1 aspect ratio.
   * Safari has bugs with aspect-ratio + absolute children,
   * but padding-bottom percentage is rock-solid everywhere.
   * Opacity is inline (not Tailwind) to avoid Safari stacking-context
   * conflicts with perspective.
   */
  const isMatched = state === "matched";

  // Delay the settle so the match pulse registers before cards retire
  const settleDelay = isMatched ? "500ms" : "0ms";

  const outerStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    paddingBottom: "100%",
    perspective: "1000px",
    opacity: isMatched ? 0.75 : 1,
    // Elevated cards lift slightly; matched cards settle flat
    transform: isMatched ? "translateY(0)" : "translateY(-2px)",
    transition: `opacity 400ms ease-out ${settleDelay}, transform 400ms ease-out ${settleDelay}`,
    // Mismatch shake — applied via prop, runs once then clears
    animation: shaking ? "card-mismatch-shake 500ms ease-out" : undefined,
  };

  /* ── Inner: the rotating container ── */
  const innerStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    transformStyle: "preserve-3d",
    transition: "transform 300ms ease-out",
    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
    pointerEvents: "none",
  };

  /*
   * Warm shadow per state — matched cards get none (they're receding).
   * Interactive cards get hover/active shadows via CSS classes on the face.
   */
  const shadow = shadowForState(state, isInteractive);

  /* ── Shared face styles ── */
  const faceStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    borderRadius: "var(--radius-card)",
    overflow: "hidden",
    boxShadow: shadow,
    transition: `box-shadow 400ms ease-out ${settleDelay}`,
  };

  const backStyle: CSSProperties = {
    ...faceStyle,
    transform: "rotateY(0deg)",
    backgroundColor: "var(--surface-card-back)",
  };

  const frontStyle: CSSProperties = {
    ...faceStyle,
    transform: "rotateY(180deg)",
    backgroundColor: "var(--surface-card)",
    padding: "var(--space-2)",
  };

  const border = borderClass(state);

  return (
    <div
      role={isInteractive ? "button" : "img"}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={ariaLabel}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      className={outerClasses}
      style={outerStyle}
    >
      <div style={innerStyle}>
        <div className={border} style={backStyle}>
          <img
            src={backImage}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className={border} style={frontStyle}>
          <img
            src={frontImage}
            alt={name}
            className="h-full w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}

function borderClass(state: CardState): string {
  switch (state) {
    case "active":
      return "border-2 border-[var(--c-sindoor)]";
    case "matched":
      return "border-[1px] border-[var(--border-thin)]";
    default:
      return "border-[1.5px] border-[var(--c-brass)]";
  }
}

function shadowForState(state: CardState, isInteractive: boolean): string {
  if (state === "matched") return "var(--shadow-card-matched)";
  if (isInteractive) return "var(--shadow-card)";
  return "var(--shadow-card)";
}
