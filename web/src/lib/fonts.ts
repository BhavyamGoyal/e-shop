import { Geist, Geist_Mono, Outfit } from "next/font/google";

export const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
