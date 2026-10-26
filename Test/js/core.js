const TextKeychain = (function () {
  const SCALE = 1000;
  const ARC_TOLERANCE = 10;
  const BEZIER_STEPS = 10;
  const BEND_SEGMENT = 0.4;
  const MIN_CLOSE = 0.03;

  function flattenCommands(commands) {
    const contours = [];
    let cur = null;
    let cx = 0;
    let cy = 0;
    for (const c of commands) {
      if (c.type === 'M') {
        cur = [[c.x, -c.y]];
        contours.push(cur);
        cx = c.x;
        cy = c.y;
      } else if (!cur) {
        continue;
      } else if (c.type === 'L') {
        cur.push([c.x, -c.y]);
        cx = c.x;
        cy = c.y;
      } else if (c.type === 'Q') {
        for (let i = 1; i <= BEZIER_STEPS; i++) {
          const t = i / BEZIER_STEPS;
          const u = 1 - t;
          cur.push([
            u * u * cx + 2 * u * t * c.x1 + t * t * c.x,
            -(u * u * cy + 2 * u * t * c.y1 + t * t * c.y)
          ]);
        }
        cx = c.x;
        cy = c.y;
      } else if (c.type === 'C') {
        for (let i = 1; i <= BEZIER_STEPS; i++) {
          const t = i / BEZIER_STEPS;
          const u = 1 - t;
          cur.push([
            u * u * u * cx + 3 * u * u * t * c.x1 + 3 * u * t * t * c.x2 + t * t * t * c.x,
            -(u * u * u * cy + 3 * u * u * t * c.y1 + 3 * u * t * t * c.y2 + t * t * t * c.y)
          ]);
        }
        cx = c.x;
        cy = c.y;
      } else if (c.type === 'Z') {
        cur = null;
      }
    }
    return contours.filter((c) => c.length >= 3);
  }

  function layoutText(font, text, o) {
    const scale = o.size / font.unitsPerEm;
    const rows = text.split('\n').map((line) => {
      const glyphs = font.stringToGlyphs(line);
      const groups = [];
      let x = 0;
      for (let i = 0; i < glyphs.length; i++) {
        const g = glyphs[i];
        const flat = flattenCommands(g.getPath(x, 0, o.size).commands);
        if (flat.length) groups.push(flat);
        x += g.advanceWidth * scale + o.spacing;
        if (i < glyphs.length - 1) x += font.getKerningValue(g, glyphs[i + 1]) * scale;
      }
      return { groups, width: glyphs.length ? Math.max(0, x - o.spacing) : 0 };
    });
    const maxW = Math.max(0, ...rows.map((r) => r.width));
    const out = [];
    rows.forEach((r, li) => {
      let dx = -r.width / 2;
      if (o.align === 'left') dx = -maxW / 2;
      if (o.align === 'right') dx = maxW / 2 - r.width;
      const dy = -li * o.size * o.lineHeight;
      for (const g of r.groups) out.push(g.map((c) => c.map((p) => [p[0] + dx, p[1] + dy])));
    });
    return { groups: out, width: maxW };
  }

  function densify(contour, maxSeg) {
    const out = [];
    const n = contour.length;
    for (let i = 0; i < n; i++) {
      const a = contour[i];
      const b = contour[(i + 1) % n];
      out.push(a);
      const k = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / maxSeg);
      for (let j = 1; j < k; j++) {
        const t = j / k;
        out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      }
    }
    return out;
  }

  function bend(contours, width, angleDeg) {
    if (Math.abs(angleDeg) < 0.5 || width <= 0) return contours;
    const R = width / ((angleDeg * Math.PI) / 180);
    return contours.map((c) =>
      densify(c, BEND_SEGMENT).map((p) => {
        const th = p[0] / R;
        const r = R + p[1];
        return [r * Math.sin(th), r * Math.cos(th) - R];
      })
    );
  }

  function centerGroups(groups) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const g of groups) {
      for (const c of g) {
        for (const p of c) {
          if (p[0] < minX) minX = p[0];
          if (p[0] > maxX) maxX = p[0];
          if (p[1] < minY) minY = p[1];
          if (p[1] > maxY) maxY = p[1];
        }
      }
    }
    if (!isFinite(minX)) return groups;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    return groups.map((g) => g.map((c) => c.map((p) => [p[0] - cx, p[1] - cy])));
  }

  function toPaths(contours) {
    return contours.map((c) =>
      c.map((p) => ({ X: Math.round(p[0] * SCALE), Y: Math.round(p[1] * SCALE) }))
    );
  }

  function execute(type, subject, clip) {
    const c = new ClipperLib.Clipper();
    c.StrictlySimple = true;
    c.AddPaths(subject, ClipperLib.PolyType.ptSubject, true);
    if (clip) c.AddPaths(clip, ClipperLib.PolyType.ptClip, true);
    const sol = new ClipperLib.Paths();
    c.Execute(type, sol, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
    return sol;
  }

  function union(a, b) {
    return execute(ClipperLib.ClipType.ctUnion, a, b);
  }

  function difference(a, b) {
    return execute(ClipperLib.ClipType.ctDifference, a, b);
  }

  function offset(paths, delta) {
    if (Math.abs(delta) < 1e-6 || !paths.length) return paths;
    const co = new ClipperLib.ClipperOffset(2, ARC_TOLERANCE);
    co.AddPaths(paths, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
    const sol = new ClipperLib.Paths();
    co.Execute(sol, delta * SCALE);
    return sol;
  }

  function closing(paths, amount) {
    if (amount <= 0 || !paths.length) return paths;
    return union(offset(offset(paths, amount), -amount));
  }

  function circlePath(cx, cy, r) {
    const n = Math.max(48, Math.ceil(r * 24));
    const path = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      path.push({
        X: Math.round((cx + r * Math.cos(a)) * SCALE),
        Y: Math.round((cy + r * Math.sin(a)) * SCALE)
      });
    }
    return path;
  }

  function boundsOf(paths) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const path of paths) {
      for (const p of path) {
        if (p.X < minX) minX = p.X;
        if (p.X > maxX) maxX = p.X;
        if (p.Y < minY) minY = p.Y;
        if (p.Y > maxY) maxY = p.Y;
      }
    }
    return { minX: minX / SCALE, maxX: maxX / SCALE, minY: minY / SCALE, maxY: maxY / SCALE };
  }

  function signedArea(pts) {
    let a = 0;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const q = pts[(i + 1) % pts.length];
      a += p[0] * q[1] - q[0] * p[1];
    }
    return a / 2;
  }

  function orient(pts, ccw) {
    return signedArea(pts) > 0 === ccw ? pts : pts.slice().reverse();
  }

  function contourToPoints(contour) {
    let pts = contour.map((p) => [p.X, p.Y]);
    let changed = true;
    while (changed && pts.length >= 3) {
      changed = false;
      const next = [];
      for (let i = 0; i < pts.length; i++) {
        const prev = pts[(i + pts.length - 1) % pts.length];
        const cur = pts[i];
        const nxt = pts[(i + 1) % pts.length];
        const dup = cur[0] === prev[0] && cur[1] === prev[1];
        const cross = (cur[0] - prev[0]) * (nxt[1] - cur[1]) - (cur[1] - prev[1]) * (nxt[0] - cur[0]);
        if (dup || cross === 0) {
          changed = true;
          pts = pts.slice(0, i).concat(pts.slice(i + 1));
          next.length = 0;
          break;
        }
        next.push(cur);
      }
    }
    return pts.map((q) => [q[0] / SCALE, q[1] / SCALE]);
  }

  function walk(node, out) {
    for (const child of node.Childs()) {
      if (child.IsHole()) continue;
      const outer = contourToPoints(child.Contour());
      const holes = child.Childs().map((h) => contourToPoints(h.Contour()));
      if (outer.length >= 3) {
        out.push({
          outer: orient(outer, true),
          holes: holes.filter((h) => h.length >= 3).map((h) => orient(h, false))
        });
      }
      for (const h of child.Childs()) walk(h, out);
    }
  }

  function toPolygons(paths) {
    if (!paths.length) return [];
    const c = new ClipperLib.Clipper();
    c.StrictlySimple = true;
    c.AddPaths(paths, ClipperLib.PolyType.ptSubject, true);
    const tree = new ClipperLib.PolyTree();
    c.Execute(
      ClipperLib.ClipType.ctUnion,
      tree,
      ClipperLib.PolyFillType.pftNonZero,
      ClipperLib.PolyFillType.pftNonZero
    );
    const out = [];
    walk(tree, out);
    return out;
  }

  function ringShape(p, anchor) {
    const outerR = p.holeD / 2 + p.wall;
    const holeR = p.holeD / 2;
    let cx = 0;
    let cy = 0;
    if (p.ring === 'left') {
      cx = anchor.minX - outerR + p.overlap + p.shiftX;
      cy = (anchor.minY + anchor.maxY) / 2 + p.shiftY;
    } else if (p.ring === 'right') {
      cx = anchor.maxX + outerR - p.overlap + p.shiftX;
      cy = (anchor.minY + anchor.maxY) / 2 + p.shiftY;
    } else {
      cx = (anchor.minX + anchor.maxX) / 2 + p.shiftX;
      cy = anchor.maxY + outerR - p.overlap + p.shiftY;
    }
    return { body: [circlePath(cx, cy, outerR)], hole: [circlePath(cx, cy, holeR)] };
  }

  function build(font, p) {
    const laid = layoutText(font, p.text, {
      size: p.size,
      spacing: p.spacing,
      lineHeight: p.lineHeight,
      align: p.align
    });
    const groups = centerGroups(laid.groups.map((g) => bend(g, laid.width, p.angle)));
    const groupPaths = groups.map((g) => closing(union(toPaths(g)), MIN_CLOSE));
    const textPaths = union([].concat(...groupPaths));
    if (!textPaths.length) return { layers: [] };

    const merge = p.merge !== false;
    const joined = closing(textPaths, Math.max(p.join, MIN_CLOSE));
    const hasBase = p.useBase !== false && p.baseH > 0;
    const ring = p.ring === 'none' ? null : ringShape(p, boundsOf(hasBase ? offset(joined, p.outline) : joined));
    const layers = [];

    function textPolys(withRing) {
      if (merge) {
        let shape = joined;
        if (withRing && ring) shape = union(shape, ring.body);
        if (ring) shape = difference(shape, ring.hole);
        return toPolygons(shape);
      }
      let polys = [];
      for (const gp of groupPaths) {
        polys = polys.concat(toPolygons(ring ? difference(gp, ring.hole) : gp));
      }
      if (withRing && ring) polys = polys.concat(toPolygons(difference(ring.body, ring.hole)));
      return polys;
    }

    if (hasBase) {
      let plate = union(offset(joined, p.outline));
      if (ring) plate = difference(union(plate, ring.body), ring.hole);
      layers.push({ name: 'Base', polys: toPolygons(plate), z0: 0, z1: p.baseH });
      if (p.textH > 0) {
        layers.push({ name: 'Text', polys: textPolys(false), z0: p.baseH, z1: p.baseH + p.textH });
      }
    } else {
      layers.push({ name: 'Text', polys: textPolys(true), z0: 0, z1: Math.max(p.textH, 0.4) });
    }
    return { layers: layers.filter((l) => l.polys.length) };
  }

  function buildMesh(polys, z0, z1) {
    const positions = [];
    const indices = [];
    for (const poly of polys) {
      const rings = [poly.outer].concat(poly.holes);
      let pts = [];
      for (const r of rings) pts = pts.concat(r);
      const n = pts.length;
      const vb = positions.length / 3;
      for (const q of pts) positions.push(q[0], q[1], z0);
      for (const q of pts) positions.push(q[0], q[1], z1);
      const tris = THREE.ShapeUtils.triangulateShape(
        poly.outer.map((q) => new THREE.Vector2(q[0], q[1])),
        poly.holes.map((h) => h.map((q) => new THREE.Vector2(q[0], q[1])))
      );
      for (const t of tris) {
        let a = t[0];
        let b = t[1];
        let c = t[2];
        const area =
          (pts[b][0] - pts[a][0]) * (pts[c][1] - pts[a][1]) -
          (pts[b][1] - pts[a][1]) * (pts[c][0] - pts[a][0]);
        if (area < 0) {
          const tmp = b;
          b = c;
          c = tmp;
        }
        indices.push(vb + n + a, vb + n + b, vb + n + c, vb + a, vb + c, vb + b);
      }
      let start = 0;
      for (const r of rings) {
        const len = r.length;
        for (let k = 0; k < len; k++) {
          const i = start + k;
          const j = start + ((k + 1) % len);
          indices.push(vb + i, vb + j, vb + n + j, vb + i, vb + n + j, vb + n + i);
        }
        start += len;
      }
    }
    return { positions, indices };
  }

  function analyzeMesh(mesh) {
    const canon = new Map();
    const ids = [];
    for (let i = 0; i < mesh.positions.length; i += 3) {
      const key = mesh.positions[i] + ',' + mesh.positions[i + 1] + ',' + mesh.positions[i + 2];
      if (!canon.has(key)) canon.set(key, canon.size);
      ids.push(canon.get(key));
    }
    const count = canon.size;
    const edges = new Map();
    for (let i = 0; i < mesh.indices.length; i += 3) {
      for (let k = 0; k < 3; k++) {
        const a = ids[mesh.indices[i + k]];
        const b = ids[mesh.indices[i + ((k + 1) % 3)]];
        const key = a * count + b;
        edges.set(key, (edges.get(key) || 0) + 1);
      }
    }
    let open = 0;
    let nonManifold = 0;
    for (const [key, v] of edges) {
      const a = Math.floor(key / count);
      const b = key % count;
      if (v > 1) nonManifold++;
      if (!edges.has(b * count + a)) open++;
    }
    return { open, nonManifold, triangles: mesh.indices.length / 3 };
  }

  return { build, buildMesh, analyzeMesh, layoutText };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = TextKeychain;
