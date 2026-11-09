import { THREE, V, mesh } from '../lib/geometry.js';

const PX_X0 = 68;
const PX_X1 = 240;
const PX_Y0 = 58;
const PX_Y1 = 172;
const PX_CX = (PX_X0 + PX_X1) / 2;
const PX_CY = (PX_Y0 + PX_Y1) / 2;

const WHEELS = [
  { x: 122, y: 148, r: 24 },
  { x: 200, y: 148, r: 24 }
];

function pathOf(Ctor, tx, ty, ops) {
  const p = new Ctor();
  ops.forEach((op, i) => {
    const c = op.slice(1);
    const m = c.map((v, k) => (k % 2 === 0 ? tx(v) : ty(v)));
    if (i === 0) p.moveTo(m[0], m[1]);
    else if (op[0] === 'L') p.lineTo(m[0], m[1]);
    else p.bezierCurveTo(m[0], m[1], m[2], m[3], m[4], m[5]);
  });
  p.closePath();
  return p;
}

export default {
  title: 'Flat car',
  description: 'Solid flat cartoon car plate with windows and hub holes, printed lying flat.',
  params: [
    { key: 'width', label: 'Width (X)', min: 20, max: 240, step: 1, value: 100, unit: ' mm' },
    { key: 'length', label: 'Length (Y)', min: 10, max: 240, step: 1, value: 66, unit: ' mm' },
    { key: 'height', label: 'Height (Z)', min: 1, max: 50, step: 0.5, value: 5, unit: ' mm' }
  ],
  toggles: [],
  build({ body, params }) {
    const { width, length, height } = params;
    const sx = width / (PX_X1 - PX_X0);
    const sy = length / (PX_Y1 - PX_Y0);
    const tx = x => (x - PX_CX) * sx;
    const ty = y => -(y - PX_CY) * sy;

    const arc = (cx, cy, r, from, to, n) => {
      const out = [];
      for (let k = 1; k <= n; k++) {
        const a = from + ((to - from) * k) / n;
        out.push(['L', cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
      return out;
    };

    const [w1, w2] = WHEELS;
    const shape = pathOf(THREE.Shape, tx, ty, [
      ['M', 74, 148],
      ['L', 70, 144],
      ['L', 69, 122],
      ['C', 70, 108, 90, 108, 98, 98],
      ['C', 106, 70, 125, 58, 152, 58],
      ['C', 180, 58, 198, 72, 206, 98],
      ['C', 215, 110, 236, 110, 239, 124],
      ['L', 240, 142],
      ['L', 236, 148],
      ['L', w2.x + w2.r, 148],
      ...arc(w2.x, 148, w2.r, 0, Math.PI, 48),
      ['L', w1.x + w1.r, 148],
      ...arc(w1.x, 148, w1.r, 0, Math.PI, 48),
      ['L', 74, 148]
    ]);

    [
      [['M', 109, 106], ['C', 109, 90, 114, 78, 122, 72], ['C', 130, 68, 140, 68, 147, 69], ['L', 147, 106]],
      [['M', 158, 69], ['C', 170, 69, 182, 74, 188, 82], ['C', 194, 90, 198, 99, 200, 107], ['L', 158, 107]]
    ].forEach(ops => shape.holes.push(pathOf(THREE.Path, tx, ty, ops)));

    WHEELS.forEach(w => {
      const hr = 11;
      shape.holes.push(pathOf(THREE.Path, tx, ty, [
        ['M', w.x + hr, w === w1 ? 147.4 : 147.1],
        ...arc(w.x, w === w1 ? 147.4 : 147.1, hr, 0, Math.PI, 32)
      ]));
    });

    const fix = (pts, wantCw) => (THREE.ShapeUtils.isClockWise(pts) === wantCw ? pts : pts.slice().reverse());
    const fixedShape = new THREE.Shape(fix(shape.getPoints(24), false));
    shape.holes.forEach(h => fixedShape.holes.push(new THREE.Path(fix(h.getPoints(24), true))));

    const result = { geometry: new THREE.ExtrudeGeometry(fixedShape, { depth: height, bevelEnabled: false, curveSegments: 24 }) };

    const geo = result.geometry;
    geo.rotateX(-Math.PI / 2);

    return {
      parts: [
        {
          name: 'Car',
          object: mesh(geo, body),
          base: V(0, 0, 0),
          explode: V(0, 0, 0),
          color: 0xff0000,
          print: true
        }
      ],
      notes: ['Solid plate printed flat, no supports. Width, length and height are adjustable.']
    };
  }
};
