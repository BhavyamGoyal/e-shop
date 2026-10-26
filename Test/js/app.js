(function () {
  const FONTS = [
    { id: 'pacifico', name: 'Pacifico (script)', w: 400 },
    { id: 'lobster', name: 'Lobster (script)', w: 400 },
    { id: 'satisfy', name: 'Satisfy (script)', w: 400 },
    { id: 'dancing-script', name: 'Dancing Script (script)', w: 700 },
    { id: 'kaushan-script', name: 'Kaushan Script (brush)', w: 400 },
    { id: 'permanent-marker', name: 'Permanent Marker', w: 400 },
    { id: 'roboto', name: 'Roboto Black', w: 900 },
    { id: 'oswald', name: 'Oswald Bold', w: 700 },
    { id: 'bebas-neue', name: 'Bebas Neue', w: 400 },
    { id: 'righteous', name: 'Righteous', w: 400 },
    { id: 'bangers', name: 'Bangers', w: 400 },
    { id: 'chewy', name: 'Chewy', w: 400 },
    { id: 'luckiest-guy', name: 'Luckiest Guy', w: 400 },
    { id: 'black-ops-one', name: 'Black Ops One', w: 400 },
    { id: 'playfair-display', name: 'Playfair Display Black', w: 900 }
  ];

  const $ = (id) => document.getElementById(id);
  const fontSelect = $('fontSelect');
  const statusEl = $('status');
  const statsEl = $('stats');
  const exportBtn = $('exportBtn');
  const fontCache = new Map();
  let currentFont = null;
  let lastParts = [];
  let timer = null;
  let framed = false;
  let loadToken = 0;

  FONTS.forEach((f, i) => {
    const o = document.createElement('option');
    o.value = String(i);
    o.textContent = f.name;
    fontSelect.appendChild(o);
  });

  function setStatus(msg, isErr) {
    statusEl.textContent = msg;
    statusEl.classList.toggle('err', !!isErr);
  }

  function fontUrl(f) {
    return 'https://cdn.jsdelivr.net/fontsource/fonts/' + f.id + '@latest/latin-' + f.w + '-normal.woff';
  }

  async function loadFontByIndex(i) {
    const token = ++loadToken;
    const f = FONTS[i];
    if (fontCache.has(f.id)) {
      currentFont = fontCache.get(f.id);
      setStatus('Ready');
      rebuild();
      return;
    }
    setStatus('Loading ' + f.name + '…');
    try {
      const res = await fetch(fontUrl(f));
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const font = opentype.parse(await res.arrayBuffer());
      fontCache.set(f.id, font);
      if (token !== loadToken) return;
      currentFont = font;
      setStatus('Ready');
      rebuild();
    } catch (e) {
      if (token !== loadToken) return;
      setStatus('Could not load ' + f.name + ' (' + e.message + '). Upload a font file instead.', true);
    }
  }

  fontSelect.addEventListener('change', () => {
    if (fontSelect.value === 'custom') return;
    loadFontByIndex(parseInt(fontSelect.value, 10));
  });

  $('fontFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      currentFont = opentype.parse(await file.arrayBuffer());
      let opt = fontSelect.querySelector('option[value="custom"]');
      if (!opt) {
        opt = document.createElement('option');
        opt.value = 'custom';
        fontSelect.appendChild(opt);
      }
      opt.textContent = file.name;
      fontSelect.value = 'custom';
      loadToken++;
      setStatus('Ready');
      rebuild();
    } catch (err) {
      setStatus('Could not read that font (' + err.message + '). Use .ttf, .otf or .woff.', true);
    }
  });

  function readParams() {
    const p = {};
    document.querySelectorAll('[data-p]').forEach((el) => {
      const k = el.dataset.p;
      if (el.type === 'range') p[k] = parseFloat(el.value);
      else if (el.type === 'checkbox') p[k] = el.checked;
      else p[k] = el.value;
    });
    return p;
  }

  function clampTo(slider, v) {
    return Math.min(parseFloat(slider.max), Math.max(parseFloat(slider.min), v));
  }

  function formatValue(slider, v) {
    const step = parseFloat(slider.step) || 1;
    const decimals = (String(step).split('.')[1] || '').length;
    return String(parseFloat(v.toFixed(decimals)));
  }

  function setupNumberFields() {
    document.querySelectorAll('output[data-for]').forEach((out) => {
      const slider = document.querySelector('[data-p="' + out.dataset.for + '"]');
      const num = document.createElement('input');
      num.type = 'number';
      num.className = 'num';
      num.min = slider.min;
      num.max = slider.max;
      num.step = slider.step;
      num.value = slider.value;
      const unit = (out.dataset.unit || '').trim();
      if (unit) num.title = unit;
      out.replaceWith(num);
      slider._num = num;
      num.addEventListener('input', () => {
        const v = parseFloat(num.value);
        if (!isFinite(v)) return;
        slider.value = clampTo(slider, v);
        schedule();
      });
      num.addEventListener('change', () => {
        const v = parseFloat(num.value);
        const c = clampTo(slider, isFinite(v) ? v : parseFloat(slider.value));
        slider.value = c;
        num.value = formatValue(slider, c);
        schedule();
      });
    });
  }

  function syncBaseControls() {
    const on = document.querySelector('[data-p="useBase"]').checked;
    ['baseH', 'outline'].forEach((k) => {
      const slider = document.querySelector('[data-p="' + k + '"]');
      slider.disabled = !on;
      if (slider._num) slider._num.disabled = !on;
    });
  }

  function syncNumberFields() {
    document.querySelectorAll('[data-p]').forEach((el) => {
      if (el._num) el._num.value = formatValue(el, parseFloat(el.value));
    });
  }

  const viewport = $('viewport');
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  viewport.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x192631);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 3000);
  camera.up.set(0, 0, 1);
  camera.position.set(0, -90, 70);
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x101a22, 0.9));
  const sun = new THREE.DirectionalLight(0xffffff, 0.9);
  sun.position.set(40, -60, 90);
  scene.add(sun);

  const grid = new THREE.GridHelper(300, 30, 0x425d72, 0x2a3c4b);
  grid.rotation.x = Math.PI / 2;
  grid.position.z = -0.02;
  scene.add(grid);

  const modelGroup = new THREE.Group();
  scene.add(modelGroup);

  function resize() {
    const w = viewport.clientWidth;
    const h = viewport.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(viewport);
  resize();

  function frameModel() {
    const box = new THREE.Box3().setFromObject(modelGroup);
    if (box.isEmpty()) return;
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const d = Math.max(size.x, size.y * 1.5, 30) * 1.5;
    controls.target.copy(center);
    camera.position.set(center.x, center.y - d * 0.7, center.z + d * 0.8);
    controls.update();
  }

  $('resetView').addEventListener('click', frameModel);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  function clearModel() {
    while (modelGroup.children.length) {
      const m = modelGroup.children.pop();
      m.geometry.dispose();
      m.material.dispose();
    }
  }

  function rebuild() {
    if (!currentFont) return;
    const p = readParams();
    const colors = { Base: $('baseColor').value, Text: $('textColor').value };
    let model;
    try {
      model = TextKeychain.build(currentFont, p);
    } catch (e) {
      setStatus('Build failed: ' + e.message, true);
      return;
    }
    clearModel();
    lastParts = [];
    const lines = [];
    let watertight = true;
    let tris = 0;
    for (const layer of model.layers) {
      const mesh = TextKeychain.buildMesh(layer.polys, layer.z0, layer.z1);
      const info = TextKeychain.analyzeMesh(mesh);
      if (info.open || info.nonManifold) watertight = false;
      tris += info.triangles;
      lastParts.push({
        name: layer.name,
        color: colors[layer.name],
        positions: mesh.positions,
        indices: mesh.indices
      });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(mesh.positions, 3));
      geo.setIndex(mesh.indices);
      geo.computeVertexNormals();
      const mat = new THREE.MeshStandardMaterial({
        color: colors[layer.name],
        flatShading: true,
        roughness: 0.55,
        metalness: 0.05
      });
      modelGroup.add(new THREE.Mesh(geo, mat));
    }
    exportBtn.disabled = !lastParts.length;
    if (!lastParts.length) {
      statsEl.textContent = 'Nothing to print yet. Type some text.';
      return;
    }
    const box = new THREE.Box3().setFromObject(modelGroup);
    const s = box.getSize(new THREE.Vector3());
    lines.push('Size: ' + s.x.toFixed(1) + ' × ' + s.y.toFixed(1) + ' × ' + s.z.toFixed(1) + ' mm');
    lines.push('Triangles: ' + tris.toLocaleString());
    lines.push(
      watertight
        ? '<span class="ok">Watertight: ready to slice</span>'
        : '<span class="bad">Mesh has open edges, try changing Join letters</span>'
    );
    statsEl.innerHTML = lines.join('<br>');
    if (!framed) {
      framed = true;
      frameModel();
    }
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 120);
  }

  document.querySelectorAll('[data-p]').forEach((el) => {
    el.addEventListener('input', () => {
      syncNumberFields();
      syncBaseControls();
      schedule();
    });
  });

  function recolor() {
    const colors = { Base: $('baseColor').value, Text: $('textColor').value };
    const names = lastParts.map((p) => p.name);
    modelGroup.children.forEach((m, i) => {
      m.material.color.set(colors[names[i]]);
      lastParts[i].color = colors[names[i]];
    });
  }
  $('baseColor').addEventListener('input', recolor);
  $('textColor').addEventListener('input', recolor);

  exportBtn.addEventListener('click', async () => {
    if (!lastParts.length) return;
    exportBtn.disabled = true;
    try {
      const name = ($('fileName').value || 'keychain').replace(/[^\w\-]+/g, '_');
      const blob = await ThreeMF.build(lastParts, name);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name + '.3mf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setStatus('Exported ' + name + '.3mf');
    } catch (e) {
      setStatus('Export failed: ' + e.message, true);
    } finally {
      exportBtn.disabled = false;
    }
  });

  setupNumberFields();
  syncBaseControls();
  loadFontByIndex(0);
})();
