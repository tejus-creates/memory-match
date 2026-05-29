import type { Theme } from "@/lib/engine/types";
import { config } from "./config";
import { cards } from "./cards";
import { decks } from "./decks";
import { avatars } from "./avatars";
import { copy } from "./copy";

export const theme: Theme = { config, cards, decks, avatars, copy };
export { config, cards, decks, avatars, copy };
