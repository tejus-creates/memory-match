"use client";

import Image from "next/image";
import { useGsapLift } from "@/lib/use-gsap-lift";
import { assetPrefix } from "@/lib/asset-prefix";

interface AvatarProps {
  src: string;
  name: string;
  size?: number;
  selected?: boolean;
  onClick?: () => void;
}

export function Avatar({
  src,
  name,
  size = 64,
  selected = false,
  onClick,
}: AvatarProps) {
  const isButton = !!onClick;

  const { ref } = useGsapLift<HTMLButtonElement>({
    y: 2,
    scale: 1.04,
    duration: 0.16,
    ease: "power2.out",
    settleDuration: 0.22,
    settleEase: "power2.inOut",
    liftShadow: "0 2px 6px rgba(42, 24, 16, 0.18)",
    restShadow: "none",
    enabled: isButton,
  });

  const classes = [
    "inline-flex items-center justify-center",
    "rounded-full overflow-hidden",
    "border-2",
    selected
      ? "border-[var(--border-active)] shadow-[0_0_0_2px_var(--border-active)] scale-110"
      : "border-[var(--c-brass)]",
    "bg-[var(--surface-parchment)]",
    isButton
      ? [
          "cursor-pointer",
          "hover:border-[var(--c-marigold)]",
          "transition-[border-color,box-shadow] duration-100 ease-out",
          "focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]",
        ].join(" ")
      : "",
  ].join(" ");

  const content = (
    <Image
      src={assetPrefix(src)}
      alt={name}
      width={size}
      height={size}
      unoptimized={src.startsWith("data:")}
      className="h-full w-full object-cover"
    />
  );

  if (isButton) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={`Select ${name}`}
        aria-pressed={selected}
        onClick={onClick}
        className={classes}
        style={{ width: size, height: size }}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={`shrink-0 ${classes}`} style={{ width: size, height: size }}>
      {content}
    </div>
  );
}
