import type { AppProps } from "next/app";
import { ClarityAnalytics, GoogleOneTap } from "@/components/organisms";
import { geistMono, geistSans } from "@/lib/fonts";
import { ThemeProvider } from "@/theme";
import "../app/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
      <GoogleOneTap />
      <ClarityAnalytics />
    </div>
  );
}
