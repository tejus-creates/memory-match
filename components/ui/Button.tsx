"use client";

import type { ButtonHTMLAttributes } from "react";
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

  const base = [
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
      "bg-transparent text-[var(--c-ink)]",
      "border-[1.5px] border-[var(--c-ink)]",
      "hover:bg-[rgba(42,24,16,0.12)]",
      "transition-[background-color] duration-100 ease-out",
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
      {children}
    </button>
  );
}
