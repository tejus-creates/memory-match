import type { ElementType, HTMLAttributes } from "react";

const sizeMap = {
  lg: "text-[length:var(--text-lg)]",
  xl: "text-[length:var(--text-xl)]",
  "2xl": "text-[length:var(--text-2xl)]",
} as const;

interface DisplayHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  size: keyof typeof sizeMap;
  underline?: boolean;
  as?: ElementType;
  /** Text color. Defaults to "ink" (dark). Use "parchment" on dark/frosted surfaces. */
  color?: "ink" | "parchment";
  children: React.ReactNode;
}

export function DisplayHeading({
  size,
  underline = false,
  as: Tag = "h2",
  color = "ink",
  children,
  className = "",
  ...rest
}: DisplayHeadingProps) {
  const colorClass = color === "parchment"
    ? "text-[var(--c-parchment)]"
    : "text-[var(--c-ink)]";

  return (
    <div>
      <Tag
        className={`font-display leading-[1.2] ${colorClass} ${sizeMap[size]} ${className}`}
        {...rest}
      >
        {children}
      </Tag>
      {underline && (
        <div className="mt-[var(--space-2)] h-[1.5px] w-10 bg-[var(--c-marigold)]" />
      )}
    </div>
  );
}
