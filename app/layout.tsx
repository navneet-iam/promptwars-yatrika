import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yatrika — Immersive GenAI Cultural Travel Companion",
  description:
    "Yatrika is a culturally aware travel planner that combines Wikipedia grounding with Gemini personalization to create authentic, respectful, hallucination-free itineraries and hidden-gem discoveries.",
  keywords: [
    "cultural travel",
    "AI itinerary planner",
    "hidden gems",
    "heritage tourism",
    "destination discovery",
    "GenAI travel",
  ],
  authors: [{ name: "Yatrika" }],
  openGraph: {
    title: "Yatrika — Immersive GenAI Cultural Travel Companion",
    description:
      "Discover destinations through authentic history, local customs, food, and neighborhood treasures — grounded and personalized by GenAI.",
    type: "website",
    siteName: "Yatrika",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yatrika — Immersive GenAI Cultural Travel Companion",
    description:
      "A culturally aware GenAI travel planner: grounded, respectful, and hallucination-free itineraries.",
  },
};

export const viewport: Viewport = {
  themeColor: "#ea580c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-orange-500 focus:px-4 focus:py-2 focus:font-bold focus:text-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
