import { RendererRegistry } from "../rendering/RendererRegistry";
import { TEXT_KEYCHAIN_RENDERER } from "./keys";

export const rendererRegistry: RendererRegistry = new RendererRegistry().register(
  TEXT_KEYCHAIN_RENDERER,
  async () => (await import("./text-keychain/createTextKeychainRenderer")).createTextKeychainRenderer(),
);
