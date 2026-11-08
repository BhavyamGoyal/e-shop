import { THREE, V, mesh } from '../lib/geometry.js';
import { mergeGeometries, toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';

const BASE_CREST = [
  [-59.85, 40.75], [-55, 44.66], [-51, 47.75], [-47, 50.69], [-43, 52.21], [-39, 55.22], [-35, 56.29],
  [-31, 59.2], [-27, 60.6], [-23, 61.76], [-19, 62.4], [-15, 64.3], [-11, 65.05], [-7, 65.63],
  [-3, 66.02], [1, 66.2], [5, 66.17], [9, 65.92], [13, 65.44], [17, 64.71], [21, 63.75],
  [25, 62.54], [29, 61.09], [33, 59.4], [37, 57.2], [41, 54.9], [45, 51.8], [49, 49.04],
  [53, 46.03], [56.5, 43.2]
];

const BASE_Y0 = 59.85;
const SHADE_H = 103.68;
const SHADE_HUB_TOP = 9.34;

function crestAt(table, z) {
  if (z <= table[0][0]) return table[0][1];
  for (let i = 1; i < table.length; i++) {
    if (z <= table[i][0]) {
      const [z0, r0] = table[i - 1];
      const [z1, r1] = table[i];
      return r0 + ((z - z0) / (z1 - z0)) * (r1 - r0);
    }
  }
  return table[table.length - 1][1];
}

function rippleLathe(points, lobes, perLobe, depth) {
  const cols = lobes * perLobe;
  const rows = points.length;
  const pos = new Float32Array(rows * cols * 3);
  for (let j = 0; j < cols; j++) {
    const lobe = Math.floor(j / perLobe);
    const k = j % perLobe;
    const x = -Math.cos((Math.PI * k) / perLobe);
    const offset = depth * (1 - Math.sqrt(Math.max(0, 1 - x * x)));
    const a = ((lobe + (x + 1) / 2) / lobes) * Math.PI * 2;
    const s = Math.sin(a);
    const c = Math.cos(a);
    for (let i = 0; i < rows; i++) {
      const [r, y, w] = points[i];
      const rr = r - w * offset;
      const o = (i * cols + j) * 3;
      pos[o] = rr * c;
      pos[o + 1] = y;
      pos[o + 2] = rr * s;
    }
  }
  const idx = [];
  for (let i = 0; i < rows; i++) {
    const i2 = (i + 1) % rows;
    for (let j = 0; j < cols; j++) {
      const j2 = (j + 1) % cols;
      const a = i * cols + j;
      const b = i * cols + j2;
      const c = i2 * cols + j2;
      const d = i2 * cols + j;
      idx.push(a, b, c, a, c, d);
    }
  }
  let geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setIndex(idx);
  let vol = 0;
  const p = geo.attributes.position;
  const ia = geo.index.array;
  const A = new THREE.Vector3();
  const B = new THREE.Vector3();
  const C = new THREE.Vector3();
  for (let t = 0; t < ia.length; t += 3) {
    A.fromBufferAttribute(p, ia[t]);
    B.fromBufferAttribute(p, ia[t + 1]);
    C.fromBufferAttribute(p, ia[t + 2]);
    vol += A.dot(B.cross(C));
  }
  if (vol < 0) {
    for (let t = 0; t < ia.length; t += 3) {
      const tmp = ia[t + 1];
      ia[t + 1] = ia[t + 2];
      ia[t + 2] = tmp;
    }
  }
  return geo;
}

function strokeShape(x0, y0, x1, y1, w) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const l = Math.hypot(dx, dy);
  const nx = (-dy / l) * (w / 2);
  const ny = (dx / l) * (w / 2);
  const s = new THREE.Shape();
  s.moveTo(x0 + nx, y0 + ny);
  s.lineTo(x1 + nx, y1 + ny);
  s.lineTo(x1 - nx, y1 - ny);
  s.lineTo(x0 - nx, y0 - ny);
  s.closePath();
  return s;
}

function rectShape(x0, y0, x1, y1) {
  const s = new THREE.Shape();
  s.moveTo(x0, y0);
  s.lineTo(x1, y0);
  s.lineTo(x1, y1);
  s.lineTo(x0, y1);
  s.closePath();
  return s;
}

function arcShape(cx, cy, rx, ry, w, a0, a1, steps) {
  const outer = [];
  const inner = [];
  for (let i = 0; i <= steps; i++) {
    const a = a0 + ((a1 - a0) * i) / steps;
    outer.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
    inner.push([cx + (rx - w) * Math.cos(a), cy + (ry - w) * Math.sin(a)]);
  }
  const s = new THREE.Shape();
  s.moveTo(...outer[0]);
  for (let i = 1; i < outer.length; i++) s.lineTo(...outer[i]);
  for (let i = inner.length - 1; i >= 0; i--) s.lineTo(...inner[i]);
  s.closePath();
  return s;
}

function letterShapes(ch, H, S) {
  const mid = H / 2;
  switch (ch) {
    case 'T': {
      const W = 10;
      return { width: W, shapes: [rectShape(0, H - S, W, H), rectShape(W / 2 - S / 2, 0, W / 2 + S / 2, H - S)] };
    }
    case 'I':
      return { width: S, shapes: [rectShape(0, 0, S, H)] };
    case 'N': {
      const W = 10.5;
      return {
        width: W,
        shapes: [rectShape(0, 0, S, H), rectShape(W - S, 0, W, H), strokeShape(S / 2, H - S * 0.4, W - S / 2, S * 0.4, S * 1.05)]
      };
    }
    case 'G': {
      const W = 11.5;
      return {
        width: W,
        shapes: [
          arcShape(W / 2, mid, W / 2, mid, S, (40 * Math.PI) / 180, Math.PI * 2, 28),
          rectShape(W / 2, mid - S, W, mid)
        ]
      };
    }
    case 'L': {
      const W = 8.5;
      return { width: W, shapes: [rectShape(0, 0, S, H), rectShape(0, 0, W, S)] };
    }
    case 'E': {
      const W = 8.5;
      return {
        width: W,
        shapes: [rectShape(0, 0, S, H), rectShape(0, H - S, W, H), rectShape(0, mid - S / 2, W - 1, mid + S / 2), rectShape(0, 0, W, S)]
      };
    }
    default:
      return { width: 6, shapes: [] };
  }
}

function buildText(text, R0, yc, H, S, gap, sink, lift) {
  const pieces = [];
  const widths = [];
  for (const ch of text) widths.push(letterShapes(ch, H, S).width);
  const total = widths.reduce((a, b) => a + b, 0) + gap * (text.length - 1);
  let cursor = -total / 2;
  const depth = sink + lift;
  let n = 0;
  for (const ch of text) {
    const { width, shapes } = letterShapes(ch, H, S);
    for (const shape of shapes) {
      const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 8 });
      g.deleteAttribute('uv');
      g.deleteAttribute('normal');
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i) + cursor;
        const y = p.getY(i) + yc - H / 2;
        const z = p.getZ(i);
        const d = crestAt(BASE_CREST, y - BASE_Y0) - sink + z;
        const phi = x / R0;
        p.setXYZ(i, d * Math.sin(phi), y, d * Math.cos(phi));
      }
      pieces.push(g.index ? g.toNonIndexed() : g);
      n++;
    }
    cursor += width + gap;
  }
  const merged = mergeGeometries(pieces, false);
  merged.deleteAttribute('normal');
  return merged;
}

function finish(geo) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  g.deleteAttribute('normal');
  g.deleteAttribute('uv');
  return g;
}

function buildBase(params) {
  const lobes = 80;
  const depth = 2.4;
  const wall = params.baseWall;
  const pts = [];
  const top = 58.5;
  for (let i = 0; i < BASE_CREST.length; i++) {
    const [z, r] = BASE_CREST[i];
    pts.push([r, z + BASE_Y0, 1]);
  }
  pts.push([41.6, top + BASE_Y0, 0]);
  pts.push([34.9, top + BASE_Y0, 0]);
  pts.push([34.9, 59.85 + BASE_Y0, 0]);
  pts.push([29.9, 59.85 + BASE_Y0, 0]);
  pts.push([29.9, top + BASE_Y0, 0]);
  pts.push([34.1, top + BASE_Y0, 0]);
  pts.push([34.1, 51.5 + BASE_Y0, 0]);
  pts.push([29.0, 51.5 + BASE_Y0, 0]);
  pts.push([29.0, 50.5 + BASE_Y0, 0]);
  const innerR = z => Math.max(36.2, crestAt(BASE_CREST, z) - depth - wall);
  const upper = BASE_CREST.filter(([z]) => z <= 49);
  pts.push([innerR(50.5), 50.5 + BASE_Y0, 0]);
  for (let i = upper.length - 1; i >= 0; i--) {
    const z = upper[i][0];
    pts.push([innerR(z), z + BASE_Y0, 0]);
  }
  const geo = rippleLathe(pts, lobes, 12, depth);
  return finish(geo);
}

function buildShade(params) {
  const lobes = 120;
  const depth = 1.3;
  const wall = params.shadeWall;
  const crest = z => 75.5 - 0.325 * z;
  const pts = [];
  const zs = [];
  for (let z = -51.84; z <= 51.84 + 1e-6; z += 51.84 / 8) zs.push(z);
  for (const z of zs) pts.push([crest(z), z + 51.84, 1]);
  for (let i = zs.length - 1; i >= 0; i--) {
    const z = zs[i];
    pts.push([crest(z) - wall, z + 51.84, 1]);
  }
  const wallGeo = rippleLathe(pts, lobes, 10, depth);

  const parts = [wallGeo];
  const hubIn = 31.7;
  const hubOut = 34.5;
  const hubShape = new THREE.Shape();
  hubShape.absarc(0, 0, hubOut, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, hubIn, 0, Math.PI * 2, true);
  hubShape.holes.push(hole);
  const hub = new THREE.ExtrudeGeometry(hubShape, { depth: SHADE_HUB_TOP, bevelEnabled: false, curveSegments: 72 });
  hub.rotateX(-Math.PI / 2);
  parts.push(hub);

  const spokeT = params.spokeThickness;
  const rimIn = crest(-51.84) - wall - depth - 0.2;
  for (let k = 0; k < 5; k++) {
    const a = ((33 + k * 72) * Math.PI) / 180;
    const s = new THREE.Shape();
    s.moveTo(hubOut - 1.5, -1.6);
    s.lineTo(rimIn + 2, -3.6);
    s.lineTo(rimIn + 2, 3.6);
    s.lineTo(hubOut - 1.5, 1.6);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: spokeT, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, 0);
    g.rotateY(-a);
    parts.push(g);
  }
  const norm = parts.map(g => {
    const n = g.index ? g.toNonIndexed() : g;
    n.deleteAttribute('uv');
    n.deleteAttribute('normal');
    return n;
  });
  return mergeGeometries(norm, false);
}

export default {
  title: 'Ribbed Mushroom Lamp',
  description: 'Ribbed globe base and pleated screw-on shade for an LED lamp kit. Same shape as the V1 HQ v2 model, with the original lettering removed and TINGLET raised on the front of the base.',
  params: [
    { key: 'baseWall', label: 'Base wall', min: 1.2, max: 3, step: 0.1, value: 2.1, unit: ' mm' },
    { key: 'shadeWall', label: 'Shade wall', min: 1.2, max: 2.4, step: 0.1, value: 1.2, unit: ' mm' },
    { key: 'spokeThickness', label: 'Shade spoke thickness', min: 1.6, max: 4, step: 0.2, value: 2.4, unit: ' mm' },
    { key: 'textHeight', label: 'Text height', min: 10, max: 22, step: 1, value: 15, unit: ' mm' },
    { key: 'textRaise', label: 'Text raise', min: 0.8, max: 2, step: 0.1, value: 1.2, unit: ' mm' }
  ],
  toggles: [],
  build({ params, body }) {
    const baseGeo = buildBase(params);
    const textGeo = buildText('TINGLET', 66.2, BASE_Y0 + 1, params.textHeight, 2.6, 3.2, 2.2, params.textRaise);
    const baseWithText = toCreasedNormals(mergeGeometries([baseGeo, finish(textGeo)], false), Math.PI / 3);
    const shadeGeo = toCreasedNormals(buildShade(params), Math.PI / 3);

    const shade = mesh(shadeGeo, body);
    const baseMesh = mesh(baseWithText, body);

    return {
      parts: [
        { name: 'Base', object: baseMesh, base: V(0, 0, 0), explode: V(0, 0, 0), color: 0xf2f4f8, print: true },
        { name: 'Shade', object: shade, base: V(0, BASE_Y0 * 2, 0), explode: V(0, 70, 0), color: 0xf2f4f8, print: true }
      ],
      notes: [
        'Shade hub sits on the lip of the base. Plain lathe, no thread: add a thread or friction fit if needed.',
        'TINGLET is block lettering merged into the base mesh, raised on the front rib surface.'
      ]
    };
  }
};
