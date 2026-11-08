import { THREE, V, makeCsg, mesh, plainBox } from '../lib/geometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const TAU = Math.PI * 2;

const L = 150;
const B = 50;
const H = 35;
const WALL = 2;
const SHEER = 6;
const BUL = 7;
const STAND_H = 9;
const Y0 = STAND_H + 2;
const DECK_Y = Y0 + H - BUL;
const CASTLE_H = 13;
const FORE_H = 8;
const SAIL_T = 1.6;
const BILLOW = 6;
const PLANKS = 12;
const GROOVE = 0.5;

function orientTris(T) {
  const edges = new Map();
  T.forEach((t, i) => {
    for (let k = 0; k < 3; k++) {
      const a = t[k], b = t[(k + 1) % 3];
      const key = a < b ? a + '_' + b : b + '_' + a;
      if (!edges.has(key)) edges.set(key, []);
      edges.get(key).push(i);
    }
  });
  const seen = new Uint8Array(T.length);
  for (let s = 0; s < T.length; s++) {
    if (seen[s]) continue;
    seen[s] = 1;
    const stack = [s];
    while (stack.length) {
      const i = stack.pop();
      const t = T[i];
      for (let k = 0; k < 3; k++) {
        const a = t[k], b = t[(k + 1) % 3];
        const key = a < b ? a + '_' + b : b + '_' + a;
        for (const j of edges.get(key)) {
          if (j === i || seen[j]) continue;
          const u = T[j];
          let same = false;
          for (let m = 0; m < 3; m++) if (u[m] === a && u[(m + 1) % 3] === b) same = true;
          if (same) T[j] = [u[0], u[2], u[1], u[3]];
          seen[j] = 1;
          stack.push(j);
        }
      }
    }
  }
}

function solid(points, tris) {
  const map = new Map();
  const verts = [];
  const id = p => {
    const k = Math.round(p.x * 1000) + ',' + Math.round(p.y * 1000) + ',' + Math.round(p.z * 1000);
    if (!map.has(k)) { map.set(k, verts.length); verts.push(p); }
    return map.get(k);
  };
  const T = [];
  for (const [a, b, c, g = 0] of tris) {
    const ia = id(points[a]), ib = id(points[b]), ic = id(points[c]);
    if (ia === ib || ib === ic || ia === ic) continue;
    T.push([ia, ib, ic, g]);
  }
  orientTris(T);
  let vol = 0;
  for (const [a, b, c] of T) {
    const p = verts[a], q = verts[b], r = verts[c];
    vol += p.x * (q.y * r.z - q.z * r.y) - p.y * (q.x * r.z - q.z * r.x) + p.z * (q.x * r.y - q.y * r.x);
  }
  if (vol < 0) for (let i = 0; i < T.length; i++) T[i] = [T[i][0], T[i][2], T[i][1], T[i][3]];
  const out = new Map();
  const pos = [];
  const idx = [];
  const vid = (v, g) => {
    const k = v + '|' + g;
    if (!out.has(k)) {
      out.set(k, pos.length / 3);
      pos.push(verts[v].x, verts[v].y, verts[v].z);
    }
    return out.get(k);
  };
  for (const [a, b, c, g] of T) idx.push(vid(a, g), vid(b, g), vid(c, g));
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array((pos.length / 3) * 2), 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

function prep(g) {
  const geo = g.index ? g.toNonIndexed() : g;
  for (const name of Object.keys(geo.attributes)) {
    if (!['position', 'normal', 'uv'].includes(name)) geo.deleteAttribute(name);
  }
  const n = geo.attributes.position.count;
  if (!geo.attributes.uv) geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(n * 2), 2));
  if (!geo.attributes.normal) geo.computeVertexNormals();
  return geo;
}

function fuse(list) {
  return mergeGeometries(list.map(prep));
}

function sheet(nu, nv, fn, ax, t) {
  const pts = [];
  const tris = [];
  const F = [], K = [];
  for (let i = 0; i <= nu; i++) {
    F.push([]);
    K.push([]);
    for (let j = 0; j <= nv; j++) {
      const p = fn(i / nu, j / nv);
      F[i].push(pts.push(p.clone().addScaledVector(ax, t / 2)) - 1);
      K[i].push(pts.push(p.clone().addScaledVector(ax, -t / 2)) - 1);
    }
  }
  for (let i = 0; i < nu; i++) {
    for (let j = 0; j < nv; j++) {
      tris.push([F[i][j], F[i + 1][j], F[i + 1][j + 1], 0], [F[i][j], F[i + 1][j + 1], F[i][j + 1], 0]);
      tris.push([K[i][j], K[i + 1][j], K[i + 1][j + 1], 1], [K[i][j], K[i + 1][j + 1], K[i][j + 1], 1]);
    }
  }
  for (let i = 0; i < nu; i++) {
    tris.push([F[i][0], F[i + 1][0], K[i + 1][0], 2], [F[i][0], K[i + 1][0], K[i][0], 2]);
    tris.push([F[i][nv], F[i + 1][nv], K[i + 1][nv], 3], [F[i][nv], K[i + 1][nv], K[i][nv], 3]);
  }
  for (let j = 0; j < nv; j++) {
    tris.push([F[0][j], F[0][j + 1], K[0][j + 1], 4], [F[0][j], K[0][j + 1], K[0][j], 4]);
    tris.push([F[nu][j], F[nu][j + 1], K[nu][j + 1], 5], [F[nu][j], K[nu][j + 1], K[nu][j], 5]);
  }
  return solid(pts, tris);
}

function rod(a, b, r0, r1 = r0, seg = 14) {
  const d = b.clone().sub(a);
  const len = d.length();
  const g = new THREE.CylinderGeometry(r1, r0, len, seg);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.normalize()));
  const m = a.clone().add(b).multiplyScalar(0.5);
  g.translate(m.x, m.y, m.z);
  return g;
}

function ball(r, x, y, z, sx = 1, sy = 1, sz = 1) {
  const g = new THREE.SphereGeometry(r, 18, 12);
  g.scale(sx, sy, sz);
  g.translate(x, y, z);
  return g;
}

function tube(r, h, x, y, z, seg = 24) {
  return new THREE.CylinderGeometry(r, r, h, seg).translate(x, y, z);
}

function ringWall(outer, inner, h, x, y, z, seg = 28) {
  const s = new THREE.Shape();
  s.absarc(0, 0, outer, 0, TAU, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, inner, 0, TAU, true);
  s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: seg });
  g.rotateX(-Math.PI / 2);
  g.translate(x, y, z);
  return g;
}

function hullWidth(u) {
  if (u >= 0.38) return Math.pow(Math.max(0, 1 - Math.pow((u - 0.38) / 0.62, 2)), 0.65);
  return 1 - 0.22 * Math.pow((0.38 - u) / 0.38, 2);
}

function station(u, extraTop = 0) {
  const s = 2 * u - 1;
  const lift = s > 0 ? SHEER * Math.pow(s, 2.2) : SHEER * 0.55 * s * s;
  const kr = u > 0.5 ? H * 0.8 * Math.pow((u - 0.5) / 0.5, 3) : H * 0.3 * Math.pow((0.5 - u) / 0.5, 3);
  return { x: (u - 0.5) * L, W: (B / 2) * hullWidth(u), yTop: Y0 + H + lift + extraTop, yK: Y0 + kr };
}

function plankProfile() {
  const prof = [];
  for (let p = 0; p < PLANKS; p++) {
    prof.push([p / PLANKS, 0], [(p + 0.78) / PLANKS, 0], [(p + 0.85) / PLANKS, 1], [(p + 0.95) / PLANKS, 1]);
  }
  prof.push([1, 0]);
  return prof;
}

function hullSolid({ len = L, wall = 0, flatY = null, extraTop = 0, N = 48, planks = false, M = 21 }) {
  const pts = [];
  const tris = [];
  const rows = [];
  const boxy = flatY !== null;
  const prof = planks ? plankProfile() : null;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const st = station(u, extraTop);
    const x = (u - 0.5) * len;
    const W = Math.max(0, st.W - wall);
    const { yTop, yK } = st;
    const row = [];
    if (boxy) {
      const K = 5, F = 6;
      for (let k = 0; k <= K; k++) row.push(pts.push(V(x, yTop - ((yTop - flatY) * k) / K, -W)) - 1);
      for (let k = 1; k < F; k++) row.push(pts.push(V(x, flatY, -W + (2 * W * k) / F)) - 1);
      for (let k = 0; k <= K; k++) row.push(pts.push(V(x, flatY + ((yTop - flatY) * k) / K, W)) - 1);
    } else {
      const h = yTop - yK;
      const list = prof ?? Array.from({ length: (M - 1) / 2 + 1 }, (_, k) => [k / ((M - 1) / 2), 0]);
      const place = (t, ins, sgn) => {
        const a = t * Math.PI / 2;
        let z = W * Math.sin(a);
        let y = yK + h * (1 - Math.cos(a));
        if (ins) {
          const nz = h * Math.sin(a), ny = -W * Math.cos(a);
          const nn = Math.hypot(nz, ny) || 1;
          z = Math.max(0, z - (GROOVE * nz) / nn);
          y -= (GROOVE * ny) / nn;
        }
        return V(x, y, sgn * z);
      };
      for (let k = list.length - 1; k >= 1; k--) row.push(pts.push(place(list[k][0], list[k][1], -1)) - 1);
      for (let k = 0; k < list.length; k++) row.push(pts.push(place(list[k][0], list[k][1], 1)) - 1);
    }
    rows.push(row);
  }
  const C = rows[0].length;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < C - 1; j++) {
      const g = boxy ? j + 10 : 0;
      const a = rows[i][j], b = rows[i + 1][j], c = rows[i + 1][j + 1], d = rows[i][j + 1];
      tris.push([a, b, c, g], [a, c, d, g]);
    }
    const l0 = rows[i][0], r0 = rows[i][C - 1], l1 = rows[i + 1][0], r1 = rows[i + 1][C - 1];
    tris.push([l0, l1, r1, 1], [l0, r1, r0, 1]);
  }
  const r0 = rows[0];
  const cen = V(0, 0, 0);
  r0.forEach(k => cen.add(pts[k]));
  cen.multiplyScalar(1 / r0.length);
  const c0 = pts.push(cen) - 1;
  for (let j = 0; j < C - 1; j++) tris.push([c0, r0[j], r0[j + 1], 2]);
  tris.push([c0, r0[C - 1], r0[0], 2]);
  return solid(pts, tris);
}

function squareSail(wBottom, wTop, yb, yt, x0, bulge, roach) {
  return (u, v) => {
    const w = wBottom + (wTop - wBottom) * v;
    const y = yb + v * (yt - yb) + roach * Math.sin(Math.PI * u) * Math.pow(1 - v, 1.5);
    const x = x0 + bulge * Math.pow(Math.sin(Math.PI * u), 0.8) * Math.pow(Math.sin(Math.PI * v), 0.7);
    return V(x, y, (u - 0.5) * w);
  };
}

function quadSail(c00, c10, c01, c11, bulge) {
  return (u, v) => {
    const p = V(0, 0, 0)
      .addScaledVector(c00, (1 - u) * (1 - v))
      .addScaledVector(c10, u * (1 - v))
      .addScaledVector(c01, (1 - u) * v)
      .addScaledVector(c11, u * v);
    p.z += bulge * Math.sin(Math.PI * u) * Math.sin(Math.PI * v);
    return p;
  };
}

function triSail(tack, clew, head, bulge) {
  return (u, v) => {
    const p = tack.clone().add(head.clone().sub(tack).multiplyScalar(v)).add(clew.clone().sub(tack).multiplyScalar(u * (1 - v)));
    p.z += bulge * Math.sin(Math.PI * u) * Math.sin(Math.PI * Math.min(1, v * 1.4));
    return p;
  };
}

function skullShapes(scale, depth) {
  const list = [];
  const skull = new THREE.Shape();
  skull.absarc(0, 1.0, 3.6, 0, TAU, false);
  const eyeL = new THREE.Path();
  eyeL.absarc(-1.45, 1.3, 1.0, 0, TAU, true);
  const eyeR = new THREE.Path();
  eyeR.absarc(1.45, 1.3, 1.0, 0, TAU, true);
  const nose = new THREE.Path();
  nose.moveTo(0, 0.6);
  nose.lineTo(-0.7, -0.4);
  nose.lineTo(0.7, -0.4);
  nose.lineTo(0, 0.6);
  skull.holes.push(eyeL, eyeR, nose);
  const jaw = new THREE.Shape();
  jaw.moveTo(-2.2, -1.4);
  jaw.lineTo(2.2, -1.4);
  jaw.lineTo(2.0, -3.6);
  jaw.lineTo(-2.0, -3.6);
  jaw.lineTo(-2.2, -1.4);
  for (const sh of [skull, jaw]) {
    list.push(new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 16 }).translate(0, 0, -depth / 2).scale(scale, scale, 1));
  }
  for (const sg of [-1, 1]) {
    const a = V(-sg * 5.6 * scale, -8.2 * scale, 0);
    const b = V(sg * 5.6 * scale, -3.2 * scale, 0);
    const len = a.distanceTo(b);
    const w = 1.5 * scale;
    const sh = new THREE.Shape();
    sh.moveTo(-len / 2, -w / 2);
    sh.lineTo(len / 2, -w / 2);
    sh.lineTo(len / 2, w / 2);
    sh.lineTo(-len / 2, w / 2);
    sh.lineTo(-len / 2, -w / 2);
    list.push(
      new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false }).translate(0, 0, -depth / 2).rotateZ(Math.atan2(b.y - a.y, b.x - a.x)).translate((a.x + b.x) / 2, (a.y + b.y) / 2, 0)
    );
    for (const p of [a, b]) list.push(new THREE.CylinderGeometry(1.0 * scale, 1.0 * scale, depth, 12).rotateX(Math.PI / 2).translate(p.x, p.y, 0));
  }
  return list;
}

export default {
  title: 'Pirate galleon',
  description: 'Fixed-size pirate galleon, 200 mm long: plank-grooved hull, gold trim, dragon figurehead, stern cabin with balcony, three masts with black skull sails, crow\'s nest, flag, rigging, cannons and deck props. All details are 0.4 mm-nozzle safe.',
  params: [],
  toggles: [
    { key: 'sails', label: 'Sails', value: true },
    { key: 'rigging', label: 'Rigging', value: true }
  ],
  build({ mat }) {
    const csg = makeCsg();
    const parts = [];
    const colors = { wood: 0x5a3a20, dark: 0x5a3a20, mast: 0x5a3a20, gold: 0xf2c200, sail: 0x16181c, white: 0xf2f0e6, iron: 0x2d3138, rope: 0xb89a62 };
    const M = c => mat(colors[c]);
    const add = (name, geo, color, extra = {}) => {
      parts.push({
        name,
        object: mesh(geo, M(color)),
        base: V(0, 0, 0),
        explode: V(0, 0, 0),
        color: colors[color],
        print: true,
        ...extra
      });
    };
    const poopTop = DECK_Y + CASTLE_H;
    const fcTop = DECK_Y + FORE_H;

    const hullGeo = hullSolid({ planks: true, N: 48 });
    const pocketGeo = hullSolid({ len: L - 2 * WALL, wall: WALL, flatY: DECK_Y, extraTop: 6, N: 48 });
    let hull = csg.sub(hullGeo, pocketGeo);

    const portX = [-0.2, -0.0667, 0.0667, 0.2].map(f => f * L);
    const portCut = [];
    for (const x of portX) for (const s of [-1, 1]) portCut.push(plainBox(6.4, 4.4, 14, x, DECK_Y + 3, s * (B / 2)));
    hull = csg.sub(hull, fuse(portCut));

    const winCut = [];
    for (const z of [-12, 0, 12]) {
      const sh = new THREE.Shape();
      const w = 6.4, h = 5.4;
      sh.moveTo(-w / 2, -h / 2);
      sh.lineTo(w / 2, -h / 2);
      sh.lineTo(w / 2, h / 2 - 2.4);
      sh.absarc(0, h / 2 - 2.4, w / 2, 0, Math.PI, false);
      sh.lineTo(-w / 2, -h / 2);
      const g = new THREE.ExtrudeGeometry(sh, { depth: WALL + 4.2, bevelEnabled: false, curveSegments: 10 });
      g.rotateY(Math.PI / 2);
      g.translate(-L / 2 - 2, DECK_Y + 6.6, z);
      winCut.push(g);
    }
    hull = csg.sub(hull, fuse(winCut));
    add('Hull', prep(hull.geometry), 'wood', { explode: V(0, 0, 0), group: 'Hull', info: 'Print upright with tree supports under the bow and stern keel rise.' });

    const stripGeos = [];
    for (const sgn of [-1, 1]) {
      const fn = (u, v) => {
        const uu = 0.03 + u * 0.93;
        const st = station(uu);
        const y = st.yTop - BUL - 5.2 + v * 3.2;
        const ratio = Math.min(1, Math.max(0, (y - st.yK) / (st.yTop - st.yK)));
        const a = Math.acos(1 - ratio);
        return V(st.x, y, sgn * st.W * Math.sin(a));
      };
      stripGeos.push(sheet(48, 2, fn, V(0, 0, 1), 1.6));
    }
    add('Gold trim', fuse(stripGeos), 'gold', { explode: V(0, 0, 14), group: 'Hull', printRotate: [-Math.PI / 2, 0, 0] });

    const fitWall = WALL + 0.25;
    const fit = hullSolid({ len: L - 2 * fitWall, wall: fitWall, flatY: DECK_Y, extraTop: CASTLE_H + 14, N: 48 });

    const Lp = L * 0.26;
    let poop = csg.inter(plainBox(Lp, CASTLE_H, B, -L / 2 + Lp / 2, DECK_Y + CASTLE_H / 2, 0), fit);
    const poopWin = [];
    for (const z of [-12, 0, 12]) poopWin.push(new THREE.BoxGeometry(2.4, 4.8, 6.2).translate(-L / 2 + fitWall + 1.2, DECK_Y + 6.6, z));
    poop = csg.sub(poop, fuse(poopWin));
    const poopX0 = -L / 2 + fitWall;
    const poopX1 = -L / 2 + Lp;
    const poopHalf = Math.min(B * 0.33, (B / 2) * hullWidth(0) - fitWall - 1.4);
    const pg = [poop.geometry];
    const rail = (a, b) => pg.push(rod(a, b, 0.6, 0.6, 8));
    const post = (x, z) => pg.push(tube(0.7, 4.6, x, poopTop + 2.3, z, 10));
    const rx0 = poopX0 + 1.6, rx1 = poopX1 - 1.6, rz = poopHalf - 0.8;
    for (let k = 0; k <= 5; k++) {
      const x = rx0 + ((rx1 - rx0) * k) / 5;
      post(x, -rz);
      post(x, rz);
    }
    for (let k = 1; k < 4; k++) post(rx0, -rz + (2 * rz * k) / 4);
    for (const yy of [poopTop + 4.4, poopTop + 2.4]) {
      rail(V(rx0, yy, -rz), V(rx1, yy, -rz));
      rail(V(rx0, yy, rz), V(rx1, yy, rz));
      rail(V(rx0, yy, -rz), V(rx0, yy, rz));
    }
    for (let k = 1; k <= 3; k++) {
      pg.push(plainBox(3.2, (CASTLE_H * k) / 4, 9, poopX1 + 3 * (4 - k) - 1.5, DECK_Y + (CASTLE_H * k) / 8, 0));
    }
    const wheelX = poopX0 + 31;
    const wheelY = poopTop + 5.6;
    pg.push(tube(1.2, 4.6, wheelX, poopTop + 2.3, 0, 12));
    pg.push(new THREE.TorusGeometry(3.7, 0.65, 8, 28).rotateY(Math.PI / 2).translate(wheelX, wheelY, 0));
    pg.push(ball(1.3, wheelX, wheelY, 0));
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * TAU;
      pg.push(rod(V(wheelX, wheelY, 0), V(wheelX, wheelY + Math.sin(a) * 5.2, Math.cos(a) * 5.2), 0.6, 0.6, 6));
    }
    const balconyY = DECK_Y + 3.2;
    const bx0 = -L / 2 - 4.5, bx1 = -L / 2 + 1;
    const bz = 16;
    pg.push(plainBox(bx1 - bx0, 1.4, bz * 2, (bx0 + bx1) / 2, balconyY, 0));
    for (let k = 0; k <= 4; k++) {
      const z = -bz + 1 + ((bz * 2 - 2) * k) / 4;
      pg.push(tube(0.6, 4, bx0 + 0.9, balconyY + 2.7, z, 8));
    }
    for (const sgn of [-1, 1]) {
      pg.push(tube(0.6, 4, (bx0 + bx1) / 2, balconyY + 2.7, sgn * (bz - 0.9), 8));
      rail(V(bx0 + 0.9, balconyY + 4.6, sgn * (bz - 0.9)), V(bx1 - 0.5, balconyY + 4.6, sgn * (bz - 0.9)));
    }
    rail(V(bx0 + 0.9, balconyY + 4.6, -bz + 0.9), V(bx0 + 0.9, balconyY + 4.6, bz - 0.9));
    for (const sg of [-1, 1]) {
      const lz = sg * (poopHalf - 1.6);
      const lx = poopX0 + 1.8;
      pg.push(tube(1.0, 5, lx, poopTop + 2.5, lz, 10));
      pg.push(ball(1.7, lx, poopTop + 6.2, lz));
      pg.push(new THREE.ConeGeometry(1.9, 1.8, 12).translate(lx, poopTop + 8.2, lz));
    }
    add('Stern castle', fuse(pg), 'wood', { explode: V(0, 26, 0), group: 'Hull' });

    const fcCenter = L * 0.31;
    const fcLen = L * 0.15;
    const fore = csg.inter(plainBox(fcLen, FORE_H, B, fcCenter, DECK_Y + FORE_H / 2, 0), fit);
    const fg = [fore.geometry];
    const fx0 = fcCenter - fcLen / 2 + 1.4;
    const fx1 = fcCenter + fcLen / 2 - 1.8;
    const fz = (B / 2) * hullWidth(0.5 + (fcCenter - fcLen / 2) / L) * 0.6;
    for (let k = 0; k <= 3; k++) {
      const x = fx0 + ((fx1 - fx0) * k) / 3;
      const zz = fz * (1 - 0.35 * (k / 3));
      fg.push(tube(0.7, 4, x, fcTop + 2, -zz, 10), tube(0.7, 4, x, fcTop + 2, zz, 10));
    }
    for (const yy of [fcTop + 3.8, fcTop + 2]) {
      fg.push(rod(V(fx0, yy, -fz), V(fx1, yy, -fz * 0.65), 0.6, 0.6, 8));
      fg.push(rod(V(fx0, yy, fz), V(fx1, yy, fz * 0.65), 0.6, 0.6, 8));
      fg.push(rod(V(fx0, yy, -fz), V(fx0, yy, fz), 0.6, 0.6, 8));
    }
    add('Forecastle', fuse(fg), 'wood', { explode: V(0, 24, 0), group: 'Hull' });

    const rud = [
      plainBox(2.0, 18, 6.4, -L / 2 - 1.2, Y0 + 9.5, 0),
      tube(1.0, 3.4, -L / 2 - 0.2, Y0 + 5, 0, 10),
      tube(1.0, 3.4, -L / 2 - 0.2, Y0 + 13, 0, 10)
    ];
    add('Rudder', fuse(rud), 'dark', { explode: V(-20, 0, 0), group: 'Hull', printRotate: [0, 0, Math.PI / 2] });

    const sy = Y0 + H * 0.7;
    const sx = L / 2;
    const dg = [];
    dg.push(rod(V(sx - 5, sy - 1, 0), V(sx + 3, sy + 1.2, 0), 3.4, 3.0, 14));
    dg.push(rod(V(sx + 3, sy + 1.2, 0), V(sx + 8, sy + 4.8, 0), 3.0, 2.6, 14));
    dg.push(ball(3.3, sx + 10, sy + 7, 0, 1.15, 1, 1));
    dg.push(rod(V(sx + 10.5, sy + 6.6, 0), V(sx + 17, sy + 6, 0), 2.3, 1.7, 12));
    dg.push(rod(V(sx + 10, sy + 5.2, 0), V(sx + 16, sy + 4.4, 0), 1.5, 1.0, 10));
    for (const tz of [-1, 1]) {
      for (const tx of [12.4, 14.6]) {
        dg.push(new THREE.ConeGeometry(0.7, 1.8, 6).rotateX(Math.PI).translate(sx + tx, sy + 3.9 + (tx - 12.4) * -0.2, tz * 1.1));
      }
      dg.push(ball(1.05, sx + 11.4, sy + 8.2, tz * 2.6));
      dg.push(new THREE.ConeGeometry(1.2, 4.4, 8).rotateZ(0.7).translate(sx + 8, sy + 11, tz * 2.4));
    }
    for (let k = 0; k < 4; k++) {
      dg.push(new THREE.ConeGeometry(1.0, 2.6, 6).rotateZ(0.5).translate(sx - 2 + k * 2.6, sy + 3.6 + k * 1.2, 0));
    }
    add('Figurehead', fuse(dg), 'gold', { explode: V(26, 0, 0), group: 'Hull', printRotate: [-Math.PI / 2, 0, 0] });

    const standShape = new THREE.Shape();
    const bw = 52, bl = L + 8, rr = 12;
    standShape.moveTo(-bl / 2 + rr, -bw / 2);
    standShape.lineTo(bl / 2 - rr, -bw / 2);
    standShape.quadraticCurveTo(bl / 2, -bw / 2, bl / 2, -bw / 2 + rr);
    standShape.lineTo(bl / 2, bw / 2 - rr);
    standShape.quadraticCurveTo(bl / 2, bw / 2, bl / 2 - rr, bw / 2);
    standShape.lineTo(-bl / 2 + rr, bw / 2);
    standShape.quadraticCurveTo(-bl / 2, bw / 2, -bl / 2, bw / 2 - rr);
    standShape.lineTo(-bl / 2, -bw / 2 + rr);
    standShape.quadraticCurveTo(-bl / 2, -bw / 2, -bl / 2 + rr, -bw / 2);
    const plate = new THREE.ExtrudeGeometry(standShape, { depth: 4, bevelEnabled: true, bevelSize: 1, bevelThickness: 1, bevelSegments: 2, curveSegments: 10 });
    plate.rotateX(-Math.PI / 2);
    plate.translate(0, 1, 0);
    let stand = csg.brush(plate);
    for (const cx of [-L * 0.2, L * 0.2]) {
      stand = csg.union(stand, plainBox(16, Y0 + 6, B * 0.55, cx, (3 + Y0 + 9) / 2, 0));
    }
    stand = csg.sub(stand, hullSolid({ len: L + 0.8, wall: -0.3, N: 48 }).translate(0, -0.2, 0));
    add('Display stand', prep(stand.geometry), 'dark', { explode: V(0, -34, 0), group: 'Hull' });

    const cg = [];
    const zOuter = (B / 2) * 0.98 + 1;
    for (const x of [portX[0], portX[3]]) {
      for (const s of [-1, 1]) {
        const yb = DECK_Y + 2.9;
        cg.push(rod(V(x, yb, s * (zOuter - 12.5)), V(x, yb, s * zOuter), 1.8, 1.25, 14));
        cg.push(ball(1.8, x, yb, s * (zOuter - 12.5)));
        cg.push(plainBox(4.4, 1.6, 8.6, x, DECK_Y + 1.5, s * (zOuter - 8.5)));
        for (const zz of [zOuter - 11.2, zOuter - 5.8]) {
          for (const sx2 of [-1, 1]) {
            cg.push(new THREE.CylinderGeometry(1.2, 1.2, 1, 12).rotateZ(Math.PI / 2).translate(x + sx2 * 2.5, DECK_Y + 1.25, s * zz));
          }
        }
      }
    }
    add('Cannons', fuse(cg).translate(0, -0.3, 0), 'iron', { explode: V(0, 18, 0), group: 'Deck' });

    const dp = [];
    const barrel = (x, z) => {
      const prof = [];
      for (let k = 0; k <= 8; k++) {
        const t = k / 8;
        prof.push(new THREE.Vector2(2.2 + 0.9 * Math.sin(t * Math.PI), t * 5.6));
      }
      dp.push(new THREE.LatheGeometry(prof, 20).translate(x, DECK_Y, z));
      dp.push(tube(2.2, 0.4, x, DECK_Y + 0.2, z, 20), tube(2.2, 0.4, x, DECK_Y + 5.4, z, 20));
      for (const hy of [1.2, 4.4]) dp.push(new THREE.TorusGeometry(2.95, 0.4, 6, 24).rotateX(Math.PI / 2).translate(x, DECK_Y + hy, z));
    };
    barrel(6, 19.6);
    barrel(9.2, 14.2);
    const cx = -3, cz = 17;
    dp.push(plainBox(11, 5, 7, cx, DECK_Y + 2.5, cz));
    dp.push(new THREE.CylinderGeometry(3.5, 3.5, 11, 18).rotateZ(Math.PI / 2).translate(cx, DECK_Y + 5, cz));
    for (const bxx of [-3.4, 3.4]) dp.push(plainBox(1.2, 6.2, 7.8, cx + bxx, DECK_Y + 3.4, cz));
    dp.push(plainBox(2, 2.6, 0.8, cx, DECK_Y + 4.6, cz + 3.8));
    const crate = (x, z, s, y = 0) => {
      dp.push(plainBox(s, s, s, x, DECK_Y + y + s / 2, z));
      for (const sgn of [-1, 1]) {
        dp.push(plainBox(s + 0.8, 1.0, 1.0, x, DECK_Y + y + s / 2, z + sgn * (s / 2 + 0.2)));
        dp.push(plainBox(1.0, s + 0.8, 1.0, x + sgn * (s / 2 + 0.2), DECK_Y + y + s / 2, z));
      }
    };
    crate(0.5, -19.5, 7);
    crate(8.3, -20.5, 6);
    crate(2, -19.5, 5, 7);
    const coil = (x, z) => {
      for (let k = 0; k < 3; k++) dp.push(new THREE.TorusGeometry(2.6 - k * 0.15, 0.8, 8, 22).rotateX(Math.PI / 2).translate(x, DECK_Y + 0.8 + k * 1.1, z));
    };
    coil(-6, -17);
    coil(22, -13);
    coil(-21, 9);
    add('Deck props', fuse(dp).translate(0, -0.3, 0), 'mast', { explode: V(0, 22, 0), group: 'Deck' });

    const masts = [
      { key: 'Mainmast', x: -L * 0.1, base: DECK_Y, h: 100, r: 2.4, span: 46, nest: true },
      { key: 'Foremast', x: L * 0.15, base: DECK_Y, h: 80, r: 2.1, span: 44, nest: false },
      { key: 'Mizzenmast', x: -L * 0.345, base: poopTop, h: 70 - CASTLE_H, r: 1.8, span: 34, nest: false }
    ];

    for (const m of masts) {
      const g = [];
      const { x, base, h, r } = m;
      const rAt = y => r * (1 - 0.42 * (y / h));
      g.push(rod(V(x, base - 4, 0), V(x, base + h, 0), r * 1.05, r * 0.58, 18));
      g.push(tube(r * 1.5, 3, x, base + 1.5, 0, 20));
      const levels = m.key === 'Mizzenmast' ? [{ y: 0.74, w: 0.78 }] : [{ y: 0.3, w: 1 }, { y: 0.63, w: 0.78 }, { y: 0.85, w: 0.54 }];
      const yardR = 1.0;
      m.yards = levels.map(lv => {
        const yy = base + lv.y * h;
        const xo = x + rAt(lv.y * h) + yardR;
        const half = (m.span * lv.w) / 2 + 3;
        g.push(rod(V(xo, yy, -half), V(xo, yy, half), yardR, yardR, 10));
        g.push(ball(yardR * 1.3, xo, yy, -half));
        g.push(ball(yardR * 1.3, xo, yy, half));
        g.push(plainBox(r * 2.4, 1.8, 2.8, x + rAt(lv.y * h) * 0.2, yy, 0));
        return { y: yy, xo, half: half - 3 };
      });
      if (m.nest) {
        const ny = base + h * 0.35;
        const nr = 7.2;
        g.push(tube(nr, 1.2, x, ny, 0, 28));
        g.push(ringWall(nr, nr - 1.0, 3.2, x, ny + 0.6, 0));
        g.push(ringWall(nr + 0.5, nr - 0.4, 1.0, x, ny + 3.3, 0));
        for (let k = 0; k < 4; k++) {
          const a = (k / 4) * TAU + Math.PI / 4;
          g.push(rod(V(x + Math.cos(a) * r * 0.8, ny - 5.5, Math.sin(a) * r * 0.8), V(x + Math.cos(a) * (nr - 0.8), ny, Math.sin(a) * (nr - 0.8)), 0.6, 0.6, 6));
        }
        m.nestPos = { y: ny, r: nr };
      }
      if (m.key === 'Mainmast') {
        g.push(rod(V(x, base + h - 0.5, 0), V(x, base + h + 28, 0), r * 0.58, 0.75, 10));
        g.push(ball(1.3, x, base + h + 28.6, 0));
      } else {
        g.push(rod(V(x, base + h - 0.5, 0), V(x, base + h + 7, 0), r * 0.58, 0.7, 10));
        g.push(ball(1.1, x, base + h + 7.4, 0));
      }
      if (m.key === 'Mizzenmast') {
        const bl = L * 0.16;
        const by = base + h * 0.16;
        g.push(rod(V(x + r, by, 0), V(x - bl, by, 0), 1.1, 0.8, 12));
        const gaffA = V(x + r, base + h * 0.64, 0);
        const gaffB = V(x - bl * 0.62, base + h * 0.64 + h * 0.2, 0);
        g.push(rod(gaffA, gaffB, 1.0, 0.7, 12));
        m.boom = { by, bl };
        m.gaff = { a: gaffA, b: gaffB };
      }
      add(m.key, fuse(g), 'mast', { explode: V(0, 44, 0), group: 'Masts', printRotate: [0, 0, Math.PI / 2] });
    }

    const sailsOf = {};
    const emblems = [];
    for (const m of masts) {
      const sg = [];
      const { x, h } = m;
      if (m.key !== 'Mizzenmast') {
        const heights = [0.19, 0.2, 0.16];
        m.yards.forEach((yd, k) => {
          const hs = h * heights[k];
          const topW = yd.half * 2 * 0.94;
          const fn = squareSail(topW * 1.12, topW, yd.y - hs, yd.y, yd.xo, BILLOW, hs * 0.07);
          sg.push(sheet(18, 12, fn, V(1, 0, 0), SAIL_T));
          if (k === 0) {
            const c = fn(0.5, 0.52);
            emblems.push({ c, scale: m.key === 'Mainmast' ? 1.2 : 0.95 });
          }
        });
      } else {
        const yd = m.yards[0];
        const hs = h * 0.2;
        const topW = yd.half * 2 * 0.94;
        sg.push(sheet(14, 10, squareSail(topW * 1.12, topW, yd.y - hs, yd.y, yd.xo, BILLOW * 0.8, hs * 0.07), V(1, 0, 0), SAIL_T));
        const { by, bl } = m.boom;
        const tack = V(x + m.r + 1.2, by + 1.2, 0);
        const clew = V(x - bl + 1, by + 1.2, 0);
        const throat = V(m.gaff.a.x + 1.2, m.gaff.a.y - 1.2, 0);
        const peak = V(m.gaff.b.x + 0.6, m.gaff.b.y - 0.8, 0);
        sg.push(sheet(16, 12, quadSail(tack, clew, throat, peak, BILLOW * 0.9), V(0, 0, 1), SAIL_T));
      }
      sailsOf[m.key] = sg;
    }

    const bsA = V(L / 2 - 15, fcTop - 0.5, 0);
    const bsLen = 62;
    const bsAng = (21 * Math.PI) / 180;
    const bsDir = V(Math.cos(bsAng), Math.sin(bsAng), 0);
    const bsB = bsA.clone().addScaledVector(bsDir, bsLen);
    const at = s => bsA.clone().addScaledVector(bsDir, bsLen * s);
    const spr = [
      rod(bsA.clone().addScaledVector(bsDir, -6), bsB, 2.2, 1.1, 14),
      ball(1.2, bsB.x, bsB.y, bsB.z),
      plainBox(5, 3, 5, at(0.05).x, at(0.05).y - 0.5, 0)
    ];
    add('Bowsprit', fuse(spr), 'mast', { explode: V(30, 14, 0), group: 'Masts', printRotate: [0, 0, -bsAng] });

    const fm = masts[1];
    const jib1 = { head: V(fm.x + 1.5, fm.base + fm.h * 0.975, 0), tack: at(0.97).add(V(0, 1.4, 0)), clew: at(0.6).add(V(0, 7, 0)) };
    const jib2 = { head: V(fm.x + 2.8, fm.base + fm.h * 0.89, 0), tack: at(0.55).add(V(0, 1.2, 0)), clew: at(0.2).add(V(0, 8, 0)) };
    sailsOf.Jibs = [
      sheet(14, 14, triSail(jib1.tack, jib1.clew, jib1.head, BILLOW * 0.8), V(0, 0, 1), SAIL_T),
      sheet(14, 14, triSail(jib2.tack, jib2.clew, jib2.head, BILLOW * 0.7), V(0, 0, 1), SAIL_T)
    ];

    for (const [name, key, rot] of [
      ['Main sails', 'Mainmast', [0, 0, Math.PI / 2]],
      ['Fore sails', 'Foremast', [0, 0, Math.PI / 2]],
      ['Mizzen sails', 'Mizzenmast', [-Math.PI / 2, 0, 0]],
      ['Jibs', 'Jibs', [-Math.PI / 2, 0, 0]]
    ]) {
      const object = new THREE.Group();
      const sm = M('sail');
      for (const geo of sailsOf[key]) object.add(mesh(geo, sm));
      parts.push({ name, object, base: V(0, 0, 0), explode: key === 'Jibs' ? V(40, 20, 0) : V(30, 18, 0), color: colors.sail, print: true, group: 'Sails', printRotate: rot });
    }

    const emGeos = [];
    for (const e of emblems) {
      const list = skullShapes(e.scale, 1.8).map(g => g.rotateY(Math.PI / 2).translate(e.c.x + SAIL_T / 2 - 0.1, e.c.y + 2.3 * e.scale, e.c.z));
      emGeos.push(...list);
    }
    add('Sail emblems', fuse(emGeos), 'white', { explode: V(44, 18, 0), group: 'Sails', printRotate: [0, 0, Math.PI / 2] });

    const mainM = masts[0];
    const poleTop = mainM.base + mainM.h + 28;
    const flagH = 17;
    const flagW = 30;
    const fyb = poleTop - flagH - 2;
    const wave = u => 2.5 * Math.sin(u * TAU * 0.85) * u;
    const flagGeo = sheet(18, 8, (u, v) => V(mainM.x - 0.6 - u * flagW, fyb + v * flagH - u * 1.2, wave(u)), V(0, 0, 1), 1.4);
    add('Pirate flag', flagGeo, 'sail', { explode: V(-30, 30, 0), group: 'Sails', printRotate: [-Math.PI / 2, 0, 0] });
    const fu = 0.45;
    const fcx = mainM.x - 0.6 - fu * flagW;
    const fcy = fyb + flagH / 2 + 2 - fu * 1.2;
    const fcz = wave(fu);
    const flagEmb = skullShapes(0.85, 2.6).map(g => g.translate(fcx, fcy, fcz));
    add('Flag emblem', fuse(flagEmb), 'white', { explode: V(-30, 36, 0), group: 'Sails', printRotate: [-Math.PI / 2, 0, 0] });

    const rg = [];
    const RR = 0.6;
    const hw = x => (B / 2) * 0.93 * hullWidth(0.5 + x / L) + 1;
    for (const m of masts.slice(0, 2)) {
      for (const s of [-1, 1]) {
        for (let k = 0; k < 4; k++) {
          const dx = -9 + (7.5 * k) / 3;
          const gx = m.x + dx;
          const top = m.nestPos
            ? V(m.x + dx * 0.5, m.nestPos.y + 0.4, s * (m.nestPos.r - 0.8) * 0.6)
            : V(m.x + dx * 0.15, m.base + m.h * 0.33, s * m.r * 0.7);
          rg.push(rod(V(gx, DECK_Y + BUL - 2, s * hw(gx) * 0.96), top, RR, RR, 6));
        }
      }
    }
    const mainTop = V(masts[0].x, masts[0].base + masts[0].h * 0.98, 0);
    const foreTop = V(masts[1].x, masts[1].base + masts[1].h * 0.98, 0);
    const mizzTop = V(masts[2].x, masts[2].base + masts[2].h * 0.96, 0);
        rg.push(rod(mainTop, foreTop, RR, RR, 6));
    rg.push(rod(mizzTop, mainTop.clone().setY(mainTop.y - 14), RR, RR, 6));
    for (const m of masts) {
      for (const yd of m.yards) {
        rg.push(rod(V(yd.xo, yd.y + 0.9, -yd.half), V(m.x, yd.y + 5, -2.6), RR, RR, 6));
        rg.push(rod(V(yd.xo, yd.y + 0.9, yd.half), V(m.x, yd.y + 5, 2.6), RR, RR, 6));
      }
    }
    rg.push(rod(jib1.head, jib1.tack, RR, RR, 6), rod(jib2.head, jib2.tack, RR, RR, 6));
    add('Rigging', fuse(rg), 'dark', { explode: V(0, 52, 0), group: 'Masts', printRotate: [0, 0, Math.PI / 2] });

    const hideMap = {
      sails: ['Main sails', 'Fore sails', 'Mizzen sails', 'Jibs', 'Sail emblems'],
      rigging: ['Rigging']
    };

    return {
      parts,
      notes: [
        'Fixed size: 200 mm long, 50 mm beam, about 170 mm tall. Walls 2.0 mm, rigging 1.2 mm, sails 1.6 mm: all safe for a 0.4 mm nozzle.',
        'Multi-colour kit: dark wood hull, gold trim and figurehead, black sails and flag, white skull emblems.',
        'Sails and flag print flat. Masts, bowsprit and rigging print lying down and need supports under the yards.',
        'The stand holds the hull with 0.2 mm clearance.'
      ],
      update({ toggles, parts: vp }) {
        for (const key of Object.keys(hideMap)) {
          for (const p of vp) if (hideMap[key].includes(p.name)) p.hide = !toggles[key];
        }
      }
    };
  }
};
