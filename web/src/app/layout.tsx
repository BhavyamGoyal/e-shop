import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClarityAnalytics, GoogleOneTap } from "@/components/organisms";
import { DEFAULT_THEME_ID, ThemeHead, ThemeProvider, THEME_ATTRIBUTE } from "@/theme";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, SOCIAL_IMAGE } from "@/lib/site";
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
  metadataBase: new URL(SITE_URL),
  title: { default: "Tinglet | Crafted for you", template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  icons: { icon: [{ url: "/fevicon.svg", type: "image/svg+xml" }], shortcut: "/fevicon.svg" },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_IN", images: [{ url: SOCIAL_IMAGE }] },
  twitter: { card: "summary_large_image", images: [SOCIAL_IMAGE] },
};

const themeAttribute = { [THEME_ATTRIBUTE]: DEFAULT_THEME_ID };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      {...themeAttribute}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <ThemeHead />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
        <GoogleOneTap />
        <ClarityAnalytics />
      </body>
    </html>
  );
}
