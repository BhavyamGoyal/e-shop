import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { Brush, Evaluator, SUBTRACTION, INTERSECTION, ADDITION } from 'three-bvh-csg';

export { THREE, RoundedBoxGeometry };

export const V = (x, y, z) => new THREE.Vector3(x, y, z);

export function roundedRectShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

export function slab(w, h, d, r, mat) {
  const geo = new THREE.ExtrudeGeometry(roundedRectShape(w, h, r), { depth: d, bevelEnabled: false, curveSegments: 6 });
  geo.translate(0, 0, -d / 2);
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  return m;
}

export function cutter(w, h, r, depth, z0) {
  const g = new THREE.ExtrudeGeometry(roundedRectShape(w, h, r), { depth, bevelEnabled: false, curveSegments: 8 });
  g.translate(0, 0, z0);
  return g;
}

export function plainBox(w, h, d, x = 0, y = 0, z = 0) {
  return new THREE.BoxGeometry(w, h, d).translate(x, y, z);
}

export function ringGeometry(outer, inner, depth, segments = 48) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outer, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, inner, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: segments });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

export function makeCsg() {
  const evaluator = new Evaluator();
  evaluator.useGroups = false;
  const mat = new THREE.MeshBasicMaterial();
  const brush = geo => {
    if (geo.isBrush) return geo;
    const b = new Brush(geo, mat);
    b.updateMatrixWorld();
    return b;
  };
  return {
    brush,
    sub: (a, b) => evaluator.evaluate(brush(a), brush(b), SUBTRACTION),
    inter: (a, b) => evaluator.evaluate(brush(a), brush(b), INTERSECTION),
    union: (a, b) => evaluator.evaluate(brush(a), brush(b), ADDITION)
  };
}

export function mesh(geo, mat, shadow = true) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = shadow;
  return m;
}

export function limb(a, b, ra, rb, mat) {
  const g = new THREE.Group();
  const s1 = new THREE.Mesh(new THREE.SphereGeometry(ra, 32, 24), mat);
  s1.position.copy(a);
  const s2 = new THREE.Mesh(new THREE.SphereGeometry(rb, 32, 24), mat);
  s2.position.copy(b);
  const dir = b.clone().sub(a);
  const len = dir.length();
  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(rb, ra, len, 32, 1, true), mat);
  cyl.position.copy(a).addScaledVector(dir, 0.5);
  cyl.quaternion.setFromUnitVectors(V(0, 1, 0), dir.normalize());
  for (const m of [s1, s2, cyl]) { m.castShadow = true; g.add(m); }
  return g;
}

export function wireBundle(group, points, colors, track, opts = {}) {
  const count = colors.length;
  const spreadR = opts.spacing ?? 0.32;
  const offset = opts.offset ?? [0, 0];
  const radius = opts.radius ?? 0.26;
  const spread = count === 2
    ? [[spreadR * 0.8, 0], [-spreadR * 0.8, 0]]
    : [[spreadR, 0], [-spreadR, 0], [0, spreadR], [0, -spreadR]];
  for (let i = 0; i < count; i++) {
    const pts = points.map(p => V(p[0] + offset[0] + spread[i][0], p[1], p[2] + offset[1] + spread[i][1]));
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    const mat = track(new THREE.MeshStandardMaterial({ color: colors[i], roughness: 0.6 }));
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 80, radius, 6, false), mat));
  }
}
