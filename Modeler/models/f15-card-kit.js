import { THREE, makeCsg } from '../lib/geometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { toCreasedNormals, mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

let QUALITY = 1;

const SCALE = 120;
const S = 1000 / SCALE;
const PITCH = 15 * Math.PI / 180;
const GROUND = -2.05;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const sm = (v, e) => { const t = clamp(v / e, 0, 1); return t * t * (3 - 2 * t); };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const PIVOT = V3(0, -1.75 * S, -11.3 * S);
const QTILT = new THREE.Quaternion().setFromAxisAngle(V3(1, 0, 0), -PITCH);
const tiltPt = v => v.clone().sub(PIVOT).applyQuaternion(QTILT).add(PIVOT);

class MB {
  constructor() { this.p = []; this.t = []; }
  v(x, y, z) { this.p.push(x, y, z); return this.p.length / 3 - 1; }
  tri(a, b, c) { this.t.push(a, b, c); }
}

function addGrid(mb, G) { return G.map(r => r.map(q => mb.v(q[0], q[1], q[2]))); }

function strip(mb, A, B, wrap) {
  const n = A.length;
  const jm = wrap ? n : n - 1;
  for (let j = 0; j < jm; j++) {
    const j1 = (j + 1) % n;
    mb.tri(A[j], A[j1], B[j1]);
    mb.tri(A[j], B[j1], B[j]);
  }
}

function skin(mb, I, wrap) {
  for (let i = 0; i < I.length - 1; i++) strip(mb, I[i], I[i + 1], wrap);
}

function cap(mb, idx) {
  const n = idx.length;
  const pts = idx.map(i => [mb.p[3 * i], mb.p[3 * i + 1], mb.p[3 * i + 2]]);
  let nx = 0, ny = 0, nz = 0;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    nx += (a[1] - b[1]) * (a[2] + b[2]);
    ny += (a[2] - b[2]) * (a[0] + b[0]);
    nz += (a[0] - b[0]) * (a[1] + b[1]);
  }
  const ax = Math.abs(nx), ay = Math.abs(ny), az = Math.abs(nz);
  let u, v;
  if (ax >= ay && ax >= az) { u = 1; v = 2; } else if (ay >= az) { u = 2; v = 0; } else { u = 0; v = 1; }
  const c2 = pts.map(p => new THREE.Vector2(p[u], p[v]));
  const tr = THREE.ShapeUtils.triangulateShape(c2, []);
  for (const t of tr) mb.tri(idx[t[0]], idx[t[1]], idx[t[2]]);
}

function planeBasis(n) {
  const a = Math.abs(n.x) < 0.9 ? V3(1, 0, 0) : V3(0, 1, 0);
  const u = a.clone().cross(n).normalize();
  const v = n.clone().cross(u).normalize();
  return [u, v];
}

function drillFace(mb, contour, holes, dir) {
  for (const h of holes) (mb.holes = mb.holes || []).push({ c: h.c.clone(), dir: dir.clone(), r: h.r, depth: h.depth });
  const [u, v] = planeBasis(dir);
  const c2 = contour.map(i => new THREE.Vector2(mb.p[3 * i] * u.x + mb.p[3 * i + 1] * u.y + mb.p[3 * i + 2] * u.z, mb.p[3 * i] * v.x + mb.p[3 * i + 1] * v.y + mb.p[3 * i + 2] * v.z));
  const all = contour.slice();
  const h2 = [], bores = [];
  for (const h of holes) {
    const ring = [], deep = [], r2 = [];
    for (let k = 0; k < 20; k++) {
      const ph = 2 * Math.PI * k / 20;
      const a = h.c.clone().addScaledVector(u, h.r * Math.cos(ph)).addScaledVector(v, h.r * Math.sin(ph));
      const b = a.clone().addScaledVector(dir, h.depth);
      ring.push(mb.v(a.x, a.y, a.z));
      deep.push(mb.v(b.x, b.y, b.z));
      r2.push(new THREE.Vector2(a.dot(u), a.dot(v)));
    }
    h2.push(r2);
    all.push(...ring);
    bores.push([ring, deep]);
  }
  const tr = THREE.ShapeUtils.triangulateShape(c2, h2);
  for (const t of tr) mb.tri(all[t[0]], all[t[1]], all[t[2]]);
  for (const [ring, deep] of bores) {
    strip(mb, ring, deep, true);
    cap(mb, deep);
  }
}

function peg(mb, base, dir, r, L, back = 0.1) {
  (mb.pegs = mb.pegs || []).push({ c: base.clone(), dir: dir.clone(), r, L });
  cyl(mb, base.clone().addScaledVector(dir, -back), base.clone().addScaledVector(dir, L), r, r * 0.8, 14);
}

function solidBox(mb, x0, x1, y0, y1, z0, z1, topHoles, botHoles, y1b = y1) {
  const v = [];
  for (let k = 0; k < 8; k++) v.push(mb.v(k & 1 ? x1 : x0, k & 2 ? (k & 4 ? y1b : y1) : y0, k & 4 ? z1 : z0));
  for (const q of [[0, 2, 6, 4], [1, 3, 7, 5], [0, 1, 3, 2], [4, 5, 7, 6]]) {
    mb.tri(v[q[0]], v[q[1]], v[q[2]]);
    mb.tri(v[q[0]], v[q[2]], v[q[3]]);
  }
  const face = (ids, holes, dir) => {
    if (holes.length) drillFace(mb, ids.map(i => v[i]), holes, dir);
    else cap(mb, ids.map(i => v[i]));
  };
  face([2, 3, 7, 6], topHoles, V3(0, -1, 0));
  face([0, 1, 5, 4], botHoles, V3(0, 1, 0));
}

function thickSurface(mb, P, Q, hb, hr) {
  const IP = addGrid(mb, P), IQ = addGrid(mb, Q);
  const last = IP.length - 1, lc = IP[0].length - 1;
  skin(mb, IP);
  if (hb) {
    const ct = [];
    for (let j = 0; j <= lc; j++) ct.push(IQ[0][j]);
    for (let i = 1; i <= last; i++) ct.push(IQ[i][lc]);
    for (let j = lc - 1; j >= 0; j--) ct.push(IQ[last][j]);
    for (let i = last - 1; i >= 1; i--) ct.push(IQ[i][0]);
    drillFace(mb, ct, hb.holes, hb.dir);
  } else skin(mb, IQ);
  if (hr) drillFace(mb, IP[0].concat(IQ[0].slice().reverse()), hr.holes, hr.dir);
  else strip(mb, IP[0], IQ[0]);
  strip(mb, IP[last], IQ[last]);
  strip(mb, IP.map(r => r[0]), IQ.map(r => r[0]));
  strip(mb, IP.map(r => r[lc]), IQ.map(r => r[lc]));
}

function revolve(mb, prof, seg, xf, rmod) {
  const rows = [];
  const v = new THREE.Vector3();
  for (const [r, a] of prof) {
    const row = [];
    for (let j = 0; j < seg; j++) {
      const ph = 2 * Math.PI * j / seg;
      const rr = rmod ? rmod(r, a, ph) : r;
      v.set(rr * Math.cos(ph), rr * Math.sin(ph), a).applyMatrix4(xf);
      row.push(mb.v(v.x, v.y, v.z));
    }
    rows.push(row);
  }
  skin(mb, rows, true);
  strip(mb, rows[rows.length - 1], rows[0], true);
}

function cyl(mb, p0, p1, r0, r1, seg = 16) {
  const dir = p1.clone().sub(p0);
  const L = dir.length();
  const q = new THREE.Quaternion().setFromUnitVectors(V3(0, 0, 1), dir.normalize());
  const xf = new THREE.Matrix4().compose(p0, q, V3(1, 1, 1));
  revolve(mb, [[0, 0], [r0, 0], [r1, L], [0, L]], seg, xf);
}

function ellipsoid(mb, c, rx, ry, rz, seg = 20) {
  const prof = [];
  for (let k = 0; k <= 10; k++) {
    const a = Math.PI * k / 10;
    prof.push([Math.sin(a), Math.cos(a)]);
  }
  const xf = new THREE.Matrix4().compose(c, new THREE.Quaternion(), V3(rx, ry, rz));
  revolve(mb, prof, seg, xf);
}

function box(mb, x0, x1, y0, y1, z0, z1) {
  const v = [];
  for (let i = 0; i < 8; i++) v.push(mb.v(i & 1 ? x1 : x0, i & 2 ? y1 : y0, i & 4 ? z1 : z0));
  const f = [[0, 4, 6], [0, 6, 2], [1, 3, 7], [1, 7, 5], [0, 1, 5], [0, 5, 4], [2, 6, 7], [2, 7, 3], [0, 2, 3], [0, 3, 1], [4, 5, 7], [4, 7, 6]];
  for (const t of f) mb.tri(v[t[0]], v[t[1]], v[t[2]]);
}

function prism(mb, poly, th, f) {
  const a = poly.map(p => { const q = f(p[0], p[1], -th / 2); return mb.v(q[0], q[1], q[2]); });
  const b = poly.map(p => { const q = f(p[0], p[1], th / 2); return mb.v(q[0], q[1], q[2]); });
  cap(mb, a);
  cap(mb, b);
  strip(mb, a, b, true);
}

function scaleMB(mb, s) { for (let i = 0; i < mb.p.length; i++) mb.p[i] *= s; }

function moveMB(mb, x, y, z) {
  for (const q of (mb.pegs || []).concat(mb.holes || [])) q.c.add(V3(x, y, z));
  for (let i = 0; i < mb.p.length; i += 3) { mb.p[i] += x; mb.p[i + 1] += y; mb.p[i + 2] += z; }
}

function tiltMB(mb) {
  const v = V3(0, 0, 0);
  for (let i = 0; i < mb.p.length; i += 3) {
    v.set(mb.p[i], mb.p[i + 1], mb.p[i + 2]).sub(PIVOT).applyQuaternion(QTILT).add(PIVOT);
    mb.p[i] = v.x;
    mb.p[i + 1] = v.y;
    mb.p[i + 2] = v.z;
  }
  for (const q of (mb.pegs || []).concat(mb.holes || [])) {
    q.c = tiltPt(q.c);
    q.dir = q.dir.clone().applyQuaternion(QTILT);
  }
}

function mergeMB(dst, src) {
  const o = dst.p.length / 3;
  for (const x of src.p) dst.p.push(x);
  for (const t of src.t) dst.t.push(t + o);
  dst.holes = (dst.holes || []).concat(src.holes || []);
  dst.pegs = (dst.pegs || []).concat(src.pegs || []);
}

function flatten(mb, dir, amt) {
  let mx = -Infinity;
  const n = mb.p.length;
  for (let i = 0; i < n; i += 3) mx = Math.max(mx, mb.p[i] * dir.x + mb.p[i + 1] * dir.y + mb.p[i + 2] * dir.z);
  const lim = mx - amt;
  for (let i = 0; i < n; i += 3) {
    const d = mb.p[i] * dir.x + mb.p[i + 1] * dir.y + mb.p[i + 2] * dir.z;
    if (d > lim) {
      mb.p[i] -= dir.x * (d - lim);
      mb.p[i + 1] -= dir.y * (d - lim);
      mb.p[i + 2] -= dir.z * (d - lim);
    }
  }
}

function finish(mb) {
  const nv = mb.p.length / 3;
  const map = new Int32Array(nv);
  const keys = new Map();
  const P = [];
  for (let i = 0; i < nv; i++) {
    const k = Math.round(mb.p[3 * i] * 200) + ',' + Math.round(mb.p[3 * i + 1] * 200) + ',' + Math.round(mb.p[3 * i + 2] * 200);
    let id = keys.get(k);
    if (id === undefined) { id = P.length / 3; keys.set(k, id); P.push(mb.p[3 * i], mb.p[3 * i + 1], mb.p[3 * i + 2]); }
    map[i] = id;
  }
  const T = [];
  for (let k = 0; k < mb.t.length; k += 3) {
    const a = map[mb.t[k]], b = map[mb.t[k + 1]], c = map[mb.t[k + 2]];
    if (a !== b && b !== c && a !== c) T.push(a, b, c);
  }
  const nt = T.length / 3;
  const N = P.length / 3;
  const em = new Map();
  const ek = (a, b) => (a < b ? a * N + b : b * N + a);
  for (let k = 0; k < nt; k++) {
    for (let e = 0; e < 3; e++) {
      const a = T[3 * k + e], b = T[3 * k + (e + 1) % 3];
      const key = ek(a, b);
      let l = em.get(key);
      if (!l) { l = []; em.set(key, l); }
      l.push(k, a < b ? 1 : -1);
    }
  }
  let bad = 0;
  for (const l of em.values()) if (l.length !== 4) bad++;
  const flip = new Uint8Array(nt);
  const seen = new Uint8Array(nt);
  const comp = [];
  for (let s = 0; s < nt; s++) {
    if (seen[s]) continue;
    const list = [s];
    seen[s] = 1;
    for (let h = 0; h < list.length; h++) {
      const k = list[h];
      for (let e = 0; e < 3; e++) {
        const a = T[3 * k + e], b = T[3 * k + (e + 1) % 3];
        const l = em.get(ek(a, b));
        if (l.length !== 4) continue;
        const dk = (a < b ? 1 : -1) * (flip[k] ? -1 : 1);
        for (let q = 0; q < 4; q += 2) {
          const k2 = l[q];
          if (k2 === k || seen[k2]) continue;
          seen[k2] = 1;
          flip[k2] = l[q + 1] !== -dk ? 1 : 0;
          list.push(k2);
        }
      }
    }
    comp.push(list);
  }
  for (const list of comp) {
    let vol = 0;
    for (const k of list) {
      const ia = T[3 * k], ib = flip[k] ? T[3 * k + 2] : T[3 * k + 1], ic = flip[k] ? T[3 * k + 1] : T[3 * k + 2];
      const ax = P[3 * ia], ay = P[3 * ia + 1], az = P[3 * ia + 2];
      const bx = P[3 * ib], by = P[3 * ib + 1], bz = P[3 * ib + 2];
      const cx = P[3 * ic], cy = P[3 * ic + 1], cz = P[3 * ic + 2];
      vol += ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx);
    }
    if (vol < 0) for (const k of list) flip[k] ^= 1;
  }
  const out = new Uint32Array(T.length);
  for (let k = 0; k < nt; k++) {
    out[3 * k] = T[3 * k];
    out[3 * k + 1] = flip[k] ? T[3 * k + 2] : T[3 * k + 1];
    out[3 * k + 2] = flip[k] ? T[3 * k + 1] : T[3 * k + 2];
  }
  return { P: Float64Array.from(P), T: out, bad, shells: comp.length };
}

function plainRaw(mb) { return { P: Float64Array.from(mb.p), T: Uint32Array.from(mb.t), bad: 0, shells: 0 }; }

function rawToGeo(raw, crease) {
  const n = raw.T.length;
  const pos = new Float32Array(n * 3);
  for (let k = 0; k < n; k++) {
    pos[3 * k] = raw.P[3 * raw.T[k]];
    pos[3 * k + 1] = raw.P[3 * raw.T[k] + 1];
    pos[3 * k + 2] = raw.P[3 * raw.T[k] + 2];
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return toCreasedNormals(g, crease);
}

function cutBores(geo, bores) {
  const csg = makeCsg();
  const n = geo.attributes.position.count;
  geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2));
  let b = csg.brush(geo);
  for (const q of bores) {
    const dir = q.dir.clone().normalize();
    const len = q.ext + q.depth;
    const cg = new THREE.CylinderGeometry(q.r, q.r, len, 24);
    cg.rotateY(Math.PI / 24);
    cg.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V3(0, 1, 0), dir));
    const mid = q.c.clone().addScaledVector(dir, (q.depth - q.ext) / 2);
    cg.translate(mid.x, mid.y, mid.z);
    b = csg.sub(b, cg);
  }
  const out = b.geometry.index ? b.geometry.toNonIndexed() : b.geometry;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(healTJunctions(out.attributes.position.array), 3));
  return toCreasedNormals(g, 0.7);
}

function healTJunctions(pos) {
  const TOL = 0.005;
  const cells = new Map();
  const P = [];
  let T = [];
  const cellKey = (i, j, k) => i + ',' + j + ',' + k;
  const weldPt = (x, y, z) => {
    const ci = Math.floor(x / TOL), cj = Math.floor(y / TOL), ck = Math.floor(z / TOL);
    for (let i = ci - 1; i <= ci + 1; i++) {
      for (let j = cj - 1; j <= cj + 1; j++) {
        for (let k = ck - 1; k <= ck + 1; k++) {
          const l = cells.get(cellKey(i, j, k));
          if (!l) continue;
          for (const id of l) {
            const dx = P[3 * id] - x, dy = P[3 * id + 1] - y, dz = P[3 * id + 2] - z;
            if (dx * dx + dy * dy + dz * dz < TOL * TOL) return id;
          }
        }
      }
    }
    const id = P.length / 3;
    P.push(x, y, z);
    const kk = cellKey(ci, cj, ck);
    if (!cells.has(kk)) cells.set(kk, []);
    cells.get(kk).push(id);
    return id;
  };
  for (let i = 0; i < pos.length; i += 3) T.push(weldPt(pos[i], pos[i + 1], pos[i + 2]));
  const CELL = 1.0;
  const grid = new Map();
  const gk = (i, j, k) => i + ',' + j + ',' + k;
  for (let v = 0; v < P.length / 3; v++) {
    const k = gk(Math.floor(P[3 * v] / CELL), Math.floor(P[3 * v + 1] / CELL), Math.floor(P[3 * v + 2] / CELL));
    let l = grid.get(k);
    if (!l) { l = []; grid.set(k, l); }
    l.push(v);
  }
  const onSeg = (a, b) => {
    const ax = P[3 * a], ay = P[3 * a + 1], az = P[3 * a + 2];
    const dx = P[3 * b] - ax, dy = P[3 * b + 1] - ay, dz = P[3 * b + 2] - az;
    const L2 = dx * dx + dy * dy + dz * dz;
    const found = [];
    const lo = [Math.min(ax, P[3 * b]), Math.min(ay, P[3 * b + 1]), Math.min(az, P[3 * b + 2])];
    const hi = [Math.max(ax, P[3 * b]), Math.max(ay, P[3 * b + 1]), Math.max(az, P[3 * b + 2])];
    for (let i = Math.floor((lo[0] - 0.01) / CELL); i <= Math.floor((hi[0] + 0.01) / CELL); i++) {
      for (let j = Math.floor((lo[1] - 0.01) / CELL); j <= Math.floor((hi[1] + 0.01) / CELL); j++) {
        for (let k = Math.floor((lo[2] - 0.01) / CELL); k <= Math.floor((hi[2] + 0.01) / CELL); k++) {
          const l = grid.get(gk(i, j, k));
          if (!l) continue;
          for (const v of l) {
            if (v === a || v === b) continue;
            const px = P[3 * v] - ax, py = P[3 * v + 1] - ay, pz = P[3 * v + 2] - az;
            const t = (px * dx + py * dy + pz * dz) / L2;
            if (t <= 1e-4 || t >= 1 - 1e-4) continue;
            const ex = px - dx * t, ey = py - dy * t, ez = pz - dz * t;
            if (ex * ex + ey * ey + ez * ez < 4e-5) found.push([t, v]);
          }
        }
      }
    }
    found.sort((m, n) => m[0] - n[0]);
    return found.map(f => f[1]);
  };
  for (let pass = 0; pass < 6; pass++) {
    const em = new Map();
    const ek = (a, b) => (a < b ? a + '_' + b : b + '_' + a);
    for (let k = 0; k < T.length; k += 3) {
      for (let e = 0; e < 3; e++) {
        const key2 = ek(T[k + e], T[k + (e + 1) % 3]);
        em.set(key2, (em.get(key2) || 0) + 1);
      }
    }
    const next = [];
    let changed = 0;
    for (let k = 0; k < T.length; k += 3) {
      let tri = [[T[k], T[k + 1], T[k + 2]]];
      for (let e = 0; e < 3; e++) {
        const a = T[k + e], b = T[k + (e + 1) % 3];
        if (em.get(ek(a, b)) !== 1) continue;
        const mids = onSeg(a, b);
        if (!mids.length) continue;
        const c = T[k + (e + 2) % 3];
        const chain = [a, ...mids, b];
        tri = [];
        for (let m = 0; m + 1 < chain.length; m++) tri.push([chain[m], chain[m + 1], c]);
        changed++;
        break;
      }
      for (const t of tri) next.push(t[0], t[1], t[2]);
    }
    T = next;
    if (!changed) break;
  }
  const seen = new Map();
  for (let k = 0; k < T.length; k += 3) {
    const a = T[k], b = T[k + 1], c = T[k + 2];
    if (a === b || b === c || a === c) continue;
    const m = Math.min(a, b, c), M = Math.max(a, b, c), mid = a + b + c - m - M;
    const kk = m + '_' + mid + '_' + M;
    const sgn = (a === m && b === mid) || (b === m && c === mid) || (c === m && a === mid) ? 1 : -1;
    const l = seen.get(kk);
    if (!l) seen.set(kk, { sgn, k });
    else if (l.sgn !== sgn) { l.dead = true; T[k] = T[k + 1] = T[k + 2] = -1; }
    else T[k] = T[k + 1] = T[k + 2] = -1;
  }
  for (const l of seen.values()) if (l.dead) T[l.k] = T[l.k + 1] = T[l.k + 2] = -1;
  T = T.filter(v => v >= 0);
  const out = new Float32Array(T.length * 3);
  for (let i = 0; i < T.length; i++) {
    out[3 * i] = P[3 * T[i]];
    out[3 * i + 1] = P[3 * T[i] + 1];
    out[3 * i + 2] = P[3 * T[i] + 2];
  }
  return out;
}

function geoVolume(geo) {
  const p = geo.attributes.position.array;
  let vol = 0;
  for (let i = 0; i < p.length; i += 9) {
    vol += p[i] * (p[i + 4] * p[i + 8] - p[i + 5] * p[i + 7]) - p[i + 1] * (p[i + 3] * p[i + 8] - p[i + 5] * p[i + 6]) + p[i + 2] * (p[i + 3] * p[i + 7] - p[i + 4] * p[i + 6]);
  }
  return Math.abs(vol / 6);
}

function interp(tab, d) {
  const last = tab.length - 1;
  let i = 0;
  while (i < last - 1 && d > tab[i + 1][0]) i++;
  const a = tab[i], b = tab[i + 1];
  const p = tab[Math.max(i - 1, 0)], n = tab[Math.min(i + 2, last)];
  const h = b[0] - a[0];
  const t = clamp((d - a[0]) / h, 0, 1);
  const t2 = t * t, t3 = t2 * t;
  const h00 = 2 * t3 - 3 * t2 + 1, h10 = t3 - 2 * t2 + t, h01 = -2 * t3 + 3 * t2, h11 = t3 - t2;
  const out = [];
  for (let k = 1; k < a.length; k++) {
    const m0 = (b[k] - p[k]) / (b[0] - p[0]);
    const m1 = (n[k] - a[k]) / (n[0] - a[0]);
    out.push(h00 * a[k] + h10 * h * m0 + h01 * b[k] + h11 * h * m1);
  }
  return out;
}

function sup(th, w, yt, yb, nt, nb) {
  const s = Math.sin(th), c = Math.cos(th);
  const e = 2 / (c >= 0 ? nt : nb);
  const yc = (yt + yb) / 2, hy = (yt - yb) / 2;
  return [w * Math.sign(s) * Math.pow(Math.abs(s), e), yc + hy * Math.sign(c) * Math.pow(Math.abs(c), e)];
}

const FIT = 0.012;
const AIM120_STATIONS = [9.85, 13.65];
const STAND_STATIONS = [10.45, 12.15];
const CANOPY_STATIONS = [4.6, 7.8];
const INTAKE_STATIONS = [8.0, 9.0];
const POD_STATIONS = [-12.5, -16.2];
const HOOK_STATION = 16.5;
const PEG_SLACK = 0.27;
const CFT_STATIONS = [10.9, 12.9, 14.9];
const CFT_TAB = [[9.5, 1.15, 2.0, -0.85, 0.05], [10.5, 1.15, 2.05, -0.92, 0.1], [13, 1.15, 2.05, -0.92, 0.12], [15, 1.15, 1.95, -0.88, 0.1], [16.0, 1.15, 1.6, -0.62, -0.05]];
function cftMidY(d) {
  const t = interp(CFT_TAB, d);
  return (t[2] + t[3]) / 2;
}
const SOCKET_EXTRA = 0.02;

const FUS_L = 17;
const STING = { K: 10, r: 0.09, y: -0.15, depth: 0.33, peg: 0.07, L: 0.3 };
const FUS = [
  [0, 0, 0, 0, 2, 2], [0.15, 0.13, -0.11, 0.12, 2.2, 2.2], [0.5, 0.28, -0.25, 0.27, 2.3, 2.3],
  [1.0, 0.41, -0.39, 0.42, 2.4, 2.4], [1.7, 0.52, -0.51, 0.58, 2.5, 2.5], [2.6, 0.59, -0.60, 0.69, 2.6, 2.7],
  [3.5, 0.63, -0.66, 0.79, 2.7, 2.9], [4.5, 0.66, -0.73, 0.88, 2.8, 3.0], [5.5, 0.70, -0.80, 0.99, 2.9, 3.2],
  [6.5, 0.72, -0.86, 1.14, 3.0, 3.4], [7.6, 0.74, -0.90, 1.27, 3.0, 3.6], [9, 0.74, -0.93, 1.34, 3.0, 3.6],
  [11, 0.74, -0.95, 1.40, 3.0, 3.6], [12.5, 0.72, -0.95, 1.40, 3.0, 3.6], [14, 0.68, -0.95, 1.40, 3.0, 3.6],
  [15.5, 0.62, -0.93, 1.38, 3.0, 3.6], [17, 0.55, -0.88, 1.32, 3.0, 3.4]
];

function hullBump(d, x) {
  const ax = Math.abs(x);
  return 0.1 * sm(d - 10.1, 0.15) * sm(12.3 - d, 0.15) * sm(0.55 - ax, 0.12)
    + 0.06 * sm(d - 6.5, 0.4) * sm(13.5 - d, 0.6) * sm(0.2 - ax, 0.1)
    + 0.07 * sm(d - 2.8, 0.15) * sm(3.6 - d, 0.1) * sm(0.45 - ax, 0.1);
}

function hullPt(d, th, side) {
  const [yt, yb, w, nt, nb] = interp(FUS, d);
  const vt = 0.55 * sm(d - 11.5, 2.5), vb = 0.3 * sm(d - 12.5, 2.0);
  let [x, y] = sup(th, w, yt, yb, nt, nb);
  if (th <= 1e-9 || th >= Math.PI - 1e-9) x = 0;
  const g = Math.exp(-((x / 0.45) ** 2));
  if (Math.cos(th) >= 0) y += hullBump(d, x) - vt * g; else y += vb * g;
  return V3(side * x, y, -d);
}

function hullNormal(d, th, side) {
  const e = 0.015, f = 0.012;
  const t0 = clamp(th, f, Math.PI - f);
  const a = hullPt(d + e, t0, side).sub(hullPt(d - e, t0, side));
  const b = hullPt(d, t0 + f, side).sub(hullPt(d, t0 - f, side));
  const n = a.cross(b).normalize();
  const [yt, yb] = interp(FUS, d);
  const p = hullPt(d, t0, side);
  if (n.dot(p.sub(V3(0, (yt + yb) / 2, -d))) < 0) n.negate();
  return n;
}

function ridge(mb, pts, nrm, w, h, closed) {
  const n = pts.length, rings = [];
  for (let i = 0; i < n; i++) {
    const a = pts[closed ? (i + n - 1) % n : Math.max(i - 1, 0)], b = pts[closed ? (i + 1) % n : Math.min(i + 1, n - 1)];
    const t = b.clone().sub(a).normalize();
    const nn = nrm[i];
    const bi = t.clone().cross(nn).normalize();
    const c = (k1, k2) => {
      const q = pts[i].clone().addScaledVector(bi, k1).addScaledVector(nn, k2);
      return mb.v(q.x, q.y, q.z);
    };
    rings.push([c(-w / 2, -0.06), c(w / 2, -0.06), c(w / 2, h), c(-w / 2, h)]);
  }
  skin(mb, rings, true);
  if (closed) strip(mb, rings[n - 1], rings[0], true);
  else { cap(mb, rings[0]); cap(mb, rings[n - 1]); }
}

const RW = 0.06, RH = 0.03;

function hullRidge(mb, side, path) {
  ridge(mb, path.map(([d, th]) => hullPt(d, th, side)), path.map(([d, th]) => hullNormal(d, th, side)), RW, RH, false);
}

function hullSideX(d, y) {
  let prev = hullPt(d, Math.PI, 1);
  for (let j = 119; j >= 0; j--) {
    const cur = hullPt(d, Math.PI * j / 120, 1);
    if (cur.y >= y && prev.y <= y) {
      const t = prev.y === cur.y ? 0 : (y - prev.y) / (cur.y - prev.y);
      return prev.x + (cur.x - prev.x) * t;
    }
    prev = cur;
  }
  return prev.x;
}

function hullTopY(d, x) {
  let best = Infinity, y = 0;
  for (let th = 0; th <= Math.PI / 2; th += 0.002) {
    const p = hullPt(d, th, 1);
    const e = Math.abs(p.x - x);
    if (e < best) { best = e; y = p.y; }
  }
  return y;
}

function bore(mb, c, dir, r, depth, ext = 0.6) {
  (mb.bores = mb.bores || []).push({ c: c.clone(), dir: dir.clone(), r, depth, ext });
}

function bellyY(d) {
  let best = Infinity, y = 0;
  for (let th = 0.6 * Math.PI; th <= Math.PI; th += 0.0005) {
    const p = hullPt(d, th, 1);
    const e = Math.abs(p.x - 0.25);
    if (e < best) { best = e; y = p.y; }
  }
  return y;
}

function fuselage(side) {
  const mb = new MB();
  const N = Math.round(240 * QUALITY), M = Math.round(60 * QUALITY);
  const rows = [];
  for (let i = 0; i < N; i++) {
    const d = FUS_L * i / (N - 1);
    const row = [];
    for (let j = 0; j <= M; j++) row.push(hullPt(d, Math.PI * j / M, side).toArray());
    rows.push(row);
  }
  const I = addGrid(mb, rows);
  skin(mb, I);
  for (const d of STAND_STATIONS) peg(mb, V3(side * 0.25, bellyY(d), -d), V3(0, -1, 0), 0.12, 0.312, 0.26);
  for (const d of CANOPY_STATIONS) {
    const b = canopyBase(d);
    bore(mb, V3(side * (b.w * b.f - 0.065), b.y, -d), V3(0, -1, 0), 0.06 + SOCKET_EXTRA, 0.3);
  }
  for (const d of INTAKE_STATIONS) {
    const [, , yb, yt] = interp(INT, d);
    const cy = (yb + yt) / 2;
    bore(mb, V3(side * hullSideX(d, cy), cy, -d), V3(-side, 0, 0), 0.06 + SOCKET_EXTRA, 0.3);
  }
  for (const d of CFT_STATIONS) {
    const cy = cftMidY(d);
    bore(mb, V3(side * hullSideX(d, cy), cy, -d), V3(-side, 0, 0), 0.07 + SOCKET_EXTRA, 0.3);
  }
  bore(mb, V3(0, hullPt(HOOK_STATION, Math.PI, 1).y, -HOOK_STATION), V3(0, 1, 0), 0.05 + SOCKET_EXTRA, 0.25, 0.5);
  const pinHoles = [2.6, 5.6, 8.6, 11.6, 14.6].map(d => ({ c: V3(0, (hullPt(d, 0, side).y + hullPt(d, Math.PI, side).y) / 2, -d), r: 0.12, depth: 0.274 }));
  const arc = [], deep = [];
  for (let k = 0; k <= STING.K; k++) {
    const ph = -Math.PI / 2 + Math.PI * k / STING.K;
    const x = k === 0 || k === STING.K ? 0 : side * STING.r * Math.cos(ph);
    const y = STING.y + STING.r * Math.sin(ph);
    arc.push(mb.v(x, y, -FUS_L));
    deep.push(mb.v(x, y, -FUS_L + STING.depth));
  }
  (mb.holes = mb.holes || []).push({ c: V3(0, STING.y, -FUS_L), dir: V3(0, 0, 1), r: STING.r, depth: STING.depth });
  drillFace(mb, I.map(r => r[0]).concat([arc[STING.K], deep[STING.K], deep[0], arc[0]], I.map(r => r[M]).slice(1).reverse()), pinHoles, V3(side, 0, 0));
  strip(mb, arc, deep);
  cap(mb, deep);
  drillFace(mb, I[N - 1].concat(arc), [-0.22, 0.22].map(dy => ({ c: V3(side * 0.3, -0.17 + dy, -17.0), r: 0.085, depth: 0.304 })), V3(0, 0, 1));
  for (const d of [1.3, 2.45, 13.6, 15.4]) hullRidge(mb, side, range(0, Math.PI, 36).map(t => [d, t]));
  {
    const ths = range(0, Math.PI, 360);
    const above = ths.filter(t => hullPt(9.9, t, side).y > 0.75);
    const below = ths.filter(t => hullPt(9.9, t, side).y < 0.0);
    hullRidge(mb, side, above.filter((t, i) => i % 5 === 0).map(t => [9.9, t]));
    hullRidge(mb, side, below.filter((t, i) => i % 5 === 0).map(t => [9.9, t]));
  }
  const longi = (th, d0, d1) => hullRidge(mb, side, range(d0, d1, Math.round((d1 - d0) / 0.12)).map(d => [d, th]));
  longi(0.16 * Math.PI, 2.9, 3.3);
  longi(0.62 * Math.PI, 3.0, 5.2);
  longi(0.5 * Math.PI, 13.7, 16.8);
  longi(0.3 * Math.PI, 13.7, 16.8);
  longi(0.75 * Math.PI, 10.5, 16.5);
  if (side > 0) prism(mb, [[9.7, 0.7], [10.0, 0.7], [9.62, 1.15], [9.5, 1.15]], 0.08, (u, v, w) => [0.05 + w, v, -u]);
  else prism(mb, [[5.5, -0.78], [5.85, -0.78], [5.65, -1.12], [5.45, -1.12]], 0.08, (u, v, w) => [-0.05 + w, v, -u]);
  return mb;
}

const INT = [[5.4, 0.95, 2.05, -0.62, 0.55], [6.4, 0.95, 2.2, -0.74, 0.45], [7.8, 0.95, 2.3, -0.86, 0.20], [9.6, 1.0, 2.3, -0.92, -0.05]];

function intake(side) {
  const mb = new MB();
  const M = 48;
  const tilt = d => 0.35 * Math.max(0, 1 - (d - 5.4) / 1.6);
  const ringAt = (d, xin, xout, yb, yt) => {
    const cx = (xin + xout) / 2, hx = (xout - xin) / 2, cy = (yt + yb) / 2, hy = (yt - yb) / 2;
    const r = [];
    for (let j = 0; j < M; j++) {
      const th = 2 * Math.PI * j / M;
      const s = Math.sin(th), c = Math.cos(th);
      const x = cx + hx * Math.sign(s) * Math.pow(Math.abs(s), 0.4);
      const y = cy + hy * Math.sign(c) * Math.pow(Math.abs(c), 0.4);
      r.push([side * x, y, -(d + tilt(d) * (0.55 - y))]);
    }
    return r;
  };
  const outer = [], inner = [];
  for (let k = 0; k <= 30; k++) {
    const d = 5.4 + 4.2 * k / 30;
    const [, xout, yb, yt] = interp(INT, d);
    outer.push(ringAt(d, interp(FUS, d)[2] + 0.02, xout, yb, yt));
  }
  for (let k = 0; k <= 15; k++) {
    const d = 5.4 + 2.2 * k / 15;
    const [, xout, yb, yt] = interp(INT, d);
    inner.push(ringAt(d, interp(FUS, d)[2] + 0.14, xout - 0.1, yb + 0.1, yt - 0.1));
  }
  const O = addGrid(mb, outer), C = addGrid(mb, inner);
  skin(mb, O, true);
  cap(mb, O[O.length - 1]);
  strip(mb, O[0], C[0], true);
  skin(mb, C, true);
  cap(mb, C[C.length - 1]);
  for (const d of INTAKE_STATIONS) {
    const [, , yb, yt] = interp(INT, d);
    const cy = (yb + yt) / 2;
    const xin = interp(FUS, d)[2] + 0.02;
    peg(mb, V3(side * xin, cy, -d), V3(-side, 0, 0), 0.06, xin - hullSideX(d, cy) + PEG_SLACK, 0.08);
  }
  for (const zl of POD_STATIONS) {
    const d = 6.2 - zl / S;
    bore(mb, V3(side * 1.75, interp(INT, d)[2], -d), V3(0, 1, 0), 0.0684, 0.24);
  }
  return mb;
}

function surfSolid(mb, o) {
  const nu = o.nu || 28;
  const sym = o.sym || 0;
  const P = [], Q = [];
  for (const a of o.as) {
    const l = o.le(a), t = o.te(a), c = Math.max(t - l, 0);
    const rp = [], rq = [];
    for (let j = 0; j <= nu; j++) {
      const u = 0.5 - 0.5 * Math.cos(Math.PI * j / nu);
      const d = l + u * c;
      const T = o.thick(a, c) * Math.pow(4 * u * (1 - u), 0.55) + (o.minT || 0.07);
      rp.push(o.map(a, d, T * (1 - sym)));
      rq.push(o.map(a, d, -T * sym));
    }
    P.push(rp);
    Q.push(rq);
  }
  thickSurface(mb, P, Q, o.hb, o.hr);
  return (a, d) => {
    const l = o.le(a), c = Math.max(o.te(a) - l, 1e-6);
    const u = clamp((d - l) / c, 0, 1);
    const T = o.thick(a, c) * Math.pow(4 * u * (1 - u), 0.55) + (o.minT || 0.07);
    return V3(...o.map(a, d, T * (1 - sym)));
  };
}

function surfRidge(mb, top, nrm, pairs, w = RW, h = RH) {
  const pts = pairs.map(([a, d]) => top(a, d));
  ridge(mb, pts, pts.map(() => nrm), w, h, false);
}

function surfPatch(mb, top, xa, xb, dA, dB, h, nx, nu) {
  const P = [], Q = [];
  for (let i = 0; i <= nx; i++) {
    const x = xa + (xb - xa) * i / nx;
    const d0 = dA(x), d1 = dB(x);
    const rp = [], rq = [];
    for (let j = 0; j <= nu; j++) {
      const p = top(x, d0 + (d1 - d0) * j / nu);
      rp.push([p.x, p.y + h, p.z]);
      rq.push([p.x, p.y - 0.03, p.z]);
    }
    P.push(rp);
    Q.push(rq);
  }
  thickSurface(mb, P, Q);
}

function spanLine(as, dfn) { return as.map(a => [a, dfn(a)]); }

function chordLine(a, d0, d1) { return range(d0, d1, 6).map(d => [a, d]); }

function range(a, b, n) {
  const r = [];
  for (let i = 0; i <= n; i++) r.push(a + (b - a) * i / n);
  return r;
}

function wing(side) {
  const mb = new MB();
  const X0 = 1.15, XR = 1.45, XT = 5.45;
  const rnd = (x, a, w) => Math.pow(Math.max(0, (x - a) / w), 2);
  const le = x => 7.58 + 1.12 * (x - X0) + 0.1 * rnd(x, 5.25, 0.2);
  const te = x => 13.55 - 0.05 * (x - X0) - 0.22 * rnd(x, 5.2, 0.25);
  const as = range(XR, 5.2, 16).concat(range(5.2, XT, 7).slice(1));
  const top = surfSolid(mb, {
    as, le, te, nu: 30, minT: 0.08,
    hb: {
      dir: V3(0, 1, 0),
      holes: [[1.74, 10.6, 0.09, 0.224], [1.74, 12.4, 0.09, 0.224], [3.1, 11.4, 0.08, 0.174], [3.1, 12.3, 0.08, 0.174]].map(([x, d, r, depth]) => ({ c: V3(side * x, 0.15, -d), r, depth }))
    },
    thick: (x, c) => c * (0.062 - 0.026 * (x - X0) / 4.3) * (0.4 + 0.6 * sm(XT - x, 0.3)),
    map: (x, d, t) => {
      const k = Math.max(0, 1 - (x - XR) / 0.5);
      const sh = k > 0 ? XR - (hullSideX(d, 0.15 + t) + FIT + 0.065) : 0;
      return [side * (x - sh * k), 0.15 + t, -d];
    }
  });
  const up = V3(0, 1, 0);
  const lePan = x => le(x) + Math.min(0.5, 0.4 * (te(x) - le(x)));
  const hinge = x => te(x) - 0.9;
  const bayA = x => le(x) + 0.56;
  const bayB = x => hinge(x) - 0.06;
  const teIn = x => te(x) - 0.05;
  const at = (x, d) => top(x, d);

  surfPatch(mb, top, 2.1, 5.35, le, lePan, 0.03, 30, 3);
  surfPatch(mb, top, 2.1, 2.95, bayA, bayB, 0.03, 6, 6);
  surfPatch(mb, top, 3.25, 4.0, bayA, bayB, 0.03, 6, 6);
  surfPatch(mb, top, 4.05, 4.62, bayA, bayB, 0.03, 5, 4);
  surfPatch(mb, top, 2.1, 3.8, hinge, teIn, 0.03, 14, 4);
  surfPatch(mb, top, 3.85, 5.1, hinge, teIn, 0.03, 11, 4);

  surfRidge(mb, top, up, spanLine(range(2.1, 5.35, 34), lePan));
  surfRidge(mb, top, up, spanLine(range(2.1, 5.1, 28), hinge), 0.06, 0.03);
  for (const xs of [2.1, 3.825, 5.1]) surfRidge(mb, top, up, chordLine(xs, hinge(xs), teIn(xs)), 0.06, 0.03);
  for (const xr of [2.45, 2.8, 3.15, 3.5, 4.1, 4.4, 4.7]) surfRidge(mb, top, up, chordLine(xr, hinge(xr) + 0.06, teIn(xr) - 0.04), 0.06, 0.026);
  surfRidge(mb, top, up, chordLine(5.38, le(5.38) + 0.12, te(5.38) - 0.1), 0.06, 0.03);
  surfRidge(mb, top, up, spanLine(range(2.1, 4.6, 22), x => le(x) + 1.0), 0.06, 0.026);

  for (let x = 2.2; x <= 5.1; x += 0.2) {
    const p = at(x, le(x) + 0.25);
    cyl(mb, V3(p.x, p.y - 0.02, p.z), V3(p.x, p.y + 0.032 + 0.03, p.z), 0.045, 0.04, 8);
  }
  for (let x = 2.3; x <= 5.0; x += 0.25) {
    const p = at(x, hinge(x) - 0.12);
    cyl(mb, V3(p.x, p.y - 0.02, p.z), V3(p.x, p.y + 0.05, p.z), 0.045, 0.04, 8);
  }
  for (const [x, f] of [[2.55, 1.1], [3.6, 1.3], [4.25, 0.95]]) {
    const p = at(x, le(x) + f);
    cyl(mb, V3(p.x, p.y - 0.03, p.z), V3(p.x, p.y + 0.06, p.z), 0.12, 0.11, 16);
  }
  for (const x of [2.55, 3.45, 4.2]) {
    const p = at(x, hinge(x) + 0.05);
    ellipsoid(mb, V3(p.x, p.y + 0.005, p.z), 0.07, 0.04, 0.3, 14);
  }
  for (const [x, f0, f1] of [[2.15, 0.8, 1.2], [3.3, 0.7, 1.05], [4.1, 0.7, 1.0]]) {
    surfPatch(mb, top, x, x + 0.23, xx => le(xx) + f0, xx => le(xx) + f1, 0.04, 3, 3);
  }
  prism(mb, [[le(5.36) + 0.12, 0.17], [le(5.36) + 0.2, 0.25], [te(5.36) - 0.25, 0.25], [te(5.36) - 0.05, 0.17]], 0.12, (u, v, w) => [side * 5.36 + w, v, -u]);
  return mb;
}

function stabilator(side) {
  const mb = new MB();
  const le = a => (a <= 2.7 ? 13.6 + 0.8 * a : 15.76 + (a - 2.7) * 2.4);
  const te = a => 17.2 + 0.1 * a;
  const AR = 0.83;
  const stabY = d => {
    const c = te(AR) - le(AR), u = (d - le(AR)) / c;
    return -0.2 - 0.05 * AR + (c * 0.09 * Math.pow(4 * u * (1 - u), 0.55) + 0.07) / 2;
  };
  const top = surfSolid(mb, {
    as: range(AR, 2.7, 10).concat(range(2.7, 3.3, 5).slice(1)), le, te, minT: 0.07,
    hr: { dir: V3(side, 0, 0), holes: [14.9, 15.5].map(d => ({ c: V3(side * (1.15 + AR), stabY(d), -d), r: 0.075, depth: 0.224 })) },
    thick: (a, c) => c * 0.09,
    map: (a, d, t) => [side * (1.15 + a), -0.2 + t - 0.05 * a, -d]
  });
  const up = V3(0, 1, 0);
  const lePan = a => le(a) + Math.min(0.42, 0.4 * (te(a) - le(a)));
  const hinge = a => te(a) - 0.75;
  surfPatch(mb, top, 1.0, 3.0, le, lePan, 0.03, 12, 3);
  surfPatch(mb, top, 1.0, 2.9, hinge, a => te(a) - 0.04, 0.03, 12, 3);
  surfRidge(mb, top, up, spanLine(range(1.0, 3.0, 16), lePan));
  surfRidge(mb, top, up, spanLine(range(1.0, 2.9, 16), hinge), 0.06, 0.03);
  surfRidge(mb, top, up, spanLine(range(1.0, 2.8, 16), a => le(a) + 0.42 * (te(a) - le(a)) + 0.3), 0.06, 0.026);
  for (const a of [1.0, 1.5, 1.9, 2.9]) surfRidge(mb, top, up, chordLine(a, hinge(a), te(a) - 0.04), 0.06, 0.03);
  for (let a = 1.1; a <= 2.8; a += 0.22) {
    const p = top(a, le(a) + 0.2);
    cyl(mb, V3(p.x, p.y - 0.02, p.z), V3(p.x, p.y + 0.05, p.z), 0.045, 0.04, 8);
  }
  return mb;
}

function fin(side) {
  const mb = new MB();
  const as = range(-0.22, 3.25, 16);
  const le = a => 13.8 + 0.7 * a;
  const te = a => 17.5 - 0.04 * a;
  const top = surfSolid(mb, {
    as, le, te,
    hr: { dir: V3(0, 1, 0), holes: [14.6, 15.3].map(d => ({ c: V3(side * 1.74, 0.35 - 0.22, -d), r: 0.08, depth: 0.284 })) },
    thick: (a, c) => c * 0.06,
    map: (a, d, t) => [side * (1.62 + 0.05 * a + t), 0.35 + a, -d]
  });
  const out = V3(side, 0, 0);
  surfRidge(mb, top, out, spanLine(range(0.5, 3.05, 20), a => te(a) - 1.3));
  surfRidge(mb, top, out, chordLine(0.5, te(0.5) - 1.3, te(0.5)));
  surfRidge(mb, top, out, chordLine(3.05, te(3.05) - 1.3, te(3.05)));
  surfRidge(mb, top, out, spanLine(range(0.6, 2.7, 14), a => le(a) + 0.5));
  {
    const dL = le(3.25), dR = te(3.25);
    prism(mb, [[dL + 0.15, 3.5], [dL + 0.12, 3.62], [dL + 0.45, 3.72], [dR - 0.3, 3.72], [dR - 0.05, 3.62], [dR, 3.5]], 0.2, (u, v, w) => [side * 1.81 + w, v, -u]);
  }
  return mb;
}

const CAN = [[3.4, 0.05, 0.12], [3.7, 0.22, 0.26], [4.1, 0.5, 0.42], [4.6, 0.82, 0.52], [5.2, 0.98, 0.54], [6.2, 1.0, 0.54], [7.0, 0.98, 0.52], [7.8, 0.84, 0.46], [8.5, 0.52, 0.36], [9.1, 0.26, 0.26], [9.6, 0.1, 0.15]];

const canopyBw = (d, a, b) => sm(d - a, 0.03) * sm(b - d, 0.03);

function canopyBase(d) {
  const w = interp(CAN, d)[1];
  const f = 1 + 0.07 * (canopyBw(d, 3.95, 4.15) + canopyBw(d, 4.85, 5.05) + canopyBw(d, 6.5, 6.65) + canopyBw(d, 8.15, 8.3));
  return { w, f, y: hullTopY(d, w * f) + FIT };
}

function canopy() {
  const mb = new MB();
  const M = 40, K = 90;
  const P = [], Q = [];
  for (let i = 0; i <= K; i++) {
    const d = 3.4 + 6.2 * i / K;
    const h = interp(CAN, d)[0] * 0.9;
    const base = canopyBase(d);
    const w = base.w, f = base.f, Y0 = base.y;
    const rp = [], rq = [];
    for (let j = 0; j <= M; j++) {
      const ph = Math.PI * j / M;
      const c = Math.cos(ph), s = Math.sin(ph);
      const x = w * Math.sign(c) * Math.pow(Math.abs(c), 0.83) * f;
      const y = Y0 + h * Math.pow(Math.abs(s), 0.83) * f;
      const len = Math.hypot(x, y - Y0);
      const t = Math.min(0.13, 0.4 * len);
      rp.push([x, y, -d]);
      rq.push(len > 1e-6 ? [x - x / len * t, y - (y - Y0) / len * t, -d] : [x, y, -d]);
    }
    P.push(rp);
    Q.push(rq);
  }
  thickSurface(mb, P, Q);
  return mb;
}

function nozzle(side) {
  const mb = new MB();
  const prof = [[0, 0], [0.62, 0], [0.62, 0.55], [0.60, 1.0], [0.65, 1.12], [0.64, 1.3], [0.60, 1.5], [0.58, 1.75], [0.60, 2.05], [0.63, 2.43],
    [0.54, 2.43], [0.50, 2.1], [0.46, 1.85], [0.47, 1.6], [0.3, 1.6], [0.22, 1.85], [0.1, 2.0], [0, 2.05]];
  const xf = new THREE.Matrix4().makeRotationY(Math.PI);
  xf.setPosition(side * 0.75, -0.17, -17.0);
  revolve(mb, prof, 96, xf, (r, a, ph) => {
    if (a > 1.3 && r > 0.57) return r * (1 + 0.06 * Math.max(0, Math.cos(16 * ph)));
    if (a > 1.8 && r > 0.45 && r < 0.56) return r * (1 - 0.06 * Math.max(0, Math.cos(16 * ph)));
    return r;
  });
  return mb;
}

function stinger() {
  const mb = new MB();
  const prof = [[0, 0], [0.12, 0], [0.11, 0.7], [0.09, 1.3], [0.12, 1.55], [0.08, 1.8], [0, 1.95]];
  const xf = new THREE.Matrix4().makeRotationY(Math.PI);
  xf.setPosition(0, -0.15, -17.0);
  revolve(mb, prof, 24, xf);
  peg(mb, V3(0, STING.y, -FUS_L), V3(0, 0, 1), STING.peg, STING.L, 0.06);
  return mb;
}

function plate(poly, th, x0) {
  const mb = new MB();
  prism(mb, poly, th, (u, v, w) => [x0 + w, v, -u]);
  return mb;
}

function wheel(R, W, sgn, center, rh) {
  const mb = new MB();
  const h = W / 2;
  const prof = [[rh, -h], [R * 0.88, -h], [R, -W * 0.36], [R, W * 0.36], [R * 0.88, h], [R * 0.6, h], [R * 0.6, h - 0.05], [rh * 2, h - 0.05], [rh * 2, h + 0.02], [rh, h + 0.02]];
  const xf = new THREE.Matrix4().makeRotationY(sgn * Math.PI / 2);
  xf.setPosition(center.x, center.y, center.z);
  revolve(mb, prof, 40, xf);
  return mb;
}

function fins(mb, poly, th, alphas) {
  for (const al of alphas) {
    prism(mb, poly, th, (q, z, w) => [q * Math.cos(al) - w * Math.sin(al), q * Math.sin(al) + w * Math.cos(al), z]);
  }
}

const X4 = [1, 3, 5, 7].map(k => k * Math.PI / 4);

function lugs(mb, r, zs) {
  for (const z of zs) cyl(mb, V3(0, r - 0.2, z), V3(0, r + 0.5, z), 0.4, 0.4, 8);
}

function aim120() {
  const mb = new MB();
  const L = 30;
  for (const z of [-4.9, -8.0]) peg(mb, V3(0, 0.95, z), V3(0, 1, 0), 0.45, 2.2, 1.2);
  revolve(mb, [[0, 0], [0.25, -0.4], [0.62, -1.3], [0.86, -2.4], [0.95, -3.6], [0.95, -8.8], [1.02, -8.8], [1.02, -9.3], [0.95, -9.3], [0.95, -15.6], [1.0, -15.6], [1.0, -16.0], [0.95, -16.0],
    [0.95, -L + 7], [0.9, -L + 2], [0.8, -L], [0, -L]], 28, new THREE.Matrix4());
  fins(mb, [[0.7, -15.0], [2.5, -16.6], [2.5, -19.2], [0.7, -19.2]], 0.8, X4);
  fins(mb, [[0.7, -L + 7.2], [3.7, -L + 3.4], [3.7, -L + 0.6], [0.7, -L + 0.6]], 0.8, X4);
  return mb;
}

function aim9() {
  const mb = new MB();
  const L = 23.7;
  for (const z of [-8.5, -16]) peg(mb, V3(0, 1.05, z), V3(0, 1, 0), 0.45, 2.2, 1.2);
  revolve(mb, [[0, 0], [0.35, -0.4], [0.75, -1.1], [0.98, -2.2], [1.05, -3.4], [1.05, -9], [1.1, -9], [1.1, -9.5], [1.05, -9.5], [1.05, -L + 6], [0.95, -L + 1], [0.85, -L], [0, -L]], 28, new THREE.Matrix4());
  fins(mb, [[0.8, -3.6], [2.6, -4.9], [2.6, -6.0], [0.8, -6.4]], 0.8, X4);
  fins(mb, [[0.8, -L + 5.6], [3.5, -L + 3.0], [3.5, -L + 0.4], [0.8, -L + 0.4]], 0.8, X4);
  return mb;
}

function lantirn(target) {
  const mb = new MB();
  const L = 25;
  const prof = target
    ? [[0, 0], [0.8, -0.4], [1.2, -1.4], [1.2, -3.0], [1.5, -3.2], [1.5, -9.5], [1.58, -9.5], [1.58, -10], [1.5, -10], [1.5, -L + 6], [1.25, -L + 2], [0.9, -L], [0, -L]]
    : [[0, 0], [0.5, -0.4], [1.0, -1.4], [1.4, -3.0], [1.5, -5], [1.5, -L + 6], [1.25, -L + 2], [0.9, -L], [0, -L]];
  revolve(mb, prof, 28, new THREE.Matrix4());
  if (target) ellipsoid(mb, V3(0, -0.1, -0.5), 1.05, 1.05, 1.2, 16);
  prism(mb, [[-5, 1.0], [-L + 5, 1.0], [-L + 7, 3.0], [-7, 3.0]], 1.4, (u, v, w) => [w, v, u]);
  return mb;
}

function cft(side) {
  const mb = new MB();
  const tab = CFT_TAB;
  const M = 44;
  const rings = [];
  for (let k = 0; k <= 36; k++) {
    const d = 9.75 + 6.25 * k / 36;
    const [, xout, yb, yt] = interp(tab, d);
    const xin = interp(FUS, d)[2] + 0.02;
    const cx = (xin + xout) / 2, hx = (xout - xin) / 2, cy = (yt + yb) / 2, hy = (yt - yb) / 2;
    const r = [];
    for (let j = 0; j < M; j++) {
      const th = 2 * Math.PI * j / M;
      const s = Math.sin(th), c = Math.cos(th);
      r.push([side * (cx + hx * Math.sign(s) * Math.pow(Math.abs(s), 0.55)), cy + hy * Math.sign(c) * Math.pow(Math.abs(c), 0.55), -d]);
    }
    rings.push(r);
  }
  const I = addGrid(mb, rings);
  skin(mb, I, true);
  cap(mb, I[0]);
  cap(mb, I[I.length - 1]);
  return mb;
}

function fuelTank() {
  const mb = new MB();
  const L = 38.3;
  revolve(mb, [[0, 0], [1.2, -1.0], [2.4, -3.0], [3.4, -6.5], [3.9, -12], [3.9, -17], [4.0, -17], [4.0, -17.6], [3.9, -17.6], [3.9, -L + 12], [3.4, -L + 6], [2.2, -L + 2.5], [0.8, -L + 0.4], [0, -L]], 40, new THREE.Matrix4());
  fins(mb, [[1.5, -L + 8], [5.9, -L + 3.5], [5.9, -L + 0.4], [1.5, -L + 0.4]], 0.7, X4);
  return mb;
}

function makeParts() {
  const out = [];
  const add = (name, group, mb, down, o = {}) => {
    if (!o.mm) scaleMB(mb, S);
    if (o.flat) flatten(mb, down, o.flat);
    const k = o.mm ? 1 : S;
    const sc = q => ({ ...q, c: q.c.clone().multiplyScalar(k), r: q.r * k, L: q.L === undefined ? undefined : q.L * k, depth: q.depth === undefined ? undefined : q.depth * k, ext: q.ext === undefined ? undefined : q.ext * k });
    const pegs = (mb.pegs || []).map(sc), holes = (mb.holes || []).map(sc), bores = (mb.bores || []).map(sc);
    let dn = down;
    if (!o.stand) {
      const v = V3(0, 0, 0);
      for (let i = 0; i < mb.p.length; i += 3) {
        v.set(mb.p[i], mb.p[i + 1], mb.p[i + 2]).sub(PIVOT).applyQuaternion(QTILT).add(PIVOT);
        mb.p[i] = v.x;
        mb.p[i + 1] = v.y;
        mb.p[i + 2] = v.z;
      }
      for (const q of pegs.concat(holes, bores)) {
        q.c = tiltPt(q.c);
        q.dir = q.dir.clone().applyQuaternion(QTILT);
      }
      dn = down.clone().applyQuaternion(QTILT);
    }
    out.push({ name, group, mb, down: dn, web: !!o.web, pegs, holes, bores });
  };
  const D = V3;
  for (const s of [1, -1]) {
    const k = s > 0 ? 'L' : 'R';
    add('Fuselage half ' + k, 'Fuselage', fuselage(s), D(-s, 0, 0));
    add('Air intake ' + k, 'Intakes', intake(s), D(s, 0, 0));
    add('Wing ' + k, 'Wings & tail', wing(s), D(0, -1, 0));
    add('Stabilator ' + k, 'Wings & tail', stabilator(s), D(0, -1, 0));
    add('Vertical fin ' + k, 'Wings & tail', fin(s), D(-s, 0, 0));
    add('Engine nozzle ' + k, 'Engines', (() => {
      const nz = nozzle(s);
      for (const dy of [-0.22, 0.22]) peg(nz, V3(s * 0.3, -0.17 + dy, -17.0), V3(0, 0, 1), 0.065, 0.28, 0.1);
      return nz;
    })(), D(0, -1, 0), { flat: 0.9 });
    add('Conformal fuel tank ' + k, 'Conformal tanks', (() => {
      const cm = cft(s);
      for (const dn of AIM120_STATIONS) solidBox(cm, Math.min(s * 1.59, s * 1.89), Math.max(s * 1.59, s * 1.89), -1.55, -0.85, -(dn + 1.12), -(dn + 0.428), [], [dn + 0.588, dn + 0.96].map(d => ({ c: V3(s * 1.74, -1.55, -d), r: 0.078, depth: 0.288 })));
      const pad = (xa, xb, y0, y1, d0, d1) => solidBox(cm, Math.min(s * xa, s * xb), Math.max(s * xa, s * xb), y0, y1, -d1, -d0, [], []);
      for (const d of [10.6, 12.4]) pad(1.57, 1.91, -0.3, 0.15 - FIT, d - 0.17, d + 0.17);
      for (const d of [14.6, 15.3]) pad(1.57, 1.91, -0.4, 0.13 - FIT, d - 0.17, d + 0.17);
      pad(1.5, 1.98 - FIT, -0.3, 0.1, 14.65, 15.75);
      for (const d of [10.6, 12.4]) peg(cm, V3(s * 1.74, 0.15, -d), V3(0, 1, 0), 0.07, 0.2, 0.3);
      for (const d of [14.6, 15.3]) peg(cm, V3(s * 1.74, 0.13, -d), V3(0, 1, 0), 0.06, 0.26, 0.25);
      for (const d of [14.9, 15.5]) {
        const y = -0.2 - 0.05 * 0.83 + (3.02 * 0.09 * Math.pow(4 * ((d - 14.26) / 3.02) * (1 - (d - 14.26) / 3.02), 0.55) + 0.07) / 2;
        peg(cm, V3(s * 1.98, y, -d), V3(s, 0, 0), 0.055, 0.2, 0.5);
      }
      for (const d of CFT_STATIONS) {
        const cy = cftMidY(d);
        const xin = interp(FUS, d)[2] + 0.02;
        peg(cm, V3(s * xin, cy, -d), V3(-s, 0, 0), 0.07, xin - hullSideX(d, cy) + PEG_SLACK, 0.08);
      }
      return cm;
    })(), D(s, 0, 0), { flat: 0.6 });
  }
  [2.6, 5.6, 8.6, 11.6, 14.6].forEach((d, n) => {
    const pm = new MB();
    const prof = [[0, 0], [0.07, 0], [0.1, 0.05], [0.1, 0.45], [0.07, 0.5], [0, 0.5]];
    const y = (hullPt(d, 0, 1).y + hullPt(d, Math.PI, 1).y) / 2;
    const xf = new THREE.Matrix4().makeRotationY(Math.PI / 2);
    xf.setPosition(-0.25, y, -d);
    revolve(pm, prof, 16, xf);
    pm.pegs = [{ c: V3(0, y, -d), dir: V3(1, 0, 0), r: 0.1, L: 0.25 }, { c: V3(0, y, -d), dir: V3(-1, 0, 0), r: 0.1, L: 0.25 }];
    add('Alignment pin ' + (n + 1), 'Pins', pm, D(0, -1, 0), { flat: 0.25 });
  });
  {
    const cm = canopy();
    for (const d of CANOPY_STATIONS) {
      const b = canopyBase(d);
      for (const sx of [-1, 1]) peg(cm, V3(sx * (b.w * b.f - 0.065), b.y, -d), V3(0, -1, 0), 0.06, PEG_SLACK, 0.05);
    }
    add('Canopy', 'Cockpit', cm, D(0, -1, 0));
  }
  {
    const hy = d => hullPt(d, Math.PI, 1).y - FIT;
    const y0 = hy(16.3), y1 = hy(17.0);
    const hook = plate([[16.3, y0], [17.0, y1], [18.5, -0.88], [18.4, -0.97], [17.0, y1 - 0.12], [16.3, y0 - 0.12]], 0.14, 0);
    const t = (HOOK_STATION - 16.3) / 0.7;
    peg(hook, V3(0, y0 + (y1 - y0) * t, -HOOK_STATION), V3(0, 1, 0), 0.05, FIT + 0.23, 0.05);
    add('Arrestor hook', 'Engines', hook, D(-1, 0, 0));
  }
  add('Tail stinger', 'Engines', stinger(), D(0, -1, 0), { flat: 0.4 });
  add('Nose gear leg', 'Landing gear', (() => {
    const mb = new MB();
    cyl(mb, V3(0, -0.7, -3.9), V3(0, -1.75, -3.9), 0.09, 0.08, 16);
    cyl(mb, V3(-0.3, -1.75, -3.9), V3(0.3, -1.75, -3.9), 0.055, 0.055, 12);
    box(mb, -0.07, 0.07, -1.2, -0.7, -4.25, -3.9);
    return mb;
  })(), D(0, -1, 0), { flat: 0.5 });
  for (const s of [1, -1]) {
    const k = s > 0 ? 'L' : 'R';
    add('Main gear leg ' + k, 'Landing gear', (() => {
      const mb = new MB();
      cyl(mb, V3(s * 0.95, -0.86, -12.0), V3(s * 0.88, -1.59, -12.0), 0.1, 0.09, 16);
      cyl(mb, V3(s * 0.8, -1.59, -12.0), V3(s * 1.36, -1.59, -12.0), 0.065, 0.065, 12);
      cyl(mb, V3(s * 0.55, -0.97, -12.0), V3(s * 0.88, -1.2, -12.0), 0.06, 0.06, 10);
      return mb;
    })(), D(0, -1, 0), { flat: 0.5 });
    add('Main wheel ' + k, 'Landing gear', wheel(0.46, 0.3, s, V3(s * 1.13, -1.59, -12.0), 0.09), D(-s, 0, 0));
    add('Nose wheel ' + k, 'Landing gear', wheel(0.3, 0.17, s, V3(s * 0.2, -1.75, -3.9), 0.075), D(-s, 0, 0));
    add('Wing pylon ' + k, 'Pylons', (() => {
      const pm = new MB();
      solidBox(pm, s * 3.1 - 0.22, s * 3.1 + 0.22, -0.45, 0.15 - FIT, -12.55, -11.15, [], [11.42, 12.32].map(d => ({ c: V3(s * 3.1, -0.45, -d), r: 0.078, depth: 0.288 })));
      for (const d of [11.4, 12.3]) peg(pm, V3(s * 3.1, 0.15, -d), V3(0, 1, 0), 0.06, 0.15, 0.1);
      return pm;
    })(), D(-1, 0, 0));
    {
      const mb = aim9();
      moveMB(mb, s * 3.1 * S, -0.45 * S - 1.05, -10.4 * S);
      add('AIM-9X ' + k, 'AIM-9X', mb, D(0, -1, 0), { mm: true, web: true });
    }
    for (const dn of AIM120_STATIONS) {
      const mb = aim120();
      moveMB(mb, s * 1.74 * S, -1.55 * S - 0.95, -dn * S);
      add('AIM-120 ' + k + (dn < 11 ? ' fwd' : ' aft'), 'AIM-120', mb, D(0, -1, 0), { mm: true, web: true });
    }
    {
      const mb = lantirn(s < 0);
      for (const zl of POD_STATIONS) {
        const yb = interp(INT, 6.2 - zl / S)[2];
        peg(mb, V3(0, 3.0, zl), V3(0, 1, 0), 0.4, (yb + 0.92) * S + 1.75, 0.6);
      }
      moveMB(mb, s * 1.75 * S, -0.92 * S - 3.0, -6.2 * S);
      add(s < 0 ? 'AN/AAQ-13 navigation pod' : 'AN/AAQ-14 targeting pod', 'Pods', mb, D(0, -1, 0), { mm: true, web: true });
    }
  }
  {
    const ys = -1.75 * S, zc = -11.3 * S, nh = 30, yh = ys - 1, yb = yh - nh, zf = zc - 28;
    const base = new MB();
    solidBox(base, -19, 19, yb - 4, yb, zf - 20, zf + 46, [{ c: V3(0, yb, zf), r: 2.2, depth: 3.2 }], []);
    add('Stand base', 'Stand', base, D(0, -1, 0), { mm: true, stand: true });

    const neck = new MB();
    const uB = -zf, uT = -zc;
    const cen = t => { const k = t * t * (3 - 2 * t); return [uB + (uT - uB) * k, yb + nh * t]; };
    const L = [], R = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40, a = cen(Math.max(t - 0.01, 0)), b = cen(Math.min(t + 0.01, 1)), c = cen(t);
      const du = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(du, dy);
      L.push([c[0] - dy / len * 3, c[1] + du / len * 3]);
      R.push([c[0] + dy / len * 3, c[1] - du / len * 3]);
    }
    prism(neck, L.concat(R.reverse()), 8, (u, v, w) => [w, v, -u]);
    peg(neck, V3(0, yb, -uB), V3(0, -1, 0), 2.0, 3.0, 2.0);
    peg(neck, V3(0, yb + nh, -uT), V3(0, 1, 0), 2.0, 4.0, 2.0);
    add('Stand neck', 'Stand', neck, D(1, 0, 0), { mm: true, stand: true });

    const head = new MB();
    const ytop = Math.max(...STAND_STATIONS.map(bellyY)) * S;
    const plateMB = new MB();
    solidBox(plateMB, -4.1, 4.1, ytop - 3.2, ytop, zc - 9.3, zc + 9.3, STAND_STATIONS.flatMap(d => [-1, 1].map(sx => ({ c: V3(sx * 0.25 * S, ytop, -d * S), r: 1.17, depth: 2.8 }))), []);
    tiltMB(plateMB);
    const nrm = V3(0, 1, 0).applyQuaternion(QTILT);
    const U0 = tiltPt(V3(0, ytop - 3.2, zc));
    const underY = z => U0.y - (z - U0.z) * nrm.z / nrm.y;
    const CW = 3.6;
    const colTop = Math.max(underY(zc - CW), underY(zc + CW)) + 0.8;
    solidBox(head, -CW, CW, yh, colTop, zc - CW, zc + CW, [], [{ c: V3(0, yh, zc), r: 2.2, depth: 4.2 }]);
    mergeMB(head, plateMB);
    add('Stand head', 'Stand', head, nrm.clone(), { mm: true, stand: true });
  }
  return out;
}

function boxRaw(mb, x0, x1, y0, y1, z0, z1) { box(mb, x0, x1, y0, y1, z0, z1); }

function orientPart(p) {
  const pos = p.geo.attributes.position;
  const n = pos.count;
  const q0 = new THREE.Quaternion().setFromUnitVectors(p.down.clone().normalize(), V3(0, 0, -1));
  const stride = Math.max(1, Math.floor(n / 3000));
  const v = new THREE.Vector3();
  const xs = [], ys = [];
  for (let i = 0; i < n; i += stride) {
    v.fromBufferAttribute(pos, i).applyQuaternion(q0);
    xs.push(v.x);
    ys.push(v.y);
  }
  let best = Infinity, ba = 0;
  for (let a = 0; a < 180; a += 3) {
    const c = Math.cos(a * Math.PI / 180), s = Math.sin(a * Math.PI / 180);
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (let i = 0; i < xs.length; i++) {
      const x = xs[i] * c - ys[i] * s, y = xs[i] * s + ys[i] * c;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
    const area = (x1 - x0) * (y1 - y0);
    if (area < best) { best = area; ba = a; }
  }
  const zAxis = V3(0, 0, 1);
  let q = new THREE.Quaternion().setFromAxisAngle(zAxis, ba * Math.PI / 180).multiply(q0);
  const box3 = qq => {
    const mn = V3(Infinity, Infinity, Infinity), mx = V3(-Infinity, -Infinity, -Infinity);
    for (let i = 0; i < n; i++) {
      v.fromBufferAttribute(pos, i).applyQuaternion(qq);
      mn.min(v);
      mx.max(v);
    }
    return [mn, mx];
  };
  let [mn, mx] = box3(q);
  if (mx.y - mn.y > mx.x - mn.x) {
    q = new THREE.Quaternion().setFromAxisAngle(zAxis, Math.PI / 2).multiply(q);
    [mn, mx] = box3(q);
  }
  p.q = q;
  p.bmin = mn;
  p.bmax = mx;
  p.size = mx.clone().sub(mn);
}

const DISPLAY = {
  'Fuselage': 'Airframe', 'Intakes': 'Airframe', 'Cockpit': 'Airframe', 'Conformal tanks': 'Airframe',
  'Wings & tail': 'Wings & tail',
  'Engines': 'Engines & gear', 'Landing gear': 'Engines & gear',
  'Pylons': 'Weapons', 'AIM-9X': 'Weapons', 'AIM-120': 'Weapons', 'Pods': 'Weapons',
  'Pins': 'Stand & pins', 'Stand': 'Stand & pins', 'Sprue': 'Sprue'
};
const CARD_ORDER = ['Airframe', 'Wings & tail', 'Engines & gear', 'Weapons', 'Stand & pins', 'Sprue'];
const CARD_W = 248;
const FILL = new Set(['Engines & gear']);

function packCard(parts, W, ray, mat) {
  const B = 3, EDGE = 3.5, GY = 7, GX = 5, X0 = B + 3, X1 = W - B - 3;
  const baseOf = n => n.replace(/\s[LR](?=\s|$)/, '');
  const baseH = new Map();
  for (const p of parts) baseH.set(baseOf(p.name), Math.max(baseH.get(baseOf(p.name)) || 0, p.size.y));
  const gi = p => CARD_ORDER.indexOf(p.disp);
  const order = parts.slice().sort((a, b) => gi(a) - gi(b) || baseH.get(baseOf(b.name)) - baseH.get(baseOf(a.name)) || baseOf(a.name).localeCompare(baseOf(b.name)) || a.name.localeCompare(b.name));
  const units = [];
  for (const p of order) {
    const u = units[units.length - 1];
    if (u && u[0].disp === p.disp && baseOf(u[0].name) === baseOf(p.name)) u.push(p);
    else units.push([p]);
  }
  const rows = [];
  let cur = null;
  const place = (p, row) => {
    p.cx = row.x;
    row.x += p.size.x + GX;
    row.items.push(p);
    row.h = Math.max(row.h, p.size.y);
  };
  const uw = u => u.reduce((t, p) => t + p.size.x, 0) + GX * (u.length - 1);
  const isFill = u => FILL.has(u[0].disp) || u[0].group === 'Pins';
  const fillUnits = units.filter(isFill).sort((a, b) => Math.max(...b.map(p => p.size.y)) - Math.max(...a.map(p => p.size.y)) || uw(b) - uw(a));
  for (const u of units.filter(u => !isFill(u))) {
    const w = u.reduce((a, p) => a + p.size.x, 0) + GX * (u.length - 1);
    const together = w <= X1 - X0 && !u.some(p => p.size.y > 40);
    const fresh = disp => { cur = { x: X0, items: [], h: 0, disp }; rows.push(cur); };
    if (together) {
      const row = rows.find(r => (u[0].plate ? r.h >= u[0].size.y : r.disp === u[0].disp) && r.x + w <= X1);
      if (!row) fresh(u[0].disp);
      const tgt = row || cur;
      for (const p of u) place(p, tgt);
    } else {
      for (const p of u) {
        if (!cur || cur.disp !== p.disp || cur.x + p.size.x > X1 || cur.items.length) fresh(p.disp);
        place(p, cur);
      }
    }
  }
  for (const u of fillUnits) {
    const w = uw(u), hy = Math.max(...u.map(p => p.size.y));
    const row = rows.find(r => r.h >= hy && r.x + w <= X1);
    if (row) {
      for (const p of u) place(p, row);
      continue;
    }
    for (const p of u.slice().sort((a, b) => b.size.y - a.size.y)) {
      let r = rows.find(q => q.h >= p.size.y && q.x + p.size.x <= X1);
      if (!r) {
        r = { x: X0, items: [], h: 0, disp: p.disp };
        rows.push(r);
      }
      place(p, r);
    }
  }
  let y = B + EDGE;
  const bars = [{ c: B / 2, w: B }];
  for (let r = 0; r < rows.length; r++) {
    rows[r].y = y;
    for (const p of rows[r].items) p.cy = y;
    y += rows[r].h;
    if (r < rows.length - 1) {
      bars.push({ c: y + GY / 2, w: 2.4 });
      y += GY;
    }
  }
  y += EDGE;
  const H = Math.ceil(y + B);
  bars.push({ c: H - B / 2, w: B });
  rows.forEach((r, i) => { r.below = bars[i]; r.above = bars[i + 1]; });

  const sprue = new MB();
  boxRaw(sprue, 0, W, 0, B, 0, 1.6);
  boxRaw(sprue, 0, W, H - B, H, 0, 1.6);
  boxRaw(sprue, 0, B, B + 0.5, H - B - 0.5, 0, 1.6);
  boxRaw(sprue, W - B, W, B + 0.5, H - B - 0.5, 0, 1.6);
  for (let i = 1; i < bars.length - 1; i++) boxRaw(sprue, B + 0.5, W - B - 0.5, bars[i].c - bars[i].w / 2, bars[i].c + bars[i].w / 2, 0, 1.2);


  for (const r of rows) {
    for (const p of r.items) {
      const pos = V3(p.cx, p.cy, 0).sub(p.bmin);
      p.Mcard = new THREE.Matrix4().compose(pos, p.q, V3(1, 1, 1));
      const cg = p.geo.clone().applyMatrix4(p.Mcard);
      const cm = new THREE.Mesh(cg, mat);
      cm.updateMatrixWorld(true);
      const x0 = p.cx, x1 = p.cx + p.size.x;
      const cands = [];
      for (const side of [1, -1]) {
        const bar = side > 0 ? r.above : r.below;
        const edgeY = side > 0 ? bar.c - bar.w / 2 : bar.c + bar.w / 2;
        for (let k = 1; k <= 9; k++) {
          const x = x0 + (x1 - x0) * k / 10;
          for (const zr of [0.2, p.size.z / 2]) {
            ray.set(V3(x, bar.c, zr), V3(0, -side, 0));
            ray.far = 80;
            const hit = ray.intersectObject(cm, false)[0];
            if (!hit) continue;
            const iy = hit.point.y - side * 0.3;
            ray.set(V3(x, iy, 60), V3(0, 0, -1));
            const th = ray.intersectObject(cm, false)[0];
            if (!th) continue;
            const T = th.point.z;
            if (T < 0.5) continue;
            const gap = side > 0 ? edgeY - hit.point.y : hit.point.y - edgeY;
            cands.push({ x, side, bar, zr, hy: hit.point.y, T, score: (zr < 1 ? Math.min(T, 1.8) * 3 : 4) - gap });
            break;
          }
        }
      }
      cg.dispose();
      let pick = [];
      if (cands.length) {
        const sc = s => cands.filter(c => c.side === s).reduce((a, c) => a + Math.max(c.score, 0), 0);
        const side = sc(1) >= sc(-1) ? 1 : -1;
        const list = cands.filter(c => c.side === side).sort((a, b) => b.score - a.score);
        const want = p.size.x > 60 ? 3 : 2;
        for (const c of list) {
          if (pick.length >= want) break;
          if (pick.every(q => Math.abs(q.x - c.x) > p.size.x * 0.22)) pick.push(c);
        }
      }
      for (const c of pick) {
        const h = c.zr < 1 ? clamp(c.T * 0.8, 0.4, 0.9) : c.zr + 0.45;
        const ya = c.side > 0 ? c.hy - 0.35 : c.bar.c - 0.8;
        const yb = c.side > 0 ? c.bar.c + 0.8 : c.hy + 0.35;
        boxRaw(sprue, c.x - 0.45, c.x + 0.45, Math.min(ya, yb), Math.max(ya, yb), 0, h);
      }
      p.runners = pick.length;
      if (p.web) {
        const yc = p.cy + p.size.y / 2;
        boxRaw(sprue, p.cx + 3, p.cx + p.size.x - 3, yc - 0.4, yc + 0.4, 0, p.size.z / 2 + 0.2);
      }
    }
  }
  const sprueRaw = plainRaw(sprue);
  const sprueGeo = rawToGeo(sprueRaw, 0.7);
  return { items: parts, sprueGeo, sprueRaw, W, H, bars, rows };
}

function buildKit(font) {
  const parts = makeParts();
  const FLOOR = GROUND * S;
  for (const p of parts) {
    p.raw = finish(p.mb);
    p.geo = rawToGeo(p.raw, 0.7);
    if (p.bores.length) p.geo = cutBores(p.geo, p.bores);
    p.bad = p.raw.bad;
    p.tris = p.raw.T.length / 3;
    p.volume = geoVolume(p.geo);
    p.geo.computeBoundingBox();
    p.center = p.geo.boundingBox.getCenter(V3(0, 0, 0));
    p.geo.translate(-p.center.x, -p.center.y, -p.center.z);
    p.asmPos = p.center.clone();
  }
  const cnt = parts.length;
  const makePlate = (line1, line2, ci) => {
    const t1 = new TextGeometry(line1, { font, size: 5.4, height: 0.8, curveSegments: 3, bevelEnabled: false });
    t1.computeBoundingBox();
    t1.translate(-t1.boundingBox.min.x, 9.4, 0);
    const t2 = new TextGeometry(line2, { font, size: 4.0, height: 0.8, curveSegments: 3, bevelEnabled: false });
    t2.computeBoundingBox();
    t2.translate(-t2.boundingBox.min.x, 2.4, 0);
    const rail = (t, y) => {
      t.computeBoundingBox();
      const w = t.boundingBox.max.x - t.boundingBox.min.x;
      const r = new THREE.BoxGeometry(w, 1.1, 0.8).toNonIndexed();
      r.translate(t.boundingBox.min.x + w / 2, y + 0.35, 0.4);
      return r;
    };
    const joinW = Math.min(t1.boundingBox.max.x, t2.boundingBox.max.x);
    const post = (x) => {
      const b = new THREE.BoxGeometry(1.2, 9.4 - 2.4, 0.8).toNonIndexed();
      b.translate(x, (9.4 + 2.4) / 2 + 0.35, 0.4);
      return b;
    };
    const pl = { name: 'Name plate', group: 'Sprue', geo: mergeGeometries([t1, t2, rail(t1, 9.4), rail(t2, 2.4), post(0.8), post(joinW - 0.8), post(joinW / 2)]), down: V3(0, 0, -1), plate: true, bad: 0, card: ci };
    parts.push(pl);
    pl.tris = pl.geo.attributes.position.count / 3;
    pl.volume = geoVolume(pl.geo);
    pl.geo.computeBoundingBox();
    pl.center = pl.geo.boundingBox.getCenter(V3(0, 0, 0));
    pl.geo.translate(-pl.center.x, -pl.center.y, -pl.center.z);
    pl.asmPos = V3(0, 0, 0);
  };
  if (font) {
    makePlate('TINGLET  F-15E STRIKE EAGLE', '1:120 KIT  -  ' + cnt + ' PARTS  -  ONE PLATE', 0);
  }
  for (const p of parts) {
    if (p.plate) {
      p.q = new THREE.Quaternion();
      p.geo.computeBoundingBox();
      p.bmin = p.geo.boundingBox.min.clone();
      p.bmax = p.geo.boundingBox.max.clone();
      p.size = p.bmax.clone().sub(p.bmin);
    } else orientPart(p);
  }

  const ray = new THREE.Raycaster();
  const mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  for (const p of parts) p.disp = DISPLAY[p.group] || p.group;
  const cards = [packCard(parts, CARD_W, ray, mat)];
  const total = CARD_W;
  let ox = -total / 2;
  for (const c of cards) {
    c.ox = ox;
    c.shift = new THREE.Matrix4().makeTranslation(ox, FLOOR, c.H / 2).multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    for (const p of c.items) {
      p.cardPos = V3(0, 0, 0);
      p.cardQuat = new THREE.Quaternion();
      c.shift.clone().multiply(p.Mcard).decompose(p.cardPos, p.cardQuat, V3(1, 1, 1));
    }
    ox += c.W;
  }
  return { parts, cards, total, FLOOR };
}

const COLORS = {
  'Fuselage': 0x9aa4b2, 'Intakes': 0x8793a3, 'Wings & tail': 0xaab3bf, 'Engines': 0x5a616b, 'Cockpit': 0x7fb6e6,
  'Landing gear': 0xc9ced6, 'Pylons': 0x8d96a3, 'AIM-120': 0xe8ebef, 'AIM-9X': 0xf0e9cf, 'Fuel tank': 0x8a9a7a, 'Pins': 0xd9b44a, 'Stand': 0xb8c0cc, 'Sprue': 0xd7dbe0,
  'Conformal tanks': 0x93a0b0, 'GBU-12': 0x9fa58a, 'Pods': 0x6f7885
};

function loadFont() {
  return new Promise(res => {
    const t = setTimeout(() => res(null), 5000);
    new FontLoader().load('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json', f => { clearTimeout(t); res(f); }, undefined, () => { clearTimeout(t); res(null); });
  });
}

function geoTris(geo, matrix, dx = 0, dy = 0, dz = 0) {
  const pos = geo.attributes.position;
  const idx = geo.index;
  const n = idx ? idx.count : pos.count;
  const out = new Float32Array(n * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(pos, idx ? idx.getX(i) : i);
    if (matrix) v.applyMatrix4(matrix);
    out[i * 3] = v.x + dx;
    out[i * 3 + 1] = v.y + dy;
    out[i * 3 + 2] = v.z + dz;
  }
  return out;
}

function concat(chunks) {
  const all = new Float32Array(chunks.reduce((n, c) => n + c.length, 0));
  let o = 0;
  for (const c of chunks) { all.set(c, o); o += c.length; }
  return all;
}

const STORE_GROUPS = ['AIM-120', 'AIM-9X', 'Fuel tank', 'Pylons', 'GBU-12', 'Pods', 'Conformal tanks'];
const AIRCRAFT_CENTER = V3(0, 0, -81);

export default {
  title: 'F-15E Strike Eagle 1:120 kit card',
  description: 'Print-ready single-plate sprue kit with a fully detailed airframe, weapons, landing gear, cockpit and display stand.',
  params: [
    { key: 'quality', label: 'Mesh quality', type: 'select', options: ['draft', 'final'], value: 'draft' }
  ],
  toggles: [
    { key: 'stores', label: 'Weapons', value: true },
    { key: 'gear', label: 'Gear', value: true },
    { key: 'glass', label: 'Canopy', value: true },
    { key: 'mono', label: 'Print colour', value: false },
    { key: 'wire', label: 'Wireframe', value: false }
  ],
  hide: ['opacity', 'cut'],
  async build({ params, track }) {
    QUALITY = params.quality === 'draft' ? 0.5 : 1;
    const font = await loadFont();
    const kit = buildKit(font);
    const kp = kit.parts;
    const cards = kit.cards;

    let lowest = Infinity;
    for (const p of kp) {
      if (p.plate) continue;
      p.geo.computeBoundingBox();
      lowest = Math.min(lowest, p.asmPos.y + p.geo.boundingBox.min.y);
    }
    const asmDy = -lowest;
    const cardDy = -kit.FLOOR;

    const mats = new Map();
    const matFor = g => {
      if (!mats.has(g)) {
        const glass = g === 'Cockpit';
        mats.set(g, track(new THREE.MeshPhysicalMaterial({
          color: COLORS[g], roughness: glass ? 0.12 : g === 'Engines' ? 0.4 : 0.5, metalness: g === 'Engines' ? 0.8 : 0.05,
          clearcoat: 0.4, clearcoatRoughness: 0.35, transparent: glass, opacity: glass ? 0.55 : 1, side: THREE.DoubleSide
        })));
      }
      return mats.get(g);
    };
    const monoMat = track(new THREE.MeshPhysicalMaterial({ color: 0xd7dbe0, roughness: 0.55, metalness: 0.0, clearcoat: 0.2, side: THREE.DoubleSide }));
    const sprueMat = track(new THREE.MeshStandardMaterial({ color: 0xd7dbe0, roughness: 0.6, metalness: 0.0, transparent: true }));

    const sprues = cards.map(c => {
      const m = new THREE.Mesh(c.sprueGeo, sprueMat);
      m.applyMatrix4(c.shift);
      m.position.y += cardDy;
      m.castShadow = m.receiveShadow = true;
      return m;
    });

    const subOf = new Map(kp.map(q => [q.name, q.group]));
    const out = [];
    for (const p of kp) {
      const mesh = new THREE.Mesh(p.geo, p.plate ? sprueMat : matFor(p.group));
      mesh.castShadow = mesh.receiveShadow = true;
      const dir = p.plate ? V3(0, 0, 0) : (() => {
        const d = p.asmPos.clone().sub(AIRCRAFT_CENTER);
        d.x *= 2.2;
        d.z *= 0.5;
        if (d.length() < 4) d.set(0, 1, 0);
        return d.normalize();
      })();
      out.push({
        name: p.name,
        group: p.disp,
        object: mesh,
        base: p.asmPos.clone().add(V3(0, asmDy, 0)),
        explode: dir.multiplyScalar(30),
        color: COLORS[p.group],
        print: !p.plate,
        assembled: !(p.plate || p.group === 'Pins'),
        cardOnly: !!p.plate,
        card: { position: p.cardPos.clone().add(V3(0, cardDy, 0)), quaternion: p.cardQuat.clone() },
        printQuaternion: p.cardQuat.clone(),
        dimsText: p.plate ? 'name plate (card only)' : undefined,
        info: `${p.size.z.toFixed(1)} mm tall printed flat · ${(p.volume / 1000).toFixed(2)} cm³ · ${p.tris} tris` + (p.runners !== undefined ? ` · ${p.runners} runners` : '')
      });
    }

    const mn = V3(Infinity, Infinity, Infinity), mx = V3(-Infinity, -Infinity, -Infinity);
    for (const p of kp) {
      if (p.plate || p.group === 'Stand' || p.group === 'Pins') continue;
      p.geo.computeBoundingBox();
      mn.min(p.geo.boundingBox.min.clone().add(p.asmPos));
      mx.max(p.geo.boundingBox.max.clone().add(p.asmPos));
    }
    const acDims = `${(mx.x - mn.x).toFixed(0)} × ${(mx.z - mn.z).toFixed(0)} × ${(mx.y - mn.y).toFixed(0)}`;
    const real = kp.filter(p => !p.plate);
    const solid = kp.reduce((a, p) => a + p.volume, 0) / 1000;
    const bad = kp.filter(p => p.bad).length;
    const info = `<b>${real.length}</b> parts · one plate <b>${cards[0].W} × ${cards[0].H}</b> mm (P1S bed 256 × 256)${cards[0].H > 254 ? ' <span style="color:#ff9a8a">too tall</span>' : ''}<br>` +
      `Aircraft on stand <b>${acDims}</b> mm, nose up ${Math.round(PITCH * 180 / Math.PI)}°<br>` +
      `Solid volume <b>${solid.toFixed(1)}</b> cm³ · est. PLA <b>${(solid * 1.24 * 0.5).toFixed(0)}</b> g<br>` +
      (bad ? `<span style="color:#ff9a8a">${bad} part(s) with open edges</span>` : `<span style="color:#8fe3a6">All parts watertight</span>`);

    const cardTris = (ci, bed) => {
      const c = cards[ci];
      const chunks = c.items.map(p => geoTris(p.geo, p.Mcard));
      chunks.push(geoTris(c.sprueGeo, null));
      const tris = concat(chunks);
      if (bed) {
        const dx = 128 - c.W / 2, dy = 128 - c.H / 2;
        for (let i = 0; i < tris.length; i += 3) { tris[i] += dx; tris[i + 1] += dy; }
      }
      return [{ name: `F-15E Strike Eagle kit 1:${SCALE}`, tris }];
    };

    return {
      parts: out,
      extras: sprues,
      assemble: 0,
      plateExports: false,
      info,
      notes: ['Bambu P1S, 0.4 mm nozzle, 0.12–0.2 mm layers, 2–3 walls, no supports. Details ≥ 0.5 mm wide, 0.2 mm high; pegs 1.0 mm, sockets +0.17 mm clearance; runners 0.9 mm.'],
      exports: [
        { label: 'Card 3MF', file: 'f15e-kit-card.3mf', format: '3mf', build: () => cardTris(0, true) }
      ],
      update({ blend, toggles, parts: vp }) {
        for (const p of vp) {
          const sub = subOf.get(p.name);
          let hide = false;
          if (STORE_GROUPS.includes(sub) && !toggles.stores) hide = true;
          if (sub === 'Landing gear' && !toggles.gear) hide = true;
          if (sub === 'Cockpit' && !toggles.glass) hide = true;
          if (p.cardOnly && blend >= 0.98) hide = true;
          if (sub === 'Pins' && blend >= 0.5) hide = true;
          p.hide = hide;
          if (!p.cardOnly) p.object.material = toggles.mono ? monoMat : matFor(sub);
        }
        for (const m of [...mats.values(), monoMat, sprueMat]) m.wireframe = toggles.wire;
        sprueMat.opacity = 1 - clamp(blend / 0.35, 0, 1);
        for (const m of sprues) m.visible = sprueMat.opacity > 0.01;
      }
    };
  }
};
