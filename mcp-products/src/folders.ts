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

export async function imageFiles(folder: string): Promise<string[]> {
  const dir: string = path.join(folder, "images");
  const names: string[] = await readdir(dir).catch((): string[] => []);
  return names
    .filter((name: string): boolean => IMAGE_EXTENSIONS.includes(path.extname(name).toLowerCase()))
    .sort(byName)
    .map((name: string): string => path.join(dir, name));
}

export async function readProductFolder(folder: string): Promise<ProductFolder> {
  const names: string[] = await readdir(folder);
  const textFiles: string[] = names.filter((name: string): boolean => name.toLowerCase().endsWith(".txt")).sort(byName);
  const warnings: string[] = [];
  if (textFiles.length === 0) warnings.push("No .txt file found");
  if (textFiles.length > 1) warnings.push(`Multiple .txt files found, using ${textFiles[0]}`);
  const images: string[] = await imageFiles(folder);
  if (images.length === 0) warnings.push("No images found in the images folder");
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
