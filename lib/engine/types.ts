/* ─── Brand ─── */

export interface BrandConfig {
  primary: string;
  accent: string;
  deep: string;
  fontDisplay: string;
  fontBody: string;
}

/* ─── Logo ─── */

export interface LogoConfig {
  splash: string;
  header: string;
}

/* ─── Meta / SEO ─── */

export interface MetaConfig {
  title: string;
  description: string;
  ogImage: string;
}

/* ─── Sibling game link ─── */

export interface SiblingGame {
  name: string;
  url: string;
}

/* ─── Theme config (top-level) ─── */

export interface ThemeConfig {
  id: string;
  gameName: string;
  shortName: string;
  tagline: string;
  domain: string;

  brand: BrandConfig;
  logo: LogoConfig;
  meta: MetaConfig;

  /** Optional links to other games built from this template. null = hide. */
  otherGames: SiblingGame[] | null;
}

/* ─── Card content ─── */

export interface CardContent {
  id: string;
  name: string;
  image: string;
  blurb: string;
  category: string;
}

/* ─── Deck back design ─── */

export interface DeckDesign {
  id: string;
  name: string;
  image: string;
}

/* ─── Avatar option ─── */

export interface AvatarOption {
  id: string;
  name: string;
  image: string;
}

/* ─── UI copy — every user-facing string ─── */

export interface Copy {
  splash: {
    subtitle: string;
    startButton: string;
  };
  menu: {
    newGame: string;
    continueGame: string;
    howToPlay: string;
  };
  setup: {
    heading: string;
    playerNameLabel: string;
    playerNamePlaceholder: string;
    chooseAvatar: string;
    nextButton: string;
  };
  deckSelect: {
    heading: string;
    choosePrompt: string;
  };
  difficulty: {
    heading: string;
    levels: {
      easy: { label: string; description: string; pairs: number };
      medium: { label: string; description: string; pairs: number };
      hard: { label: string; description: string; pairs: number };
      expert: { label: string; description: string; pairs: number };
    };
  };
  gameplay: {
    pauseButton: string;
    matchFound: string;
    noMatch: string;
    turnLabel: string;
    matchesLabel: string;
    timeLabel: string;
  };
  results: {
    heading: string;
    totalTime: string;
    totalMoves: string;
    matchesMade: string;
    playAgain: string;
    backToMenu: string;
  };
  matchModal: {
    eyebrow: string;
    dismissButton: string;
  };
  pauseModal: {
    heading: string;
    resumeButton: string;
    quitButton: string;
    soundToggleLabel: string;
  };
}

/* ─── Full theme export shape ─── */

export interface Theme {
  config: ThemeConfig;
  cards: CardContent[];
  decks: DeckDesign[];
  avatars: AvatarOption[];
  copy: Copy;
}
