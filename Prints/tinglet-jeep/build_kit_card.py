import math
import sys
import zipfile
import numpy as np

OUT = sys.argv[1] if len(sys.argv) > 1 else "tinglet-jeep-kit-card.3mf"
PREVIEW = sys.argv[2] if len(sys.argv) > 2 else None

CARD_W, CARD_H, FRAME_T, BAR = 112.0, 72.0, 1.6, 2.0
RUNNER_W, RUNNER_T = 0.8, 0.8
FIT = 0.2


def box(x0, y0, z0, x1, y1, z1):
    v = np.array([[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0],
                  [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], float)
    f = np.array([[0, 2, 1], [0, 3, 2], [4, 5, 6], [4, 6, 7], [0, 1, 5], [0, 5, 4],
                  [1, 2, 6], [1, 6, 5], [2, 3, 7], [2, 7, 6], [3, 0, 4], [3, 4, 7]])
    return v, f


def merge(meshes):
    vs, fs, off = [], [], 0
    for v, f in meshes:
        vs.append(v)
        fs.append(f + off)
        off += len(v)
    return np.vstack(vs), np.vstack(fs)


def translate(m, dx=0, dy=0, dz=0):
    return m[0] + np.array([dx, dy, dz]), m[1]


def rotz(m, ang):
    c, s = math.cos(ang), math.sin(ang)
    r = np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])
    return m[0] @ r.T, m[1]


def prism(poly, z0, z1):
    poly = np.array(poly, float)
    n = len(poly)
    cx, cy = poly.mean(axis=0)
    v = [[cx, cy, z0], [cx, cy, z1]]
    for z in (z0, z1):
        for x, y in poly:
            v.append([x, y, z])
    f = []
    for i in range(n):
        j = (i + 1) % n
        f.append([0, 2 + j, 2 + i])
        f.append([1, 2 + n + i, 2 + n + j])
        f.append([2 + i, 2 + j, 2 + n + j])
        f.append([2 + i, 2 + n + j, 2 + n + i])
    return np.array(v, float), np.array(f)


def disc(cx, cy, r, z0, z1, n=32):
    pts = [(cx + r * math.cos(2 * math.pi * i / n), cy + r * math.sin(2 * math.pi * i / n)) for i in range(n)]
    return prism(pts, z0, z1)


def ring(cx, cy, ro, ri, z0, z1, n=40):
    v, f = [], []
    for z in (z0, z1):
        for r in (ro, ri):
            for i in range(n):
                a = 2 * math.pi * i / n
                v.append([cx + r * math.cos(a), cy + r * math.sin(a), z])
    f = []
    for i in range(n):
        j = (i + 1) % n
        bo, bi, to, ti = i, n + i, 2 * n + i, 3 * n + i
        bo2, bi2, to2, ti2 = j, n + j, 2 * n + j, 3 * n + j
        f += [[bo, bo2, to2], [bo, to2, to], [bi, ti2, bi2], [bi, ti, ti2],
              [to, to2, ti2], [to, ti2, ti], [bo, bi2, bo2], [bo, bi, bi2]]
    return np.array(v, float), np.array(f)


def rod_x(x0, x1, yc, zc, r, n=20):
    pts = [(yc + r * math.cos(2 * math.pi * i / n), zc + r * math.sin(2 * math.pi * i / n)) for i in range(n)]
    v, f = prism(pts, x0, x1)
    v = v[:, [2, 0, 1]]
    return v, f[:, [0, 2, 1]]


def star(cx, cy, ro, ri, z0, z1):
    pts = []
    for i in range(10):
        r = ro if i % 2 == 0 else ri
        a = math.pi / 2 + i * math.pi / 5
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return prism(pts, z0, z1)


def slab(x0, y0, x1, y1, z0, z1, holes=()):
    xs = sorted({x0, x1} | {h[0] for h in holes} | {h[2] for h in holes})
    ys = sorted({y0, y1} | {h[1] for h in holes} | {h[3] for h in holes})
    out = []
    for i in range(len(xs) - 1):
        for j in range(len(ys) - 1):
            mx, my = (xs[i] + xs[i + 1]) / 2, (ys[j] + ys[j + 1]) / 2
            if any(h[0] < mx < h[2] and h[1] < my < h[3] for h in holes):
                continue
            out.append(box(xs[i], ys[j], z0, xs[i + 1], ys[j + 1], z1))
    return merge(out)


def bbox(m):
    return m[0].min(axis=0), m[0].max(axis=0)


def normalize(m, x, y):
    lo, _ = bbox(m)
    return translate(m, x - lo[0], y - lo[1], -lo[2])


FONT = {
    "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    "I": ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
    "N": ["10001", "11001", "10101", "10101", "10011", "10001", "10001"],
    "G": ["01110", "10001", "10000", "10111", "10001", "10001", "01110"],
    "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
}


def text_mesh(s, px, z0, z1):
    out, x = [], 0.0
    for ch in s:
        for r, row in enumerate(FONT[ch]):
            for c, bit in enumerate(row):
                if bit == "1":
                    out.append(box(x + c * px, (6 - r) * px, z0, x + (c + 1) * px, (7 - r) * px, z1))
        x += 6 * px
    return merge(out)


BODY_L, BODY_W = 50.0, 24.0
WALL, FLOOR = 1.6, 1.6
HOOD_L, HOOD_H = 15.0, 7.0
TUB_H = 8.5
SLOT = 1.4
LIP_X0 = HOOD_L + SLOT
LIP_X1 = LIP_X0 + 1.4
CH_L, CH_W = 46.0, 14.0
CH_OFF_X, CH_OFF_Y = 4.0, 5.0
PEG_X = (19.0, 42.0)
PEG_Y = (1.6, 12.4)
PEG = 2.4
HOLE = PEG + 2 * FIT
AXLE_X = (8.0, 36.0)
AXLE_R = 1.3
AXLE_LEN = 34.0
CHAN = 2 * AXLE_R + 2 * FIT + 1.4


def make_body():
    holes = []
    for px in PEG_X:
        for py in PEG_Y:
            hx = CH_OFF_X + px
            hy = CH_OFF_Y + py
            holes.append((hx - HOLE / 2, hy - HOLE / 2, hx + HOLE / 2, hy + HOLE / 2))
    parts = [
        slab(0, 0, BODY_L, BODY_W, 0, FLOOR, holes),
        box(0, 0, 0, HOOD_L, BODY_W, HOOD_H),
        box(HOOD_L, 0, 0, BODY_L, WALL, TUB_H),
        box(HOOD_L, BODY_W - WALL, 0, BODY_L, BODY_W, TUB_H),
        box(BODY_L - WALL, 0, 0, BODY_L, BODY_W, TUB_H),
        box(LIP_X0, 0, 0, LIP_X1, BODY_W, TUB_H + 0.5),
        box(HOOD_L, 0, 0, LIP_X0, WALL, TUB_H),
        box(HOOD_L, BODY_W - WALL, 0, LIP_X0, BODY_W, TUB_H),
        box(0, 0, HOOD_H, HOOD_L, BODY_W, HOOD_H + 0.4),
    ]
    for cx in (9.0, 40.0):
        parts.append(box(cx - 4.5, -0.6, TUB_H - 1.0, cx + 4.5, 0.0, TUB_H + 0.4))
        parts.append(box(cx - 4.5, BODY_W, TUB_H - 1.0, cx + 4.5, BODY_W + 0.6, TUB_H + 0.4))
    for i in range(7):
        gy = 4.2 + i * 2.6
        parts.append(box(-0.8, gy, 1.8, 0, gy + 1.2, 5.8))
    for hy in (3.2, BODY_W - 3.2):
        pts = [(hy + 2.2 * math.cos(2 * math.pi * i / 24), 5.2 + 2.2 * math.sin(2 * math.pi * i / 24)) for i in range(24)]
        v, f = prism(pts, -0.8, 0)
        v = v[:, [2, 0, 1]]
        parts.append((v, f[:, [0, 2, 1]]))
    parts.append(box(BODY_L - 12, 2.0, FLOOR, BODY_L - 2.0, 3.6, FLOOR + 1.0))
    parts.append(box(BODY_L - 12, BODY_W - 3.6, FLOOR, BODY_L - 2.0, BODY_W - 2.0, FLOOR + 1.0))
    return merge(parts)


def make_chassis():
    L, W = CH_L, CH_W
    rail_w = 3.2
    top0 = 2 * AXLE_R + 2 * FIT + 0.3
    H = 4.6
    parts = []
    gaps = [(a - CHAN / 2, a + CHAN / 2) for a in AXLE_X]
    for y0, y1 in ((0, rail_w), (W - rail_w, W)):
        cur = 0.0
        for g0, g1 in gaps:
            parts.append(box(cur, y0, 0, g0, y1, H))
            parts.append(box(g0, y0, top0, g1, y1, H))
            cur = g1
        parts.append(box(cur, y0, 0, L, y1, H))
    for a in AXLE_X:
        parts.append(box(a - CHAN / 2 - 1.5, rail_w, top0, a + CHAN / 2 + 1.5, W - rail_w, H))
    parts.append(box(L - 2.4, rail_w, 0, L, W - rail_w, H))
    parts.append(box(0, rail_w, 0, 2.4, W - rail_w, H))
    for px in PEG_X:
        for py in PEG_Y:
            parts.append(box(px - PEG / 2, py - PEG / 2, H, px + PEG / 2, py + PEG / 2, H + 2.0))
    return merge(parts)


def make_axle():
    return rod_x(0, AXLE_LEN, 0, AXLE_R, AXLE_R)


TYRE_R, TYRE_H = 6.0, 4.0
TYRE_IN = 3.8


def make_tyre():
    parts = [ring(0, 0, TYRE_R - 0.4, TYRE_IN, 0, TYRE_H)]
    n = 22
    for i in range(n):
        a = 2 * math.pi * i / n
        lug = box(TYRE_R - 0.9, -0.55, 0, TYRE_R, 0.55, TYRE_H)
        parts.append(rotz(lug, a))
    return merge(parts)


def make_wheel_set():
    hub_r = TYRE_IN - FIT
    parts = [make_tyre()]
    parts.append(ring(0, 0, hub_r, AXLE_R + FIT, 0, TYRE_H + 0.6))
    parts.append(ring(0, 0, hub_r + 1.0, AXLE_R + FIT, TYRE_H + 0.2, TYRE_H + 0.8))
    for ang in (0.0, math.pi):
        parts.append(rotz(box(hub_r - 0.2, -0.5, 0, TYRE_IN + 0.3, 0.5, 0.6), ang))
    for i in range(6):
        a = 2 * math.pi * i / 6 + math.pi / 6
        parts.append(translate(disc(2.6 * math.cos(a), 2.6 * math.sin(a), 0.45, TYRE_H + 0.8, TYRE_H + 1.0, 12)))
    return merge(parts)


def make_seat(depth, width, back_h=9.0):
    return merge([
        box(0, 0, 0, depth, width, 3.0),
        box(0, 0, 3.0, 1.8, width, back_h),
        box(0, 0, 3.0, depth, 1.2, 4.6),
        box(0, width - 1.2, 3.0, depth, width, 4.6),
    ])


def make_windshield():
    w, h, t = 20.4, 12.0, 1.2
    b = 1.6
    return merge([
        box(0, 0, 0, w, b, t),
        box(0, h - b, 0, w, h, t),
        box(0, 0, 0, b, h, t),
        box(w - b, 0, 0, w, h, t),
        box(w / 2 - 0.6, 0, 0, w / 2 + 0.6, h, t),
    ])


def make_rollbar():
    w, h, b, t = 20.0, 9.0, 1.6, 1.6
    return merge([
        box(0, 0, 0, b, h, t),
        box(w - b, 0, 0, w, h, t),
        box(0, h - b, 0, w, h, t),
        box(0, 0, 0, b + 1.4, 1.6, t),
        box(w - b - 1.4, 0, 0, w, 1.6, t),
        box(b, h / 2 - 0.4, 0, w - b, h / 2 + 0.4, t),
    ])


def make_bumper():
    w = 24.0
    parts = [
        box(0, 0, 0, w, 3.4, 3.0),
        box(0, 0, 3.0, 2.6, 3.4, 4.2),
        box(w - 2.6, 0, 3.0, w, 3.4, 4.2),
        ring(4.5, 1.7, 1.6, 0.7, 0, 1.2, 16),
        ring(w - 4.5, 1.7, 1.6, 0.7, 0, 1.2, 16),
    ]
    return merge([translate(p, 0, 0, 0) for p in parts])


def make_steering():
    parts = [ring(0, 0, 3.3, 2.3, 0, 1.2),
             box(-2.4, -0.4, 0, 2.4, 0.4, 1.2),
             box(-0.4, -2.4, 0, 0.4, 0, 1.2),
             box(3.3, -0.7, 0, 9.0, 0.7, 1.4)]
    return merge(parts)


def make_jerry():
    return merge([
        box(0, 0, 0, 6.0, 5.4, 2.4),
        box(6.0, 3.4, 0, 7.4, 4.8, 1.8),
        box(1.5, 5.4, 0, 4.5, 6.4, 1.6),
        box(0.6, 0.6, 2.4, 5.4, 4.8, 2.8),
    ])


def make_star():
    return merge([ring(0, 0, 4.2, 3.6, 0, 0.8), star(0, 0, 3.9, 1.6, 0, 0.8)])


def make_plate():
    px = 0.8
    txt = text_mesh("TINGLET", px, 1.0, 1.4)
    tw = 7 * 6 * px - px
    plate = box(-2.4, -1.4, 0, tw + 2.4, 7 * px + 1.4, 1.0)
    return merge([plate, txt])


PARTS = []


def add(name, qty_note, mesh, x, y, rnd=False):
    m = normalize(mesh, x, y)
    PARTS.append({"name": name, "mesh": m, "round": rnd, "note": qty_note})


add("Body tub with hood", "1", make_body(), 4, 44)
add("Windshield frame", "1", make_windshield(), 59, 55)
add("Roll bar", "1", make_rollbar(), 84, 58)
add("Jerry can", "1", make_jerry(), 59, 45)
add("Steering wheel", "1", make_steering(), 68, 45)
add("Bumper", "1", make_bumper(), 84, 52.5)
add("Chassis", "1", make_chassis(), 4, 22)
add("Axle A", "2", make_axle(), 4, 17.3)
add("Axle B", "2", make_axle(), 40, 17.3)
add("Front seat L", "2", make_seat(9.0, 7.2), 56, 24)
add("Front seat R", "2", make_seat(9.0, 7.2), 67, 24)
add("Rear bench", "1", make_seat(7.0, 17.6, 7.0), 78, 21)
add("Star emblem", "1", make_star(), 94, 27, True)
add("Tinglet plate", "1", make_plate(), 70, 5)
for i in range(5):
    add("Wheel %d" % (i + 1), "5", make_wheel_set(), 3 + i * 13, 3, True)

FRAME = [
    (0, 0, CARD_W, BAR),
    (0, CARD_H - BAR, CARD_W, CARD_H),
    (0, 0, BAR, CARD_H),
    (CARD_W - BAR, 0, CARD_W, CARD_H),
    (BAR, 40.2, CARD_W - BAR, 41.8),
]


def pbox(p):
    lo, hi = bbox(p["mesh"])
    return lo[0], lo[1], hi[0], hi[1]


nodes = [{"name": "frame-%d" % i, "box": b, "round": False, "frame": True} for i, b in enumerate(FRAME)]
for p in PARTS:
    nodes.append({"name": p["name"], "box": pbox(p), "round": p["round"], "frame": False})

for i, a in enumerate(nodes):
    for b in nodes[i + 1:]:
        if a["frame"] or b["frame"]:
            continue
        ax0, ay0, ax1, ay1 = a["box"]
        bx0, by0, bx1, by1 = b["box"]
        assert ax1 <= bx0 or bx1 <= ax0 or ay1 <= by0 or by1 <= ay0, (a["name"], b["name"])

centers = {n["name"]: ((n["box"][0] + n["box"][2]) / 2, (n["box"][1] + n["box"][3]) / 2) for n in nodes}


def candidates():
    out = []
    for i, a in enumerate(nodes):
        for b in nodes[i + 1:]:
            if a["frame"] and b["frame"]:
                continue
            ax0, ay0, ax1, ay1 = a["box"]
            bx0, by0, bx1, by1 = b["box"]
            lo, hi = max(ax0, bx0), min(ax1, bx1)
            if hi - lo >= 1.6 and (ay1 <= by0 or by1 <= ay0):
                c = (lo + hi) / 2
                ok = True
                for n in (a, b):
                    if n["round"]:
                        cx = centers[n["name"]][0]
                        if not (lo + 0.4 <= cx <= hi - 0.4):
                            ok = False
                        c = cx
                if a["round"] and b["round"] and abs(centers[a["name"]][0] - centers[b["name"]][0]) > 0.2:
                    ok = False
                if ok:
                    ya, yb = (ay1, by0) if ay1 <= by0 else (by1, ay0)
                    out.append((yb - ya, a, b, "v", c, ya, yb))
            lo, hi = max(ay0, by0), min(ay1, by1)
            if hi - lo >= 1.6 and (ax1 <= bx0 or bx1 <= ax0):
                c = (lo + hi) / 2
                ok = True
                for n in (a, b):
                    if n["round"]:
                        cy = centers[n["name"]][1]
                        if not (lo + 0.4 <= cy <= hi - 0.4):
                            ok = False
                        c = cy
                if a["round"] and b["round"] and abs(centers[a["name"]][1] - centers[b["name"]][1]) > 0.2:
                    ok = False
                if ok:
                    xa, xb = (ax1, bx0) if ax1 <= bx0 else (bx1, ax0)
                    out.append((xb - xa, a, b, "h", c, xa, xb))
    return sorted(out, key=lambda e: e[0])


def runner_box(e):
    gap, a, b, kind, c, s0, s1 = e
    h = RUNNER_W / 2
    if kind == "v":
        return (c - h, s0 - 0.5, c + h, s1 + 0.5)
    return (s0 - 0.5, c - h, s1 + 0.5, c + h)


def hits(rb, skip):
    for n in nodes:
        if n["name"] in skip:
            continue
        x0, y0, x1, y1 = n["box"]
        if rb[0] < x1 + 0.2 and rb[2] > x0 - 0.2 and rb[1] < y1 + 0.2 and rb[3] > y0 - 0.2:
            return True
    return False


parent = {n["name"]: n["name"] for n in nodes}


def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x


for n in nodes:
    if n["frame"]:
        parent[find(n["name"])] = find("frame-0")

runners = []
for e in candidates():
    gap, a, b, kind, c, s0, s1 = e
    if gap > 7 or gap < 0.4:
        continue
    ra, rb_ = find(a["name"]), find(b["name"])
    if ra == rb_:
        continue
    rbx = runner_box(e)
    if hits(rbx, {a["name"], b["name"]}):
        continue
    parent[ra] = rb_
    runners.append(rbx)

extra = []
for e in candidates():
    gap, a, b, kind, c, s0, s1 = e
    if gap > 5 or gap < 0.4:
        continue
    if not (a["frame"] or b["frame"]):
        continue
    part = b if a["frame"] else a
    if part["name"].startswith("Wheel"):
        continue
    if hits(runner_box(e), {a["name"], b["name"]}):
        continue
    key = tuple(round(v, 2) for v in runner_box(e))
    if key in [tuple(round(v, 2) for v in r) for r in runners + extra]:
        continue
    extra.append(runner_box(e))

roots = {find(n["name"]) for n in nodes}
assert len(roots) == 1, [n["name"] for n in nodes if find(n["name"]) != find("frame-0")]

meshes = []
for x0, y0, x1, y1 in FRAME:
    meshes.append(box(x0, y0, 0, x1, y1, FRAME_T))
for p in PARTS:
    meshes.append(p["mesh"])
for r in runners + extra:
    meshes.append(box(r[0], r[1], 0, r[2], r[3], RUNNER_T))

final_v, final_f = merge(meshes)

with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
    z.writestr("[Content_Types].xml",
               '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
               '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
               '<Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>')
    z.writestr("_rels/.rels",
               '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
               '<Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>')
    vx = "".join('<vertex x="%.4f" y="%.4f" z="%.4f"/>' % tuple(v) for v in final_v)
    tr = "".join('<triangle v1="%d" v2="%d" v3="%d"/>' % tuple(t) for t in final_f)
    z.writestr("3D/3dmodel.model",
               '<?xml version="1.0" encoding="UTF-8"?><model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">'
               '<metadata name="Title">Tinglet Jeep Kit Card</metadata><resources><object id="1" type="model"><mesh><vertices>%s</vertices><triangles>%s</triangles></mesh></object></resources>'
               '<build><item objectid="1"/></build></model>' % (vx, tr))

print("triangles", len(final_f), "runners", len(runners) + len(extra))
lo, hi = final_v.min(axis=0), final_v.max(axis=0)
print("bounds", lo, hi)

if PREVIEW:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from mpl_toolkits.mplot3d.art3d import Poly3DCollection

    fig = plt.figure(figsize=(16, 9))
    ax = fig.add_subplot(111, projection="3d")
    tris = final_v[final_f]
    nrm = np.cross(tris[:, 1] - tris[:, 0], tris[:, 2] - tris[:, 0])
    nrm /= np.linalg.norm(nrm, axis=1, keepdims=True) + 1e-9
    light = np.array([0.3, -0.5, 0.8])
    light /= np.linalg.norm(light)
    shade = np.clip(nrm @ light, 0, 1) * 0.6 + 0.35
    base = np.array([0.39, 0.5, 0.4])
    cols = np.clip(shade[:, None] * base, 0, 1)
    ax.add_collection3d(Poly3DCollection(tris, facecolors=cols, linewidths=0))
    ax.set_xlim(0, CARD_W)
    ax.set_ylim(0, CARD_H)
    ax.set_zlim(0, CARD_W * 0.5)
    ax.set_box_aspect((CARD_W, CARD_H, 20))
    ax.view_init(elev=55, azim=-90)
    ax.set_axis_off()
    plt.tight_layout()
    plt.savefig(PREVIEW, dpi=140)
