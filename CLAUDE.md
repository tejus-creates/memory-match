# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Vibrant Holi Memories — This is a web based educational memory match game in the theme of Holi, the Hindu Festival of Color and Spring Celebrations. 

1. Project overview
What this is
A web-based educational memory match game. Players flip pairs of cards to find matches; each successful match displays a short, culturally accurate blurb about the matched item. The current theme is Holi (Hindu festival of colors), but the codebase is structured so a future theme — Diwali, Lunar New Year, Día de los Muertos, etc. — can be swapped in by changing data files, not engine code.
Audience

Primary: children ages 6–12, especially of Hindu and South Asian heritage
Secondary: parents and teachers seeking age-appropriate cultural education content
Tertiary: anyone curious about the festival's traditions

Experience goals
The game should feel: festive, reverent, calm to play, educational without being preachy, and unmistakably polished — every screen looks like it belongs to the same product.
The game should NOT feel: chaotic, cartoonish in a reductive way, stressful, ad-heavy, or like a generic kids' app skinned with cultural assets.
Success criteria for Phase 1

A child can complete a full game (splash → menu → setup → deck → difficulty → play → results) without adult help
The game is fully playable on a phone (320px viewport up)
All 4 difficulty levels work on all device sizes
Match modal educational content is accurate, age-appropriate, and well-written
Lighthouse mobile performance score ≥ 90
No console errors during normal play

2. Technical foundation
Stack
LayerChoiceReasonFrameworkNext.js 14+ with App RouterExisting build uses this; great mobile perf; easy Vercel deployLanguageTypeScript (strict mode)Catches state bugs early in a stateful gameStylingTailwind CSS + CSS custom properties for theme tokensTokens enable theme-swapping; Tailwind for layoutStateZustand (one store)Lightweight, no Context boilerplate, works well with persistencePersistencelocalStorage via Zustand persist middlewareSaves player names, avatars, deck choice, sound preference, in-progress gameAudioHTML5 <audio> with a small custom hookNo library needed for ~6 short sound effectsRoutingNext.js file-based routingEach screen is a route — clean URLs, easy back-button behaviorDeploymentVercelZero-config Next.js hosting
Explicitly NOT using: Redux, styled-components, CSS-in-JS runtime libs, animation libraries (Framer Motion is allowed if needed for card flip — otherwise CSS), state machines libs (XState — overkill here).
Browser support

Chrome, Safari, Firefox, Edge: last 2 versions
iOS Safari 15+
Chrome Android: last 2 versions
No IE11. No legacy mobile browsers.

Performance budget

Total initial JS bundle: under 200 KB gzipped
Initial page weight (HTML + CSS + JS + first image): under 2 MB
Largest Contentful Paint (LCP) on 4G mobile: under 2.5s
Lighthouse Performance score: 90+ on mobile
Card images: WebP with PNG fallback, lazy-loaded except for the active deck

Critical technical rules

Mobile-first. Every component is designed for 320px first, then scales up. Never the reverse.
Viewport meta tag is mandatory: <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
Touch targets minimum 44×44px for any interactive element.
No sessionStorage or cookies. localStorage only, accessed through a single helper module.
Card images are pre-loaded for the active deck when a game starts, so flip animations are instant.

3. Architecture: template, not single app
This is the most important architectural decision in the whole document — read it carefully.

The mental model
This is NOT a single app that switches themes at runtime. This is a template that produces separate, standalone games. Each themed game is its own deployed product, at its own URL, with its own brand identity, its own localStorage, its own everything.
A player visits holi.yoursite.com and experiences "Vibrant Holi Memories" — a complete, standalone game. If they later visit diwali.yoursite.com, that's a different game to them: different splash, different logo, different name input, different saved progress.

Behind the scenes, both games are built from the same codebase. The engine is shared. Bug fixes and improvements to the engine benefit every game built from the template. But the player never sees this — to them, each game is its own product.

Project Structure

/memory-match-template            ← one repo, multiple deployed games
  /lib
    /engine                       ← shared core, never theme-specific
      game-state.ts               ← state machine (board, turns, matches, timer)
      shuffle.ts                  ← Fisher-Yates shuffle
      grid-math.ts                ← columns/rows from card count + viewport
      storage.ts                  ← localStorage helpers
      types.ts                    ← shared TypeScript interfaces

  /themes                         ← one folder per game product
    /holi
      config.ts                   ← game name, title, brand colors, fonts, URL
      cards.ts                    ← 30 card definitions
      decks.ts                    ← deck back design metadata
      avatars.ts                  ← avatar metadata
      copy.ts                     ← every UI string used in this game
      assets/                     ← bundled into the build
        cards/                    ← card face illustrations
        decks/                    ← deck back designs
        avatars/                  ← avatar illustrations
        backgrounds/              ← background art
        logo.png
        favicon.ico
    /diwali                       ← (future) same structure
    /lunar-new-year               ← (future) same structure

  /app                            ← Next.js app, reads from active theme
    page.tsx                      ← splash, etc.
    ...

  /components                     ← UI components, shared
  /scripts
    build-theme.ts                ← reads THEME env var, sets up build

  next.config.js
  package.json
  .env.example                    ← documents THEME=holi convention

How a build works
Each game is built independently:
# Build the Holi game
THEME=holi npm run build
# Output: a complete static site for Holi, deployed to holi.yoursite.com

# Build the Diwali game
THEME=diwali npm run build
# Output: a complete static site for Diwali, deployed to diwali.yoursite.com

Each build:

1. Reads THEME from environment
2. Imports only that theme's config.ts, cards.ts, decks.ts, avatars.ts, copy.ts
3. Copies only that theme's /assets to the public output
4. Compiles with that theme's brand colors as CSS custom properties
5. Sets the page <title>, favicon, and meta tags from config.ts
6. Produces a static site for that game alone

The Holi build does NOT contain Diwali assets, code, or even references. The bundle is smaller and the game is properly isolated.
How the engine stays theme-agnostic
The engine reads theme data through a single import path:
// /lib/engine/active-theme.ts
import { theme } from '@/themes/active';
export { theme };

Where @/themes/active is a build-time alias resolved by next.config.js based on THEME:
// next.config.js
const path = require('path');
const theme = process.env.THEME || 'holi';

module.exports = {
  webpack: (config) => {
    config.resolve.alias['@/themes/active'] = path.resolve(__dirname, `themes/${theme}`);
    return config;
  },
};

Engine code never imports from /themes/holi/* or /themes/diwali/* directly. It only ever imports from @/themes/active. The build resolves that to the correct theme.
What the engine knows vs. what themes know

Engine knows:

1. How many cards to deal
2. That cards have IDs and need matching pairs
3. Whose turn it is, score, time, flip count
4. Win/lose conditions
5. That there's a theme, accessed through one import

Engine does NOT know:

The festival name
Anything about Holi specifically
That Diwali exists

Themes know:

1. Their own brand identity (name, logo, colors, fonts)
2. Their card content (names, images, blurbs)
3. Their deck designs and avatars
4. Every user-facing string — no hardcoded "Vibrant Holi Memories" anywhere in engine code
5. Their deployment metadata (domain, social card image, etc.)

Theme config structure
Each theme exports a typed config object. Example:
// /themes/holi/config.ts
import type { ThemeConfig } from '@/lib/engine/types';

export const config: ThemeConfig = {
  id: 'holi',
  gameName: 'Vibrant Holi Memories',
  shortName: 'Holi Memories',
  tagline: 'Match the colors of the festival',
  domain: 'holi.yoursite.com',

  brand: {
    primary: '#F59E0B',
    accent: '#EC4899',
    deep: '#1E1B4B',
    fontDisplay: 'Fraunces',
    fontBody: 'Inter',
  },

  logo: {
    splash: '/logo-splash.png',
    header: '/logo-header.png',
  },

  meta: {
    title: 'Vibrant Holi Memories — A memory match game',
    description: 'Learn about Holi, the Hindu festival of colors, through play.',
    ogImage: '/og-image.png',
  },

  // Optional: list of sibling games to surface in an "Other games" footer
  // Set to null if this game should make no reference to its siblings
  otherGames: [
    { name: 'Diwali Memories', url: 'https://diwali.yoursite.com' },
  ],
};

Card content structure
Each theme defines its own card data. Example:

typescript// /themes/holi/cards.ts
import type { CardContent } from '@/lib/engine/types';

export const cards: CardContent[] = [
  {
    id: 'red-gulal',
    name: 'Red Gulal',
    image: '/cards/red-gulal.webp',
    blurb: 'Gulal is the traditional colored powder thrown during Holi. Red symbolizes creative energy and passion.',
    category: 'colors'
  },
  // ... 29 more cards (need at least 30 for the largest difficulty)
];

Asset paths in the data are relative to the theme's /assets folder, which gets copied to the public root at build time. The engine doesn't need to know which theme's assets it's loading.
What this architecture gives you

Each game is genuinely standalone — separate domain, separate identity, separate save data (localStorage is per-origin, so isolation is automatic)
Shared engine improvements — fix a bug once, rebuild and redeploy every game
Faster to launch new themes — add a folder, drop in assets, deploy
No runtime overhead — the Diwali build contains no Holi code
Independent versioning — Holi can ship a new version without touching Diwali
Independent analytics — each game has its own domain, own GA/Plausible/etc. property

What this architecture explicitly does NOT do

No runtime theme switching (by design)
No cross-game data sharing (by design)
No master hub site (separate concern — build one later if you want to market the games together)

4. Game logic
Game state shape
typescripttype Player = {
  id: 1 | 2;
  name: string;
  avatarId: string;
  score: number;          // number of matched pairs found
};

type Card = {
  id: string;             // matches CardContent.id
  uid: string;            // unique per card instance (since pairs share id)
  isFlipped: boolean;
  isMatched: boolean;
  position: number;       // 0-indexed position on the board
};

type GameState = {
  mode: '1p' | '2p';
  players: Player[];
  activePlayerId: 1 | 2;
  deckId: string;         // which deck back design is in use
  difficulty: 12 | 18 | 24 | 30;  // number of pairs
  board: Card[];
  flippedCards: Card[];   // 0, 1, or 2 cards currently face-up and unresolved
  matchedThisTurn: Card[];// for the modal queue
  timer: number;          // seconds elapsed
  flips: number;          // total flips this game
  status: 'idle' | 'playing' | 'paused' | 'won';
  showingMatchModal: CardContent | null;
};
Game flow

Setup: player(s) choose name, avatar, deck, difficulty. State is initialized.
Deal: select N unique cards from cards.ts (where N = difficulty), duplicate each to make pairs, shuffle, place on board.
Turn loop:

Player taps a face-down card → it flips, added to flippedCards
Player taps a second face-down card → it flips, added to flippedCards
System checks match:

Match: both cards' isMatched = true, score++ for active player, show match modal with card content, when modal closes the active player gets another turn (in 2P)
No match: wait 1.2s, flip both back, switch to other player (in 2P)


In 1P mode: turn never "switches" — same player plays until done. Flip counter and timer still tick.


Win condition: all cards matched. Show results screen with stats and (in 2P) the winner.

Match modal behavior

Appears immediately after a successful match, before flipping cards face-down (in a match, they stay face-up matched)
Contains: card image, card name, blurb, continue button
Auto-dismisses after 4 seconds (long enough to read, short enough not to interrupt flow)
Tap anywhere on the modal to dismiss faster (not just the Continue button)
During modal display, the timer pauses (educational reading shouldn't count against time)
If 2P, the game tracks that the matching player gets another turn AFTER modal dismisses

Scoring

1P: track time, total flips, matches found, best streak (consecutive matches without a miss). Show 1–3 stars on results based on flip efficiency relative to a perfect run.

3 stars: ≤ 1.5× perfect (perfect = 2 flips per pair)
2 stars: ≤ 2× perfect
1 star: completed the game


2P: track matches per player. Winner = most matches. Tie possible.

Pause behavior

Pause button on the gameplay screen freezes the timer
Pause modal shows: Resume, Restart, Quit to Menu
Currently flipped cards stay flipped during pause (no peeking exploit — they were already visible)

Persistence
The following are saved to localStorage and restored on return visits:

Player names (last used)
Last selected avatars (one per player slot)
Last selected deck
Last selected difficulty
Sound on/off preference
In-progress game: if a player quits mid-game, "Continue last game" appears on the splash screen on their next visit

5. Design system
Visual language principle
The illustrations are not just content — they set the entire visual register. The UI must feel like the frame around fine art, not the wrapper around a digital app. Think: a beautifully illustrated children's book, a quality festival poster, a miniature painting with hand-lettered margins. Every UI decision should ask: "Would this feel at home next to the artwork?" If the answer is no, the UI is wrong.
This visual register is parchment-and-miniature-painting: warm cream surfaces, brass and ink accents, hand-crafted feel, and a quiet reverence. It is NOT: bright digital pastels, gradient pinks and purples, neon glows, bubble fonts, or anything that signals "kids app from 2015."
What this register forbids
These are not stylistic preferences; they are violations of the visual language. Any of these breaks the whole system:

Gradients on UI surfaces. Solid fills only. (The Holi powder background is illustration, not UI — it's exempt.)
Drop shadows used as decoration. Functional letterpress shadows on the primary button are allowed; nothing else.
Glow effects, neon, or aggressive saturation. Every color is grounded and slightly muted, the way pigments age.
Bubble fonts, comic fonts, decorative display scripts. The display font carries personality through letterform craft, not through tricks.
Rounded-pill buttons (radius ≥ half the height). Pills feel like consumer SaaS. Use 8px corners.
Mixing more than the defined palette. No off-palette accent colors, even "just for this one screen."

Color tokens
Defined as CSS custom properties on :root. Every color is sampled from the illustration set itself — sindoor red is the powder, peacock blue is the Krishna deck back, marigold is the garland tone, parchment is the warm cream card face.
css:root {
  /* Core palette — sampled from the illustrations */
  --c-sindoor: #C84B1F;        /* primary action, the red of gulal powder */
  --c-sindoor-dark: #7A1F2A;   /* primary button shadow, deep maroon */
  --c-marigold: #D89A2C;       /* accent, highlights, active states */
  --c-peacock: #1F4A5C;        /* deep secondary, card backs, dark surfaces */
  --c-parchment: #F4E8D0;      /* warm surface, modal backgrounds, card faces */

  /* Supporting palette */
  --c-maroon: #7A1F2A;         /* deep accent, secondary surface */
  --c-teal: #2E6B5F;           /* deep accent, used sparingly */
  --c-brass: #B8966A;          /* metallic accent, borders, dividers */
  --c-ink: #2A1810;            /* primary text, hand-drawn line work */

  /* Functional tokens — derived from core */
  --bg-base: #2A1810;                       /* dark page base behind illustrations */
  --bg-overlay: rgba(31, 74, 92, 0.3);      /* peacock overlay on the Holi background */
  --surface-parchment: #F4E8D0;             /* modal surface, light backgrounds */
  --surface-card: #F4E8D0;                  /* face-up card background */
  --surface-card-back: #1F4A5C;             /* face-down card fallback (illustrations preferred) */
  --surface-overlay: rgba(42, 24, 16, 0.4); /* HUD inset surface on the dark bg */

  --text-primary-light: #F4E8D0;            /* text on dark surfaces */
  --text-primary-dark: #2A1810;             /* text on parchment surfaces */
  --text-secondary-light: rgba(244, 232, 208, 0.7);
  --text-secondary-dark: rgba(42, 24, 16, 0.65);
  --text-accent: #D89A2C;                   /* marigold for emphasis */

  --border-default: #B8966A;                /* brass borders */
  --border-thin: rgba(184, 150, 106, 0.4);  /* subtle dividers */
  --border-active: #D89A2C;                 /* selected state */

  /* Functional */
  --success: #2E6B5F;          /* deep teal, not the standard green */
  --error: #7A1F2A;            /* deep maroon, not bright red */
}
Theme swaps (Diwali, etc.) override these in the theme's config.ts — colors are part of theme config, not hard-coded in the engine.
Typography
Two fonts, both free from Google Fonts:

Display: Alice — a refined transitional serif with delicate proportions. Feels like a thoughtfully designed children's book or museum placard. Quiet enough to let the illustrations carry the visual weight, characterful enough to set the register. Used for headings, the logo treatment, card names in the match modal, and any moment of emphasis. Loads as Alice:wght@400.
Body: Andika — designed specifically for literacy learners, with unambiguous letterforms (single-story a, distinguishable l / 1, simple g). Optimized for screen reading at small sizes, which matters for the card blurb text. Loads as Andika:wght@400;700.

The pairing: Alice gives the game its voice in headings; Andika gives the educational content its clarity. Together they read as "considered educational publication," not "kids' web app."
NOT used: anything else. No third font, no script font for accents, no system fallback as a stylistic choice. The whole game is these two fonts.
Type scale
Sizes are slightly tighter and more deliberate than a generic web app — this is a print-influenced register. Note: Andika doesn't have a 500 weight, so emphasis uses 700 where bold is needed.
TokenSizeFont / weightUse--text-xs11pxAndika 400, letterspacedsmall caps eyebrow labels (e.g. "MATCH FOUND")--text-sm13pxAndika 400metadata, captions, stats--text-base15pxAndika 400body copy, blurbs--text-md17pxAlice 400emphasized body, blurb leads (display font)--text-lg24pxAlice 400screen headings (display font)--text-xl34pxAlice 400major screen titles (display font)--text-2xl48pxAlice 400splash screen only (display font)
Display heading sizes are slightly larger than the previous spec because Alice has more delicate proportions than Fraunces — it needs the extra size to carry the same presence on screen.
Letterspacing on small caps eyebrows: 0.15em. Use sparingly — only as labels above modal headings, never as button text.
Body line-height: 1.6 for Andika body copy. Andika has generous x-height which makes 1.5 feel cramped.
Font loading: load both via Google Fonts at the top of the document. Use font-display: swap so the page renders immediately with a fallback. The fallback stack should be Alice, Georgia, 'Times New Roman', serif for display and Andika, system-ui, -apple-system, sans-serif for body — Georgia and the system stack share enough visual character with Alice and Andika respectively that the swap won't jar.
Spacing scale
4px base, but the system favors slightly more generous spacing than a typical app — let things breathe like a printed page: 4, 8, 12, 16, 20, 24, 32, 40, 56, 80. Never arbitrary values.
Buttons — two styles, one icon variant
Primary button — the letterpress-inspired primary action:

Background: var(--c-sindoor) (sindoor red)
Text: var(--c-parchment), body font, 16px, weight 500
Height: 48px on desktop, 52px on mobile (touch-target safe)
Border-radius: 8px (not pill, not sharp — slightly soft)
Horizontal padding: 32px
Box-shadow: 0 2px 0 var(--c-sindoor-dark) — a flat 2px offset, no blur. This is the letterpress detail; it makes the button feel like an object pressed into the page.
Hover: brightness(1.05), no other change
Active: transform: translateY(2px) and shadow shrinks to 0 0 0 var(--c-sindoor-dark) — the press-down effect. 80ms.

Secondary button:

Background: transparent
Border: 1.5px solid var(--c-ink) (on parchment) or 1.5px solid var(--c-parchment) at 80% opacity (on dark)
Text: matching ink or parchment, body font, 16px, weight 500
Same height, radius, padding as primary
Hover: background rgba(42, 24, 16, 0.06) (on parchment) or rgba(244, 232, 208, 0.08) (on dark)
Active: transform: scale(0.98), 100ms

Icon button — different category, different shape rules:

44×44px minimum (touch target)
Background: transparent, or rgba(244, 232, 208, 0.1) on dark surfaces for visibility
Border: 1px solid var(--border-thin)
Border-radius: 8px (not circular — square-with-soft-corners matches the rest of the system)
Icon: Tabler outline, 20px, var(--c-ink) or var(--c-parchment) depending on surface
Always has aria-label

Forbidden: gradients, glow, multiple primary buttons per screen, pill shapes, button styles not defined here.
Cards
The card components themselves (the matching game cards) are the centerpiece. Their styling must defer to the illustrations:

Border-radius: 10px — matches the soft corner language but slightly tighter than buttons
Border: 1.5px solid var(--c-brass) — the brass border echoes the gilt edge of miniature paintings
Face-down state: the deck back illustration fills the card, brass border framing it
Face-up state: var(--surface-card) parchment background, card illustration centered with small interior padding (8px), brass border framing it
Matched state: opacity 0.5, brass border becomes thin var(--border-thin), no further interaction
Flipped/active state (waiting for second flip): brass border becomes 2px var(--border-active) marigold
Hover (desktop only): transform: scale(1.02), 150ms
Tap: transform: scale(0.97), 80ms

Modals
Modals are the parchment moments — they feel like a page from an illustrated book opening over the game.

Background: var(--surface-parchment)
Border: 0.5px solid var(--c-ink) (almost invisible, just a precise edge)
Border-radius: 12px
Box-shadow: 0 8px 24px rgba(42, 24, 16, 0.4) — the only place a soft shadow is allowed, because the modal is genuinely floating over content
Inner padding: 32px on desktop, 24px on mobile
Max-width: 480px desktop, 90vw mobile
Headings: --text-lg or --text-xl, Alice, var(--c-ink) or var(--c-sindoor-dark)
Eyebrow labels (e.g. "MATCH FOUND" above the card name): --text-xs, small caps with letterspacing, var(--c-sindoor) color
Body: --text-base, Andika, var(--c-ink) at 85% opacity for warmth (not pure black on cream — that's harsh)

Borders and dividers
Consistent treatment everywhere:

Functional borders (around cards, modals, inputs): 1.5px solid var(--c-brass) on parchment, 1px solid var(--border-thin) on dark surfaces
Decorative dividers (under section headings, between groups): a single 0.5px line in var(--border-thin) with 16px vertical padding around it
Hand-lettered accent under display headings: an optional 1.5px solid var(--c-marigold) line, 40px wide, sitting just below the heading. Use sparingly — this is the design system equivalent of an em-dash flourish in old books. Good on the splash, the results screen, and the match modal name. Bad on every screen.

Shadows
Used in exactly three places, with exactly these specifications:

Primary button: 0 2px 0 var(--c-sindoor-dark) — the letterpress detail
Modals: 0 8px 24px rgba(42, 24, 16, 0.4) — genuine elevation
Focus rings: 0 0 0 3px rgba(216, 154, 44, 0.4) — marigold at low opacity, accessible focus state

Nowhere else. No subtle shadows on cards, no glow on hover, no "ambient elevation."
Background treatment
The Holi powder background image stays — it's the right atmosphere — but it gets paired with overlays for legibility:

Splash, menu, setup, deck, difficulty: Holi background full-bleed, with a linear-gradient(180deg, rgba(42,24,16,0.0) 0%, rgba(42,24,16,0.5) 100%) bottom-vignette so footer text reads cleanly
Gameplay: a heavier overlay — rgba(42, 24, 16, 0.55) solid over the background — so the cards and HUD have enough contrast without needing solid panels
Results: same as gameplay, plus a parchment modal card holding the stats

Visual texture (optional, polish-phase only)
If time allows in the polish phase, the parchment surface can use a subtle paper-texture PNG overlay (multiply blend mode, 20% opacity, tileable). This gives modals and the results screen a hint of physical warmth. Skip if it costs performance — it's not worth more than a few KB of asset budget.

10. Asset inventory
All Holi assets exist and are to be reused from the previous build. They live inside the theme folder, not in a global /public directory. The build script copies the active theme's /assets contents into /public at build time.
/themes/holi/assets/
  /backgrounds
    holi-powder.webp           — full-bleed background, 1920×1080
  logo-splash.png              — primary logo (existing, approved)
  logo-header.png              — compact logo for top bar / menu
  favicon.ico
  /cards
    red-gulal.webp
    yellow-gulal.webp
    ... (30 total)
  /decks
    krishna.webp               — deck back design
    hanuman.webp
    mandala-color.webp
    mandala-om.webp
    ramayana.webp
    ganesha.webp
  /avatars
    flame.webp
    water-drop.webp
    ... (existing avatars)
  /sounds
    flip.mp3
    match.mp3
    no-match.mp3
    win.mp3
    tap.mp3
    chime.mp3
Note: sound files could be moved to /lib/engine/sounds/ if you want them shared across all themed games (the flip and match sounds are generic and don't need a Holi-specific version). For Phase 1, keeping them per-theme is fine — it's flexibility you may want later.
Card content
The blurb copy for each card needs review for accuracy and age-appropriateness. Maintain in /themes/holi/cards.ts. Format:
typescript{ id: 'red-gulal', name: 'Red Gulal', image: '/cards/red-gulal.webp', blurb: '...' }
Asset paths are relative to the theme's assets folder (which becomes the public root at build time), so /cards/red-gulal.webp resolves correctly regardless of which theme is active.
Blurb guidelines:

1–2 sentences, max 200 characters
Reading level: grade 4–6
Culturally accurate (have a content reviewer check)
Avoid stereotypes, oversimplification
Where helpful, include the cultural significance, not just the literal description


11. Build order
Build in this sequence. Do NOT skip ahead — each step depends on the previous one being solid.

Project setup: Next.js, TypeScript, Tailwind, font loading. Configure the THEME env variable mechanism and the @/themes/active webpack alias (see Section 3). Verify Lighthouse runs clean on an empty page.
Engine type definitions: define ThemeConfig, CardContent, DeckDesign, AvatarOption, and the Copy interface in /lib/engine/types.ts. These are the contracts every theme must implement.
Holi theme stubs: create /themes/holi/ with all required exports — but use placeholder content (5–10 cards, 2 decks, a few avatars). Verify the build picks up theme data correctly.
Game state: build the Zustand store and game state machine in /lib/engine/, importing card data via @/themes/active. Write unit tests for shuffle, match detection, turn handoff, win condition. No UI yet.
Design system components: Button (primary, secondary, icon), Modal, Input, Avatar — in an isolated test page first. Brand colors come from the active theme's config.ts.
Static screens (splash, menu, setup, deck, difficulty, results): build with placeholder game state. Make every screen perfect on mobile first, then verify desktop.
Gameplay screen — board only: render cards, flip on tap, match detection. No HUD yet, no modal yet.
Match modal: integrate with game state, pulls card content from theme.
HUD: top bar with timer, counters, icons. Player status row for 2P.
Pause + sound + animations + persistence: layer on the enhancements.
Holi content finalization: replace placeholder cards with all 30 real cards, real blurbs, real images. Replace placeholder decks and avatars with the existing assets from your prior build.
Accessibility pass: keyboard, screen reader, contrast, reduced motion.
Real-device testing: phone, tablet, desktop. Fix what breaks.
Performance pass: Lighthouse, image optimization, bundle analysis.
Deploy: see Section 13 for deployment specifics.
## Status
