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
      <body className="min-h-full flex flex-col antialiased">
        <AudioUnlock />
        {children}
      </body>
    </html>
  );
}
