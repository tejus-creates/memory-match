"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  closeOnOutsideClick?: boolean;
  ariaLabel?: string;
  maxWidth?: number;
  width?: string;
  shadow?: string;
  /** "parchment" = solid cream panel (default). "frosted" = dark semi-transparent with backdrop blur, matching start screens. */
  variant?: "parchment" | "frosted";
}

export function Modal({
  isOpen,
  onClose,
  children,
  closeOnOutsideClick = true,
  ariaLabel,
  maxWidth = 480,
  width = "90vw",
  shadow,
  variant = "parchment",
}: ModalProps) {
  const isFrosted = variant === "frosted";
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // ── Mount / unmount lifecycle ──
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      setMounted(true);
    } else if (mounted) {
      // Begin exit: flip visible, then unmount after animation
      setVisible(false);
      const id = setTimeout(() => {
        setMounted(false);
        if (triggerRef.current instanceof HTMLElement) {
          triggerRef.current.focus();
        }
      }, 150);
      return () => clearTimeout(id);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Once mounted, set visible on next frame so the browser paints the
  // initial (hidden) state before we transition to the visible state.
  useEffect(() => {
    if (!mounted) return;
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [mounted]);

  // ── Esc key ──
  useEffect(() => {
    if (!mounted || !closeOnOutsideClick) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mounted, closeOnOutsideClick, onClose]);

  // ── Focus trap ──
  useEffect(() => {
    if (!mounted) return;
    const panel = panelRef.current;
    if (!panel) return;

    const getFocusable = () =>
      panel.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])',
      );

    const nodes = getFocusable();
    if (nodes.length) nodes[0].focus();
    else panel.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const els = getFocusable();
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [mounted]);

  // ── Body scroll lock ──
  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    /* Overlay — doubles as the scrim and the click-outside target.
       Clicking it calls onClose; clicking the panel stops propagation. */
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className={isFrosted ? "backdrop-blur-[12px]" : ""}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isFrosted
          ? "rgba(42, 24, 16, 0.45)"
          : "rgba(42, 24, 16, 0.6)",
        opacity: visible ? 1 : 0,
        transition: "opacity 200ms ease-out",
      }}
      onClick={closeOnOutsideClick ? onClose : undefined}
      onKeyDown={undefined}
    >
      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={isFrosted ? "backdrop-blur-[4px] sm:!p-[var(--space-8)]" : ""}
        style={{
          width,
          maxWidth,
          borderRadius: "var(--radius-modal)",
          border: isFrosted
            ? "0.5px solid rgba(244, 232, 208, 0.25)"
            : "0.5px solid var(--c-ink)",
          backgroundColor: isFrosted
            ? "rgba(42, 24, 16, 0.4)"
            : "var(--surface-parchment)",
          padding: "var(--space-6)",
          boxShadow: shadow ?? (isFrosted
            ? "0 6px 20px rgba(42, 24, 16, 0.3)"
            : "var(--shadow-modal)"),
          color: isFrosted
            ? "var(--text-primary-light)"
            : "var(--text-primary-dark)",
          outline: "none",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1) translateY(0)" : "scale(0.95) translateY(8px)",
          transition: visible
            ? "opacity 200ms ease-out, transform 200ms ease-out"
            : "opacity 150ms ease-in, transform 150ms ease-in",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
