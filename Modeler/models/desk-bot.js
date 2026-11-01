import { THREE, RoundedBoxGeometry, V, slab, cutter, plainBox, ringGeometry, makeCsg, mesh, limb, wireBundle } from '../lib/geometry.js';

export default {
  title: 'Desk Bot',
  description: 'Full-body desk companion shell with ESP32, screen, battery, touch, vibration and charger bays.',
  params: [
    { key: 'wall', label: 'Wall thickness', min: 1.6, max: 3.2, step: 0.1, value: 2.2, unit: ' mm' },
    { key: 'gap', label: 'Cap clearance', min: 0.1, max: 0.5, step: 0.05, value: 0.2, unit: ' mm' }
  ],
  toggles: [
    { key: 'wires', label: 'Wiring', value: true },
    { key: 'vib', label: 'Vibrate', value: false }
  ],
  build({ params, body, mat, track }) {
    const WALL = params.wall;
    const GAP = params.gap;
    const HW = 66, HH = 44, HD = 66, HR = 8.8;
    const HEAD_CY = 72.6;
    const TW = 44, TH = 27.5, TD = 41.8, TR = 5.5;
    const T_OPEN_W = 28.6, T_OPEN_H = 12.65, T_OPEN_R = 3.3;
    const TORSO_Y = 17;
    const FW = 28.6, FH = 18.7, FD = 48.4, FR = 6.6;
    const FOOT_X = 18.7;
    const SOLE = 3.3;
    const LIP_Z = 15;
    const PASS_X = 13.75;
    const PASS_R = 3.5;
    const OPEN_W = 44, OPEN_H = 22, OPEN_R = 4.4;
    const FRONT_IN = HD / 2 - WALL;
    const SCREEN_DY = -1.5;
    const WINDOW_DY = SCREEN_DY + 3.5;
    const ESP_X = -14.5;
    const ESP_DY = -5;
    const ESP_Z = -0.15;
    const BAT_X = 15.9;
    const BAT_DY = -14.8;
    const BAT_Z = 3.6;
    const CHARGER_Y = 6.8;
    const CHARGER_Z = -8.7;
    const PORT_Y = CHARGER_Y + 3.2;
    const TORSO_CY = TORSO_Y + TH / 2;

    const csg = makeCsg();
    const sub = (a, g) => csg.sub(a, g);
    const inter = (a, g) => csg.inter(a, g);

    const bodyMesh = geo => mesh(geo, body);
    const pcb = color => mat(color, { roughness: 0.55, metalness: 0.2 });
    const metal = mat(0xc8ccd2, { roughness: 0.3, metalness: 0.95 });
    const black = mat(0x15171c, { roughness: 0.5, metalness: 0.2 });
    const tabMat = mat(0xdfe3ea, { roughness: 0.5, metalness: 0.05 });

    function columnOuter(w, h, d, r) {
      const full = csg.brush(new RoundedBoxGeometry(w, h * 2, d, 12, r));
      return inter(full, plainBox(w + 2, h, d + 2, 0, h / 2, 0));
    }

    function buildHead() {
      let r = csg.brush(new RoundedBoxGeometry(HW, HH, HD, 12, HR));
      r = sub(r, new RoundedBoxGeometry(HW - WALL * 2, HH - WALL * 2, HD - WALL * 2, 12, HR - WALL));
      r = sub(r, cutter(OPEN_W, OPEN_H, OPEN_R, 6, -HD / 2 - 3));
      r = sub(r, cutter(35.2, 18.7, 1.2, 6, FRONT_IN - 1.5).translate(0, WINDOW_DY, 0));
      r = sub(r, new THREE.CylinderGeometry(6, 6, 10, 40).translate(0, -HH / 2, 0));
      return r.geometry;
    }

    function buildCap(depth, openW, openH, openR, slot) {
      const plate = cutter(openW - GAP * 2, openH - GAP * 2, openR - GAP, WALL, -depth / 2);
      let r = csg.brush(plate);
      if (slot) r = sub(r, cutter(10, 4.4, 1.4, 6, -depth / 2 - 3).translate(slot[0], slot[1], 0));
      return r.geometry;
    }

    function buildTorso() {
      let r = csg.brush(new RoundedBoxGeometry(TW, TH, TD, 12, TR));
      r = sub(r, new RoundedBoxGeometry(TW - WALL * 2, TH - WALL * 2, TD - WALL * 2, 12, TR - WALL));
      r = sub(r, cutter(T_OPEN_W, T_OPEN_H, T_OPEN_R, 6, -TD / 2 - 3));
      r = sub(r, new THREE.CylinderGeometry(6, 6, 10, 40).translate(0, TH / 2, 0));
      for (const px of [-PASS_X, PASS_X]) r = sub(r, new THREE.CylinderGeometry(PASS_R, PASS_R, 10, 32).translate(px, -TH / 2, 0));
      return r.geometry;
    }

    function buildFoot(sx) {
      const withPort = sx > 0;
      const withWindow = sx < 0;
      const outer = columnOuter(FW, FH, FD, FR);
      let upper = inter(outer, plainBox(FW + 2, FH - SOLE, FD + 2, 0, SOLE + (FH - SOLE) / 2, 0));
      upper = sub(upper, new RoundedBoxGeometry(FW - WALL * 2, (FH - WALL) * 2, FD - WALL * 2, 12, FR - WALL));
      if (withPort) upper = sub(upper, cutter(9.2, 3.8, 1.4, 6, -FD / 2 - 3).translate(0, PORT_Y, 0));
      upper = sub(upper, new THREE.CylinderGeometry(PASS_R, PASS_R, 10, 32).translate(-sx * (FOOT_X - PASS_X), FH, 0));
      for (const gx of [-1, 1]) {
        for (const gz of [-1, 1]) upper = sub(upper, plainBox(1.0, 1.4, 5, gx * 12.6, 5.2, gz * LIP_Z));
      }
      upper = sub(upper, plainBox(3, 1.6, 8, -sx * (FW / 2), SOLE + 0.8, 0));
      let sole = inter(columnOuter(FW, FH, FD, FR), plainBox(FW + 2, SOLE, FD + 2, 0, SOLE / 2, 0));
      if (withWindow) {
        const w = cutter(21.4, 23.4, 2, 6, -3).rotateX(Math.PI / 2).translate(0, 3.8, 0);
        sole = sub(sole, w);
      }
      return { upper: upper.geometry, sole: sole.geometry };
    }

    function buildBackCap(depth, openW, openH, slot, tabSpecs, blockParent) {
      const half = { x: openW / 2, y: openH / 2 };
      const backIn = -depth / 2 + WALL;
      const zr = -depth / 2 + WALL - 0.2;
      const ze = backIn + 5;
      const len = ze - zr;
      const zc = (zr + ze) / 2;
      const hookZ = ze - 1.0;
      const blockZ = backIn + 1.4;
      const tabs = new THREE.Group();
      for (const [axis, sign, offset, span] of tabSpecs) {
        const horizontal = axis === 'x';
        const h = half[axis];
        const dims = (t, w, l) => (horizontal ? [t, w, l] : [w, t, l]);
        const place = (m, radial, z) => {
          if (horizontal) m.position.set(sign * radial, offset, z);
          else m.position.set(offset, sign * radial, z);
        };
        const plate = new THREE.Mesh(new THREE.BoxGeometry(...dims(1.2, span, len)), tabMat);
        place(plate, h - GAP - 0.7, zc);
        const hook = new THREE.Mesh(new THREE.BoxGeometry(...dims(1.0, span - 1, 1.6)), tabMat);
        place(hook, h + 0.1, hookZ);
        plate.castShadow = hook.castShadow = true;
        tabs.add(plate, hook);
        const block = new THREE.Mesh(new THREE.BoxGeometry(...dims(1.5, span + 1, 2.8)), tabMat);
        place(block, h + 0.75, blockZ);
        block.castShadow = true;
        blockParent.add(block);
      }
      const cap = new THREE.Group();
      cap.add(bodyMesh(buildCap(depth, openW, openH, openW === OPEN_W ? OPEN_R : T_OPEN_R, slot)), tabs);
      return cap;
    }

    const parts = [];
    const add = (name, object, base, explode, opts = {}) => {
      object.position.copy(base);
      parts.push({ name, object, base, explode, ...opts });
    };
    const printed = { color: 0xf2f4f8, print: true };
    const UP = Math.PI / 2;

    const headGroup = new THREE.Group();
    headGroup.add(bodyMesh(buildHead()));
    add('Head cap', buildBackCap(HD, OPEN_W, OPEN_H, [ESP_X, ESP_DY + 2.2], [['x', -1, 0, 6], ['x', 1, 0, 6], ['y', 1, 0, 8], ['y', -1, 9, 8]], headGroup),
      V(0, HEAD_CY, 0), V(0, 0, -42), { ...printed, printRotate: [-UP, 0, 0] });
    add('Head', headGroup, V(0, HEAD_CY, 0), V(0, 0, 0), { ...printed, printRotate: [UP, 0, 0] });

    for (const sx of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.CylinderGeometry(7.7, 7.7, 4.95, 40), body);
      ear.rotation.z = Math.PI / 2;
      ear.castShadow = true;
      const g = new THREE.Group();
      g.add(ear);
      add(sx < 0 ? 'Ear left' : 'Ear right', g, V(sx * (33.2 + 2.475), HEAD_CY + 1.1, 2.2), V(0, 0, 0), { ...printed, printRotate: [0, 0, UP] });
    }

    {
      const g = new THREE.Group();
      const m = bodyMesh(ringGeometry(9.5, 6, 6.3, 40));
      g.add(m);
      add('Neck ring', g, V(0, 44.3, 0), V(0, 0, 0), printed);
    }

    {
      const torso = new THREE.Group();
      torso.add(bodyMesh(buildTorso()));
      const torsoCap = buildBackCap(TD, T_OPEN_W, T_OPEN_H, null, [['x', -1, 0, 5], ['x', 1, 0, 5], ['y', 1, 0, 8], ['y', -1, 0, 8]], torso);
      add('Torso', torso, V(0, TORSO_CY, 0), V(0, 0, 0), { ...printed, printRotate: [UP, 0, 0] });
      add('Torso cap', torsoCap, V(0, TORSO_CY, 0), V(0, 0, -38), { ...printed, printRotate: [-UP, 0, 0] });
    }

    for (const sx of [-1, 1]) {
      const side = sx < 0 ? 'left' : 'right';
      const f = buildFoot(sx);
      const upper = new THREE.Group();
      upper.add(bodyMesh(f.upper));
      add(`Foot ${side}`, upper, V(sx * FOOT_X, 0, 0), V(0, 0, 0), { ...printed, printRotate: [Math.PI, 0, 0] });
      const sole = new THREE.Group();
      sole.add(bodyMesh(f.sole));
      for (const gx of [-1, 1]) {
        for (const gz of [-1, 1]) {
          const lip = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.6, 4), body);
          lip.position.set(gx * 11.3, SOLE + 1.7, gz * LIP_Z);
          const bump = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 3), body);
          bump.position.set(gx * 12.2, 5.2, gz * LIP_Z);
          lip.castShadow = bump.castShadow = true;
          sole.add(lip, bump);
        }
      }
      add(`Sole ${side}`, sole, V(sx * FOOT_X, 0, 0), V(sx * 12, -22, 0), printed);
    }

    for (const sx of [-1, 1]) {
      const a = V(sx * 24.2, 39, 0.55), b = V(sx * 34.1, 29.15, 1.1);
      const arm = limb(a, b, 6.05, 4.62, body);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), body);
      hand.scale.set(6.6, 7.15, 6.05);
      hand.position.set(sx * 35.75, 24.75, 1.65);
      hand.castShadow = true;
      arm.add(hand);
      add(sx < 0 ? 'Arm left' : 'Arm right', arm, V(0, 0, 0), V(0, 0, 0), printed);
    }

    const vibGroup = new THREE.Group();
    {
      const padMat = mat(0xff7a1a, { roughness: 0.6, metalness: 0.1 });
      const pad = slab(21, 23, 5, 2, padMat);
      pad.rotation.x = Math.PI / 2;
      pad.position.y = 0.8 + 2.5;
      const motor = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 7, 32), metal);
      motor.rotation.z = Math.PI / 2;
      motor.position.set(0, 0.8 + 5 + 3.2, 0);
      motor.castShadow = true;
      vibGroup.add(pad, motor);
    }
    add('Vibration module', vibGroup, V(-FOOT_X, 0, 0), V(-12, -22, 0), { color: 0xff7a1a });

    const chargerGroup = new THREE.Group();
    {
      const board = slab(17, 25, 1.6, 1.5, pcb(0x1f3f8a));
      board.rotation.x = Math.PI / 2;
      board.position.y = 0.8;
      const port = new THREE.Mesh(new RoundedBoxGeometry(9, 3.2, 7.5, 3, 0.9), metal);
      port.position.set(0, 3.2, -25 / 2 + 3.2);
      port.castShadow = true;
      const chip = new THREE.Mesh(new THREE.BoxGeometry(5, 1, 5), black);
      chip.position.set(0, 2.1, 4);
      chargerGroup.add(board, port, chip);
      for (const px of [-5.5, 5.5]) {
        for (const pz of [-9, 9]) {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 3.5, 16), tabMat);
          post.position.set(px, -1.75, pz);
          chargerGroup.add(post);
        }
      }
    }
    add('C-type charger', chargerGroup, V(FOOT_X, CHARGER_Y, CHARGER_Z), V(12, -22, 0), { color: 0x1f3f8a });

    for (const sx of [-1, 1]) {
      const g = new THREE.Group();
      const board = slab(10.7, 14, 1.4, 1.5, pcb(0xd9a21c));
      const chip = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 0.6), black);
      chip.position.z = -0.9;
      g.add(board, chip);
      add(sx < 0 ? 'Touch module L' : 'Touch module R', g, V(sx * 9.9, TORSO_CY, TD / 2 - WALL - 0.7), V(sx * 8, 0, 34), { color: 0xd9a21c });
    }

    const accelGroup = new THREE.Group();
    {
      const board = slab(20, 15, 1.6, 1.5, pcb(0x7a2fb0));
      const chip = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 1), black);
      chip.position.set(0, 0, 1.3);
      const pins = new THREE.Mesh(new THREE.BoxGeometry(14, 2.5, 2.5), black);
      pins.position.set(0, -5, -1.5);
      accelGroup.add(board, chip, pins);
    }
    accelGroup.rotation.x = -Math.PI / 2;
    add('Accelerometer', accelGroup, V(0, HEAD_CY + 15.5, -6.6), V(0, 22, 0), { color: 0x7a2fb0 });

    const batteryGroup = new THREE.Group();
    {
      const inner = new THREE.Group();
      const cell = slab(25, 44, 10, 2.5, mat(0x4b6fd1, { roughness: 0.4, metalness: 0.3 }));
      const tab = new THREE.Mesh(new THREE.BoxGeometry(10, 4, 1.2), black);
      tab.position.set(0, -24, 0);
      inner.add(cell, tab);
      inner.rotation.x = -Math.PI / 2;
      batteryGroup.add(inner);
      batteryGroup.rotation.y = Math.PI;
    }
    add('Battery', batteryGroup, V(BAT_X, HEAD_CY + BAT_DY, BAT_Z), V(14, 10, 4), { color: 0x4b6fd1 });

    const espGroup = new THREE.Group();
    {
      const inner = new THREE.Group();
      const board = slab(28.5, 51.5, 1.6, 1.5, pcb(0x14171f));
      const can = new THREE.Mesh(new THREE.BoxGeometry(18, 25.5, 3), metal);
      can.position.set(0, 12, 2.3);
      can.castShadow = true;
      const usb = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 2.8), metal);
      usb.position.set(0, -24.5, 2.2);
      inner.add(board, can, usb);
      const pinsMat = mat(0xd9b45a, { metalness: 0.9, roughness: 0.35 });
      for (const sx of [-1, 1]) {
        const strip = new THREE.Mesh(new THREE.BoxGeometry(2.5, 44, 2.5), black);
        strip.position.set(sx * 12.6, -2, -1.6);
        const gold = new THREE.Mesh(new THREE.BoxGeometry(0.7, 44, 0.7), pinsMat);
        gold.position.set(sx * 12.6, -2, -3.1);
        inner.add(strip, gold);
      }
      inner.rotation.x = -Math.PI / 2;
      espGroup.add(inner);
      espGroup.rotation.y = Math.PI;
      const floorDy = -HH / 2 + WALL - ESP_DY;
      for (const px of [-8, 8]) {
        for (const pz of [-20, 20]) {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, -floorDy - 0.8, 16), tabMat);
          post.position.set(px, (floorDy - 0.8) / 2, pz);
          espGroup.add(post);
        }
      }
    }
    add('ESP32', espGroup, V(ESP_X, HEAD_CY + ESP_DY, ESP_Z), V(-14, 12, -10), { color: 0x3a3f4d });

    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 700;
    screenCanvas.height = 370;
    const sctx = screenCanvas.getContext('2d');
    const screenTex = new THREE.CanvasTexture(screenCanvas);
    screenTex.colorSpace = THREE.SRGBColorSpace;
    screenTex.anisotropy = 8;

    function drawFace(t) {
      const w = screenCanvas.width, h = screenCanvas.height;
      sctx.fillStyle = '#04080c';
      sctx.fillRect(0, 0, w, h);
      const blink = (t % 4) > 3.85 ? 0.12 : 1;
      const look = Math.sin(t * 0.8) * 14;
      sctx.fillStyle = '#4ff0ff';
      sctx.shadowColor = '#4ff0ff';
      sctx.shadowBlur = 24;
      for (const ex of [w * 0.3, w * 0.7]) {
        const ew = 100, eh = 130 * blink;
        sctx.beginPath();
        sctx.roundRect(ex - ew / 2 + look, h * 0.45 - eh / 2, ew, eh, 34);
        sctx.fill();
      }
      sctx.shadowBlur = 0;
      screenTex.needsUpdate = true;
    }
    drawFace(0);

    const screenGroup = new THREE.Group();
    {
      const board = slab(35, 32.2, 1.6, 2, pcb(0x101216));
      const glass = new THREE.Mesh(new THREE.PlaneGeometry(35, 18.5), track(new THREE.MeshBasicMaterial({ map: screenTex })));
      glass.position.set(0, 3.5, 0.85);
      const flex = new THREE.Mesh(new THREE.BoxGeometry(14, 2.5, 0.4), mat(0xc78a2c, { roughness: 0.6 }));
      flex.position.set(0, -14.5, -0.8);
      screenGroup.add(board, glass, flex);
    }
    add('Screen', screenGroup, V(0, HEAD_CY + SCREEN_DY, FRONT_IN - 0.9), V(0, 0, 34), { color: 0x4ff0ff });

    const wireGroup = new THREE.Group();
    const S = 1.1;
    const COLORS = [0xe23b3b, 0x1b1b1f, 0xf2c200, 0x2fbf71];
    const bundle = (points, count, offset = [0, 0]) =>
      wireBundle(wireGroup, points.map(p => [p[0] * S, p[1] * S, p[2] * S]), COLORS.slice(0, count), track, { offset: [offset[0] , offset[1]] });
    const NECK_UP = [[0.8, 48, -1], [0, 45, 0], [0, 41, 0], [0, 36, 0]];
    bundle([[-1.73, 55, 14], [-1.73, 50, 6], ...NECK_UP, [-4, 31, 13], [-9, 29.5, 14.2]], 4, [-1.6, 0]);
    bundle([[-1.73, 55, 10], [-1.73, 50, 4], ...NECK_UP, [4, 31, 13], [9, 29.5, 14.2]], 4, [1.6, 0]);
    bundle([[-1.73, 55, 6], [-1.73, 50, 2], ...NECK_UP, [-3, 28, 2], [-9, 22, 1], [-11.5, 18, 0.8], [-11.5, 15, 0.8], [-12, 10.5, 1], [-13.5, 8.5, 3]], 4, [0, -1.6]);
    bundle([[-1.73, 55, 2], [-1.73, 50, 0], ...NECK_UP, [3, 28, 1], [9, 22, 1], [11.5, 18, 0.8], [11.5, 15, 0.8], [13, 10.5, 2], [16, 8.8, 5]], 4, [0, 1.6]);
    bundle([[0, 44, 1.5], [4, 49.5, -8], [10, 51, -18], [14.5, 53, -21]], 2, [0, 1.6]);
    bundle([[14.5, 53, -21], [8, 51, -23.5], [-6, 51, -24.5], [-12, 55, -23]], 2);
    bundle([[-8, 59, 24], [-6, 62, 25.5], [-4, 64, 26]], 4);
    bundle([[-12, 62.5, -6], [-8, 70, -6], [-3, 78, -6], [0, 80, -6]], 4);

    return {
      parts,
      extras: [wireGroup],
      notes: [
        '4 wires per module: screen, accelerometer, touch L, touch R, vibration, charger.',
        'Neck carries 16 wires through a 12 mm hole.',
        'Each foot passage is 7 mm for 4 wires; ESP32 end takes 24 wires.'
      ],
      update({ t, e, toggles, root }) {
        wireGroup.visible = toggles.wires && e < 0.02;
        const sh = toggles.vib ? 0.15 : 0;
        root.position.set(Math.sin(t * 90) * sh, 0, Math.cos(t * 83) * sh);
        drawFace(t);
      }
    };
  }
};
