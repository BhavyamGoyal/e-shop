"use client";

import { useImageLibrary } from "@/lib/use-image-library";
import { Heading, Input, Text } from "../atoms";
import { AlertMessage, ImageTile, PagerBar, UploadButton } from "../molecules";

export function ImageLibrary() {
  const library = useImageLibrary();

  const confirmDelete = (id: string, filename: string): void => {
    if (window.confirm(`Delete ${filename}? Products still using it will show a broken image.`)) {
      void library.remove(id);
    }
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Heading level={2}>Images</Heading>
          <Text tone="muted" className="text-sm">
            {library.total} stored in Vercel Blob
          </Text>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search filename"
            value={library.search}
            onChange={(event) => library.setSearch(event.target.value)}
            className="w-56"
          />
          <UploadButton disabled={library.busy} onFiles={library.upload} />
        </div>
      </div>
      {library.error ? <AlertMessage tone="danger" message={library.error} /> : null}
      {library.busy ? <Text tone="muted">Loading...</Text> : null}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {library.items.map((image) => (
          <ImageTile key={image.id} image={image} onDelete={() => confirmDelete(image.id, image.filename)} />
        ))}
      </div>
      <PagerBar page={library.page} totalPages={library.totalPages} onChange={library.setPage} />
    </section>
  );
}
