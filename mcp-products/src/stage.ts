import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { config } from "./config.js";

export interface StagedImage {
  url: string;
  filename: string;
}

export const slugify = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const productDir = (handle: string): string => path.join(config.publicDir, "products", handle);

export async function stagedFolderExists(handle: string): Promise<boolean> {
  return stat(productDir(handle)).then(
    (): boolean => true,
    (): boolean => false,
  );
}

export async function stageImages(handle: string, sources: string[]): Promise<StagedImage[]> {
  const target: string = path.join(productDir(handle), "images");
  await mkdir(target, { recursive: true });
  const staged: StagedImage[] = [];
  for (const [index, source] of sources.entries()) {
    const stem: string = slugify(path.basename(source, path.extname(source))).slice(0, 40) || "image";
    const filename = `${String(index + 1).padStart(2, "0")}-${stem}.webp`;
    const output: Buffer = await sharp(source)
      .rotate()
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    await writeFile(path.join(target, filename), output);
    staged.push({ url: `/products/${handle}/images/${filename}`, filename });
  }
  return staged;
}

export async function removeStaged(handle: string): Promise<void> {
  await rm(productDir(handle), { recursive: true, force: true });
}
