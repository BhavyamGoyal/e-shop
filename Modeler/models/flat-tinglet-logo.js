import { THREE, V, mesh } from '../lib/geometry.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { LOGO_PATHS, LOGO_VIEW, LOGO_DOT } from '../lib/tinglet-logo.js';

function flipWinding(geo) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const p = g.attributes.position.array;
  for (let i = 0; i < p.length; i += 9) {
    for (let k = 0; k < 3; k++) {
      const t = p[i + 3 + k];
      p[i + 3 + k] = p[i + 6 + k];
      p[i + 6 + k] = t;
    }
  }
  g.attributes.position.needsUpdate = true;
  g.deleteAttribute('normal');
  g.deleteAttribute('uv');
  g.computeVertexNormals();
  return g;
}

export default {
  title: 'Flat Tinglet logo',
  description: 'Flat Tinglet logo text with a round dot on the i, printed lying flat.',
  params: [
    { key: 'width', label: 'Width (X)', min: 20, max: 240, step: 1, value: 100, unit: ' mm' },
    { key: 'height', label: 'Thickness (Z)', min: 0.4, max: 10, step: 0.2, value: 1, unit: ' mm' }
  ],
  toggles: [],
  build({ body, params }) {
    const { width, height } = params;
    const sc = width / LOGO_VIEW.w;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LOGO_VIEW.w} ${LOGO_VIEW.h}">${LOGO_PATHS.map(d => `<path fill-rule="evenodd" d="${d}"/>`).join('')}</svg>`;
    const data = new SVGLoader().parse(svg);
    const shapes = [];
    for (const sp of data.paths) shapes.push(...SVGLoader.createShapes(sp));
    const dot = new THREE.Shape();
    dot.absarc(LOGO_DOT.x, LOGO_DOT.y, LOGO_DOT.r, 0, Math.PI * 2, false);
    shapes.push(dot);

    const geos = shapes.map(s => {
      const g = new THREE.ExtrudeGeometry(s, { depth: height / sc, bevelEnabled: false, curveSegments: 12 });
      g.translate(-LOGO_VIEW.w / 2, -LOGO_VIEW.h / 2, 0);
      g.scale(sc, -sc, sc);
      return flipWinding(g);
    });
    const geo = mergeGeometries(geos);
    geo.rotateX(-Math.PI / 2);
    geo.computeBoundingBox();
    geo.translate(0, -geo.boundingBox.min.y, 0);

    return {
      parts: [
        {
          name: 'Tinglet logo',
          object: mesh(geo, body),
          base: V(0, 0, 0),
          explode: V(0, 0, 0),
          color: 0xffffff,
          print: true
        }
      ],
      notes: ['Flat logo printed lying down, no supports. Thickness defaults to 1 mm.']
    };
  }
};
