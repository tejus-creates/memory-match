import type { ThemeConfig } from "@/lib/engine/types";

export const config: ThemeConfig = {
  id: "holi",
  gameName: "Vibrant Holi Memories",
  shortName: "Holi Memories",
  tagline: "Match the colors of the festival",
  domain: "holi.yoursite.com",

  brand: {
    primary: "#C84B1F",
    accent: "#D89A2C",
    deep: "#1F4A5C",
    fontDisplay: "Alice",
    fontBody: "Andika",
  },

  logo: {
    splash: "/logo-splash.png",
    header: "/logo-header.png",
  },

  meta: {
    title: "Vibrant Holi Memories — A memory match game",
    description:
      "Learn about Holi, the Hindu festival of colors, through play.",
    ogImage: "/og-image.png",
  },

  otherGames: null,
};
