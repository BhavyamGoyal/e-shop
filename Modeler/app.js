import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import * as lib from './lib/geometry.js';
import { collectTris, rotateTris, toZUp, bounds, translate, layoutOnBed, threeMFBlob, download } from './lib/export.js';

const $ = id => document.getElementById(id);

if (location.protocol === 'file:') {
  $('nofile').style.display = 'flex';
  throw new Error('Open through the server');
}

const AXIS = {
  x: { name: 'X', css: '#ff6b6b', hex: 0xff6b6b },
  y: { name: 'Y', css: '#7be08f', hex: 0x7be08f },
  z: { name: 'Z', css: '#6aa8ff', hex: 0x6aa8ff }
};

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.localClippingEnabled = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f1218);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 1, 6000);
camera.position.set(165, 120, 230);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = false;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI;
controls.minDistance = 10;
controls.maxDistance = 3000;
controls.autoRotateSpeed = 1.5;

scene.add(new THREE.AmbientLight(0xffffff, 0.9));
scene.add(new THREE.HemisphereLight(0xffffff, 0x8a96b0, 0.8));
const under = new THREE.DirectionalLight(0xffffff, 0.9);
under.position.set(-120, -200, -140);
scene.add(under);
const key = new THREE.DirectionalLight(0xffffff, 2.2);
key.position.set(100, 220, 140);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -260;
key.shadow.camera.right = 260;
key.shadow.camera.top = 260;
key.shadow.camera.bottom = -260;
key.shadow.camera.far = 900;
key.shadow.bias = -0.0005;
scene.add(key);
const rim = new THREE.DirectionalLight(0x7aa7ff, 1.0);
rim.position.set(-150, 90, -120);
scene.add(rim);

const desk = new THREE.Mesh(
  new THREE.PlaneGeometry(4000, 4000),
  new THREE.MeshStandardMaterial({ color: 0x1a2030, roughness: 0.85, metalness: 0.05 })
);
desk.rotation.x = -Math.PI / 2;
desk.receiveShadow = true;
scene.add(desk);
const grid = new THREE.GridHelper(800, 80, 0x2c3650, 0x1d2536);
grid.position.y = 0.02;
scene.add(grid);

const clipPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);
const clipMats = new Set();
const track = mat => { clipMats.add(mat); return mat; };
function applyClip() {
  const on = $('cut').checked;
  for (const mat of clipMats) {
    mat.clippingPlanes = on ? [clipPlane] : [];
    mat.needsUpdate = true;
  }
}

const bodyMat = new THREE.MeshPhysicalMaterial({
  color: 0xf2f4f8, roughness: 0.35, metalness: 0.0, clearcoat: 0.8, clearcoatRoughness: 0.25,
  transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false
});
track(bodyMat);

function stdMat(color, opts = {}) {
  return track(new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.1, ...opts }));
}

let root = new THREE.Group();
scene.add(root);
const rulerGroup = new THREE.Group();
scene.add(rulerGroup);
const selBox = new THREE.Box3Helper(new THREE.Box3(), 0x4da3ff);
selBox.visible = false;
scene.add(selBox);

let models = [];
let current = null;
let built = null;
let parts = [];
let toggleState = {};
const paramStore = {};
let framed = false;
let blend = 1;
let blendTarget = 1;
let rulerState = -1;
let hover = null;
let selected = null;
let buildToken = 0;
const tmpV = new THREE.Vector3();
const tmpQ = new THREE.Quaternion();
const ease = t => t * t * (3 - 2 * t);
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function applyOpacity() {
  const v = $('opacity').value / 100;
  $('opv').textContent = $('opacity').value + '%';
  const solid = v >= 0.999;
  bodyMat.opacity = v;
  bodyMat.transparent = !solid;
  bodyMat.depthWrite = solid;
  bodyMat.needsUpdate = true;
}

function textSprite(text, pos, size, color) {
  const c = document.createElement('canvas');
  c.width = 320;
  c.height = 64;
  const x = c.getContext('2d');
  x.fillStyle = color;
  x.font = 'bold 34px system-ui, sans-serif';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText(text, 160, 34);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  sp.position.copy(pos);
  sp.scale.set(size * 5, size, 1);
  sp.renderOrder = 10;
  rulerGroup.add(sp);
}

function ruler(origin, axisVec, tickDir, length, step, labelOffset, tag, axis) {
  const pts = [origin.clone(), origin.clone().addScaledVector(axisVec, length)];
  const labelSize = step * 0.9;
  for (let d = 0; d <= length + 1e-6; d += step) {
    const major = Math.round(d / step) % 2 === 0;
    const p = origin.clone().addScaledVector(axisVec, d);
    pts.push(p, p.clone().addScaledVector(tickDir, major ? step * 0.8 : step * 0.4));
    if (major) textSprite(String(Math.round(d)), p.clone().add(labelOffset), labelSize, AXIS[axis].css);
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const idx = [0, 1];
  for (let i = 2; i < pts.length; i += 2) idx.push(i, i + 1);
  geo.setIndex(idx);
  const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: AXIS[axis].hex, depthTest: false, transparent: true }));
  lines.renderOrder = 9;
  lines.frustumCulled = false;
  rulerGroup.add(lines);
  textSprite(`${tag} (mm)`, origin.clone().addScaledVector(axisVec, length + step * 1.6), labelSize * 1.2, AXIS[axis].css);
}

function niceStep(maxDim) {
  if (maxDim > 600) return 50;
  if (maxDim > 300) return 20;
  if (maxDim > 120) return 10;
  if (maxDim > 50) return 5;
  return 2;
}

const START = [10, 10, 0];
const rootOffset = new THREE.Vector3();
function placement(box) {
  return new THREE.Vector3(START[0] - box.min.x, START[2] - box.min.y, -START[1] - box.max.z);
}

function buildRulers(box) {
  for (const c of [...rulerGroup.children]) {
    rulerGroup.remove(c);
    c.geometry?.dispose();
    c.material?.map?.dispose();
    c.material?.dispose();
  }
  const size = box.getSize(new THREE.Vector3());
  const step = niceStep(Math.max(size.x, size.y, size.z));
  const up = v => Math.ceil(v / step) * step;
  const V = lib.V;
  const off = 10;
  const o = V(0, 0, 0);
  ruler(o, V(1, 0, 0), V(0, 0, 1), up(size.x + off), step, V(0, 0, step * 1.4), 'X width', 'x');
  ruler(o, V(0, 0, -1), V(-1, 0, 0), up(size.z + off), step, V(-step * 1.4, 0, 0), 'Y depth', 'y');
  ruler(o, V(0, 1, 0), V(-1, 0, 0), up(size.y), step, V(-step * 1.4, 0, 0), 'Z height', 'z');
}

function fmt(v) { return v.toFixed(1).replace(/\.0$/, ''); }

function dimsHtml(size) {
  const row = (a, v) => `<div class="ax"><i style="color:${AXIS[a].css}">${AXIS[a].name}</i><span>${fmt(v)} mm</span></div>`;
  return row('x', size.x) + row('y', size.z) + row('z', size.y);
}

function disposeRoot() {
  scene.remove(root);
  root.traverse(o => {
    o.geometry?.dispose();
    if (o.material && o.material !== bodyMat) {
      for (const m of [].concat(o.material)) {
        m.map?.dispose();
        m.dispose();
      }
    }
  });
  clipMats.clear();
  clipMats.add(bodyMat);
}

function setPose(e, b = blend, moves = false) {
  const k = ease(Math.min(1, Math.max(0, b)));
  for (const p of parts) {
    tmpV.copy(p.base).addScaledVector(p.explode, e);
    if (p.card) {
      p.object.position.lerpVectors(p.card.position, tmpV, k);
      p.object.quaternion.copy(p.card.quaternion).slerp(tmpQ.identity(), k);
    } else {
      p.object.position.copy(tmpV);
    }
    if (moves && p.moved) p.object.position.add(p.moved);
  }
}

function resetMoves() {
  for (const p of parts) p.moved = null;
}

function printTris(p) {
  setPose(0, 1);
  root.position.set(0, 0, 0);
  const t = collectTris(p.object);
  const r = p.printQuaternion ?? p.printRotate;
  if (r) rotateTris(t, r);
  return toZUp(t);
}

function groundTris(t) {
  const b = bounds(t);
  return translate(t, -b.min[0], -b.min[1], -b.min[2]);
}

function showError(e) {
  const box = $('err');
  box.style.display = e ? 'block' : 'none';
  box.textContent = e ? String(e.stack || e).split('\n').slice(0, 8).join('\n') : '';
}

function buildParamsUi(def, values) {
  const host = $('params');
  host.innerHTML = '';
  if (!def.params?.length) return;
  const h = document.createElement('h3');
  h.textContent = 'Parameters';
  host.appendChild(h);
  for (const p of def.params) {
    const wrap = document.createElement('div');
    if (p.type === 'bool') {
      wrap.innerHTML = `<label><span>${p.label}</span><input type="checkbox" ${values[p.key] ? 'checked' : ''}></label>`;
      wrap.querySelector('input').addEventListener('change', ev => { values[p.key] = ev.target.checked; rebuild(); });
    } else if (p.type === 'select') {
      wrap.innerHTML = `<label><span>${p.label}</span><select class="p">${p.options.map(o => `<option ${o === values[p.key] ? 'selected' : ''}>${o}</option>`).join('')}</select></label>`;
      wrap.querySelector('select').addEventListener('change', ev => { values[p.key] = ev.target.value; rebuild(); });
    } else {
      const step = p.step ?? 1;
      wrap.innerHTML = `<label><span>${p.label}</span><span class="nv"><input type="number" class="num" min="${p.min}" max="${p.max}" step="${step}" value="${values[p.key]}">${p.unit ? `<span class="u">${p.unit}</span>` : ''}</span></label><input type="range" min="${p.min}" max="${p.max}" step="${step}" value="${values[p.key]}">`;
      const input = wrap.querySelector('input[type=range]');
      const num = wrap.querySelector('input.num');
      const decimals = (String(step).split('.')[1] ?? '').length;
      input.addEventListener('input', () => { num.value = input.value; });
      input.addEventListener('change', () => { values[p.key] = Number(input.value); rebuild(); });
      num.addEventListener('change', () => {
        let v = Number(num.value);
        if (!Number.isFinite(v)) v = values[p.key];
        v = Math.min(p.max, Math.max(p.min, v));
        v = Number((Math.round((v - p.min) / step) * step + p.min).toFixed(decimals));
        num.value = v;
        input.value = v;
        values[p.key] = v;
        rebuild();
      });
      num.addEventListener('keydown', ev => { if (ev.key === 'Enter') num.blur(); });
    }
    host.appendChild(wrap);
  }
}

function buildTogglesUi(def) {
  const host = $('toggles');
  host.innerHTML = '';
  toggleState = {};
  for (const t of def.toggles ?? []) {
    toggleState[t.key] = t.value ?? false;
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" ${toggleState[t.key] ? 'checked' : ''}>${t.label}`;
    label.querySelector('input').addEventListener('change', ev => { toggleState[t.key] = ev.target.checked; });
    host.appendChild(label);
  }
}

function select(p, scroll) {
  selected = p;
  for (const r of document.querySelectorAll('#list .p.sel')) r.classList.remove('sel');
  if (p && p.row) {
    p.row.classList.add('sel');
    if (scroll) p.row.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  $('sel').innerHTML = p ? `<b>${p.name}</b><br>${p.dimsText}${p.info ? '<br>' + p.info : ''}` : '';
}

function buildPartsUi() {
  const host = $('list');
  host.innerHTML = '';
  const boxes = new Map();
  const groupBoxes = new Map();
  const collapsed = new Set();
  let allCb;
  const syncGroups = () => {
    if (allCb) {
      const on = parts.filter(p => p.userVisible).length;
      allCb.checked = on === parts.length;
      allCb.indeterminate = on > 0 && on < parts.length;
    }
    for (const [g, cb] of groupBoxes) {
      const ps = parts.filter(p => p.group === g);
      const on = ps.filter(p => p.userVisible).length;
      cb.checked = on === ps.length;
      cb.indeterminate = on > 0 && on < ps.length;
    }
  };
  const setAll = (ps, v) => {
    for (const p of ps) { p.userVisible = v; boxes.get(p).checked = v; }
    syncGroups();
  };
  const allLabel = document.createElement('label');
  allLabel.className = 'g all';
  allCb = document.createElement('input');
  allCb.type = 'checkbox';
  allCb.checked = true;
  allCb.addEventListener('change', () => setAll(parts, allCb.checked));
  allLabel.appendChild(allCb);
  allLabel.appendChild(document.createTextNode('All parts'));
  host.appendChild(allLabel);
  const order = [];
  const seen = new Map();
  for (const p of parts) {
    if (!p.group) { order.push(p); continue; }
    if (!seen.has(p.group)) { seen.set(p.group, []); order.push(seen.get(p.group)); }
    seen.get(p.group).push(p);
  }
  const ordered = order.flat();
  let lastGroup = null;
  ordered.forEach(p => {
    if (p.group && p.group !== lastGroup) {
      const h = document.createElement('label');
      h.className = 'g';
      const gcb = document.createElement('input');
      gcb.type = 'checkbox';
      gcb.checked = true;
      const grp = p.group;
      gcb.addEventListener('change', () => setAll(parts.filter(q => q.group === grp), gcb.checked));
      groupBoxes.set(grp, gcb);
      const chev = document.createElement('span');
      chev.className = 'chev';
      chev.textContent = '▾';
      chev.title = 'Collapse / expand';
      chev.addEventListener('click', ev => {
        ev.preventDefault();
        const closed = !collapsed.has(grp);
        if (closed) collapsed.add(grp); else collapsed.delete(grp);
        chev.textContent = closed ? '▸' : '▾';
        for (const q of parts) if (q.group === grp && q.row) q.row.style.display = closed ? 'none' : '';
      });
      h.appendChild(chev);
      h.appendChild(gcb);
      h.appendChild(document.createTextNode(grp));
      host.appendChild(h);
      lastGroup = p.group;
    }
    const row = document.createElement('div');
    row.className = 'p';
    const hex = '#' + p.color.toString(16).padStart(6, '0');
    row.innerHTML = `<input type="checkbox" ${p.userVisible ? 'checked' : ''}><i class="sw" style="background:${hex}"></i><span class="nm">${p.name}<small>${p.dimsText}</small></span>`;
    const cb = row.querySelector('input');
    boxes.set(p, cb);
    p.row = row;
    cb.addEventListener('change', ev => { p.userVisible = ev.target.checked; syncGroups(); });
    row.addEventListener('mouseenter', () => { hover = p; });
    row.addEventListener('mouseleave', () => { hover = null; });
    row.querySelector('.nm').addEventListener('click', () => select(p));
    if (p.print) {
      const b = document.createElement('button');
      b.textContent = '3MF';
      b.title = 'Download this part in print orientation';
      b.addEventListener('click', () => {
        const t = groundTris(printTris(p));
        download(threeMFBlob([{ name: p.name, tris: t }], p.name), `${current.id}-${slug(p.name)}.3mf`);
      });
      row.appendChild(b);
    }
    host.appendChild(row);
  });
  syncGroups();
}

function buildExportsUi() {
  const host = $('modelExports');
  host.innerHTML = '';
  for (const ex of built.exports ?? []) {
    const b = document.createElement('button');
    b.textContent = ex.label;
    b.addEventListener('click', async () => {
      const items = await ex.build();
      if (!items.length) return;
      download(threeMFBlob(items, ex.file), ex.file);
    });
    host.appendChild(b);
  }
  const plate = built.plateExports === false ? 'none' : '';
  $('bPlate3mf').style.display = plate;
}

function computeBoxes() {
  const hasCards = parts.some(p => p.card);
  const asm = new THREE.Box3();
  setPose(0, 1);
  root.updateMatrixWorld(true);
  const sel = parts.filter(p => p.print && p.assembled !== false);
  for (const p of sel.length ? sel : parts) asm.expandByObject(p.object, true);
  let card = null;
  if (hasCards) {
    card = new THREE.Box3();
    setPose(0, 0);
    root.updateMatrixWorld(true);
    for (const p of parts) if (p.card) card.expandByObject(p.object, true);
    for (const x of built.extras ?? []) card.expandByObject(x, true);
  }
  setPose(0, blend);
  return { asm, card, hasCards };
}

function showOverall(state) {
  const box = state === 0 && built.boxes.card ? built.boxes.card : built.boxes.asm;
  const label = state === 0 && built.boxes.card ? 'Card layout size' : 'Overall size';
  $('dims').innerHTML = `<div style="opacity:.55;font-size:10px;letter-spacing:.08em;text-transform:uppercase">${label}</div>${dimsHtml(box.getSize(new THREE.Vector3()))}<div style="opacity:.55;margin-top:4px">${Math.round(built.tris).toLocaleString('en-US')} printable triangles</div>`;
  rootOffset.copy(placement(box));
  buildRulers(box.clone().translate(rootOffset));
  rulerState = state;
}

async function rebuild() {
  if (!current) return;
  const token = ++buildToken;
  showError(null);
  disposeRoot();
  root = new THREE.Group();
  scene.add(root);
  parts = [];
  built = null;
  hover = null;
  select(null);
  $('busy').style.display = 'flex';
  await new Promise(r => requestAnimationFrame(() => setTimeout(r, 20)));
  try {
    const mod = await import(`/models/${current.file}?v=${current.mtime}`);
    const def = mod.default;
    if (!paramStore[current.id]) {
      paramStore[current.id] = Object.fromEntries((def.params ?? []).map(p => [p.key, p.value]));
      buildParamsUi(def, paramStore[current.id]);
      buildTogglesUi(def);
    }
    $('title').textContent = def.title ?? current.id;
    $('desc').textContent = def.description ?? '';
    for (const id of ['opacity', 'cut']) {
      const row = $(id === 'opacity' ? 'opRow' : 'cutRow');
      row.style.display = def.hide?.includes(id) ? 'none' : '';
    }
    const ctx = { THREE, lib, params: paramStore[current.id], body: bodyMat, mat: stdMat, track };
    const result = await def.build(ctx);
    if (token !== buildToken) return;
    built = result;
    built.update = built.update ?? def.update;
    for (const p of built.parts) {
      const part = {
        color: 0xf2f4f8,
        ...p,
        base: (p.base ?? p.object.position).clone(),
        explode: p.explode ?? new THREE.Vector3(),
        print: !!p.print,
        userVisible: true,
        hide: false
      };
      part.object.position.copy(part.base);
      part.object.traverse(o => { o.userData.part = part; });
      root.add(part.object);
      parts.push(part);
    }
    for (const extra of built.extras ?? []) root.add(extra);
    const hasCards = parts.some(p => p.card);
    blend = blendTarget = hasCards ? (built.assemble ?? 0) : 1;
    $('asmRow').style.display = hasCards ? '' : 'none';
    $('bCard').style.display = hasCards ? '' : 'none';
    $('bAsm').style.display = hasCards ? '' : 'none';
    $('assemble').value = Math.round(blend * 100);
    $('asv').textContent = Math.round(blend * 100) + '%';
    root.updateMatrixWorld(true);
    let tris = 0;
    for (const p of parts) {
      if (p.print) {
        const t = printTris(p);
        tris += t.length / 9;
        p.dimsText = `${bounds(t).size.map(fmt).join(' × ')} mm · print`;
      } else if (!p.dimsText) {
        setPose(0, 1);
        const s = new THREE.Box3().setFromObject(p.object).getSize(new THREE.Vector3());
        p.dimsText = `${fmt(s.x)} × ${fmt(s.z)} × ${fmt(s.y)} mm`;
      }
    }
    built.tris = tris;
    built.boxes = computeBoxes();
    built.frame = built.boxes.asm.clone();
    if (built.boxes.card) built.frame.union(built.boxes.card);
    $('info').innerHTML = built.info ?? '';
    $('notes').innerHTML = (built.notes ?? []).map(n => `<div>${n}</div>`).join('');
    showOverall(blend < 0.5 && built.boxes.card ? 0 : 1);
    buildPartsUi();
    buildExportsUi();
    applyClip();
    if (!framed) { setView(blend < 0.5 && built.boxes.card ? 'top' : 'iso'); framed = true; }
  } catch (e) {
    console.error(e);
    if (token === buildToken) showError(e);
  } finally {
    if (token === buildToken) $('busy').style.display = 'none';
  }
}

function setView(name, state = blend < 0.5 ? 0 : 1) {
  if (!built?.boxes) return;
  const box = state === 0 && built.boxes.card ? built.boxes.card : built.boxes.asm;
  const c = box.getCenter(new THREE.Vector3()).add(placement(box));
  const size = box.getSize(new THREE.Vector3());
  const r = Math.max(size.x, size.y, size.z) * 2.4 + 40;
  const dirs = {
    iso: [0.62, 0.45, 0.9],
    front: [0, 0.05, 1],
    side: [1, 0.05, 0],
    top: [0, 1, 0.001]
  };
  const d = new THREE.Vector3(...dirs[name]).normalize();
  camera.position.copy(c).addScaledVector(d, r);
  controls.target.copy(c);
}

async function refreshList(selectId) {
  const res = await fetch('/api/models', { cache: 'no-store' });
  const list = await res.json();
  const sel = $('model');
  const prev = selectId ?? sel.value;
  models = list;
  sel.innerHTML = list.map(m => `<option value="${m.id}">${m.id}</option>`).join('');
  if (list.some(m => m.id === prev)) sel.value = prev;
  return list;
}

async function chooseModel(id) {
  const m = models.find(x => x.id === id);
  if (!m) return;
  if (!current || current.id !== id) {
    framed = false;
    delete paramStore[id];
  }
  current = m;
  localStorage.setItem('modeler.model', id);
  location.hash = id;
  await rebuild();
}

$('model').addEventListener('change', ev => chooseModel(ev.target.value));
$('refresh').addEventListener('click', async () => {
  await refreshList(current?.id);
  if (current) await chooseModel($('model').value);
});

setInterval(async () => {
  try {
    const list = await (await fetch('/api/models', { cache: 'no-store' })).json();
    const idsNow = list.map(m => m.id + m.mtime).join();
    const idsOld = models.map(m => m.id + m.mtime).join();
    if (idsNow === idsOld) return;
    const prev = current?.id;
    models = list;
    const sel = $('model');
    sel.innerHTML = list.map(m => `<option value="${m.id}">${m.id}</option>`).join('');
    if (prev && list.some(m => m.id === prev)) {
      sel.value = prev;
      const fresh = list.find(m => m.id === prev);
      if (fresh.mtime !== current.mtime) {
        current = fresh;
        delete paramStore[prev];
        await rebuild();
      }
    }
  } catch {}
}, 1500);

$('opacity').addEventListener('input', applyOpacity);
$('explode').addEventListener('input', () => { $('exv').textContent = $('explode').value + '%'; });
$('assemble').addEventListener('input', () => {
  blend = blendTarget = $('assemble').value / 100;
  $('asv').textContent = $('assemble').value + '%';
});
$('cut').addEventListener('change', applyClip);
$('spin').addEventListener('change', () => { controls.autoRotate = $('spin').checked; });
document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => { resetMoves(); setView(b.dataset.view); }));
$('bCard').addEventListener('click', () => { resetMoves(); blendTarget = 0; setView('top', 0); });
$('bAsm').addEventListener('click', () => { resetMoves(); blendTarget = 1; setView('iso', 1); });

let drag = null;
const dragRay = new THREE.Raycaster();
function dragPoint(ev, plane) {
  dragRay.setFromCamera(new THREE.Vector2(ev.clientX / innerWidth * 2 - 1, -(ev.clientY / innerHeight) * 2 + 1), camera);
  return dragRay.ray.intersectPlane(plane, new THREE.Vector3());
}
addEventListener('pointerdown', ev => {
  if (ev.target !== renderer.domElement || !ev.ctrlKey || ev.button !== 0 || !selected || !selected.object.visible) return;
  const center = new THREE.Box3().setFromObject(selected.object).getCenter(new THREE.Vector3());
  const normal = camera.getWorldDirection(new THREE.Vector3()).negate();
  const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, center);
  const start = dragPoint(ev, plane);
  if (!start) return;
  controls.enabled = false;
  drag = { plane, last: start, part: selected };
}, true);
addEventListener('pointermove', ev => {
  if (!drag) return;
  const pt = dragPoint(ev, drag.plane);
  if (!pt) return;
  const d = pt.clone().sub(drag.last);
  drag.last = pt;
  root.updateWorldMatrix(true, false);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const len = d.length();
  d.transformDirection(inv).multiplyScalar(len);
  drag.part.moved = (drag.part.moved ?? new THREE.Vector3()).add(d);
});
addEventListener('pointerup', () => {
  if (!drag) return;
  drag = null;
  controls.enabled = true;
});

let down = null;
renderer.domElement.addEventListener('pointerdown', ev => { down = [ev.clientX, ev.clientY]; });
renderer.domElement.addEventListener('pointerup', ev => {
  if (!down || Math.hypot(ev.clientX - down[0], ev.clientY - down[1]) > 4) return;
  const ray = new THREE.Raycaster();
  ray.setFromCamera(new THREE.Vector2(ev.clientX / innerWidth * 2 - 1, -(ev.clientY / innerHeight) * 2 + 1), camera);
  const targets = parts.filter(p => p.object.visible).map(p => p.object);
  const hit = ray.intersectObjects(targets, true)[0];
  select(hit?.object.userData.part ?? null, true);
});

function printItems() {
  return parts.filter(p => p.print).map(p => ({ name: p.name, tris: groundTris(printTris(p)) }));
}

$('bPlate3mf').addEventListener('click', () => {
  const items = layoutOnBed(printItems());
  if (!items.length) return;
  download(threeMFBlob(items, current.id), `${current.id}-plate.3mf`);
});
$('bAsm3mf').addEventListener('click', () => {
  setPose(0, 1);
  root.position.set(0, 0, 0);
  const list = parts.filter(p => p.print && p.assembled !== false).map(p => toZUp(collectTris(p.object)));
  if (!list.length) return;
  const all = new Float32Array(list.reduce((n, t) => n + t.length, 0));
  let o = 0;
  for (const t of list) { all.set(t, o); o += t.length; }
  groundTris(all);
  download(threeMFBlob([{ name: current.id, tris: all }], current.id), `${current.id}-assembled.3mf`);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const clock = new THREE.Clock();
function tick() {
  const t = clock.getElapsedTime();
  const e = $('explode').value / 100;
  if (built) {
    if (Math.abs(blendTarget - blend) > 0.0005) {
      blend += Math.sign(blendTarget - blend) * Math.min(0.012, Math.abs(blendTarget - blend));
      $('assemble').value = Math.round(blend * 100);
      $('asv').textContent = Math.round(blend * 100) + '%';
    }
    setPose(e, blend, true);
    root.position.copy(rootOffset);
    if (built.boxes) {
      const state = blend < 0.5 && built.boxes.card ? 0 : 1;
      if (state !== rulerState) showOverall(state);
    }
    rulerGroup.visible = $('scale').checked;
    try {
      built.update?.({ t, e, blend, toggles: toggleState, root, parts });
    } catch (err) {
      built.update = null;
      showError(err);
    }
    for (const p of parts) p.object.visible = p.userVisible && !p.hide;
    const focus = hover ?? selected;
    selBox.visible = !!focus && focus.object.visible;
    if (selBox.visible) selBox.box.setFromObject(focus.object);
  }
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

applyOpacity();
(async () => {
  try {
    const list = await refreshList();
    if (!list.length) {
      $('title').textContent = 'No models yet';
      $('desc').textContent = 'Add a file to the models folder.';
    } else {
      const want = location.hash.slice(1) || localStorage.getItem('modeler.model');
      const id = list.some(m => m.id === want) ? want : list[0].id;
      $('model').value = id;
      await chooseModel(id);
    }
  } catch (e) {
    showError(e);
  }
  tick();
})();
