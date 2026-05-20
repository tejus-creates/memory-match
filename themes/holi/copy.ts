import type { Copy } from "@/lib/engine/types";

export const copy: Copy = {
  splash: {
    subtitle: "A memory match game celebrating the festival of colors",
    startButton: "Play",
  },
  menu: {
    newGame: "New Game",
    continueGame: "Continue",
    howToPlay: "How to Play",
  },
  setup: {
    heading: "Who's Playing?",
    playerNameLabel: "Your Name",
    playerNamePlaceholder: "Enter your name",
    chooseAvatar: "Choose Your Avatar",
    nextButton: "Next",
  },
  deckSelect: {
    heading: "Choose Your Deck",
    choosePrompt: "Pick a card back design",
  },
  difficulty: {
    heading: "Choose Difficulty",
    levels: {
      easy: {
        label: "Easy",
        description: "6 pairs — a gentle start",
        pairs: 6,
      },
      medium: {
        label: "Medium",
        description: "10 pairs — a fair challenge",
        pairs: 10,
      },
      hard: {
        label: "Hard",
        description: "15 pairs — test your memory",
        pairs: 15,
      },
      expert: {
        label: "Expert",
        description: "20 pairs — the ultimate challenge",
        pairs: 20,
      },
    },
  },
  gameplay: {
    pauseButton: "Pause",
    matchFound: "Match!",
    noMatch: "Try again",
    turnLabel: "Moves",
    matchesLabel: "Matches",
    timeLabel: "Time",
  },
  results: {
    heading: "Well Done!",
    totalTime: "Total Time",
    totalMoves: "Total Moves",
    matchesMade: "Matches Made",
    playAgain: "Play Again",
    backToMenu: "Back to Menu",
  },
  matchModal: {
    eyebrow: "MATCH FOUND",
    dismissButton: "Continue",
  },
  pauseModal: {
    heading: "Game Paused",
    resumeButton: "Resume",
    quitButton: "Quit to Menu",
    soundToggleLabel: "Sound Effects",
  },
};
