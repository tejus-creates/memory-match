"use client";

import {
  Suspense,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Panel } from "@/components/ui/Panel";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { playSound } from "@/lib/sound";
import { decks } from "@/themes/holi/decks";
import { getGamePrefs, saveGamePrefs } from "@/lib/engine/storage";
import { navigateForward, navigateBack } from "@/lib/navigation";
import { PageTransition } from "@/components/PageTransition";
import type { GameMode } from "@/lib/engine/game-state";

/* ─── Eased programmatic scroll ─── */

const SCROLL_DURATION = 320; // ms

/** ease-out cubic: fast start, gentle deceleration */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Animate scrollLeft from current position to `target` using rAF.
 * Falls back to instant jump when reduced-motion is preferred.
 */
function animateScroll(
  el: HTMLElement,
  target: number,
  instant: boolean
): void {
  if (instant) {
    el.scrollLeft = target;
    return;
  }
  const start = el.scrollLeft;
  const delta = target - start;
  if (Math.abs(delta) < 1) return;

  const t0 = performance.now();

  function frame(now: number) {
    const elapsed = now - t0;
    const progress = Math.min(elapsed / SCROLL_DURATION, 1);
    el.scrollLeft = start + delta * easeOutCubic(progress);
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

/* ─── Initial index from saved prefs ─── */

function getInitialIndex(): number {
  if (typeof window === "undefined") return 0;
  const saved = getGamePrefs();
  if (saved?.deckId) {
    const idx = decks.findIndex((d) => d.id === saved.deckId);
    if (idx >= 0) return idx;
  }
  return 0;
}

/* ─── Helpers ─── */

/** Compute the scrollLeft that centers a child inside its scroll parent. */
function centerOffset(parent: HTMLElement, child: HTMLElement): number {
  return (
    child.offsetLeft - parent.offsetLeft - (parent.clientWidth - child.offsetWidth) / 2
  );
}

/* ─── Component ─── */

function DeckContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as GameMode) || "1p";

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Set initial index from saved prefs + scroll to it
  useEffect(() => {
    const idx = getInitialIndex();
    setActiveIndex(idx);
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      const child = el.children[idx] as HTMLElement | undefined;
      if (child) {
        el.scrollLeft = centerOffset(el, child);
      }
    });
  }, []);

  // Scroll listener — sync activeIndex to whichever card is centered.
  // Uses getBoundingClientRect (viewport-relative) to avoid offsetLeft/offsetParent
  // ambiguity that can cause two items to appear equidistant from center.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const containerRect = el.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;
        let closest = 0;
        let minDist = Infinity;
        for (let i = 0; i < el.children.length; i++) {
          const childRect = (el.children[i] as HTMLElement).getBoundingClientRect();
          const childCenter = childRect.left + childRect.width / 2;
          const dist = Math.abs(containerCenter - childCenter);
          if (dist < minDist) {
            minDist = dist;
            closest = i;
          }
        }
        setActiveIndex(closest);
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Measure the tallest deck image once so the carousel has a stable fixed height.
  // This prevents the panel from jittering when swiping between decks with
  // slightly different aspect ratios.
  const [carouselHeight, setCarouselHeight] = useState<number | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Wait for images to load, then measure
    const images = Array.from(el.querySelectorAll("img"));
    let loaded = 0;
    const total = images.length;

    function measure() {
      let maxH = 0;
      for (const child of Array.from(el!.children) as HTMLElement[]) {
        maxH = Math.max(maxH, child.offsetHeight);
      }
      if (maxH > 0) setCarouselHeight(maxH);
    }

    function onLoad() {
      loaded++;
      if (loaded >= total) measure();
    }

    // If images are already cached / complete
    const allLoaded = images.every((img) => img.complete);
    if (allLoaded) {
      requestAnimationFrame(measure);
    } else {
      images.forEach((img) => {
        if (img.complete) {
          loaded++;
        } else {
          img.addEventListener("load", onLoad, { once: true });
        }
      });
    }

    return () => {
      images.forEach((img) => img.removeEventListener("load", onLoad));
    };
  }, []);

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const child = el.children[index] as HTMLElement | undefined;
      if (!child) return;
      // Temporarily disable scroll-snap so our animation isn't fighting it
      el.style.scrollSnapType = "none";
      animateScroll(el, centerOffset(el, child), prefersReducedMotion);
      // Re-enable snap after animation completes (or instantly if reduced motion)
      setTimeout(
        () => {
          el.style.scrollSnapType = "x mandatory";
        },
        prefersReducedMotion ? 0 : SCROLL_DURATION + 50
      );
    },
    [prefersReducedMotion]
  );

  const handlePrev = useCallback(() => {
    playSound("tap");
    scrollToIndex((activeIndex - 1 + decks.length) % decks.length);
  }, [activeIndex, scrollToIndex]);

  const handleNext = useCallback(() => {
    playSound("tap");
    scrollToIndex((activeIndex + 1) % decks.length);
  }, [activeIndex, scrollToIndex]);

  const handleDotClick = useCallback(
    (index: number) => {
      playSound("tap");
      scrollToIndex(index);
    },
    [scrollToIndex]
  );

  const handleContinue = useCallback(() => {
    playSound("tap");
    const existing = getGamePrefs();
    saveGamePrefs({
      deckId: decks[activeIndex].id,
      difficulty: existing?.difficulty ?? 12,
      soundEnabled: existing?.soundEnabled ?? true,
    });
    navigateForward(router, `/difficulty?mode=${mode}`);
  }, [activeIndex, mode, router]);

  const handleBack = useCallback(() => {
    playSound("tap");
    navigateBack(router, `/setup?mode=${mode}`);
  }, [mode, router]);

  return (
    <PageTransition>
    <main
      className="flex flex-1 flex-col items-center justify-between px-[var(--space-4)] py-[var(--space-10)]"
    >
      {/* ── Back button — top-left ── */}
      <div className="w-full" style={{ maxWidth: 480 }}>
        <IconButton
          aria-label="Back to setup"
          className="mb-[var(--space-4)]"
          onClick={handleBack}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </IconButton>
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Panel ── */}
      <Panel
        className="flex flex-col items-center gap-[var(--space-5)]"
        elevated
      >
          {/* Heading */}
          <DisplayHeading size="lg">
            Choose your deck
          </DisplayHeading>

          {/* Carousel area */}
          <div className="w-full flex flex-col items-center gap-[var(--space-4)]">
            {/* Scroll container + arrow buttons */}
            <div className="relative w-full">
              {/* Left arrow */}
              <button
                type="button"
                aria-label="Previous deck"
                onClick={handlePrev}
                className={[
                  "absolute left-0 top-1/2 -translate-y-1/2 z-10",
                  "flex items-center justify-center",
                  "w-[36px] h-[36px] sm:w-[40px] sm:h-[40px]",
                  "rounded-full",
                  "text-[var(--c-parchment)]",
                  "cursor-pointer",
                  "transition-[background-color,transform] duration-100 ease-out",
                  "hover:bg-[rgba(244,232,208,0.15)]",
                  "active:scale-[0.92]",
                  "focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]",
                ].join(" ")}
                style={{ backgroundColor: "rgba(42, 24, 16, 0.5)" }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              {/* Right arrow */}
              <button
                type="button"
                aria-label="Next deck"
                onClick={handleNext}
                className={[
                  "absolute right-0 top-1/2 -translate-y-1/2 z-10",
                  "flex items-center justify-center",
                  "w-[36px] h-[36px] sm:w-[40px] sm:h-[40px]",
                  "rounded-full",
                  "text-[var(--c-parchment)]",
                  "cursor-pointer",
                  "transition-[background-color,transform] duration-100 ease-out",
                  "hover:bg-[rgba(244,232,208,0.15)]",
                  "active:scale-[0.92]",
                  "focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]",
                ].join(" ")}
                style={{ backgroundColor: "rgba(42, 24, 16, 0.5)" }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              {/* Horizontal scroll-snap container — fixed height prevents panel jitter.
                  Vertical padding gives the drop shadow room to render before
                  the overflow clip boundary; negative margin on the outer wrapper
                  compensates so the layout doesn't shift. */}
              <div
                ref={scrollRef}
                className="flex overflow-x-auto hide-scrollbar items-center"
                style={{
                  scrollSnapType: "x mandatory",
                  WebkitOverflowScrolling: "touch",
                  paddingLeft: "10%",
                  paddingRight: "10%",
                  paddingTop: 24,
                  paddingBottom: 24,
                  marginTop: -24,
                  marginBottom: -24,
                  height: carouselHeight
                    ? carouselHeight + 48
                    : undefined,
                }}
              >
                {decks.map((deck, i) => {
                  const isActive = i === activeIndex;
                  return (
                    <div
                      key={deck.id}
                      className="flex-shrink-0"
                      style={{
                        width: "80%",
                        scrollSnapAlign: "center",
                        paddingLeft: i === 0 ? 0 : 6,
                        paddingRight: i === decks.length - 1 ? 0 : 6,
                        opacity: isActive ? 1 : 0.4,
                        transition: "opacity 250ms ease-out, box-shadow 250ms ease-out",
                      }}
                    >
                      <div
                        className="w-full overflow-hidden rounded-[var(--radius-card)]"
                        style={{
                          boxShadow: isActive
                            ? "0 8px 24px rgba(42, 24, 16, 0.4)"
                            : "none",
                          transition: "box-shadow 250ms ease-out",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={deck.image}
                          alt={`${deck.name} deck back design`}
                          className="w-full h-auto"
                          draggable={false}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Deck name — shows centered deck's name */}
            <p
              className="font-display text-center"
              style={{
                fontSize: "var(--text-md)",
                color: "var(--c-marigold)",
                minHeight: "1.4em",
              }}
            >
              {decks[activeIndex]?.name}
            </p>

            {/* Dot indicators */}
            <div
              className="flex items-center justify-center gap-[var(--space-2)]"
              role="tablist"
              aria-label="Deck selection"
            >
              {decks.map((deck, i) => {
                const isDotActive = i === activeIndex;
                return (
                <button
                  key={deck.id}
                  type="button"
                  role="tab"
                  aria-selected={isDotActive}
                  aria-label={`Go to ${deck.name}`}
                  onClick={() => handleDotClick(i)}
                  className={[
                    "rounded-full cursor-pointer",
                    "transition-[width,height,background-color] duration-100 ease-out",
                    "focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]",
                  ].join(" ")}
                  style={{
                    width: isDotActive ? 10 : 8,
                    height: isDotActive ? 10 : 8,
                    backgroundColor: isDotActive
                      ? "var(--c-parchment)"
                      : "rgba(244, 232, 208, 0.2)",
                  }}
                />
                );
              })}
            </div>
          </div>

          {/* Continue button */}
          <Button
            variant="primary"
            className="w-full max-w-[320px]"
            onClick={handleContinue}
          >
            Continue
          </Button>
        </Panel>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Footer — HAF branding ── */}
      <footer className="flex flex-col items-center gap-[var(--space-3)] pt-[var(--space-6)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/branding/HAFLogo2019_RGB_white.webp"
          alt="Hindu American Foundation"
          className="h-[32px] w-auto opacity-70"
        />
        <div
          className="text-center font-body leading-relaxed"
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--text-secondary-light)",
          }}
        >
          <p>Created by Tejus Shah</p>
          <p>&copy;2026 Hindu American Foundation &middot; hinduamerican.org</p>
        </div>
      </footer>

      {/* Hide scrollbar across browsers */}
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
    </PageTransition>
  );
}

export default function DeckPage() {
  return (
    <Suspense>
      <DeckContent />
    </Suspense>
  );
}
