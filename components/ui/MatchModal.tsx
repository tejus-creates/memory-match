"use client";

import { Modal } from "@/components/ui/Modal";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { Button } from "@/components/ui/Button";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: string;
  name: string;
  blurb: string;
}

export function MatchModal({
  isOpen,
  onClose,
  image,
  name,
  blurb,
}: MatchModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOutsideClick
      ariaLabel={`Match found: ${name}`}
      maxWidth={680}
      width="75vw"
      shadow="var(--shadow-modal-celebration)"
    >
      {/* Celebratory entrance wrapper */}
      <div
        style={{
          animation: "match-modal-enter 350ms ease-out both",
        }}
        className="motion-reduce:[animation:none]"
      >
        {/* ── Mobile: vertical layout ── */}
        <div className="sm:hidden">
          {/* Image zone — flush to top, left, right edges */}
          <div
            style={{
              margin: "calc(-1 * var(--space-6)) calc(-1 * var(--space-6)) 0",
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
                className="h-full w-full object-cover"
              />
            </div>

            {/* Divider */}
            <div
              className="bg-[var(--c-brass)]"
              style={{ height: 1 }}
            />
          </div>

          {/* Content zone */}
          <div className="flex flex-col items-center pt-[var(--space-3)] text-center">
            <DisplayHeading size="lg" underline>
              {name}
            </DisplayHeading>

            <p
              className="mt-[var(--space-2)] font-body text-[length:var(--text-sm)] leading-[1.6]"
              style={{ color: "rgba(42, 24, 16, 0.85)" }}
            >
              {blurb}
            </p>

            <div className="mt-[var(--space-3)]">
              <Button onClick={onClose} style={{ height: 36, fontSize: 13, padding: "0 20px" }}>Continue</Button>
            </div>
          </div>
        </div>

        {/* ── Desktop: horizontal layout — image left, text right ── */}
        <div
          className="hidden sm:flex"
          style={{
            margin: "calc(-1 * var(--space-6))",
            height: 300,
          }}
        >
          {/* Left: image column — 220×220 square flush to edges */}
          <div
            className="shrink-0 overflow-hidden bg-[var(--surface-card)]"
            style={{
              width: 300,
              borderRadius: "var(--radius-modal) 0 0 var(--radius-modal)",
            }}
          >
            <img
              src={image}
              alt={name}
              className="block h-full w-full object-contain"
            />
          </div>

          {/* Vertical divider */}
          <div
            className="shrink-0 bg-[var(--c-brass)]"
            style={{ width: 1 }}
          />

          {/* Right: text column */}
          <div
            className="flex flex-1 flex-col justify-center"
            style={{ padding: "var(--space-6) var(--space-8, 40px)" }}
          >
            <DisplayHeading size="lg" underline>
              {name}
            </DisplayHeading>

            <p
              className="mt-[var(--space-4)] font-body text-[length:var(--text-base)] leading-[1.6]"
              style={{ color: "rgba(42, 24, 16, 0.85)" }}
            >
              {blurb}
            </p>

            <div className="mt-[var(--space-5)]">
              <Button onClick={onClose} style={{ height: 40, fontSize: 14, padding: "0 24px" }}>Continue</Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
