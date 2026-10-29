import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

export const IMAGE_EXTENSIONS: string[] = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"];

export interface ProductFolder {
  folder: string;
  textFile: string | null;
  text: string;
  images: string[];
  warnings: string[];
}

const byName = (a: string, b: string): number => a.localeCompare(b, undefined, { numeric: true });

async function imagesIn(dir: string): Promise<string[]> {
  const names: string[] = await readdir(dir).catch((): string[] => []);
  return names
    .filter((name: string): boolean => IMAGE_EXTENSIONS.includes(path.extname(name).toLowerCase()))
    .sort(byName)
    .map((name: string): string => path.join(dir, name));
}

export async function imageFiles(folder: string): Promise<string[]> {
  const nested: string[] = await imagesIn(path.join(folder, "images"));
  return nested.length > 0 ? nested : imagesIn(folder);
}

export async function readProductFolder(folder: string): Promise<ProductFolder> {
  const names: string[] = await readdir(folder);
  const textFiles: string[] = names.filter((name: string): boolean => name.toLowerCase().endsWith(".json")).sort(byName);
  const warnings: string[] = [];
  if (textFiles.length === 0) warnings.push("No .json file found");
  if (textFiles.length > 1) warnings.push(`Multiple .json files found, using ${textFiles[0]}`);
  const images: string[] = await imageFiles(folder);
  if (images.length === 0) warnings.push("No images found in the product folder or its images subfolder");
  const textFile: string | null = textFiles[0] ? path.join(folder, textFiles[0]) : null;
  return {
    folder,
    textFile,
    text: textFile ? await readFile(textFile, "utf8") : "",
    images,
    warnings,
  };
}

export async function productFolders(root: string): Promise<string[]> {
  const names: string[] = await readdir(root);
  const folders: string[] = [];
  for (const name of names.sort(byName)) {
    const full: string = path.join(root, name);
    if ((await stat(full)).isDirectory()) folders.push(full);
  }
  return folders;
}
