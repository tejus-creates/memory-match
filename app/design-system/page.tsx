export default function DesignSystemPage() {
  return (
    <main className="mx-auto max-w-[960px] px-[var(--space-4)] py-[var(--space-10)] sm:px-[var(--space-6)]">
      {/* ─── Page title ─── */}
      <h1 className="mb-[var(--space-10)] font-display text-[length:var(--text-2xl)] leading-[1.2] text-[var(--text-primary-light)]">
        Design System
      </h1>

      {/* ═══════════════════════════════════════════
          COLOR SWATCHES
          ═══════════════════════════════════════════ */}

      <Section title="Core Palette">
        <SwatchGrid>
          <Swatch token="--c-sindoor" hex="#C84B1F" />
          <Swatch token="--c-sindoor-dark" hex="#7A1F2A" />
          <Swatch token="--c-marigold" hex="#D89A2C" />
          <Swatch token="--c-peacock" hex="#1F4A5C" />
          <Swatch token="--c-parchment" hex="#F4E8D0" />
        </SwatchGrid>
      </Section>

      <Section title="Supporting Palette">
        <SwatchGrid>
          <Swatch token="--c-maroon" hex="#7A1F2A" />
          <Swatch token="--c-teal" hex="#2E6B5F" />
          <Swatch token="--c-brass" hex="#B8966A" />
          <Swatch token="--c-ink" hex="#2A1810" />
        </SwatchGrid>
      </Section>

      <Section title="Functional — Backgrounds &amp; Surfaces">
        <SwatchGrid>
          <Swatch token="--bg-base" hex="#2A1810" />
          <Swatch token="--bg-overlay" hex="rgba(31,74,92,0.3)" />
          <Swatch token="--surface-parchment" hex="#F4E8D0" />
          <Swatch token="--surface-card" hex="#F4E8D0" />
          <Swatch token="--surface-card-back" hex="#1F4A5C" />
          <Swatch token="--surface-overlay" hex="rgba(42,24,16,0.4)" />
        </SwatchGrid>
      </Section>

      <Section title="Functional — Text">
        <SwatchGrid>
          <Swatch token="--text-primary-light" hex="#F4E8D0" />
          <Swatch token="--text-primary-dark" hex="#2A1810" />
          <Swatch token="--text-secondary-light" hex="rgba(244,232,208,0.7)" />
          <Swatch token="--text-secondary-dark" hex="rgba(42,24,16,0.65)" />
          <Swatch token="--text-accent" hex="#D89A2C" />
        </SwatchGrid>
      </Section>

      <Section title="Functional — Borders">
        <SwatchGrid>
          <Swatch token="--border-default" hex="#B8966A" />
          <Swatch token="--border-thin" hex="rgba(184,150,106,0.4)" />
          <Swatch token="--border-active" hex="#D89A2C" />
        </SwatchGrid>
      </Section>

      <Section title="Functional — Status">
        <SwatchGrid>
          <Swatch token="--success" hex="#2E6B5F" />
          <Swatch token="--error" hex="#7A1F2A" />
        </SwatchGrid>
      </Section>

      {/* ═══════════════════════════════════════════
          TYPE SCALE
          ═══════════════════════════════════════════ */}

      <Section title="Type Scale">
        <div className="flex flex-col gap-[var(--space-6)]">
          <TypeSample token="--text-xs" size="11px" eyebrow>
            EYEBROW LABEL
          </TypeSample>

          <TypeSample token="--text-sm" size="13px">
            Metadata and captions
          </TypeSample>

          <TypeSample token="--text-base" size="15px">
            Body copy and blurbs — Andika at 15px with 1.6 line-height for comfortable reading.
          </TypeSample>

          <TypeSample token="--text-md" size="17px" display>
            Emphasized body text
          </TypeSample>

          <TypeSample token="--text-lg" size="24px" display>
            Screen Heading
          </TypeSample>

          <TypeSample token="--text-xl" size="34px" display>
            Major Title
          </TypeSample>

          <TypeSample token="--text-2xl" size="48px" display>
            Splash Title
          </TypeSample>
        </div>
      </Section>
    </main>
  );
}

/* ─── Local layout helpers (not exported, not design-system components) ─── */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-[var(--space-14)]">
      <h2 className="mb-[var(--space-6)] font-display text-[length:var(--text-lg)] leading-[1.2] text-[var(--text-accent)]">
        {title}
      </h2>
      <div className="mb-[var(--space-6)] h-[1.5px] w-10 bg-[var(--c-marigold)]" />
      {children}
    </section>
  );
}

function SwatchGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-[var(--space-4)] sm:grid-cols-3 md:grid-cols-4">
      {children}
    </div>
  );
}

function Swatch({
  token,
  hex,
}: {
  token: string;
  hex: string;
}) {
  return (
    <div>
      <div
        className="mb-[var(--space-2)] h-20 rounded-[var(--radius-button)] border border-[var(--border-thin)]"
        style={{ background: `var(${token})` }}
      />
      <p className="font-body text-[length:var(--text-sm)] leading-[1.4] text-[var(--text-primary-light)]">
        <code className="text-[var(--text-accent)]">{token}</code>
        <br />
        <span className="text-[var(--text-secondary-light)]">{hex}</span>
      </p>
    </div>
  );
}

function TypeSample({
  token,
  size,
  display = false,
  eyebrow = false,
  children,
}: {
  token: string;
  size: string;
  display?: boolean;
  eyebrow?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[var(--border-thin)] pb-[var(--space-6)]">
      {/* Label row */}
      <div className="mb-[var(--space-2)] flex flex-wrap gap-x-[var(--space-4)] gap-y-[var(--space-1)] font-body text-[length:var(--text-sm)] text-[var(--text-secondary-light)]">
        <code className="text-[var(--text-accent)]">{token}</code>
        <span>{size}</span>
        <span>{display ? "Alice 400" : "Andika 400"}</span>
      </div>

      {/* Sample text */}
      <p
        className={[
          "text-[var(--text-primary-light)]",
          display ? "font-display leading-[1.2]" : "font-body leading-[1.6]",
          eyebrow ? "font-body uppercase leading-none tracking-[0.15em]" : "",
        ].join(" ")}
        style={{ fontSize: `var(${token})` }}
      >
        {children}
      </p>
    </div>
  );
}
