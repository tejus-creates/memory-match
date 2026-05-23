"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { MatchModal } from "@/components/ui/MatchModal";
import { Avatar } from "@/components/ui/Avatar";
import { Card, type CardState } from "@/components/ui/Card";
import { playSound, toggleMute, isMuted, type SoundType } from "@/lib/sound";

/* ─── Placeholder card images (inline SVG data URIs) ─── */

function placeholderFront(label: string, color: string) {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="${color}" rx="6"/><text x="100" y="100" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="22" font-weight="bold" fill="#F4E8D0">${label}</text></svg>`,
  )}`;
}

const PLACEHOLDER_BACK = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#1F4A5C"/><circle cx="100" cy="100" r="50" fill="none" stroke="#C9A876" stroke-width="2" opacity="0.6"/><circle cx="100" cy="100" r="30" fill="none" stroke="#C9A876" stroke-width="1.5" opacity="0.4"/><circle cx="100" cy="100" r="8" fill="#C9A876" opacity="0.5"/></svg>`,
)}`;

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

const SOUND_TYPES: { type: SoundType; label: string }[] = [
  { type: "flip", label: "Flip — soft click" },
  { type: "tap", label: "Tap — UI tick" },
  { type: "match", label: "Match — rising chime" },
  { type: "mismatch", label: "Mismatch — gentle descend" },
  { type: "chime", label: "Chime — modal bell" },
  { type: "win", label: "Win — celebratory flourish" },
];

export default function DesignSystemPage() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(isMuted());
  }, []);

  const handleToggleMute = useCallback(() => {
    const nowMuted = toggleMute();
    setMuted(nowMuted);
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [matchModalStandalone, setMatchModalStandalone] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("flame");
  const [interactiveCardFlipped, setInteractiveCardFlipped] = useState(false);
  const flipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFlipDemo = useCallback(() => {
    if (flipTimer.current) return; // already mid-flip
    playSound("flip");
    setInteractiveCardFlipped(true);
    flipTimer.current = setTimeout(() => {
      setInteractiveCardFlipped(false);
      flipTimer.current = null;
    }, 1500);
  }, []);

  /* ── Match sequence demo state ── */
  const [matchCard1, setMatchCard1] = useState<CardState>("face-down");
  const [matchCard2, setMatchCard2] = useState<CardState>("face-down");
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const matchRef1 = useRef<HTMLDivElement>(null);
  const matchRef2 = useRef<HTMLDivElement>(null);
  const matchSeqRef = useRef(false);

  const runMatchSequence = useCallback(() => {
    if (matchSeqRef.current) return;
    matchSeqRef.current = true;

    // If cards aren't already face-down, reset first and wait for
    // the 300ms flip transition to finish before starting the sequence.
    const needsReset = matchCard1 !== "face-down" || matchCard2 !== "face-down";
    setMatchCard1("face-down");
    setMatchCard2("face-down");
    setMatchModalOpen(false);

    const delay = needsReset ? 400 : 0;

    // Step 1: flip first card
    setTimeout(() => { setMatchCard1("active"); playSound("flip"); }, delay + 200);

    // Step 2: flip second card
    setTimeout(() => { setMatchCard2("active"); playSound("flip"); }, delay + 800);

    // Step 3: match found → celebratory bounce (cards stay active/bright)
    setTimeout(() => {
      playSound("match");
      const bounceKeyframes = [
        { transform: "scale(1)", offset: 0 },
        { transform: "scale(0.8)", offset: 0.4 },
        { transform: "scale(1.25)", offset: 0.75 },
        { transform: "scale(1)", offset: 1 },
      ];
      const bounceOptions: KeyframeAnimationOptions = {
        duration: 700,
        easing: "ease-in-out",
      };
      matchRef1.current?.animate(bounceKeyframes, bounceOptions);
      matchRef2.current?.animate(bounceKeyframes, bounceOptions);
    }, delay + 1400);

    // Step 4: open match modal after bounce
    setTimeout(() => {
      playSound("chime");
      setMatchModalOpen(true);
    }, delay + 2000);
  }, [matchCard1, matchCard2]);

  const handleMatchModalClose = useCallback(() => {
    setMatchModalOpen(false);
    setMatchCard1("matched");
    setMatchCard2("matched");
    // Sequence stays locked — user must click Reset to replay
  }, []);

  const resetMatchDemo = useCallback(() => {
    setMatchCard1("face-down");
    setMatchCard2("face-down");
    setMatchModalOpen(false);
    matchSeqRef.current = false;
  }, []);

  /* ── Mismatch sequence demo state ── */
  const [mismatchCard1, setMismatchCard1] = useState<CardState>("face-down");
  const [mismatchCard2, setMismatchCard2] = useState<CardState>("face-down");
  const mismatchRef1 = useRef<HTMLDivElement>(null);
  const mismatchRef2 = useRef<HTMLDivElement>(null);
  const mismatchSeqRef = useRef(false);

  const runMismatchSequence = useCallback(() => {
    if (mismatchSeqRef.current) return;
    mismatchSeqRef.current = true;

    // Reset to face-down if not already
    const needsReset = mismatchCard1 !== "face-down" || mismatchCard2 !== "face-down";
    setMismatchCard1("face-down");
    setMismatchCard2("face-down");

    const delay = needsReset ? 400 : 0;

    // Step 1: flip first card to active
    setTimeout(() => { setMismatchCard1("active"); playSound("flip"); }, delay + 200);

    // Step 2: flip second card to active
    setTimeout(() => { setMismatchCard2("active"); playSound("flip"); }, delay + 800);

    // Step 3: shake both (mismatch detected)
    setTimeout(() => {
      playSound("mismatch");
      const shakeKeyframes = [
        { marginLeft: "0px" },
        { marginLeft: "-8px" },
        { marginLeft: "8px" },
        { marginLeft: "-6px" },
        { marginLeft: "6px" },
        { marginLeft: "-3px" },
        { marginLeft: "0px" },
      ];
      const shakeOptions: KeyframeAnimationOptions = {
        duration: 500,
        easing: "ease-out",
      };
      mismatchRef1.current?.animate(shakeKeyframes, shakeOptions);
      mismatchRef2.current?.animate(shakeKeyframes, shakeOptions);
    }, delay + 1400);

    // Step 4: flip back after shake finishes
    setTimeout(() => {
      setMismatchCard1("face-down");
      setMismatchCard2("face-down");
    }, delay + 2100);

    // Step 5: unlock replay
    setTimeout(() => {
      mismatchSeqRef.current = false;
    }, delay + 2500);
  }, [mismatchCard1, mismatchCard2]);

  const resetMismatchDemo = useCallback(() => {
    setMismatchCard1("face-down");
    setMismatchCard2("face-down");
    mismatchSeqRef.current = false;
  }, []);

  /* ── Win reveal sequence demo state ── */
  const [winCards, setWinCards] = useState<[CardState, CardState, CardState, CardState]>([
    "matched", "matched", "matched", "matched",
  ]);
  const [winPanelOpen, setWinPanelOpen] = useState(false);
  const winRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];
  const winSeqRef = useRef(false);

  /** Generate a random tilt between -2° and +2° for each card */
  function randomTilts(): [number, number, number, number] {
    return [0, 1, 2, 3].map(() => (Math.random() * 8 - 4)) as [number, number, number, number];
  }

  const runWinReveal = useCallback(() => {
    if (winSeqRef.current) return;
    winSeqRef.current = true;

    // Reset to matched
    setWinCards(["matched", "matched", "matched", "matched"]);
    setWinPanelOpen(false);

    // Reset transforms to flat
    winRefs.forEach((ref) => {
      if (ref.current) ref.current.style.transform = "scale(1) rotate(0deg)";
    });

    const tilts = randomTilts();
    const startDelay = 500; // brief beat

    // All cards animate together:
    // 1. Dip to 0.95 (anticipation, 150ms)
    // 2. Pop to 1.06 + random tilt and HOLD (250ms ease-out)
    // 3. Simultaneously brighten (matched → revealed)
    setTimeout(() => {
      // Brighten all cards at once
      setWinCards(["revealed", "revealed", "revealed", "revealed"]);
      playSound("win");

      winRefs.forEach((ref, i) => {
        const el = ref.current;
        if (!el) return;
        const endTransform = `scale(1.06) rotate(${tilts[i].toFixed(1)}deg)`;

        el.animate(
          [
            { transform: "scale(1) rotate(0deg)", offset: 0 },
            { transform: "scale(0.95) rotate(0deg)", offset: 0.35 },
            { transform: endTransform, offset: 1 },
          ],
          { duration: 400, easing: "ease-out", fill: "forwards" },
        );
      });
    }, startDelay);

    // Show results panel after admiring the held state
    setTimeout(() => {
      playSound("chime");
      setWinPanelOpen(true);
    }, startDelay + 1200);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetWinDemo = useCallback(() => {
    setWinCards(["matched", "matched", "matched", "matched"]);
    setWinPanelOpen(false);
    // Reset transforms to flat
    winRefs.forEach((ref) => {
      if (ref.current) {
        ref.current.getAnimations().forEach((a) => a.cancel());
        ref.current.style.transform = "scale(1) rotate(0deg)";
      }
    });
    winSeqRef.current = false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      {/* ═══════════════════════════════════════════
          CARDS
          ═══════════════════════════════════════════ */}

      <Section title="Cards">
        <div className="flex flex-col gap-[var(--space-8)]">
          {/* All four states at normal size */}
          <div>
            <p className="mb-[var(--space-3)] font-body text-[length:var(--text-sm)] text-[var(--text-secondary-light)]">
              All states (120px)
            </p>
            <div className="grid grid-cols-4 gap-[var(--space-4)]" style={{ maxWidth: 580 }}>
              <div className="flex flex-col gap-[var(--space-2)]">
                <div style={{ width: 120 }}>
                  <Card
                    state="face-down"
                    frontImage={placeholderFront("Gulal", "#EE1F6F")}
                    backImage={PLACEHOLDER_BACK}
                    name="Red Gulal"
                  />
                </div>
                <p className="font-body text-[length:var(--text-xs)] text-[var(--text-secondary-light)]">
                  face-down — hidden (clickable)
                </p>
              </div>
              <div className="flex flex-col gap-[var(--space-2)]">
                <div style={{ width: 120 }}>
                  <Card
                    state="active"
                    frontImage={placeholderFront("Thandai", "#F44E18")}
                    backImage={PLACEHOLDER_BACK}
                    name="Thandai"
                  />
                </div>
                <p className="font-body text-[length:var(--text-xs)] text-[var(--text-secondary-light)]">
                  active — being evaluated (orange border)
                </p>
              </div>
              <div className="flex flex-col gap-[var(--space-2)]">
                <div style={{ width: 120 }}>
                  <Card
                    state="matched"
                    frontImage={placeholderFront("Pichkari", "#2E8B73")}
                    backImage={PLACEHOLDER_BACK}
                    name="Pichkari"
                  />
                </div>
                <p className="font-body text-[length:var(--text-xs)] text-[var(--text-secondary-light)]">
                  matched — found (dimmed)
                </p>
              </div>
              <div className="flex flex-col gap-[var(--space-2)]">
                <div style={{ width: 120 }}>
                  <Card
                    state="revealed"
                    frontImage={placeholderFront("Gulal", "#EE1F6F")}
                    backImage={PLACEHOLDER_BACK}
                    name="Red Gulal"
                  />
                </div>
                <p className="font-body text-[length:var(--text-xs)] text-[var(--text-secondary-light)]">
                  revealed — win-screen reveal (neutral)
                </p>
              </div>
            </div>
          </div>

          {/* Interactive flip demo */}
          <div>
            <p className="mb-[var(--space-3)] font-body text-[length:var(--text-sm)] text-[var(--text-secondary-light)]">
              Interactive — click to flip (resets after 1.5s)
            </p>
            <div className="flex items-end gap-[var(--space-4)]">
              <div style={{ width: 120 }}>
                <Card
                  state={interactiveCardFlipped ? "active" : "face-down"}
                  frontImage={placeholderFront("Rang", "#0E9BB5")}
                  backImage={PLACEHOLDER_BACK}
                  name="Rang"
                  onClick={handleFlipDemo}
                />
              </div>
              <p className="pb-[var(--space-1)] font-body text-[length:var(--text-sm)] text-[var(--text-secondary-light)]">
                {interactiveCardFlipped ? "active — resets automatically" : "face-down — click to flip"}
              </p>
            </div>
          </div>

          {/* Small size test (~55px, phone grid scale) */}
          <div>
            <p className="mb-[var(--space-3)] font-body text-[length:var(--text-sm)] text-[var(--text-secondary-light)]">
              Small size test (~55px, phone 30-card grid)
            </p>
            <div className="flex flex-wrap gap-[var(--space-3)]">
              {(["face-down", "active", "matched", "revealed"] as const).map((s) => (
                <div key={s} style={{ width: 55 }}>
                  <Card
                    state={s}
                    frontImage={placeholderFront("G", "#EE1F6F")}
                    backImage={PLACEHOLDER_BACK}
                    name="Gulal"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════
          MATCH SEQUENCE
          ═══════════════════════════════════════════ */}

      <Section title="Match Sequence">
        <p className="mb-[var(--space-4)] font-body text-[length:var(--text-sm)] text-[var(--text-secondary-light)]">
          Full match flow: face-down → active → matched (pulse) → MatchModal appears
        </p>
        <div className="flex flex-col gap-[var(--space-6)]">
          <div className="flex items-end gap-[var(--space-4)]">
            <div ref={matchRef1} style={{ width: 120 }}>
              <Card
                state={matchCard1}
                frontImage={placeholderFront("Gulal", "#EE1F6F")}
                backImage={PLACEHOLDER_BACK}
                name="Red Gulal"
              />
            </div>
            <div ref={matchRef2} style={{ width: 120 }}>
              <Card
                state={matchCard2}
                frontImage={placeholderFront("Gulal", "#EE1F6F")}
                backImage={PLACEHOLDER_BACK}
                name="Red Gulal"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-[var(--space-4)]">
            <Button onClick={runMatchSequence}>Play Match Sequence</Button>
            <Button variant="secondary" onClick={resetMatchDemo}>Reset</Button>
          </div>
        </div>
        <MatchModal
          isOpen={matchModalOpen}
          onClose={handleMatchModalClose}
          image={placeholderFront("Gulal", "#EE1F6F")}
          name="Red Gulal"
          blurb="Gulal is the traditional colored powder thrown during Holi. Red symbolizes creative energy and passion."
        />
      </Section>

      {/* ═══════════════════════════════════════════
          MISMATCH SEQUENCE
          ═══════════════════════════════════════════ */}

      <Section title="Mismatch Sequence">
        <p className="mb-[var(--space-4)] font-body text-[length:var(--text-sm)] text-[var(--text-secondary-light)]">
          Mismatch flow: face-down → flip to active → shake → flip back to face-down
        </p>
        <div className="flex flex-col gap-[var(--space-6)]">
          <div className="flex items-end gap-[var(--space-4)]">
            <div
              ref={mismatchRef1}
              style={{ width: 120 }}
            >
              <Card
                state={mismatchCard1}
                frontImage={placeholderFront("Gulal", "#EE1F6F")}
                backImage={PLACEHOLDER_BACK}
                name="Red Gulal"
              />
            </div>
            <div
              ref={mismatchRef2}
              style={{ width: 120 }}
            >
              <Card
                state={mismatchCard2}
                frontImage={placeholderFront("Thandai", "#0E9BB5")}
                backImage={PLACEHOLDER_BACK}
                name="Thandai"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-[var(--space-4)]">
            <Button onClick={runMismatchSequence}>Play Mismatch</Button>
            <Button variant="secondary" onClick={resetMismatchDemo}>Reset</Button>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════
          WIN REVEAL SEQUENCE
          ═══════════════════════════════════════════ */}

      <Section title="Win Reveal Sequence">
        <p className="mb-[var(--space-4)] font-body text-[length:var(--text-sm)] text-[var(--text-secondary-light)]">
          End-of-game reveal: matched (dimmed) → dip → pop up with random tilts (held) → win sound → results panel
        </p>
        <div className="flex flex-col gap-[var(--space-6)]">
          {/* 2×2 card grid */}
          <div className="grid grid-cols-2 gap-[var(--space-6)]" style={{ width: 280 }}>
            {([
              { name: "Red Gulal", color: "#EE1F6F", label: "Gulal" },
              { name: "Thandai", color: "#0E9BB5", label: "Thandai" },
              { name: "Pichkari", color: "#2E8B73", label: "Pichkari" },
              { name: "Rang", color: "#F44E18", label: "Rang" },
            ] as const).map((card, i) => (
              <div key={card.name} ref={winRefs[i]}>
                <Card
                  state={winCards[i]}
                  frontImage={placeholderFront(card.label, card.color)}
                  backImage={PLACEHOLDER_BACK}
                  name={card.name}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-[var(--space-4)]">
            <Button onClick={runWinReveal}>Play Win Reveal</Button>
            <Button variant="secondary" onClick={resetWinDemo}>Reset</Button>
          </div>
        </div>

        {/* Placeholder results panel — real results screen with stars/stats comes later */}
        <Modal
          isOpen={winPanelOpen}
          onClose={() => { setWinPanelOpen(false); winSeqRef.current = false; }}
          ariaLabel="Game complete"
          maxWidth={340}
          shadow="var(--shadow-modal-celebration)"
        >
          <div className="flex flex-col items-center gap-[var(--space-4)] text-center">
            <DisplayHeading size="xl" underline>
              Happy Holi!
            </DisplayHeading>
            <p
              className="font-body text-[length:var(--text-base)] leading-[1.6]"
              style={{ color: "rgba(42, 24, 16, 0.85)" }}
            >
              You matched all the pairs!
            </p>
            {/* TODO: Replace with full results screen — stars, stats, play-again flow */}
            <Button onClick={() => { setWinPanelOpen(false); winSeqRef.current = false; }}>
              Play Again
            </Button>
          </div>
        </Modal>
      </Section>

      {/* ═══════════════════════════════════════════
          MATCH MODAL (standalone)
          ═══════════════════════════════════════════ */}

      <Section title="Match Modal">
        <div className="flex flex-wrap gap-[var(--space-4)]">
          <Button onClick={() => setMatchModalStandalone(true)}>Open Match Modal</Button>
        </div>
        <MatchModal
          isOpen={matchModalStandalone}
          onClose={() => setMatchModalStandalone(false)}
          image={placeholderFront("Thandai", "#0E9BB5")}
          name="Thandai"
          blurb="Thandai is a chilled drink made with milk, almonds, and aromatic spices, enjoyed during Holi celebrations."
          autoDismissMs={6000}
        />
      </Section>

      {/* ═══════════════════════════════════════════
          SOUND SYSTEM
          ═══════════════════════════════════════════ */}

      <Section title="Sound System">
        <div className="flex flex-col gap-[var(--space-6)]">
          {/* Mute toggle */}
          <div className="flex items-center gap-[var(--space-4)]">
            <IconButton aria-label={muted ? "Unmute" : "Mute"} onClick={handleToggleMute}>
              {muted ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="4,7 8,7 12,3 12,17 8,13 4,13" fill="currentColor" stroke="none" />
                  <line x1="15" y1="7" x2="19" y2="13" />
                  <line x1="19" y1="7" x2="15" y2="13" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="4,7 8,7 12,3 12,17 8,13 4,13" fill="currentColor" stroke="none" />
                  <path d="M14.5 7.5c.8.8 1.3 2 1.3 3s-.5 2.2-1.3 3" />
                </svg>
              )}
            </IconButton>
            <p className="font-body text-[length:var(--text-sm)] text-[var(--text-secondary-light)]">
              {muted ? "Muted — sounds disabled" : "Sound on — click to mute"}
            </p>
          </div>

          {/* Individual sound audition buttons */}
          <div>
            <p className="mb-[var(--space-3)] font-body text-[length:var(--text-sm)] text-[var(--text-secondary-light)]">
              Audition each sound (synth tones — will be swapped for audio files later)
            </p>
            <div className="flex flex-wrap gap-[var(--space-3)]">
              {SOUND_TYPES.map(({ type, label }) => (
                <Button
                  key={type}
                  variant="secondary"
                  onClick={() => playSound(type)}
                >
                  {label}
                </Button>
              ))}
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
