import { THREE, V, mesh } from '../lib/geometry.js';

const CHARM_AT = [560, 350];
const CHARM_SCALE = 1.25;

const fix = (pts, wantCw) => (THREE.ShapeUtils.isClockWise(pts) === wantCw ? pts : pts.slice().reverse());

const inside = (pt, ring) => {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i];
    const b = ring[j];
    if (a.y > pt.y !== b.y > pt.y && pt.x < ((b.x - a.x) * (pt.y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
};

function ringPts(ring, map) {
  return ring.slice(0, -1).map(q => map(q));
}

function buildSolid(outer, holes, pockets, top, floor) {
  const pos = [];
  const tri = (a, b, c) => pos.push(...a, ...b, ...c);
  const v3 = (p, z) => [p.x, p.y, z];
  const wall = (ring, z0, z1) => {
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i];
      const b = ring[(i + 1) % ring.length];
      tri(v3(a, z0), v3(b, z0), v3(b, z1));
      tri(v3(a, z0), v3(b, z1), v3(a, z1));
    }
  };
  const all = outer.concat(...holes, ...pockets);
  const faces = THREE.ShapeUtils.triangulateShape(outer, holes.concat(pockets));
  faces.forEach(f => {
    tri(v3(all[f[0]], top), v3(all[f[1]], top), v3(all[f[2]], top));
  });
  const bottom = THREE.ShapeUtils.triangulateShape(outer, holes);
  const bAll = outer.concat(...holes);
  bottom.forEach(f => tri(v3(bAll[f[2]], 0), v3(bAll[f[1]], 0), v3(bAll[f[0]], 0)));
  wall(outer, 0, top);
  holes.forEach(h => wall(h, 0, top));
  pockets.forEach(p => {
    wall(p, floor, top);
    const ccw = p.slice().reverse();
    THREE.ShapeUtils.triangulateShape(ccw, []).forEach(f => tri(v3(ccw[f[0]], floor), v3(ccw[f[1]], floor), v3(ccw[f[2]], floor)));
  });
  return pos;
}

export default {
  title: 'Floral name bookmark',
  description: 'Script name bookmark with three recessed cherry blossoms, veined leaf branch and a hanging heart charm. Flat, no supports.',
  params: [
    { key: 'length', label: 'Length (X)', min: 100, max: 170, step: 1, value: 130, unit: ' mm' },
    { key: 'thick', label: 'Thickness', min: 1.6, max: 4, step: 0.2, value: 2.4, unit: ' mm' },
    { key: 'floor', label: 'Petal floor', min: 0.4, max: 1.6, step: 0.2, value: 0.8, unit: ' mm' }
  ],
  toggles: [],
  async build({ body, params }) {
    const res = await fetch(new URL('../assets/bookmark.json', import.meta.url));
    const data = await res.json();
    const { length, thick } = params;
    const floor = Math.min(params.floor, thick - 0.8);
    const b = data.bounds;
    const k = length / (b.x1 - b.x0);
    const cx = (b.x0 + b.x1) / 2;
    const cy = (b.y0 + b.y1) / 2;
    const map = q => new THREE.Vector2((q[0] - cx) * k, (cy - q[1]) * k);

    const bodyPos = [];
    data.body.forEach(p => {
      const outer = fix(ringPts(p[0], map), false);
      const holes = p.slice(1).map(h => fix(ringPts(h, map), true));
      const mine = data.pockets
        .map(pk => fix(ringPts(pk[0], map), true))
        .filter(pk => inside(pk[0], outer) && !holes.some(h => inside(pk[0], h)));
      buildSolid(outer, holes, mine, thick, floor).forEach(v => bodyPos.push(v));
    });

    const cs = CHARM_SCALE;
    const charmX = (CHARM_AT[0] - cx) * k;
    const charmY = (cy - CHARM_AT[1]) * k;
    const charmMap = q => new THREE.Vector2(charmX + q[0] * k * cs, charmY - q[1] * k * cs);
    const charmPos = [];
    data.charm.forEach(p => {
      const outer = fix(ringPts(p[0], charmMap), false);
      const holes = p.slice(1).map(h => fix(ringPts(h, charmMap), true));
      buildSolid(outer, holes, [], thick, 0).forEach(v => charmPos.push(v));
    });

    const make = (name, pos, color, explodeZ, info) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
      g.computeVertexNormals();
      g.rotateX(-Math.PI / 2);
      return { name, object: mesh(g, body), base: V(0, 0, 0), explode: V(0, 0, explodeZ), color, print: true, info };
    };

    return {
      parts: [
        make('1 Bookmark', bodyPos, 0xffffff, 0, 'Name, blossoms, veined leaves and hanging loop in one flat piece. Petals are recessed with raised rims and stamens.'),
        make('2 Heart charm', charmPos, 0xffffff, 18, 'Round tag with a heart cut-out and a small hole for the chain ring.')
      ],
      notes: [
        'The chain is not printed. Use a metal chain and jump ring through the loop hole and the charm hole.',
        'Both parts lie flat and print without supports. Use white filament.'
      ]
    };
  }
};
