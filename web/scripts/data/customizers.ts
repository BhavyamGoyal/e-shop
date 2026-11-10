import type { CustomizerInput } from "../../src/server/types/customizer.types";
import type { ParamDefinition, ParamOption } from "../../src/customizers/core";
import { ADMIN_NAME_KEYCHAIN_SLUG } from "../../src/customizers/admin-slugs";

const FONTS: [string, string, number][] = [
  ["pacifico", "Pacifico (script)", 400],
  ["lobster", "Lobster (script)", 400],
  ["satisfy", "Satisfy (script)", 400],
  ["dancing-script", "Dancing Script (script)", 700],
  ["kaushan-script", "Kaushan Script (brush)", 400],
  ["permanent-marker", "Permanent Marker", 400],
  ["roboto", "Roboto Black", 900],
  ["oswald", "Oswald Bold", 700],
  ["bebas-neue", "Bebas Neue", 400],
  ["righteous", "Righteous", 400],
  ["bangers", "Bangers", 400],
  ["chewy", "Chewy", 400],
  ["luckiest-guy", "Luckiest Guy", 400],
  ["black-ops-one", "Black Ops One", 400],
  ["playfair-display", "Playfair Display Black", 900],
];

const fontOptions: ParamOption[] = FONTS.map(([id, label, weight]: [string, string, number]): ParamOption => ({
  value: `${id}:${weight}`,
  label,
}));

const slider = (
  key: string,
  label: string,
  group: string,
  value: number,
  min: number,
  max: number,
  step: number,
  unit: string,
  mutable: boolean,
): ParamDefinition => ({ key, type: "number", label, group, default: value, mutable, min, max, step, unit });

const toggle = (key: string, label: string, group: string, value: boolean, mutable: boolean): ParamDefinition => ({
  key,
  type: "boolean",
  label,
  group,
  default: value,
  mutable,
});

const choice = (
  key: string,
  label: string,
  group: string,
  value: string,
  options: [string, string][],
  mutable: boolean,
): ParamDefinition => ({
  key,
  type: "select",
  label,
  group,
  default: value,
  mutable,
  options: options.map(([optionValue, optionLabel]: [string, string]): ParamOption => ({
    value: optionValue,
    label: optionLabel,
  })),
});

const color = (key: string, label: string, group: string, value: string): ParamDefinition => ({
  key,
  type: "color",
  label,
  group,
  default: value,
  mutable: true,
});

export const NAME_KEYCHAIN: CustomizerInput = {
  slug: "name-keychain",
  title: "Name keychain",
  renderer: "text-keychain",
  active: true,
  params: [
    { key: "text", type: "textarea", label: "Your text", group: "Text", default: "Name", mutable: true, maxLength: 40 },
    { key: "font", type: "font", label: "Font", group: "Text", default: "pacifico:400", mutable: true, options: fontOptions },
    slider("size", "Font size", "Text", 16, 6, 60, 0.5, "mm", true),
    slider("spacing", "Letter spacing", "Text", 0, -4, 10, 0.1, "mm", false),
    slider("lineHeight", "Line height", "Text", 1.1, 0.7, 2, 0.05, "×", false),
    choice("align", "Align", "Text", "center", [["center", "Center"], ["left", "Left"], ["right", "Right"]], false),
    color("textColor", "Text color", "Text", "#ffffff"),
    slider("angle", "Bend angle", "Curve", 0, -270, 270, 1, "°", false),
    color("baseColor", "Base color", "Joining & base", "#425d72"),
    toggle("merge", "Merge mesh", "Joining & base", true, false),
    slider("join", "Join letters", "Joining & base", 0, 0, 4, 0.1, "mm", false),
    toggle("useBase", "Enable base", "Joining & base", true, false),
    slider("baseH", "Base thickness", "Joining & base", 2, 0, 6, 0.1, "mm", false),
    slider("outline", "Base outline", "Joining & base", 2, 0, 8, 0.1, "mm", false),
    slider("textH", "Text height", "Joining & base", 1.5, 0.4, 6, 0.1, "mm", false),
    choice("ring", "Position", "Key ring", "left", [
        ["left", "Left"],
        ["right", "Right"],
        ["top", "Top"],
        ["top-left", "Top left"],
        ["top-right", "Top right"],
        ["bottom", "Bottom"],
        ["bottom-left", "Bottom left"],
        ["bottom-right", "Bottom right"],
        ["none", "None"],
      ], true),
    slider("holeD", "Hole diameter", "Key ring", 4, 2, 10, 0.1, "mm", false),
    slider("wall", "Ring wall", "Key ring", 2.5, 1, 6, 0.1, "mm", false),
    slider("overlap", "Attach overlap", "Key ring", 1.5, 0, 8, 0.1, "mm", false),
    slider("shiftX", "Shift X", "Key ring", 0, -30, 30, 0.5, "mm", false),
    slider("shiftY", "Shift Y", "Key ring", 0, -30, 30, 0.5, "mm", false),
  ],
};

export const ADMIN_NAME_KEYCHAIN: CustomizerInput = {
  ...NAME_KEYCHAIN,
  slug: ADMIN_NAME_KEYCHAIN_SLUG,
  title: "Name keychain (admin)",
  params: NAME_KEYCHAIN.params.map((definition: ParamDefinition): ParamDefinition => ({ ...definition, mutable: true })),
};

const LETTER_FONTS: [string, string][] = [
  ["stix-two-math:400", "STIX Two Math"],
  ["stix-two-text:700", "STIX Two Text Bold"],
  ["playfair-display:700", "Playfair Display Bold"],
  ["cormorant-garamond:700", "Cormorant Garamond Bold"],
  ["libre-baskerville:700", "Libre Baskerville Bold"],
  ["lora:700", "Lora Bold"],
  ["eb-garamond:700", "EB Garamond Bold"],
  ["cinzel:700", "Cinzel Bold"],
  ["bodoni-moda:700", "Bodoni Moda Bold"],
  ["abril-fatface:400", "Abril Fatface"],
  ["dm-serif-display:400", "DM Serif Display"],
  ["archivo:700", "Archivo Bold"],
];

const letterFontOptions: ParamOption[] = LETTER_FONTS.map(([value, label]: [string, string]): ParamOption => ({ value, label }));

export const LETTER_NAME: CustomizerInput = {
  slug: "letter-name",
  title: "Letter with name",
  renderer: "letter-name",
  active: true,
  params: [
    { key: "name", type: "text", label: "Name", group: "Text", default: "Nicole", mutable: true, maxLength: 20 },
    { key: "letterFont", type: "font", label: "Letter font", group: "Text", default: "stix-two-math:400", mutable: true, options: letterFontOptions },
    { key: "nameFont", type: "font", label: "Name font", group: "Text", default: "pacifico:400", mutable: true, options: fontOptions },
    slider("letterSize", "Letter cap height", "Depth", 138.5, 40, 200, 0.5, "mm", false),
    slider("nameFit", "Name width vs letter", "Depth", 0.85, 0.3, 1, 0.01, "×", false),
    slider("nameFirstScale", "First letter scale", "Depth", 1.3, 1, 2, 0.05, "×", false),
    slider("letterH", "Letter height", "Depth", 25, 2, 40, 0.5, "mm", false),
    slider("nameH", "Name raise", "Depth", 5, 0, 20, 0.5, "mm", false),
    color("letterColor", "Letter color", "Colors", "#e6e6e6"),
    color("nameColor", "Name color", "Colors", "#425d72"),
  ],
};

export const CUSTOMIZERS: CustomizerInput[] = [NAME_KEYCHAIN, ADMIN_NAME_KEYCHAIN, LETTER_NAME];
