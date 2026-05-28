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

import {
  useRef,
  useCallback,
  useEffect,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import gsap from "gsap";

/*
 * Shadow interpolation for the hover tilt.
 *
 * At rest the card sits close to the surface (small, tight shadow).
 * As it lifts + tilts on hover, the shadow grows, softens, and shifts
 * opposite the tilt direction (card tilts right → shadow falls left+down)
 * as if lit from above-front. All values use warm ink tones (42,24,16).
 *
 * `p` is the tween progress 0→1 (rest→lifted).
 */
function lerpShadow(p: number): string {
  // Main soft shadow — grows and drifts left+down
  const x1 = p * -6;
  const y1 = 4 + p * 12;
  const b1 = 12 + p * 16;
  const a1 = 0.35 + p * 0.1;

  // Tight contact shadow — subtle directional shift
  const x2 = p * -2;
  const y2 = 1 + p * 3;
  const b2 = 3 + p * 5;
  const a2 = 0.2 + p * 0.05;

  return (
    `${x1.toFixed(1)}px ${y1.toFixed(1)}px ${b1.toFixed(1)}px rgba(42, 24, 16, ${a1.toFixed(3)}), ` +
    `${x2.toFixed(1)}px ${y2.toFixed(1)}px ${b2.toFixed(1)}px rgba(42, 24, 16, ${a2.toFixed(3)})`
  );
}

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

  const outerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

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

  /* ── GSAP hover tilt for face-down cards ── */

  const applyFaceShadow = useCallback((shadow: string) => {
    outerRef.current
      ?.querySelectorAll<HTMLElement>("[data-card-face]")
      .forEach((el) => {
        el.style.boxShadow = shadow;
      });
  }, []);

  /** Read the card's current Y and derive shadow from it — always in lockstep. */
  const syncShadow = useCallback(() => {
    const el = outerRef.current;
    if (!el) return;
    const currentY = gsap.getProperty(el, "y") as number;
    // y ranges 0 (rest) → -10 (lifted); normalise to 0→1
    const t = Math.min(Math.max(-currentY / 10, 0), 1);
    applyFaceShadow(lerpShadow(t));
  }, [applyFaceShadow]);

  const onHoverEnter = useCallback(() => {
    if (!isInteractive || reducedMotion.current) return;
    gsap.to(outerRef.current, {
      y: -10,
      rotationY: 30,
      scale: 1.03,
      transformPerspective: 900,
      duration: 0.25,
      ease: "power2.out",
      overwrite: true,
      onUpdate: syncShadow,
    });
  }, [isInteractive, syncShadow]);

  const onHoverLeave = useCallback(() => {
    if (reducedMotion.current) return;
    gsap.to(outerRef.current, {
      y: 0,
      rotationY: 0,
      scale: 1,
      transformPerspective: 900,
      duration: 0.3,
      ease: "power2.inOut",
      overwrite: true,
      onUpdate: syncShadow,
    });
  }, [syncShadow]);

  // Reset tilt when card becomes non-interactive (flipped / matched)
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    if (!isInteractive) {
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "transform" });
      // Reset to rest shadow (clear inline so CSS token takes over)
      el.querySelectorAll<HTMLElement>("[data-card-face]").forEach((f) => {
        f.style.boxShadow = "";
      });
    }
  }, [isInteractive]);

  // Cleanup on unmount
  useEffect(() => {
    const el = outerRef.current;
    return () => {
      if (el) gsap.killTweensOf(el);
    };
  }, []);

  /* ── Outer: size + perspective + interaction ── */
  const outerClasses = [
    isInteractive
      ? [
          "cursor-pointer",
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
   *
   * NOTE: `transform` is NOT set here — GSAP manages it for the hover
   * tilt. Setting it in React style would overwrite GSAP on re-render.
   */
  const isMatched = state === "matched";
  const settleDelay = isMatched ? "500ms" : "0ms";

  const outerStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    paddingBottom: "100%",
    perspective: "1000px",
    opacity: isMatched ? 0.75 : 1,
    transition: `opacity 400ms ease-out ${settleDelay}`,
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
      ref={outerRef}
      role={isInteractive ? "button" : "img"}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={ariaLabel}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      onMouseEnter={isInteractive ? onHoverEnter : undefined}
      onMouseLeave={onHoverLeave}
      className={outerClasses}
      style={outerStyle}
    >
      <div style={innerStyle}>
        <div data-card-face className={border} style={backStyle}>
          <img
            src={backImage}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div data-card-face className={border} style={frontStyle}>
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
