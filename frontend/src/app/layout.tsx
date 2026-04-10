import type { Metadata, Viewport } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fintrixia AI — Cyber-Luminescence Financial Intelligence",
  description:
    "An advanced AI-powered financial core tracking telemetry, optimizing burn rates, and delivering strategic neural insights.",
  keywords: ["fintech", "AI", "financial intelligence", "cyber-luminescence", "budget optimization"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0c1324",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark select-none">
      <body className={`${manrope.variable} ${spaceGrotesk.variable} bg-background text-foreground antialiased min-h-screen selection:bg-primary/30 overflow-x-hidden`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
