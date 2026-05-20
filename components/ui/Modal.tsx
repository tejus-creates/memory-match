"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  closeOnOutsideClick?: boolean;
  ariaLabel?: string;
}

export function Modal({
  isOpen,
  onClose,
  children,
  closeOnOutsideClick = true,
  ariaLabel,
}: ModalProps) {
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
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(42, 24, 16, 0.6)",
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
        style={{
          width: "90vw",
          maxWidth: 480,
          borderRadius: "var(--radius-modal)",
          border: "0.5px solid var(--c-ink)",
          backgroundColor: "var(--surface-parchment)",
          padding: "var(--space-6)",
          boxShadow: "var(--shadow-modal)",
          color: "var(--text-primary-dark)",
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
