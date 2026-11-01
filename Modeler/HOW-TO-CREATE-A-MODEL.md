# How to create a model for the Modeler

A model is one JavaScript file in `models/`. The viewer (`app.js`) handles everything else: the dropdown, parameter sliders, explode, cut-away, rulers, X/Y/Z dimensions, part selection and STL/3MF export. You never edit `app.js` or `index.html` to add a model.

## 1. Run the viewer

```
start.bat
```

or `node server.mjs`, then open http://localhost:5174. The page does not work when `index.html` is opened as a file.

The viewer checks `models/` every 1.5 seconds. Save your model file and the viewer rebuilds it. Errors appear in a red box under the dropdown and in the browser console (F12).

## 2. Create the file

1. Copy `models/_template.js` to `models/<name>.js`. Files starting with `_` are ignored by the dropdown.
2. The file name (without `.js`) is the dropdown label.
3. Edit the copy. Pick the new name in the dropdown.

## 3. Minimal model

```js
import { THREE, V, RoundedBoxGeometry, makeCsg, mesh } from '../lib/geometry.js';

export default {
  title: 'Pen cup',
  description: 'Round cup with a lid.',
  params: [
    { key: 'r', label: 'Radius', min: 15, max: 50, step: 1, value: 30, unit: ' mm' },
    { key: 'h', label: 'Height', min: 30, max: 120, step: 1, value: 80, unit: ' mm' },
    { key: 'wall', label: 'Wall', min: 1, max: 4, step: 0.2, value: 2, unit: ' mm' }
  ],
  build({ params, body }) {
    const { r, h, wall } = params;
    const csg = makeCsg();

    const outer = new THREE.CylinderGeometry(r, r, h, 64);
    const inner = new THREE.CylinderGeometry(r - wall, r - wall, h, 64).translate(0, wall, 0);
    const cup = csg.sub(outer, inner);

    return {
      parts: [
        { name: 'Cup', object: mesh(cup.geometry, body), base: V(0, h / 2, 0), explode: V(0, 0, 0), print: true }
      ]
    };
  }
};
```

Add `explode`, more parts and `printRotate` as the model grows.

## 4. Coordinates and units

- Units are millimetres.
- Three.js is Y-up. In your code: X is width, Y is height, Z is depth.
- The viewer reports dimensions in print convention: X width, Y depth (your Z), Z height (your Y). Exports are converted to Z-up.
- Stand the model on `y = 0` (the desk). Centre it on `x = 0` and `z = 0`.
- Geometry built in your code is centred on its own origin unless you translate it. `base` is where that origin sits in the assembled model.

## 5. The module contract

```js
export default {
  title: 'string',
  description: 'string',
  params: [ ... ],
  toggles: [ ... ],
  hide: ['opacity', 'cut'],
  async build({ THREE, lib, params, body, mat, track }) {
    return {
      parts: [ ... ],
      extras: [ ... ],
      notes: [ ... ],
      info: 'html',
      exports: [ ... ],
      plateExports: false,
      assemble: 0,
      update({ t, e, blend, toggles, root, parts }) { }
    };
  }
};
```

Only `title`, `build` and `parts` are required. `build` may be sync or `async`.

### params (rebuild the model when released)

| Field | Meaning |
|---|---|
| `key` | name in `params` |
| `label` | text in the panel |
| `type` | `'number'` (default, slider), `'bool'` or `'select'` |
| `min`, `max`, `step` | slider range (number) |
| `value` | default |
| `unit` | suffix shown beside the value, for example `' mm'` |
| `options` | array of strings (select) |

Parameter values are read in `build` as `params.<key>`. Use parameters for every dimension a user might want to change (wall thickness, clearances, sizes).

### toggles (live checkboxes, no rebuild)

`{ key, label, value }`. Read them in `update` as `toggles.<key>`. Use them for show/hide, animation on/off, wireframe and so on.

### build context

| Name | What it is |
|---|---|
| `THREE` | the three.js module |
| `lib` | everything exported from `lib/geometry.js` |
| `params` | current parameter values |
| `body` | shared translucent shell material. The Shell opacity slider drives it. Use it for every printable mesh |
| `mat(color, opts)` | creates a tracked `MeshStandardMaterial` for non-printed parts (electronics, wires, glass) |
| `track(material)` | registers any other material so cut-away works |

### parts

Each entry in `parts`:

| Field | Required | Meaning |
|---|---|---|
| `name` | yes | label in the parts list and file name |
| `object` | yes | `Mesh` or `Group` |
| `base` | recommended | `Vector3`, assembled position |
| `explode` | no | `Vector3`, offset at 100 % explode |
| `color` | no | hex colour of the swatch in the list |
| `print` | no | `true` includes the part in exports. Leave it off for electronics, wires, helpers |
| `printRotate` | no | `[rx, ry, rz]` radians, the print orientation (see section 7) |
| `printQuaternion` | no | `THREE.Quaternion` alternative to `printRotate` |
| `group` | no | heading in the parts list |
| `info` | no | extra text when the part is selected |
| `dimsText` | no | overrides the size text in the list |
| `assembled` | no | `false` excludes the part from the Assembled STL and the overall size |
| `card` | no | `{ position, quaternion }` for sprue-card layouts (section 9) |
| `cardOnly` | no | `true` makes the part vanish once assembled (for example a name plate) |

Mark helper meshes that must never be exported with `mesh.userData.noPrint = true`.

### Other return fields

| Field | Meaning |
|---|---|
| `extras` | Objects added to the scene that are not parts (wires, sprues) |
| `notes` | array of strings shown at the bottom of the panel |
| `info` | HTML shown under the size readout (stats, warnings) |
| `exports` | custom export buttons (section 10) |
| `plateExports` | `false` hides the generic Print plate buttons |
| `assemble` | initial value of the Card to assembled slider (`0` to `1`) |
| `update` | called every frame |

### update

```js
update({ t, e, blend, toggles, root, parts }) {
  wires.visible = toggles.wires && e < 0.02;
}
```

- `t`: seconds since the page loaded.
- `e`: explode amount, 0 to 1.
- `blend`: card to assembled amount, 0 to 1 (always 1 without cards).
- `root`: the group holding the whole model.
- `parts`: the viewer's part records. Set `p.hide = true` to hide one.

Errors thrown in `update` disable it and show in the red box.

## 6. Building printable geometry

Shells with openings, pockets and holes should be CSG, so the result is a real solid.

```js
const csg = makeCsg();
let shell = csg.brush(new RoundedBoxGeometry(60, 40, 50, 12, 6));
shell = csg.sub(shell, new RoundedBoxGeometry(56, 36, 46, 12, 4));
shell = csg.sub(shell, cutter(30, 12, 3, 6, -28));
const geometry = shell.geometry;
```

- `csg.sub(a, b)`, `csg.inter(a, b)` and `csg.union(a, b)` accept geometries or brushes and return a brush. Use `.geometry`.
- Make the cutting shape slightly larger than the cut so no zero-thickness skins are left.
- Make the shell material the shared `body` so Shell opacity applies.
- Several overlapping meshes in one part are allowed (tabs, lips). Slicers union them. Use CSG when you need a true hole.
- Keep wall thickness at least 1.6 mm (two nozzle lines) and fits at 0.15 to 0.25 mm clearance. Expose both as parameters.

## 7. Print orientation

Each printable part is exported on its own, dropped onto `z = 0` and laid out on a 250 mm bed. `printRotate` chooses which way it lies.

The rotation is applied in the Y-up assembled pose, before the Z-up conversion:

| You want | Use |
|---|---|
| a face pointing to −Z (the back) to face up | `[Math.PI / 2, 0, 0]` |
| a face pointing to +Z (the front) to face up | `[-Math.PI / 2, 0, 0]` |
| an open bottom to face up | `[Math.PI, 0, 0]` |
| a part along the X axis to lie flat (cylinder on its side) | `[0, 0, Math.PI / 2]` |

Rule of thumb: print with the flat face down, the open side up, and no overhangs. Check the size shown under each part in the list: it is the print-oriented X × Y × Z.

## 8. Explode and assembly

`base` is the assembled position and `explode` the extra offset at 100 %. Move parts along the direction they would be pulled out. The explode slider moves every part by `explode * amount`.

## 9. Sprue-card kits

Give each part a card pose and the viewer adds a Card to assembled slider, Card view and Assemble buttons.

```js
{
  name: 'Wing L',
  object: mesh,
  base: assembledPosition,
  card: { position: cardPosition, quaternion: cardQuaternion },
  printQuaternion: cardQuaternion,
  print: true
}
```

- Card poses lie on the desk (`y = 0`) in Y-up world coordinates.
- Put the sprue frame meshes in `extras`, and fade them with `update({ blend })` (for example `material.opacity = 1 - clamp(blend / 0.35, 0, 1)`).
- Use `printQuaternion` with the card quaternion so single-part STLs match the card orientation.
- `models/f15-card-kit.js` is the full example: it packs parts, adds runners, builds two cards and exports each as STL and 3MF.

## 10. Custom exports

```js
exports: [
  { label: 'Card 1 STL', file: 'card-1.stl', format: 'stl', build: () => [{ name: 'Card 1', tris }] },
  { label: 'Card 1 3MF', file: 'card-1.3mf', format: '3mf', build: () => [{ name: 'Card 1', tris }] }
]
```

`tris` is a `Float32Array` of triangles in print space (Z-up, 9 numbers per triangle: three vertices of x, y, z). For 3MF, move the items to the bed centre yourself (for a 256 mm bed, offset by `128 - width / 2` and `128 - height / 2`).

Built-in exports, available for every model:

- Print plate STL and Print plate 3MF (one object per printable part, laid out on a bed).
- Assembled STL.
- A per-part STL button in the parts list.

## 11. Helpers in `lib/geometry.js`

| Helper | What it does |
|---|---|
| `THREE` | three.js |
| `V(x, y, z)` | new `Vector3` |
| `RoundedBoxGeometry(w, h, d, segments, radius)` | box with rounded edges |
| `roundedRectShape(w, h, r)` | 2D rounded rectangle for extrusions |
| `slab(w, h, d, r, material)` | rounded plate mesh, `w`×`h` in XY, thickness `d` along Z, centred |
| `cutter(w, h, r, depth, z0)` | rounded-rectangle extrusion starting at `z0`, used as a CSG cutter |
| `plainBox(w, h, d, x, y, z)` | `BoxGeometry` already translated |
| `ringGeometry(outer, inner, depth, segments)` | flat ring (washer) with its axis along Y, from y = 0 up |
| `makeCsg()` | `{ brush, sub, inter, union }` |
| `mesh(geometry, material, castShadow)` | `Mesh` with shadow flag |
| `limb(a, b, ra, rb, material)` | tapered capsule between two points |
| `wireBundle(group, points, colors, track, opts)` | coloured tube wires through points |

You can import any other three.js add-on directly, for example `import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'`. Libraries available through the import map: `three`, `three/addons/*`, `three-mesh-bvh`, `three-bvh-csg`.

## 12. Checklist before you call a model done

1. The model loads without a red error box and without console errors.
2. Every printable part has `print: true`, a sensible `printRotate`, and a print size that fits the bed (250 mm).
3. Open sides face up in print orientation, with no large overhangs.
4. Walls, clearances and other sizes that matter are parameters.
5. Explode moves parts apart in a believable direction.
6. Electronics and other non-printed parts are visible (use `mat`) but have no `print`.
7. Overall size under the dimension readout matches the intended size.
8. Export the print plate 3MF once and open it in the slicer to check orientation and scale.

## 13. Troubleshooting

| Symptom | Cause |
|---|---|
| Empty dropdown, "Models cannot load" message | `index.html` opened as a file. Run `start.bat` |
| Red box: `Cannot read properties…` | an error in `build`. The first stack line names your file and line |
| Model does not appear in the dropdown | file name starts with `_`, is not `.js`, or is outside `models/` |
| Changes not showing | wait 1.5 seconds, or press the refresh button next to the dropdown |
| Part prints upside down | adjust `printRotate` (section 7) |
| Holes missing or shell looks filled | the cutter does not pass fully through the wall. Make it longer than the wall |
| Whole model hidden inside the desk | the lowest point is below `y = 0`. Raise `base` |
| Cut-away ignores a part | its material was not created with `mat()` or wrapped in `track()` |
| Rebuild is slow | lower curve segments, or add a quality select parameter like the F-15 model |
