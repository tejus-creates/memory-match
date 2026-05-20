import { theme } from "@/lib/engine/active-theme";

export default function SplashPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1
        className="font-[family-name:var(--font-display)]"
        style={{ fontSize: "var(--text-2xl)" }}
      >
        {theme.config.gameName}
      </h1>
      <p
        className="font-[family-name:var(--font-body)]"
        style={{
          fontSize: "var(--text-base)",
          color: "var(--text-secondary-light)",
        }}
      >
        {theme.config.tagline}
      </p>
    </main>
  );
}
