import argparse
import os
import sys
from collections import Counter
from multiprocessing import Pool
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

EXTENSIONS = {".webp", ".png", ".jpg", ".jpeg"}
DEFAULT_ROOT = Path(__file__).resolve().parent.parent / "public" / "products"
WEBP_QUALITY = 82
JPEG_QUALITY = 92


def purple_mask(rgb):
    r, g, b = (rgb[..., i].astype(np.int32) for i in range(3))
    distance = np.sqrt((r - 100) ** 2 + (g - 80) ** 2 + (b - 240) ** 2)
    return ((distance < 70) & (b - g > 80) & (b > 150)).astype(np.uint8)


def find_logo(rgb):
    h, w = rgb.shape[:2]
    scale = (w / 1024) ** 2
    x0, y0 = int(w * 0.4), int(h * 0.6)
    purple = purple_mask(rgb[y0:, x0:])
    if purple.sum() < 300 * scale:
        return None
    kernel = max(5, int(w * 0.02) | 1)
    grown = cv2.dilate(purple, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel, kernel)))
    count, labels = cv2.connectedComponents(grown)
    matches = []
    for index in range(1, count):
        ys, xs = np.nonzero((labels == index) & (purple > 0))
        if len(xs) < 300 * scale:
            continue
        bw = int(xs.max() - xs.min() + 1)
        bh = int(ys.max() - ys.min() + 1)
        fill = len(xs) / (bw * bh)
        aspect = bw / bh
        if 1.6 <= aspect <= 2.5 and 0.07 <= bw / w <= 0.15 and 0.2 <= fill <= 0.5:
            matches.append((int(xs.min() + x0), int(ys.min() + y0), bw, bh))
    return matches[0] if len(matches) == 1 else None


def build_mask(rgb, box):
    x, y, bw, bh = box
    h, w = rgb.shape[:2]
    mask = np.zeros((h, w), np.uint8)
    pad = int(round(bw * 0.08))
    x_lo, y_lo = max(0, x - pad), max(0, y - pad)
    x_hi, y_hi = min(w, x + bw + pad), min(h, y + bh + pad)
    mask[y_lo:y_hi, x_lo:x_hi] = purple_mask(rgb[y_lo:y_hi, x_lo:x_hi])
    tx0, tx1 = max(0, x + int(bw * 0.75)), min(w, x + int(bw * 2.15))
    ty0, ty1 = y + int(bh * 0.18), min(h, y + bh + int(bh * 0.12))
    brightness = rgb[ty0:ty1, tx0:tx1].astype(np.int32).max(axis=2)
    threshold = min(75.0, 0.55 * float(np.median(brightness)))
    dark = brightness < threshold
    dark_ratio = float(dark.mean())
    if dark_ratio < 0.5:
        mask[ty0:ty1, tx0:tx1] |= dark.astype(np.uint8)
    kernel = max(5, int(round(bw * 0.08)) | 1)
    mask = cv2.dilate(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel, kernel)))
    return mask, dark_ratio


def inpaint_region(rgb, mask, box_width):
    h, w = mask.shape
    ys, xs = np.nonzero(mask)
    margin = int(max(30, box_width * 0.35))
    x0, y0 = max(0, xs.min() - margin), max(0, ys.min() - margin)
    x1, y1 = min(w, xs.max() + margin + 1), min(h, ys.max() + margin + 1)
    crop = rgb[y0:y1, x0:x1].copy()
    local = mask[y0:y1, x0:x1]
    known = ((local == 0) * 255).astype(np.uint8)
    filled = np.zeros_like(crop)
    cv2.xphoto.inpaint(crop, known, filled, cv2.xphoto.INPAINT_FSR_BEST)
    result = rgb.copy()
    result[y0:y1, x0:x1] = np.where(local[..., None] > 0, filled, crop)
    return result


def save_image(path, rgb):
    image = Image.fromarray(rgb)
    suffix = path.suffix.lower()
    if suffix == ".webp":
        image.save(path, "WEBP", quality=WEBP_QUALITY)
    elif suffix == ".png":
        image.save(path, "PNG", optimize=True)
    else:
        image.save(path, "JPEG", quality=JPEG_QUALITY)


def process(job):
    path, dry_run = job
    try:
        rgb = np.asarray(Image.open(path).convert("RGB"))
        box = find_logo(rgb)
        if box is None:
            return str(path), "clean", ""
        if dry_run:
            return str(path), "has-logo", ""
        mask, dark_ratio = build_mask(rgb, box)
        save_image(path, inpaint_region(rgb, mask, box[2]))
        note = "dark background, text may remain" if dark_ratio >= 0.5 else ""
        return str(path), "cleaned", note
    except Exception as error:
        return str(path), "error", repr(error)


def collect(root, limit):
    files = sorted(p for p in root.rglob("*") if p.suffix.lower() in EXTENSIONS)
    return files[:limit] if limit else files


def main():
    parser = argparse.ArgumentParser(description="Remove the bottom-right PipliStudio logo from product images in place.")
    parser.add_argument("root", nargs="?", default=str(DEFAULT_ROOT))
    parser.add_argument("--dry-run", action="store_true", help="only report which images have the logo")
    parser.add_argument("--workers", type=int, default=min(4, os.cpu_count() or 1))
    parser.add_argument("--limit", type=int, default=0, help="process only the first N files")
    args = parser.parse_args()

    root = Path(args.root)
    if not root.is_dir():
        sys.exit(f"Not a directory: {root}")
    files = collect(root, args.limit)
    print(f"Scanning {len(files)} images in {root}")

    jobs = [(path, args.dry_run) for path in files]
    counts = Counter()
    with Pool(args.workers) as pool:
        for done, (path, status, note) in enumerate(pool.imap_unordered(process, jobs, chunksize=2), 1):
            counts[status] += 1
            if status in {"cleaned", "has-logo", "error"}:
                print(f"[{done}/{len(files)}] {status}: {Path(path).relative_to(root)} {note}".rstrip())
            elif done % 100 == 0:
                print(f"[{done}/{len(files)}] ...")
    print(dict(counts))


if __name__ == "__main__":
    main()
