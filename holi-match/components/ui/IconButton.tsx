"use client";

import type { ButtonHTMLAttributes } from "react";
import { useGsapLift } from "@/lib/use-gsap-lift";

interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  "aria-label": string;
  children: React.ReactNode;
}

export function IconButton({
  children,
  className = "",
  disabled,
  ...rest
}: IconButtonProps) {
  const { ref } = useGsapLift<HTMLButtonElement>({
    y: 2,
    scale: 1.06,
    duration: 0.16,
    ease: "power2.out",
    settleDuration: 0.22,
    settleEase: "power2.inOut",
    liftShadow: "0 2px 6px rgba(42, 24, 16, 0.18)",
    restShadow: "none",
    enabled: !disabled,
  });

  return (
    <button
      ref={ref}
      className={[
        "inline-flex items-center justify-center",
        "min-h-[44px] min-w-[44px]",
        "rounded-[var(--radius-button)]",
        "border border-[var(--border-thin)]",
        "bg-transparent",
        "text-[var(--c-parchment)]",
        "cursor-pointer",
        "hover:bg-[rgba(244,232,208,0.1)] hover:border-[var(--border-default)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-[background-color,border-color] duration-100 ease-out",
        "focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]",
        className,
      ].join(" ")}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
