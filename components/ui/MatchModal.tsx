"use client";

import { useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { Button } from "@/components/ui/Button";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: string;
  name: string;
  blurb: string;
  eyebrow?: string;
  autoDismissMs?: number;
}

export function MatchModal({
  isOpen,
  onClose,
  image,
  name,
  blurb,
  eyebrow = "MATCH FOUND",
  autoDismissMs = 4000,
}: MatchModalProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-dismiss timer — clears if user dismisses manually first
  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      onClose();
    }, autoDismissMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isOpen, autoDismissMs, onClose]);

  const countdownSeconds = Math.round(autoDismissMs / 1000);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOutsideClick
      ariaLabel={`Match found: ${name}`}
      maxWidth={340}
      shadow="var(--shadow-modal-celebration)"
    >
      {/* Celebratory entrance wrapper */}
      <div
        style={{
          animation: "match-modal-enter 350ms ease-out both",
        }}
        className="motion-reduce:[animation:none]"
      >
        {/*
         * Two-zone card: full-bleed image (top) + content (bottom).
         * The generic Modal panel has padding: var(--space-6) (24px).
         * Negative margins pull the image zone flush to modal edges.
         */}

        {/* ── Image zone — flush to top, left, right edges ── */}
        <div
          style={{
            margin: "calc(-1 * var(--space-6))",
            marginBottom: 0,
          }}
        >
          <div
            className="overflow-hidden bg-[var(--surface-card)]"
            style={{
              aspectRatio: "1",
              borderRadius: "var(--radius-modal) var(--radius-modal) 0 0",
            }}
          >
            <img
              src={image}
              alt={name}
              className="h-full w-full object-contain"
              style={{ padding: "var(--space-3)" }}
            />
          </div>

          {/* Divider */}
          <div
            className="bg-[var(--c-brass)]"
            style={{ height: 1 }}
          />
        </div>

        {/* ── Content zone — centered, generous spacing ── */}
        <div className="flex flex-col items-center pt-[var(--space-5)] text-center">
          <EyebrowLabel>{eyebrow}</EyebrowLabel>

          <div className="mt-[var(--space-3)]">
            <DisplayHeading size="lg" underline>
              {name}
            </DisplayHeading>
          </div>

          <p
            className="mt-[var(--space-4)] max-w-[340px] font-body text-[length:var(--text-base)] leading-[1.6]"
            style={{ color: "rgba(42, 24, 16, 0.85)" }}
          >
            {blurb}
          </p>

          <div className="mt-[var(--space-5)] flex flex-col items-center gap-[var(--space-2)]">
            <Button onClick={onClose} style={{ height: 40, fontSize: 14, padding: "0 24px" }}>Continue</Button>
            <p
              className="font-body text-[length:var(--text-xs)]"
              style={{ color: "rgba(42, 24, 16, 0.5)" }}
            >
              Auto-continues in {countdownSeconds}s
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
