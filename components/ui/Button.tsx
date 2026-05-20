import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonProps) {
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
      "hover:brightness-115 hover:-translate-y-[1px] hover:shadow-[0_3px_0_var(--c-magenta-dark)]",
      "active:translate-y-[2px] active:shadow-[0_0_0_var(--c-magenta-dark)]",
      "transition-[transform,box-shadow,filter] duration-[80ms] ease-out",
      "focus-visible:shadow-[0_2px_0_var(--c-magenta-dark),var(--shadow-focus)]",
    ].join(" "),
    secondary: [
      "bg-transparent text-[var(--c-ink)]",
      "border-[1.5px] border-[var(--c-ink)]",
      "hover:bg-[rgba(42,24,16,0.12)]",
      "active:scale-[0.98]",
      "transition-[transform,background-color] duration-100 ease-out",
      "focus-visible:shadow-[var(--shadow-focus)]",
    ].join(" "),
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
