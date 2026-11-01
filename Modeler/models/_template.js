import { THREE, V, RoundedBoxGeometry, makeCsg, cutter, mesh } from '../lib/geometry.js';

export default {
  title: 'Template box with lid',
  description: 'Copy this file to models/<name>.js (no leading underscore) and edit.',
  params: [
    { key: 'w', label: 'Width', min: 20, max: 120, step: 1, value: 60, unit: ' mm' },
    { key: 'd', label: 'Depth', min: 20, max: 120, step: 1, value: 40, unit: ' mm' },
    { key: 'h', label: 'Height', min: 10, max: 80, step: 1, value: 25, unit: ' mm' },
    { key: 'wall', label: 'Wall', min: 1, max: 4, step: 0.2, value: 2, unit: ' mm' }
  ],
  toggles: [],
  build({ params, body, mat }) {
    const { w, d, h, wall } = params;
    const csg = makeCsg();

    let shell = csg.brush(new RoundedBoxGeometry(w, h, d, 6, 3));
    shell = csg.sub(shell, new RoundedBoxGeometry(w - wall * 2, h, d - wall * 2, 6, 2).translate(0, wall, 0));

    const lidGeo = new RoundedBoxGeometry(w - wall * 2 - 0.4, wall, d - wall * 2 - 0.4, 4, 0.6);

    const sensor = mesh(new THREE.BoxGeometry(12, 4, 12), mat(0x2f6fd1));

    return {
      parts: [
        { name: 'Box', object: mesh(shell.geometry, body), base: V(0, h / 2, 0), explode: V(0, 0, 0), color: 0xf2f4f8, print: true },
        { name: 'Lid', object: mesh(lidGeo, body), base: V(0, h - wall / 2, 0), explode: V(0, 30, 0), color: 0xf2f4f8, print: true },
        { name: 'Sensor board', object: sensor, base: V(0, wall + 2, 0), explode: V(0, 15, 0), color: 0x2f6fd1 }
      ],
      notes: ['Tolerance between lid and box is 0.2 mm per side.']
    };
  }
};
