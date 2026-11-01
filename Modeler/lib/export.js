import * as THREE from 'three';

export function collectTris(object) {
  object.updateMatrixWorld(true);
  const chunks = [];
  let total = 0;
  object.traverse(o => {
    if (!o.isMesh || o.userData.noPrint || !o.geometry.attributes.position) return;
    const geo = o.geometry;
    const pos = geo.attributes.position;
    const idx = geo.index;
    const triCount = idx ? idx.count / 3 : pos.count / 3;
    const out = new Float32Array(triCount * 9);
    const flip = o.matrixWorld.determinant() < 0;
    const v = new THREE.Vector3();
    for (let t = 0; t < triCount; t++) {
      for (let k = 0; k < 3; k++) {
        const src = idx ? idx.getX(t * 3 + k) : t * 3 + k;
        const dst = flip ? [0, 2, 1][k] : k;
        v.fromBufferAttribute(pos, src).applyMatrix4(o.matrixWorld);
        out[t * 9 + dst * 3] = v.x;
        out[t * 9 + dst * 3 + 1] = v.y;
        out[t * 9 + dst * 3 + 2] = v.z;
      }
    }
    chunks.push(out);
    total += out.length;
  });
  const all = new Float32Array(total);
  let off = 0;
  for (const c of chunks) { all.set(c, off); off += c.length; }
  return all;
}

export function rotateTris(tris, rotation) {
  const m = new THREE.Matrix4();
  if (Array.isArray(rotation)) m.makeRotationFromEuler(new THREE.Euler(rotation[0], rotation[1], rotation[2]));
  else m.makeRotationFromQuaternion(rotation);
  const v = new THREE.Vector3();
  for (let i = 0; i < tris.length; i += 3) {
    v.set(tris[i], tris[i + 1], tris[i + 2]).applyMatrix4(m);
    tris[i] = v.x; tris[i + 1] = v.y; tris[i + 2] = v.z;
  }
  return tris;
}

export function toZUp(tris) {
  for (let i = 0; i < tris.length; i += 3) {
    const y = tris[i + 1], z = tris[i + 2];
    tris[i + 1] = -z;
    tris[i + 2] = y;
  }
  return tris;
}

export function bounds(tris) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < tris.length; i += 3) {
    for (let a = 0; a < 3; a++) {
      const v = tris[i + a];
      if (v < min[a]) min[a] = v;
      if (v > max[a]) max[a] = v;
    }
  }
  return { min, max, size: max.map((m, a) => m - min[a]) };
}

export function translate(tris, dx, dy, dz) {
  for (let i = 0; i < tris.length; i += 3) {
    tris[i] += dx; tris[i + 1] += dy; tris[i + 2] += dz;
  }
  return tris;
}

export function layoutOnBed(items, gap = 6, bedWidth = 250) {
  let x = 0, y = 0, rowH = 0;
  return items.map(item => {
    const b = bounds(item.tris);
    if (x > 0 && x + b.size[0] > bedWidth) { x = 0; y += rowH + gap; rowH = 0; }
    const tris = translate(item.tris.slice(), x - b.min[0], y - b.min[1], -b.min[2]);
    x += b.size[0] + gap;
    rowH = Math.max(rowH, b.size[1]);
    return { name: item.name, tris };
  });
}

export function stlBlob(list, name = 'model') {
  let count = 0;
  for (const t of list) count += t.length / 9;
  const buf = new ArrayBuffer(84 + count * 50);
  const dv = new DataView(buf);
  const header = `Modeler ${name}`.slice(0, 79);
  for (let i = 0; i < header.length; i++) dv.setUint8(i, header.charCodeAt(i));
  dv.setUint32(80, count, true);
  let o = 84;
  for (const tris of list) {
    for (let i = 0; i < tris.length; i += 9) {
      const ax = tris[i + 3] - tris[i], ay = tris[i + 4] - tris[i + 1], az = tris[i + 5] - tris[i + 2];
      const bx = tris[i + 6] - tris[i], by = tris[i + 7] - tris[i + 1], bz = tris[i + 8] - tris[i + 2];
      let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
      const l = Math.hypot(nx, ny, nz) || 1;
      nx /= l; ny /= l; nz /= l;
      dv.setFloat32(o, nx, true); dv.setFloat32(o + 4, ny, true); dv.setFloat32(o + 8, nz, true);
      for (let k = 0; k < 9; k++) dv.setFloat32(o + 12 + k * 4, tris[i + k], true);
      o += 50;
    }
  }
  return new Blob([buf], { type: 'model/stl' });
}

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(u8) {
  let c = 0xffffffff;
  for (let i = 0; i < u8.length; i++) c = crcTable[(c ^ u8[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function zipStore(files) {
  const enc = new TextEncoder();
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const f of files) {
    const name = enc.encode(f.name);
    const data = enc.encode(f.data);
    const crc = crc32(data);
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true);
    lh.setUint16(4, 20, true);
    lh.setUint32(14, crc, true);
    lh.setUint32(18, data.length, true);
    lh.setUint32(22, data.length, true);
    lh.setUint16(26, name.length, true);
    locals.push(new Uint8Array(lh.buffer), name, data);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true);
    ch.setUint16(4, 20, true);
    ch.setUint16(6, 20, true);
    ch.setUint32(16, crc, true);
    ch.setUint32(20, data.length, true);
    ch.setUint32(24, data.length, true);
    ch.setUint16(28, name.length, true);
    ch.setUint32(42, offset, true);
    centrals.push(new Uint8Array(ch.buffer), name);
    offset += 30 + name.length + data.length;
  }
  let centralSize = 0;
  for (let i = 0; i < centrals.length; i++) centralSize += centrals[i].length;
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);
  return new Blob([...locals, ...centrals, new Uint8Array(end.buffer)], { type: 'application/zip' });
}

function escapeXml(s) {
  return s.replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]);
}

export function threeMFBlob(items, title = 'model') {
  let objects = '';
  let build = '';
  items.forEach((item, n) => {
    const id = n + 1;
    const map = new Map();
    const verts = [];
    const tris = [];
    const vi = (x, y, z) => {
      const key = `${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}`;
      let i = map.get(key);
      if (i === undefined) {
        i = verts.length;
        map.set(key, i);
        verts.push(`<vertex x="${x.toFixed(4)}" y="${y.toFixed(4)}" z="${z.toFixed(4)}"/>`);
      }
      return i;
    };
    const t = item.tris;
    for (let i = 0; i < t.length; i += 9) {
      const a = vi(t[i], t[i + 1], t[i + 2]);
      const b = vi(t[i + 3], t[i + 4], t[i + 5]);
      const c = vi(t[i + 6], t[i + 7], t[i + 8]);
      if (a !== b && b !== c && a !== c) tris.push(`<triangle v1="${a}" v2="${b}" v3="${c}"/>`);
    }
    objects += `<object id="${id}" type="model" name="${escapeXml(item.name)}"><mesh><vertices>${verts.join('')}</vertices><triangles>${tris.join('')}</triangles></mesh></object>`;
    build += `<item objectid="${id}"/>`;
  });
  const model = `<?xml version="1.0" encoding="UTF-8"?>\n<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><metadata name="Title">${escapeXml(title)}</metadata><resources>${objects}</resources><build>${build}</build></model>`;
  const types = '<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>';
  const rels = '<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>';
  return zipStore([
    { name: '[Content_Types].xml', data: types },
    { name: '_rels/.rels', data: rels },
    { name: '3D/3dmodel.model', data: model }
  ]);
}

export function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
