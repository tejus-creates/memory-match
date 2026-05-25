"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

export function PauseModal({ isOpen, onResume, onRestart, onQuit }: PauseModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onResume} ariaLabel="Game paused" maxWidth={360}>
      <div className="flex flex-col items-center gap-5">
        <h2
          className="font-display text-lg"
          style={{ color: "var(--text-primary-dark)" }}
        >
          Game Paused
        </h2>

        <div className="flex flex-col gap-3 w-full">
          <Button variant="primary" onClick={onResume} className="w-full">
            Resume
          </Button>
          <Button variant="secondary" onClick={onRestart} className="w-full">
            Restart
          </Button>
          <Button variant="secondary" onClick={onQuit} className="w-full">
            Quit to Menu
          </Button>
        </div>
      </div>
    </Modal>
  );
}
