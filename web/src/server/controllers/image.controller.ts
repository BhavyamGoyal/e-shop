import { requireAdmin } from "../auth/guard";
import { NotFoundError, ValidationError } from "../http/errors";
import { imageRepository, type StoredImage } from "../repositories/image.repository";
import { deleteBlob, uploadBlob } from "../storage/blob";
import type { ImageListPage, ImageRecord } from "../types/admin.types";

const MAX_BYTES = 4 * 1024 * 1024;

export const toImageRecord = (image: StoredImage): ImageRecord => ({
  id: image._id.toString(),
  url: image.url,
  filename: image.filename,
  size: image.size ?? 0,
  createdAt: (image.createdAt ?? new Date(0)).toISOString(),
});

const safeName = (name: string): string => name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+/, "");

export const imageController = {
  async list(page: number, limit: number, search: string): Promise<ImageListPage> {
    await requireAdmin();
    const { items, total } = await imageRepository.list(page, limit, search);
    return {
      data: items.map(toImageRecord),
      meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  },

  async upload(file: File): Promise<ImageRecord> {
    await requireAdmin();
    if (!file.type.startsWith("image/")) throw new ValidationError(`${file.name} is not an image`);
    if (file.size > MAX_BYTES) throw new ValidationError(`${file.name} is larger than 4 MB`);
    const filename: string = safeName(file.name) || "image";
    const stored = await uploadBlob(`uploads/${filename}`, file, file.type, { addRandomSuffix: true });
    const saved: StoredImage = await imageRepository.create({
      url: stored.url,
      pathname: stored.pathname,
      filename,
      size: file.size,
      contentType: file.type,
    });
    return toImageRecord(saved);
  },

  async remove(id: string): Promise<void> {
    await requireAdmin();
    const image: StoredImage | null = await imageRepository.findById(id);
    if (!image) throw new NotFoundError("Image not found");
    if (/^https?:/.test(image.url)) await deleteBlob(image.url);
    await imageRepository.remove(id);
  },
};
