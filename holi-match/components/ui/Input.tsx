"use client";

import { useCallback, type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", onFocus, ...rest }: InputProps) {
  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.select();
      onFocus?.(e);
    },
    [onFocus],
  );

  return (
    <input
      type="text"
      className={[
        "h-[48px] w-full",
        "rounded-[var(--radius-button)]",
        "border-[1.5px] border-[var(--c-brass)]",
        "bg-transparent",
        "px-[var(--space-4)]",
        "font-body text-[16px] text-[var(--text-primary-dark)]",
        "placeholder:text-[var(--text-secondary-dark)]",
        "focus-visible:outline-none focus-visible:border-[var(--border-active)] focus-visible:shadow-[var(--shadow-focus)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-[border-color,box-shadow] duration-100 ease-out",
        className,
      ].join(" ")}
      onFocus={handleFocus}
      {...rest}
    />
  );
}
