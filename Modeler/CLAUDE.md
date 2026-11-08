# Modeler

One viewer for every printable model. Do not create standalone HTML or three.js apps for new models. Add one file to `models/` and the viewer lists it in the dropdown with parameter sliders, explode, cut-away, rulers, X/Y/Z dimensions and STL/3MF export.

The full guide is `HOW-TO-CREATE-A-MODEL.md`. Read it before writing a model. This file is the short version.

## Rules

- Never add comments to code, in any language.
- Do not edit `app.js` or `index.html` to add a model. Add `models/<name>.js`.
- Start from `models/_template.js`. Study `models/desk-bot.js` (CSG shell, explode, print orientations) and `models/f15-card-kit.js` (sprue cards, custom exports) for larger examples.
- Files starting with `_` in `models/` are ignored by the dropdown.

## Printer and filament

- Printer nozzle is 0.4 mm. Keep walls at least 1.2 mm (2.0 mm preferred), rods and rigging at least 1.2 mm thick, and relief details at least 0.8 mm wide.
- Filament colours available: red, blue, green, white, black, brown, orange, yellow, grey. There is only one brown. Colour every part with one of these (use yellow or orange for gold) and keep all wood parts the same brown.
- Models are fixed-size with proportional dimensions unless the user asks for sliders.

## Run and check

- `start.bat` or `node server.mjs`, then http://localhost:5174. Opening `index.html` as a file does not work.
- The viewer reloads a model within 1.5 seconds of saving its file. Errors show in a red box under the dropdown and in the browser console.
- A headless check is possible by driving Edge over the DevTools protocol and reading `#err`, `#dims` and `#list`.

## Layout

```
Modeler/
  index.html           panel and import map
  app.js               viewer, UI, exports
  server.mjs           static server + /api/models
  start.bat            starts the server and opens the browser
  lib/geometry.js      model helpers (CSG, shapes, wires)
  lib/export.js        STL, 3MF and print layout
  models/              one file per model
  HOW-TO-CREATE-A-MODEL.md
```

## Model contract (summary)

```js
export default {
  title, description,
  params: [{ key, label, type?, min, max, step, value, unit, options }],
  toggles: [{ key, label, value }],
  hide: ['opacity', 'cut'],
  async build({ THREE, lib, params, body, mat, track }) {
    return {
      parts: [{ name, object, base, explode, color, print, printRotate }],
      extras, notes, info, exports, plateExports, assemble,
      update({ t, e, blend, toggles, root, parts }) {}
    };
  }
};
```

- Units are mm. Three.js is Y-up (Y height, X width, Z depth). The viewer reports Z height, X width, Y depth and exports Z-up.
- Models stand on `y = 0`, centred on `x = 0` and `z = 0`.
- Use `body` for every printable mesh, `mat(color)` for non-printed parts, and `track()` for any other material.
- Only parts with `print: true` are exported. Each is laid out on a 250 mm bed in the orientation given by `printRotate` (Euler radians in the Y-up assembled pose) or `printQuaternion`.
- Holes and pockets: use `makeCsg()` (`sub`, `inter`, `union`) and take `.geometry`.
- Expose wall thickness, clearances and key sizes as `params`.
- Sprue-card kits: give parts `card: { position, quaternion }` and put the sprue meshes in `extras`.

## Before finishing a model

Open it in the viewer, confirm there is no error box, check each part's print size and orientation, and check the overall X/Y/Z size against the intended size. The checklist is in section 12 of the guide.
