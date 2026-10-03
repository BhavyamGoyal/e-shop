import { buildThemesCss, THEME_ATTRIBUTE } from "./css";
import { DEFAULT_THEME_ID, themes } from "./registry";
import { THEME_STORAGE_KEY } from "./storage";

const themesCss = buildThemesCss(themes);

const ids = JSON.stringify(themes.map((theme) => theme.id));

const bootScript = `(function(){try{var s=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});var ok=${ids}.indexOf(s)>-1;document.documentElement.setAttribute(${JSON.stringify(
  THEME_ATTRIBUTE,
)},ok?s:${JSON.stringify(DEFAULT_THEME_ID)});}catch(e){}})();`;

export function ThemeHead() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themesCss }} />
      <script dangerouslySetInnerHTML={{ __html: bootScript }} />
    </>
  );
}
