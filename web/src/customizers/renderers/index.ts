import { RendererRegistry } from "../rendering/RendererRegistry";
import { LETTER_NAME_RENDERER, TEXT_KEYCHAIN_RENDERER } from "./keys";

export const rendererRegistry: RendererRegistry = new RendererRegistry()
  .register(
    TEXT_KEYCHAIN_RENDERER,
    async () => (await import("./text-keychain/createTextKeychainRenderer")).createTextKeychainRenderer(),
  )
  .register(
    LETTER_NAME_RENDERER,
    async () => (await import("./letter-name/createLetterNameRenderer")).createLetterNameRenderer(),
  );
