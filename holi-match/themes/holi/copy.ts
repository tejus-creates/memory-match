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
        description: "A gentle start",
        pairs: 6,
      },
      medium: {
        label: "Medium",
        description: "A fair challenge",
        pairs: 12,
      },
      hard: {
        label: "Hard",
        description: "Test your memory",
        pairs: 20,
      },
      expert: {
        label: "Expert",
        description: "The ultimate challenge",
        pairs: 28,
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
    accuracyLabel: "Accuracy",
    streakLabel: "Streak",
    bestStreakLabel: "Best",
  },
  results: {
    heading: "Well Done!",
    heading2p: "Game Over!",
    totalTime: "Total Time",
    totalMoves: "Total Moves",
    matchesMade: "Matches Made",
    playAgain: "Play Again",
    backToMenu: "Back to Menu",
    gameComplete: "GAME COMPLETE",
    gameOver: "GAME OVER",
    winnerBanner: "{name} wins!",
    tieBanner: "It's a tie!",
    continueButton: "Continue",
    learnCta: "Learn About Holi",
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
