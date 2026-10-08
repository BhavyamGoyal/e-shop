import { Head, Html, Main, NextScript } from "next/document";
import { DEFAULT_THEME_ID, ThemeHead, THEME_ATTRIBUTE } from "@/theme";

const themeAttribute = { [THEME_ATTRIBUTE]: DEFAULT_THEME_ID };

export default function Document() {
  return (
    <Html lang="en" {...themeAttribute} className="h-full antialiased">
      <Head>
        <link rel="icon" href="/fevicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/fevicon.svg" />
        <ThemeHead />
      </Head>
      <body className="min-h-full flex flex-col">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
