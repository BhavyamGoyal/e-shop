import { THREE, V, mesh } from '../lib/geometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const CX = 345;
const BASE = 1076;
const PX_H = 568;

const G_OPS = [
  ['M', 462, 692],
  ['L', 556, 672],
  ['C', 556, 610, 500, 510, 410, 508],
  ['C', 230, 500, 126, 620, 126, 790],
  ['C', 126, 960, 200, 1076, 290, 1076],
  ['L', 565, 1076],
  ['L', 565, 760],
  ['L', 372, 760],
  ['L', 372, 805],
  ['L', 447, 805],
  ['L', 447, 925],
  ['C', 447, 960, 400, 978, 340, 978],
  ['C', 285, 978, 252, 900, 252, 800],
  ['C', 252, 690, 290, 608, 370, 608],
  ['C', 420, 608, 455, 640, 462, 692]
];

const TEXT_STROKES = [
  [[306, 782, 3], [296, 790, 4], [276, 828, 6], [250, 838, 8], [228, 815, 10], [226, 775, 11], [243, 732, 10], [272, 716, 6], [300, 730, 3]],
  [[296, 742, 4], [290, 790, 8], [280, 835, 9], [262, 872, 7], [238, 888, 5], [224, 880, 4]],
  [[306, 782, 3], [314, 775, 3], [318, 810, 8], [332, 832, 9], [350, 818, 7], [356, 775, 4]],
  [[356, 775, 4], [354, 815, 9], [362, 836, 6], [372, 822, 4]],
  [[374, 776, 4], [372, 820, 9], [366, 870, 9], [362, 892, 5], [354, 884, 3]],
  [[368, 812, 4], [388, 775, 6], [414, 772, 8], [430, 792, 8], [422, 825, 7], [398, 838, 5], [372, 828, 3]],
  [[452, 725, 3], [450, 775, 8], [448, 820, 8], [458, 836, 6], [472, 826, 4], [484, 822, 3]],
  [[418, 774, 3], [455, 768, 4], [485, 764, 3]],
  [[528, 780, 4], [505, 775, 6], [490, 800, 8], [496, 830, 8], [515, 836, 6], [530, 815, 6], [534, 775, 5]],
  [[534, 775, 5], [532, 820, 8], [540, 836, 5], [556, 818, 3]]
];

const FLOWERS = [
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
  { x: 259, y: 1000, r: 19, t: 'b' },
  { x: 512, y: 960, r: 30, t: 'w' },
  { x: 555, y: 935, r: 26, t: 'w' },
  { x: 430, y: 1042, r: 28, t: 'w' },
  { x: 503, y: 1037, r: 32, t: 'w' },
  { x: 472, y: 1003, r: 35, t: 'b' },
  { x: 537, y: 1013, r: 25, t: 'b' }
];

const LEAVES = [
  [296, 545, -80, 38, 14],
  [340, 545, -35, 40, 14],
  [385, 540, -15, 38, 13],
  [305, 590, 35, 36, 13],
  [178, 660, 185, 38, 13],
  [172, 672, 55, 40, 13],
  [185, 910, 170, 32, 12],
  [192, 915, 60, 32, 11],
  [455, 1015, 200, 38, 14],
  [410, 1050, 180, 45, 13],
  [415, 1052, 150, 26, 10],
  [455, 1050, 70, 32, 12],
  [555, 905, -60, 34, 11],
  [575, 880, -15, 34, 11],
  [580, 865, -60, 28, 10],
  [545, 1000, -20, 38, 12],
  [545, 1015, 10, 36, 12],
  [215, 1005, 120, 30, 11],
  [235, 1010, 40, 30, 11]
];

const STEMS = [
  [[160, 725, 3], [165, 700, 3], [180, 675, 3]],
  [[190, 575, 3], [197, 545, 3], [205, 525, 3]],
  [[545, 925, 3], [565, 895, 3], [590, 850, 3]],
  [[345, 1048, 3], [380, 1050, 3], [420, 1040, 3]],
  [[420, 560, 3], [432, 548, 3]]
];

const BERRIES = [
  [205, 524], [213, 534], [196, 534], [433, 547], [441, 541], [592, 848], [583, 858], [600, 860]
];

function sampleOutline(ops) {
  const pts = [];
  let cur = null;
  ops.forEach(op => {
    if (op[0] === 'M') {
      cur = [op[1], op[2]];
      pts.push(cur);
    } else if (op[0] === 'L') {
      cur = [op[1], op[2]];
      pts.push(cur);
    } else {
      const c = new THREE.CubicBezierCurve(
        new THREE.Vector2(cur[0], cur[1]),
        new THREE.Vector2(op[1], op[2]),
        new THREE.Vector2(op[3], op[4]),
        new THREE.Vector2(op[5], op[6])
      );
      const n = 28;
      for (let i = 1; i <= n; i++) {
        const p = c.getPoint(i / n);
        pts.push([p.x, p.y]);
      }
      cur = [op[5], op[6]];
    }
  });
  const first = pts[0];
  const last = pts[pts.length - 1];
  if (Math.abs(first[0] - last[0]) < 1e-6 && Math.abs(first[1] - last[1]) < 1e-6) pts.pop();
  return pts;
}

function clean(g) {
  const src = g.index ? g.toNonIndexed() : g;
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(new Float32Array(src.getAttribute('position').array), 3));
  out.computeVertexNormals();
  out.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(src.getAttribute('position').count * 2), 2));
  return out;
}

function extrudePoly(points, depth, z0) {
  const v = points.map(p => new THREE.Vector2(p[0], p[1]));
  const pts = THREE.ShapeUtils.isClockWise(v) ? v.slice().reverse() : v;
  const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth, bevelEnabled: false });
  g.translate(0, 0, z0);
  return clean(g);
}

function circlePoints(cx, cy, r, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

function ellipsePoints(cx, cy, a, b, rot, n) {
  const out = [];
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  for (let i = 0; i < n; i++) {
    const t = (Math.PI * 2 * i) / n;
    const ex = a * Math.cos(t);
    const ey = b * Math.sin(t);
    out.push([cx + ex * c - ey * s, cy + ex * s + ey * c]);
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
  description: 'Red capital G with white script name and white and blue daisies, yellow centres and green leaves. Six parts, one per filament colour, all printed flat.',
  params: [
    { key: 'height', label: 'Letter height (Y)', min: 90, max: 200, step: 1, value: 140, unit: ' mm' },
    { key: 'depth', label: 'Letter thickness (Z)', min: 6, max: 25, step: 0.5, value: 12, unit: ' mm' },
    { key: 'script', label: 'Script thickness', min: 2, max: 6, step: 0.2, value: 3, unit: ' mm' }
  ],
  toggles: [],
  build({ body, params }) {
    const { height, depth, script } = params;
    const s = height / PX_H;
    const zf = depth / 2;
    const mx = x => (x - CX) * s;
    const my = y => (BASE - y) * s;
    const mp = p => [mx(p[0]), my(p[1])];

    const gGeo = extrudePoly(sampleOutline(G_OPS).map(mp), depth, -zf);

    const strokeGeos = (pts, d, z0) => {
      const out = [];
      const spline = new THREE.SplineCurve(pts.map(p => new THREE.Vector2(p[0], p[1])));
      const n = pts.length - 1;
      const total = n * 10;
      const radiusAt = t => {
        const f = Math.min(n - 1e-9, t * n);
        const i = Math.floor(f);
        const k = f - i;
        return pts[i][2] + (pts[i + 1][2] - pts[i][2]) * k;
      };
      for (let j = 0; j < total; j++) {
        const t0 = j / total;
        const t1 = (j + 1) / total;
        const p0 = spline.getPoint(t0);
        const p1 = spline.getPoint(t1);
        if (p0.distanceTo(p1) < 0.01) continue;
        out.push(capsule(mp([p0.x, p0.y]), radiusAt(t0) * s, mp([p1.x, p1.y]), radiusAt(t1) * s, d, z0));
      }
      return out;
    };

    const textGeos = [];
    TEXT_STROKES.forEach(st => textGeos.push(...strokeGeos(st, script, zf)));

    const radii = FLOWERS.map(f => f.r);
    for (let pass = 0; pass < 4; pass++) {
      for (let i = 0; i < FLOWERS.length; i++) {
        for (let j = i + 1; j < FLOWERS.length; j++) {
          const d = Math.hypot(FLOWERS[i].x - FLOWERS[j].x, FLOWERS[i].y - FLOWERS[j].y);
          const need = (radii[i] + radii[j]) * 0.88;
          if (d < need) {
            const k = d / need;
            radii[i] *= k;
            radii[j] *= k;
          }
        }
      }
    }

    const whiteGeos = [];
    const blueGeos = [];
    const yellowGeos = [];

    FLOWERS.forEach((f, idx) => {
      const rPx = radii[idx];
      const R = rPx * s;
      const c = mp([f.x, f.y]);
      const blue = f.t === 'b';
      const N = blue ? (rPx >= 28 ? 18 : rPx >= 20 ? 14 : 11) : rPx >= 26 ? 12 : rPx >= 18 ? 10 : 8;
      const h1 = blue ? 2.2 : 2.0;
      const h2 = h1 + 0.8;
      const target = blue ? blueGeos : whiteGeos;
      const hw = Math.max(0.45, ((Math.PI * 2 * 0.6 * R) / N) * (blue ? 0.58 : 0.62));
      for (let i = 0; i < N; i++) {
        const ang = (Math.PI * 2 * i) / N;
        target.push(extrudePoly(ellipsePoints(c[0] + Math.cos(ang) * R * 0.5, c[1] + Math.sin(ang) * R * 0.5, R * 0.5, hw, ang, 18), h1, zf));
        const ang2 = ang + Math.PI / N;
        target.push(extrudePoly(ellipsePoints(c[0] + Math.cos(ang2) * R * 0.39, c[1] + Math.sin(ang2) * R * 0.39, R * 0.39, hw * 0.9, ang2, 18), h2, zf));
      }
      target.push(extrudePoly(circlePoints(c[0], c[1], R * 0.42, 28), h2, zf));
      yellowGeos.push(extrudePoly(circlePoints(c[0], c[1], R * 0.3, 24), 1.0, zf + h2));
    });

    const leafGeo = (bx, by, deg, L, W) => {
      const a = (deg * Math.PI) / 180;
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      const map = (u, v) => mp([bx + u * dx - v * dy, by + u * dy + v * dx]);
      const up = new THREE.CubicBezierCurve(new THREE.Vector2(0, 0), new THREE.Vector2(L * 0.25, W), new THREE.Vector2(L * 0.7, W * 0.8), new THREE.Vector2(L, 0)).getPoints(12);
      const lo = new THREE.CubicBezierCurve(new THREE.Vector2(L, 0), new THREE.Vector2(L * 0.7, -W * 0.8), new THREE.Vector2(L * 0.25, -W), new THREE.Vector2(0, 0)).getPoints(12);
      const pts = up.concat(lo.slice(1, -1)).map(p => map(p.x, p.y));
      return pts;
    };

    const greenGeos = [];
    const flowerCircles = FLOWERS.map((f, i) => ({ x: f.x, y: f.y, r: radii[i] * 0.97 }));
    LEAVES.forEach(l => {
      const [bx, by, deg, L0, W] = l;
      const a = (deg * Math.PI) / 180;
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      let u = 0;
      const inside = uu => flowerCircles.some(c => Math.hypot(bx + uu * dx - c.x, by + uu * dy - c.y) < c.r);
      while (u < L0 && inside(u)) u += 0.5;
      const L = L0 - u;
      if (L < 14) return;
      const k = L / L0;
      greenGeos.push(extrudePoly(leafGeo(bx + u * dx, by + u * dy, deg, L, W * Math.max(0.7, k)), 1.6, zf));
    });
    STEMS.forEach(st => greenGeos.push(...strokeGeos(st, 1.6, zf)));
    BERRIES.forEach(b => {
      const c = mp(b);
      greenGeos.push(extrudePoly(circlePoints(c[0], c[1], 0.95, 14), 2.2, zf));
    });

    const make = (name, geos, color, explodeZ, info) => ({
      name,
      object: mesh(mergeGeometries(geos), body),
      base: V(0, 0, 0),
      explode: V(0, 0, explodeZ),
      color,
      print: true,
      printRotate: [-Math.PI / 2, 0, 0],
      info
    });

    return {
      parts: [
        make('1 Red G', [gGeo], 0xd0021b, 0, 'Print first. Flat on its back, no supports.'),
        make('2 White Gupta script', textGeos, 0xffffff, 28, 'Glue onto the front of the G. Its left end rests on the G stroke and the crossbar.'),
        make('3 Green leaves and stems', greenGeos, 0x2fa62f, 14, 'Leaves are trimmed where flowers sit on top.'),
        make('4 White daisy petals', whiteGeos, 0xffffff, 40, 'White daisies, two petal rings and a core.'),
        make('5 Blue flower petals', blueGeos, 0x1f4fd8, 40, 'Blue asters, two petal rings and a core.'),
        make('6 Yellow flower centres', yellowGeos, 0xffd400, 56, 'Small discs that sit on top of every flower core.')
      ],
      notes: [
        'Six parts, one per filament colour: red, white (script), green, white (daisies), blue, yellow.',
        'All parts print flat with the front face up and need no supports.',
        'The G has a flat bottom edge so it stands on a desk. Add a small base if you want extra stability.'
      ]
    };
  }
};
