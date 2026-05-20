import Image from "next/image";

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
          "active:scale-[0.95]",
          "transition-[transform,border-color,box-shadow] duration-100 ease-out",
          "focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]",
        ].join(" ")
      : "",
  ].join(" ");

  const content = (
    <Image
      src={src}
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
    <div className={classes} style={{ width: size, height: size }}>
      {content}
    </div>
  );
}
