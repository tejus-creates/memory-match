"use client";

import { useRef, useEffect, type ButtonHTMLAttributes } from "react";
import gsap from "gsap";
import { useGsapLift } from "@/lib/use-gsap-lift";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

/* Shadow presets for the GSAP lift per variant */
const LIFT_SHADOWS = {
  primary: {
    rest: "0 2px 0 var(--c-magenta-dark)",
    lift: "0 3px 0 var(--c-magenta-dark), 0 4px 8px rgba(42, 24, 16, 0.12)",
  },
  secondary: {
    rest: "none",
    lift: "0 2px 6px rgba(42, 24, 16, 0.12)",
  },
};

export function Button({
  variant = "primary",
  className = "",
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const shadows = LIFT_SHADOWS[variant];
  const { ref } = useGsapLift<HTMLButtonElement>({
    y: 2,
    scale: 1.02,
    duration: 0.18,
    ease: "power2.out",
    settleDuration: 0.25,
    settleEase: "power2.inOut",
    liftShadow: shadows.lift,
    restShadow: shadows.rest,
    enabled: !disabled,
  });

  const fillRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  // Radial fill hover animation using clip-path
  useEffect(() => {
    const btn = ref.current;
    const fill = fillRef.current;
    const text = textRef.current;
    if (!btn || !fill || !text || disabled) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.set(fill, { clipPath: "circle(0% at 50% 100%)" });

    const textColor = variant === "primary" ? "#EE1F6F" : "var(--c-ink)";
    const textColorRest = variant === "primary" ? "var(--c-parchment)" : "var(--c-parchment)";

    const onEnter = () => {
      if (reducedMotion) {
        gsap.set(fill, { clipPath: "circle(150% at 50% 100%)" });
        gsap.set(text, { color: textColor });
        return;
      }
      gsap.to(fill, {
        clipPath: "circle(150% at 50% 100%)",
        duration: 0.7,
        ease: "power2.out",
        overwrite: true,
      });
      gsap.to(text, {
        color: textColor,
        duration: 0.4,
        delay: 0.15,
        ease: "power1.out",
        overwrite: true,
      });
    };

    const onLeave = () => {
      if (reducedMotion) {
        gsap.set(fill, { clipPath: "circle(0% at 50% 100%)" });
        gsap.set(text, { color: textColorRest });
        return;
      }
      gsap.to(fill, {
        clipPath: "circle(0% at 50% 100%)",
        duration: 0.3,
        ease: "power2.in",
        overwrite: true,
      });
      gsap.to(text, {
        color: textColorRest,
        duration: 0.2,
        ease: "power1.in",
        overwrite: true,
      });
    };

    btn.addEventListener("pointerenter", onEnter);
    btn.addEventListener("pointerleave", onLeave);

    return () => {
      btn.removeEventListener("pointerenter", onEnter);
      btn.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(fill);
      gsap.killTweensOf(text);
    };
  }, [ref, disabled, variant]);

  const base = [
    "relative overflow-hidden",
    "inline-flex items-center justify-center",
    "h-[52px] sm:h-[48px]",
    "px-[var(--space-8)]",
    "rounded-[var(--radius-button)]",
    "font-body text-[length:16px] font-bold",
    "cursor-pointer",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "focus-visible:outline-none",
  ].join(" ");

  const variants = {
    primary: [
      "bg-[var(--c-magenta)] text-[var(--c-parchment)]",
      "shadow-[0_2px_0_var(--c-magenta-dark)]",
      "focus-visible:shadow-[0_2px_0_var(--c-magenta-dark),var(--shadow-focus)]",
    ].join(" "),
    secondary: [
      "bg-transparent text-[var(--c-parchment)]",
      "border-[1.5px] border-[var(--c-parchment)]",
      "focus-visible:shadow-[var(--shadow-focus)]",
    ].join(" "),
  };

  return (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {/* Radial fill — full-size white layer, clip-path circle grows from bottom center */}
      <span
        ref={fillRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#FFFFFF",
          borderRadius: "inherit",
          pointerEvents: "none",
          clipPath: "circle(0% at 50% 100%)",
        }}
      />
      {/* Content sits above the fill */}
      <span ref={textRef} className="relative z-[1]">{children}</span>
    </button>
  );
}
