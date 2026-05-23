import type { Metadata, Viewport } from "next";
import { Alice, Andika } from "next/font/google";
import { theme } from "@/lib/engine/active-theme";
import { AudioUnlock } from "@/components/AudioUnlock";
import "./globals.css";

const alice = Alice({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const andika = Andika({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: theme.config.meta.title,
  description: theme.config.meta.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${alice.variable} ${andika.variable} h-full`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          /* Forward: old slides left, new slides in from right */
          [data-nav-direction="forward"]::view-transition-old(page-content) {
            animation: 150ms ease-in both vt-fade reverse,
                       300ms ease-in-out both vt-slide-x reverse;
            --vt-slide-offset: -60px;
          }
          [data-nav-direction="forward"]::view-transition-new(page-content) {
            animation: 210ms ease-out 150ms both vt-fade,
                       300ms ease-in-out both vt-slide-x;
            --vt-slide-offset: 60px;
          }

          /* Back: old slides right, new slides in from left */
          [data-nav-direction="back"]::view-transition-old(page-content) {
            animation: 150ms ease-in both vt-fade reverse,
                       300ms ease-in-out both vt-slide-x reverse;
            --vt-slide-offset: 60px;
          }
          [data-nav-direction="back"]::view-transition-new(page-content) {
            animation: 210ms ease-out 150ms both vt-fade,
                       300ms ease-in-out both vt-slide-x;
            --vt-slide-offset: -60px;
          }

          @keyframes vt-fade {
            from { opacity: 0; }
            to   { opacity: 1; }
          }

          @keyframes vt-slide-x {
            from { translate: var(--vt-slide-offset); }
            to   { translate: 0; }
          }

          @media (prefers-reduced-motion: reduce) {
            ::view-transition-old(page-content),
            ::view-transition-new(page-content) {
              animation: none !important;
            }
          }
        `}} />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <AudioUnlock />
        {children}
      </body>
    </html>
  );
}
