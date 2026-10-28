import type { CustomizerConfig } from "@/customizers/core";

export interface CustomizerRecord extends CustomizerConfig {
  id: string;
}

export interface CustomizerInput {
  slug: string;
  title: string;
  renderer: string;
  params: CustomizerConfig["params"];
  active: boolean;
}

export interface CustomizerOption {
  slug: string;
  title: string;
}
