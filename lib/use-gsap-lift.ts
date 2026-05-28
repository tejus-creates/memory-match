"use client";

import { useRef, useCallback, useEffect } from "react";
import gsap from "gsap";

/**
 * Reusable GSAP lift animation hook.
 *
 * Attaches hover (desktop) and pointerdown/pointerup (touch) listeners
 * that smoothly lift an element upward with a growing shadow, then
 * settle it back on leave/release.
 *
 * Respects prefers-reduced-motion — skips animation entirely if set.
 *
 * Returns a ref to attach to the target element, plus manual
 * lift/settle callbacks if you need programmatic control.
 */

export interface LiftOptions {
  /** Y translation in pixels when lifted (positive = up). Default 4 */
  y?: number;
  /** Scale when lifted. Default 1.03 */
  scale?: number;
  /** Duration in seconds for the lift. Default 0.22 */
  duration?: number;
  /** GSAP ease for lift. Default "power2.out" */
  ease?: string;
  /** Duration in seconds for the settle-back. Default 0.3 */
  settleDuration?: number;
  /** GSAP ease for settle. Default "power2.inOut" */
  settleEase?: string;
  /** CSS box-shadow when lifted. Uses --shadow-card-hover token by default */
  liftShadow?: string;
  /** CSS box-shadow at rest. Uses --shadow-card token by default */
  restShadow?: string;
  /** Element(s) whose box-shadow should animate (if different from the root ref).
   *  Pass a CSS selector string resolved within the ref element. */
  shadowTarget?: string;
  /** Whether the lift is currently enabled. Default true */
  enabled?: boolean;
}

const DEFAULT: Required<Omit<LiftOptions, "shadowTarget" | "enabled">> = {
  y: 4,
  scale: 1.03,
  duration: 0.22,
  ease: "power2.out",
  settleDuration: 0.3,
  settleEase: "power2.inOut",
  liftShadow: "var(--shadow-card-hover)",
  restShadow: "var(--shadow-card)",
};

export function useGsapLift<T extends HTMLElement = HTMLDivElement>(
  opts: LiftOptions = {},
) {
  const ref = useRef<T>(null);
  const reducedMotion = useRef(false);
  const enabled = opts.enabled ?? true;

  const o = { ...DEFAULT, ...opts };

  // Detect reduced motion once on mount
  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  const getShadowTargets = useCallback((): HTMLElement[] => {
    if (!ref.current) return [];
    if (o.shadowTarget) {
      return Array.from(
        ref.current.querySelectorAll<HTMLElement>(o.shadowTarget),
      );
    }
    return [ref.current];
  }, [o.shadowTarget]);

  const lift = useCallback(() => {
    const el = ref.current;
    if (!el || reducedMotion.current || !enabled) return;

    gsap.to(el, {
      y: -o.y,
      scale: o.scale,
      duration: o.duration,
      ease: o.ease,
      overwrite: true,
    });

    for (const t of getShadowTargets()) {
      t.style.boxShadow = o.liftShadow;
    }
  }, [o.y, o.scale, o.duration, o.ease, o.liftShadow, getShadowTargets, enabled]);

  const settle = useCallback(() => {
    const el = ref.current;
    if (!el || reducedMotion.current || !enabled) return;

    gsap.to(el, {
      y: 0,
      scale: 1,
      duration: o.settleDuration,
      ease: o.settleEase,
      overwrite: true,
    });

    for (const t of getShadowTargets()) {
      t.style.boxShadow = o.restShadow;
    }
  }, [o.settleDuration, o.settleEase, o.restShadow, getShadowTargets, enabled]);

  // Attach pointer listeners
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const onPointerEnter = () => lift();
    const onPointerLeave = () => settle();
    const onPointerDown = () => lift();
    const onPointerUp = () => settle();

    el.addEventListener("pointerenter", onPointerEnter);
    el.addEventListener("pointerleave", onPointerLeave);
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);

    return () => {
      el.removeEventListener("pointerenter", onPointerEnter);
      el.removeEventListener("pointerleave", onPointerLeave);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "transform" });
    };
  }, [lift, settle, enabled]);

  return { ref, lift, settle };
}
