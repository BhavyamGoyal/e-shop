import { THREE, V, mesh } from '../lib/geometry.js';

const CIRCLES = [
  { x: 162, y: 438, r: 47 },
  { x: 220, y: 392, r: 55 },
  { x: 319, y: 385, r: 77 },
  { x: 382, y: 438, r: 47 }
];
const BOX = { x0: 162, x1: 382, y0: 392, y1: 485 };
const PX_X0 = 115;
const PX_X1 = 428;
const PX_CX = (PX_X0 + PX_X1) / 2;
const PX_CY = (307 + 485) / 2;
const EPS = 0.01;

const insideCircle = (c, x, y) => Math.hypot(x - c.x, y - c.y) < c.r - EPS;
const insideBox = (x, y) => x > BOX.x0 + EPS && x < BOX.x1 - EPS && y > BOX.y0 + EPS && y < BOX.y1 - EPS;

function outline() {
  const pts = [];
  CIRCLES.forEach((c, i) => {
    const n = 720;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      const x = c.x + Math.cos(a) * c.r;
      const y = c.y + Math.sin(a) * c.r;
      if (CIRCLES.some((o, j) => j !== i && insideCircle(o, x, y))) continue;
      if (insideBox(x, y)) continue;
      pts.push([x, y]);
    }
  });
  for (let x = BOX.x0; x <= BOX.x1; x += 1) {
    if (CIRCLES.some(o => insideCircle(o, x, BOX.y1))) continue;
    pts.push([x, BOX.y1]);
  }
  const cx = 270;
  const cy = 430;
  pts.sort((p, q) => Math.atan2(p[1] - cy, p[0] - cx) - Math.atan2(q[1] - cy, q[0] - cx));
  return pts;
}

export default {
  title: 'Flat cloud',
  description: 'Solid flat cloud plate, printed lying flat.',
  params: [
    { key: 'width', label: 'Width (X)', min: 20, max: 240, step: 1, value: 100, unit: ' mm' },
    { key: 'length', label: 'Length (Y)', min: 10, max: 240, step: 1, value: 56.5, unit: ' mm' },
    { key: 'height', label: 'Height (Z)', min: 1, max: 50, step: 0.5, value: 5, unit: ' mm' }
  ],
  toggles: [],
  build({ body, params }) {
    const { width, length, height } = params;
    const sx = width / (429 - PX_X0);
    const sy = length / (485 - 308);

    const shape = new THREE.Shape();
    outline().forEach(([x, y], i) => {
      const px = (x - PX_CX) * sx;
      const py = -(y - PX_CY) * sy;
      if (i === 0) shape.moveTo(px, py);
      else shape.lineTo(px, py);
    });
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, curveSegments: 1 });
    geo.rotateX(-Math.PI / 2);

    return {
      parts: [
        {
          name: 'Cloud',
          object: mesh(geo, body),
          base: V(0, 0, 0),
          explode: V(0, 0, 0),
          color: 0xffffff,
          print: true
        }
      ],
      notes: ['Solid plate printed flat, no supports. Width, length and height are adjustable.']
    };
  }
};
