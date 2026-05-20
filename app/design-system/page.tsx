"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";

/* ─── Placeholder avatar data (inline SVG data URIs) ─── */

const PLACEHOLDER_AVATARS = [
  { id: "flame", name: "Flame", color: "EE1F6F", initial: "F" },
  { id: "water", name: "Water Drop", color: "0E9BB5", initial: "W" },
  { id: "lotus", name: "Lotus", color: "2E8B73", initial: "L" },
  { id: "peacock", name: "Peacock", color: "F44E18", initial: "P" },
].map((a) => ({
  ...a,
  src: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#${a.color}"/><text x="32" y="32" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="28" font-weight="bold" fill="#F4E8D0">${a.initial}</text></svg>`,
  )}`,
}));

export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("flame");

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
          <Swatch token="--c-magenta" hex="#EE1F6F" />
          <Swatch token="--c-magenta-dark" hex="#BC1656" />
          <Swatch token="--c-sindoor" hex="#F44E18" />
          <Swatch token="--c-sindoor-dark" hex="#BC3410" />
          <Swatch token="--c-marigold" hex="#FFBE1A" />
          <Swatch token="--c-peacock" hex="#0E9BB5" />
          <Swatch token="--c-parchment" hex="#F4E8D0" />
        </SwatchGrid>
      </Section>

      <Section title="Supporting Palette">
        <SwatchGrid>
          <Swatch token="--c-maroon" hex="#7A1F2A" />
          <Swatch token="--c-teal" hex="#2E8B73" />
          <Swatch token="--c-brass" hex="#C9A876" />
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
          <Swatch token="--text-accent" hex="#F44E18" />
        </SwatchGrid>
      </Section>

      <Section title="Functional — Borders">
        <SwatchGrid>
          <Swatch token="--border-default" hex="#B8966A" />
          <Swatch token="--border-thin" hex="rgba(184,150,106,0.4)" />
          <Swatch token="--border-active" hex="#F44E18" />
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

      {/* ═══════════════════════════════════════════
          BUTTONS
          ═══════════════════════════════════════════ */}

      <Section title="Buttons">
        <div className="flex flex-col gap-[var(--space-6)]">
          {/* Primary */}
          <div>
            <p className="mb-[var(--space-3)] font-body text-[length:var(--text-sm)] text-[var(--text-secondary-light)]">
              Primary
            </p>
            <div className="flex flex-wrap items-center gap-[var(--space-4)]">
              <Button>Start Game</Button>
              <Button disabled>Start Game</Button>
            </div>
          </div>

          {/* Secondary — shown on a parchment surface so ink border is visible */}
          <div>
            <p className="mb-[var(--space-3)] font-body text-[length:var(--text-sm)] text-[var(--text-secondary-light)]">
              Secondary (on parchment surface)
            </p>
            <div className="inline-flex flex-wrap items-center gap-[var(--space-4)] rounded-[var(--radius-modal)] bg-[var(--surface-parchment)] p-[var(--space-6)]">
              <Button variant="secondary">How to Play</Button>
              <Button variant="secondary" disabled>How to Play</Button>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════
          ICON BUTTONS
          ═══════════════════════════════════════════ */}

      <Section title="Icon Buttons">
        <div className="flex flex-wrap items-center gap-[var(--space-4)]">
          <IconButton aria-label="Pause">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="7" y1="4" x2="7" y2="16" />
              <line x1="13" y1="4" x2="13" y2="16" />
            </svg>
          </IconButton>
          <IconButton aria-label="Toggle sound">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="4,7 8,7 12,3 12,17 8,13 4,13" fill="currentColor" stroke="none" />
              <path d="M14.5 7.5c.8.8 1.3 2 1.3 3s-.5 2.2-1.3 3" />
            </svg>
          </IconButton>
          <IconButton aria-label="Home">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10l7-7 7 7" />
              <path d="M5 8v8a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V8" />
            </svg>
          </IconButton>
          <IconButton aria-label="Disabled example" disabled>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="7" y1="4" x2="7" y2="16" />
              <line x1="13" y1="4" x2="13" y2="16" />
            </svg>
          </IconButton>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════
          EYEBROW LABELS
          ═══════════════════════════════════════════ */}

      <Section title="Eyebrow Labels">
        <div className="flex flex-wrap items-center gap-[var(--space-6)]">
          <EyebrowLabel>Match Found</EyebrowLabel>
          <EyebrowLabel color="marigold">Player 1</EyebrowLabel>
          <EyebrowLabel color="parchment">Your Turn</EyebrowLabel>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════
          DISPLAY HEADINGS
          ═══════════════════════════════════════════ */}

      <Section title="Display Headings">
        {/* Shown on parchment so var(--c-ink) text is visible */}
        <div className="flex flex-col gap-[var(--space-8)] rounded-[var(--radius-modal)] bg-[var(--surface-parchment)] p-[var(--space-6)]">
          <DisplayHeading size="lg">Screen Heading (lg)</DisplayHeading>
          <DisplayHeading size="lg" underline>Screen Heading with underline</DisplayHeading>
          <DisplayHeading size="xl">Major Title (xl)</DisplayHeading>
          <DisplayHeading size="xl" underline>Major Title with underline</DisplayHeading>
          <DisplayHeading size="2xl" as="h1">Splash Title (2xl)</DisplayHeading>
          <DisplayHeading size="2xl" as="h1" underline>Splash Title with underline</DisplayHeading>
        </div>
      </Section>
      {/* ═══════════════════════════════════════════
          INPUTS
          ═══════════════════════════════════════════ */}

      <Section title="Inputs">
        <div className="rounded-[var(--radius-modal)] bg-[var(--surface-parchment)] p-[var(--space-6)]">
          <div className="flex flex-col gap-[var(--space-6)] max-w-[320px]">
            <div>
              <p className="mb-[var(--space-2)] font-body text-[length:var(--text-sm)] text-[var(--text-primary-dark)]">
                With placeholder
              </p>
              <Input placeholder="Enter your name" maxLength={20} />
            </div>
            <div>
              <p className="mb-[var(--space-2)] font-body text-[length:var(--text-sm)] text-[var(--text-primary-dark)]">
                Filled (select-all on focus)
              </p>
              <Input defaultValue="Arjun" maxLength={20} />
            </div>
            <div>
              <p className="mb-[var(--space-2)] font-body text-[length:var(--text-sm)] text-[var(--text-primary-dark)]">
                Disabled
              </p>
              <Input placeholder="Not available" disabled />
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════
          MODAL
          ═══════════════════════════════════════════ */}

      <Section title="Modal">
        <div className="flex flex-wrap gap-[var(--space-4)]">
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
        </div>
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} ariaLabel="Example modal">
          <div className="flex flex-col gap-[var(--space-4)]">
            <EyebrowLabel>Match Found</EyebrowLabel>
            <DisplayHeading size="lg">Red Gulal</DisplayHeading>
            <p className="font-body text-[length:var(--text-base)] leading-[1.6]" style={{ color: "rgba(42, 24, 16, 0.85)" }}>
              Gulal is the traditional colored powder thrown during Holi. Red symbolizes creative energy and passion.
            </p>
          </div>
        </Modal>
      </Section>

      {/* ═══════════════════════════════════════════
          AVATARS
          ═══════════════════════════════════════════ */}

      <Section title="Avatars">
        <div className="flex flex-col gap-[var(--space-6)]">
          {/* Selectable avatars (default 64px) */}
          <div>
            <p className="mb-[var(--space-3)] font-body text-[length:var(--text-sm)] text-[var(--text-secondary-light)]">
              Selectable (64px) — click to select
            </p>
            <div className="flex flex-wrap items-center gap-[var(--space-4)]">
              {PLACEHOLDER_AVATARS.map((a) => (
                <Avatar
                  key={a.id}
                  src={a.src}
                  name={a.name}
                  selected={selectedAvatar === a.id}
                  onClick={() => setSelectedAvatar(a.id)}
                />
              ))}
            </div>
          </div>

          {/* Small display-only avatars (44px) */}
          <div>
            <p className="mb-[var(--space-3)] font-body text-[length:var(--text-sm)] text-[var(--text-secondary-light)]">
              Display-only (44px)
            </p>
            <div className="flex flex-wrap items-center gap-[var(--space-3)]">
              <Avatar src={PLACEHOLDER_AVATARS[0].src} name={PLACEHOLDER_AVATARS[0].name} size={44} />
              <Avatar src={PLACEHOLDER_AVATARS[2].src} name={PLACEHOLDER_AVATARS[2].name} size={44} />
            </div>
          </div>
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
