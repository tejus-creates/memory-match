import type { ButtonHTMLAttributes } from "react";

interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  "aria-label": string;
  children: React.ReactNode;
}

export function IconButton({
  children,
  className = "",
  ...rest
}: IconButtonProps) {
  return (
    <button
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
        "transition-colors duration-100 ease-out",
        "focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
