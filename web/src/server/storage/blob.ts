import { del, put } from "@vercel/blob";

export interface StoredBlob {
  url: string;
  pathname: string;
  contentType: string;
}

export interface BlobUploadOptions {
  addRandomSuffix: boolean;
}

export async function uploadBlob(
  pathname: string,
  body: Blob | Buffer,
  contentType: string,
  options: BlobUploadOptions,
): Promise<StoredBlob> {
  const result = await put(pathname, body, {
    access: "public",
    contentType,
    addRandomSuffix: options.addRandomSuffix,
    allowOverwrite: !options.addRandomSuffix,
  });
  return { url: result.url, pathname: result.pathname, contentType: result.contentType };
}

export async function deleteBlob(url: string): Promise<void> {
  await del(url);
}
