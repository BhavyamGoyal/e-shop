import { del, list } from "@vercel/blob";

async function main(): Promise<void> {
  const urls: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: "products/", cursor, limit: 1000 });
    urls.push(...page.blobs.map((blob): string => blob.url));
    cursor = page.cursor;
  } while (cursor);
  console.log(`${urls.length} blobs to delete`);
  for (let index = 0; index < urls.length; index += 100) {
    await del(urls.slice(index, index + 100));
  }
  console.log("deleted");
}

main().catch((error: unknown): void => {
  console.error(error);
  process.exit(1);
});
