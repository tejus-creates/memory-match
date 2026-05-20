interface EyebrowLabelProps {
  children: React.ReactNode;
  color?: "sindoor" | "marigold" | "parchment";
}

const colorMap: Record<NonNullable<EyebrowLabelProps["color"]>, string> = {
  sindoor: "text-[var(--c-sindoor)]",
  marigold: "text-[var(--c-marigold)]",
  parchment: "text-[var(--c-parchment)]",
};

export function EyebrowLabel({
  children,
  color = "sindoor",
}: EyebrowLabelProps) {
  return (
    <span
      className={[
        "font-body text-[length:var(--text-xs)] font-bold",
        "uppercase tracking-[0.15em]",
        colorMap[color],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
