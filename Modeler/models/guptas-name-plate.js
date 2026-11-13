import { THREE, V, mesh } from '../lib/geometry.js';
import { collectTris, toZUp, bounds, translate } from '../lib/export.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const CX = 345;
const BASE = 1076;
const PX_H = 568;
const K = 0.38;
const LEAF_L = 36.76;
const MIN_LEAF = 37;
const MIN_FLOWER = 22;
const S0 = 140 / 568;
const DAISY_R = 3.707;
const DAISY_Z0 = 0.327;

const sh = (x, y) => [565 + (x - 485) * K, 1076 + (y - 498) * K];

const FLOWERS_OLD = [
  { x: 253, y: 545, r: 33, t: 'w' },
  { x: 295, y: 565, r: 20, t: 'w' },
  { x: 335, y: 577, r: 20, t: 'w' },
  { x: 192, y: 647, r: 26, t: 'w' },
  { x: 237, y: 643, r: 22, t: 'w' },
  { x: 203, y: 590, r: 38, t: 'b' },
  { x: 265, y: 602, r: 33, t: 'b' },
  { x: 324, y: 531, r: 28, t: 'b' },
  { x: 385, y: 562, r: 33, t: 'b' },
  { x: 154, y: 853, r: 14, t: 'w' },
  { x: 180, y: 897, r: 19, t: 'w' },
  { x: 216, y: 978, r: 25, t: 'w' },
  { x: 180, y: 948, r: 14, t: 'b' },
  { x: 259, y: 1000, r: 19, t: 'b' }
];

const FLOWERS_SHOT = [
  [315, 376, 103, 'w'],
  [427, 243, 80, 'b'],
  [172, 428, 48, 'b'],
  [443, 414, 34, 'w']
];

const LEAVES_OLD = [
  [296, 545, -80, 38, 14],
  [340, 545, -35, 40, 14],
  [385, 540, -15, 38, 13],
  [305, 590, 35, 36, 13],
  [178, 660, 185, 38, 13],
  [172, 672, 55, 40, 13],
  [185, 910, 170, 32, 12],
  [192, 915, 60, 32, 11],
  [215, 1005, 120, 30, 11],
  [235, 1010, 40, 30, 11]
];

const LEAVES_SHOT = [
  [235, 378, 207, 105],
  [255, 430, 128, 85],
  [128, 430, 112, 78],
  [36, 434, 178, 42],
  [468, 172, -105, 120],
  [505, 86, -98, 55],
  [452, 332, -20, 90],
  [445, 346, 15, 85]
];

const STEMS_SHOT = [
  [[400, 355, 6], [435, 338, 6], [458, 300, 5.5], [466, 230, 5], [470, 175, 5], [495, 115, 4.5], [520, 60, 4], [538, 12, 3.5]],
  [[466, 200, 4], [500, 185, 3.6], [535, 172, 3.2]],
  [[463, 262, 4], [490, 252, 3.6], [518, 236, 3.2], [540, 228, 3]],
  [[498, 112, 3.6], [520, 100, 3.2], [546, 90, 3]],
  [[0, 440, 5], [35, 434, 5], [80, 426, 4.5], [125, 424, 4.2], [152, 426, 4]],
  [[35, 434, 3.6], [33, 418, 3.2], [38, 404, 3]],
  [[45, 434, 3.6], [45, 452, 3.2], [46, 470, 3]],
  [[85, 424, 3.6], [92, 405, 3.2], [96, 390, 3]],
  [[110, 424, 3.6], [105, 408, 3.2], [100, 398, 3]]
];

const STEMS_TOP = [
  [[176, 672, 3.2], [168, 690, 3], [160, 708, 3], [153, 726, 2.8]],
  [[170, 684, 2.8], [154, 690, 2.8], [140, 696, 2.8]],
  [[224, 546, 3], [208, 542, 3], [196, 536, 2.8], [188, 530, 2.8]],
  [[206, 541, 2.8], [201, 525, 2.8]],
  [[456, 568, 3], [462, 548, 3], [459, 530, 2.8], [450, 516, 2.8]],
  [[461, 540, 2.8], [476, 534, 2.8], [488, 524, 2.8]]
];

const LETTER_EDGE = [
  [290, 1070], [225, 1020], [182, 965], [160, 925], [140, 880], [127, 820], [128, 770], [130, 730], [137, 695], [148, 660], [165, 625], [190, 590], [220, 560], [255, 538], [295, 522], [335, 512],
  [375, 508], [420, 508], [455, 518], [490, 535]
];

const BUDS_SHOT = [
  [548, 88, 16], [541, 226, 17], [517, 10, 12], [549, 36, 11], [565, 160, 8], [532, 153, 8], [507, 155, 8],
  [517, 280, 9], [549, 269, 7], [38, 404, 9], [46, 470, 12], [96, 389, 9], [100, 398, 8], [30, 400, 8]
];

async function loadTemplate(name) {
  const res = await fetch(new URL('../assets/' + name, import.meta.url));
  const buf = await res.arrayBuffer();
  const head = new Uint32Array(buf, 0, 2);
  const verts = new Float32Array(buf, 8, head[0] * 3);
  const tri = new Uint32Array(buf, 8 + head[0] * 12, head[1]);
  return { verts, tri };
}

function placeTemplate(tpl, cx, cy, sxy, rot) {
  const out = new Float32Array(tpl.tri.length * 3);
  const cs = Math.cos(rot);
  const sn = Math.sin(rot);
  for (let i = 0; i < tpl.tri.length; i++) {
    const k = tpl.tri[i] * 3;
    const x = tpl.verts[k];
    const y = tpl.verts[k + 1];
    const z = tpl.verts[k + 2];
    out[i * 3] = cx + (x * cs - y * sn) * sxy;
    out[i * 3 + 1] = cy + (x * sn + y * cs) * sxy;
    out[i * 3 + 2] = (z + DAISY_Z0) * sxy;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(out, 3));
  g.computeVertexNormals();
  return g;
}

function extrudePoly(points, depth, z0) {
  const v = points.map(p => new THREE.Vector2(p[0], p[1]));
  const pts = THREE.ShapeUtils.isClockWise(v) ? v.slice().reverse() : v;
  const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth, bevelEnabled: false });
  g.translate(0, 0, z0);
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(new Float32Array(g.getAttribute('position').array), 3));
  out.computeVertexNormals();
  return out;
}

function circlePoints(cx, cy, r, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

function hull(points) {
  const p = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  p.forEach(pt => {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], pt) <= 1e-9) lower.pop();
    lower.push(pt);
  });
  const upper = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const pt = p[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], pt) <= 1e-9) upper.pop();
    upper.push(pt);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

function capsule(a, ra, b, rb, depth, z0) {
  const pts = hull(circlePoints(a[0], a[1], ra, 14).concat(circlePoints(b[0], b[1], rb, 14)));
  return extrudePoly(pts, depth, z0);
}

export default {
  title: "Gupta's name plate",
  description: 'White and blue daisies, mint leaves, stems and buds. Five parts, all lying flat on the ground.',
  params: [
    { key: 'height', label: 'Letter height (Y)', min: 90, max: 200, step: 1, value: 140, unit: ' mm' }
  ],
  toggles: [],
  async build({ body, params }) {
    const { height } = params;
    const s = height / PX_H;
    const zf = 0;
    const zs = s / S0;
    const mx = x => (x - CX) * s;
    const my = y => (BASE - y) * s;
    const mp = p => [mx(p[0]), my(p[1])];

    const FLOWERS = FLOWERS_OLD.concat(FLOWERS_SHOT.map(f => {
      const c = sh(f[0], f[1]);
      return { x: c[0], y: c[1], r: f[2] * K, t: f[3] };
    }));

    const radii = FLOWERS.map((f, i) => Math.max(MIN_FLOWER, f.r * 0.9 * (0.7 + 0.95 * ((i * 0.618034) % 1))));
    const pos = FLOWERS.map(f => [f.x, f.y]);
    const GAP = 6;
    const CENTER = [330, 800];
    const separate = pull => {
      let moved = false;
      for (let i = 0; i < FLOWERS.length; i++) {
        for (let j = i + 1; j < FLOWERS.length; j++) {
          const dx = pos[j][0] - pos[i][0];
          const dy = pos[j][1] - pos[i][1];
          const d = Math.hypot(dx, dy) || 0.01;
          const need = radii[i] + radii[j] + GAP;
          if (d < need) {
            const push = (need - d) / 2 + 0.01;
            const ux = dx / d;
            const uy = dy / d;
            pos[i][0] -= ux * push;
            pos[i][1] -= uy * push;
            pos[j][0] += ux * push;
            pos[j][1] += uy * push;
            moved = true;
          }
        }
      }
      return moved;
    };
    for (let pass = 0; pass < 400; pass++) {
      pos.forEach(p => {
        p[0] += (CENTER[0] - p[0]) * 0.05;
        p[1] += (CENTER[1] - p[1]) * 0.05;
      });
      separate();
    }
    for (let pass = 0; pass < 3000; pass++) if (!separate()) break;

    const [daisyTpl, leafTpl] = await Promise.all([loadTemplate('daisy-full.bin'), loadTemplate('leaf.bin')]);
    const whiteGeos = [];
    const blueGeos = [];

    FLOWERS.forEach((f, idx) => {
      const c = mp(pos[idx]);
      const sxy = (radii[idx] * s) / DAISY_R;
      const rot = idx * 0.83;
      (f.t === 'b' ? blueGeos : whiteGeos).push(placeTemplate(daisyTpl, c[0], c[1], sxy, rot));
    });

    const placeLeaf = (tpl, bx, by, dx, dy, f, sg) => {
      const n = tpl.tri.length;
      const out = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const tri = Math.floor(i / 3);
        const corner = i % 3;
        const slot = sg === 1 && corner > 0 ? 3 - corner : corner;
        const k = tpl.tri[tri * 3 + slot] * 3;
        const u = tpl.verts[k] * f;
        const v = tpl.verts[k + 1] * f * sg;
        const q = mp([bx + u * dx - v * dy, by + u * dy + v * dx]);
        out[i * 3] = q[0];
        out[i * 3 + 1] = q[1];
        out[i * 3 + 2] = tpl.verts[k + 2] * f * s;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(out, 3));
      g.computeVertexNormals();
      return g;
    };

    const cen = [pos.reduce((t, p) => t + p[0], 0) / pos.length, pos.reduce((t, p) => t + p[1], 0) / pos.length];
    const leafDefs = Array.from({ length: 18 }, (_, i) => [cen[0], cen[1], i * 20 + 8, MIN_LEAF]);

    const FLOWER_GAP = 3.5;
    const flowerCircles = FLOWERS.map((f, i) => ({ x: pos[i][0], y: pos[i][1], r: radii[i] * 0.97 }));
    const flowerKeepOut = FLOWERS.map((f, i) => ({ x: pos[i][0], y: pos[i][1], r: radii[i] + FLOWER_GAP }));

    const stemGeos = [];
    const stemDiscs = [];
    const leftStems = [];
    const leftBuds = [];
    STEMS_SHOT.map(st => st.map(q => {
      const c = sh(q[0], q[1]);
      return [c[0], c[1], Math.max(2.8, q[2] * K * 1.1)];
    })).concat(STEMS_TOP, leftStems).forEach(pts => {
      const spline = new THREE.SplineCurve(pts.map(q => new THREE.Vector2(q[0], q[1])));
      const n = pts.length - 1;
      const total = Math.max(n * 10, Math.ceil(spline.getLength() / 1.2));
      const radiusAt = t => {
        const f = Math.min(n - 1e-9, t * n);
        const i = Math.floor(f);
        return pts[i][2] + (pts[i + 1][2] - pts[i][2]) * (f - i);
      };
      const hitsFlower = (p, r) => flowerKeepOut.some(c => Math.hypot(p.x - c.x, p.y - c.y) < c.r + r);
      for (let j = 0; j < total; j++) {
        const t0 = j / total;
        const t1 = (j + 1) / total;
        const p0 = spline.getPoint(t0);
        const p1 = spline.getPoint(t1);
        if (p0.distanceTo(p1) < 0.01) continue;
        const r0 = radiusAt(t0);
        const r1 = radiusAt(t1);
        if (hitsFlower(p0, r0) || hitsFlower(p1, r1)) continue;
        stemDiscs.push({ x: p0.x, y: p0.y, r: r0 });
        stemDiscs.push({ x: p1.x, y: p1.y, r: r1 });
        stemGeos.push(capsule(mp([p0.x, p0.y]), r0 * s, mp([p1.x, p1.y]), r1 * s, 1.6 * zs, zf));
      }
    });

    const budList = BUDS_SHOT.map(b => {
      const c = sh(b[0], b[1]);
      return { x: c[0], y: c[1], r: Math.max(1.0 * zs / s, b[2] * K) };
    }).concat(leftBuds).filter(b => !flowerKeepOut.some(c => Math.hypot(b.x - c.x, b.y - c.y) < c.r + b.r));

    const daisyH = FLOWERS.map((f, i) => 2 * DAISY_Z0 * (radii[i] * s) / DAISY_R);
    const budDepth = Math.min(2.2 * zs, Math.min.apply(null, daisyH));

    const budGeos = budList.map(b => {
      const m = mp([b.x, b.y]);
      return extrudePoly(circlePoints(m[0], m[1], b.r * s, 18), budDepth, zf);
    });

    const NB = 12;
    const UL = 36.8;
    const prof = [];
    {
      const mn = new Array(NB).fill(1e9);
      const mxv = new Array(NB).fill(-1e9);
      for (let i = 0; i < leafTpl.verts.length; i += 3) {
        const b = Math.min(NB - 1, Math.max(0, Math.floor((leafTpl.verts[i] / UL) * NB)));
        mn[b] = Math.min(mn[b], leafTpl.verts[i + 1]);
        mxv[b] = Math.max(mxv[b], leafTpl.verts[i + 1]);
      }
      for (let b = 0; b < NB; b++) {
        if (mn[b] > mxv[b]) continue;
        prof.push({ u: ((b + 0.5) * UL) / NB, v: (mn[b] + mxv[b]) / 2, r: Math.hypot((mxv[b] - mn[b]) / 2, UL / NB / 2) });
      }
    }

    const LEAF_GAP = 3.5;
    const obstacles = stemDiscs.concat(budList.map(b => ({ x: b.x, y: b.y, r: b.r })));
    const leafDiscs = (bx, by, a, f, sg) => {
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      return prof.map(p => {
        const u = p.u * f;
        const v = p.v * f * sg;
        return { x: bx + u * dx - v * dy, y: by + u * dy + v * dx, r: p.r * f };
      });
    };
    const distSeg = (px, py, a, b) => {
      const vx = b[0] - a[0];
      const vy = b[1] - a[1];
      const t = Math.max(0, Math.min(1, ((px - a[0]) * vx + (py - a[1]) * vy) / (vx * vx + vy * vy)));
      return Math.hypot(px - a[0] - t * vx, py - a[1] - t * vy);
    };
    const insideLetter = d => {
      const poly = LETTER_EDGE.concat([[520, 540], [520, 1100], [290, 1100]]);
      let c = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        if (poly[i][1] > d.y !== poly[j][1] > d.y && d.x < ((poly[j][0] - poly[i][0]) * (d.y - poly[i][1])) / (poly[j][1] - poly[i][1]) + poly[i][0]) c = !c;
      }
      if (!c) return false;
      for (let i = 0; i < LETTER_EDGE.length - 1; i++) if (distSeg(d.x, d.y, LETTER_EDGE[i], LETTER_EDGE[i + 1]) < d.r * 0.6) return false;
      return true;
    };
    const leafClear = discs => discs.every(d => obstacles.every(o => Math.hypot(d.x - o.x, d.y - o.y) >= d.r + o.r + LEAF_GAP));

        const leafGeos = [];
    leafDefs.forEach((l, li) => {
      const [bx, by, deg, L0] = l;
      const sg = li % 2 ? 1 : -1;
      const top = false;
      const sizes = [Math.max(L0, MIN_LEAF)];
      const maxDa = 25;
      const maxU = 300;
      let best = null;
      let bestF = 0;
      for (const sz of sizes) {
        const f = sz / LEAF_L;
        for (let da = 0; da <= maxDa; da += 5) {
          for (const sgn of da === 0 ? [1] : [1, -1]) {
            const a = ((deg + da * sgn) * Math.PI) / 180;
            const dx = Math.cos(a);
            const dy = Math.sin(a);
            for (let u = 0; u <= maxU; u += 1) {
              const cost = u + da * 0.6;
              if (best && cost >= best.cost) break;
              const px = bx + u * dx;
              const py = by + u * dy;
              const discs = leafDiscs(px, py, a, f, sg);
              if ((!top || discs.every(insideLetter)) && leafClear(discs)) {
                best = { cost, px, py, dx, dy, discs };
                bestF = f;
                break;
              }
            }
          }
        }
        if (best) break;
      }
      if (!best) return;
      best.discs.forEach(d => obstacles.push(d));
      leafGeos.push(placeLeaf(leafTpl, best.px, best.py, best.dx, best.dy, bestF, sg));
    });

    const make = (name, geos, color, explodeY, info) => {
      const g = mergeGeometries(geos);
      g.rotateX(-Math.PI / 2);
      return {
        name,
        object: mesh(g, body),
        base: V(0, 0, 0),
        explode: V(0, explodeY, 0),
        color,
        print: true,
        info
      };
    };

    const parts = [
      make('1 Green leaves', leafGeos, 0x2fa62f, 14, 'Mint leaves from the leaf_models file, printed flat with veins and a stalk. Shortened where a flower sits over them.'),
      make('2 Green stems', stemGeos, 0x2fa62f, 20, 'Stems of the bottom right arrangement: one main stem with side stems, and a short stem at the left.'),
      make('3 Green buds', budGeos, 0x2fa62f, 26, 'Small round buds at the stem tips. Leave this part out if you do not want buds.'),
      make('4 White daisy petals', whiteGeos, 0xffffff, 40, 'White daisies from the margherita model. Print separately in white.'),
      make('5 Blue flower petals', blueGeos, 0x1f4fd8, 40, 'Blue flowers from the margherita model. Print separately in blue.')
    ];

    const single = (label, file, part) => ({
      label,
      file,
      build: () => {
        const tris = toZUp(collectTris(part.object));
        const b = bounds(tris);
        translate(tris, 125 - (b.min[0] + b.max[0]) / 2, 125 - (b.min[1] + b.max[1]) / 2, -b.min[2]);
        return [{ name: part.name, tris }];
      }
    });

    return {
      parts,
      exports: [
        single('White flowers 3MF', 'gupta-white-flowers.3mf', parts[3]),
        single('Blue flowers 3MF', 'gupta-blue-flowers.3mf', parts[4]),
        single('Green leaves 3MF', 'gupta-green-leaves.3mf', parts[0]),
        single('Green stems 3MF', 'gupta-green-stems.3mf', parts[1]),
        single('Green buds 3MF', 'gupta-green-buds.3mf', parts[2])
      ],
      notes: [
        'White and blue flowers are separate parts and separate 3MF files, so each prints on its own.',
        'Leaves, stems and buds are separate from the flowers, so each can be printed and coloured on its own.',
        'All parts lie flat on the ground and print with no supports.'
      ]
    };
  }
};
