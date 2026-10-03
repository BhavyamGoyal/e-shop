import { Heading, Text } from "../atoms";

export interface ProductPreviewProps {
  handle: string;
  version: number;
}

export function ProductPreview({ handle, version }: ProductPreviewProps) {
  const path = `/product/${handle}`;
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Heading level={3}>Preview</Heading>
        <a href={path} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline">
          Open {path}
        </a>
      </div>
      <Text tone="muted" className="text-sm">
        Shows the saved version of the page, refreshed after every save.
      </Text>
      <iframe key={version} src={path} title="Product preview" className="h-[800px] w-full rounded-xl border bg-background" />
    </section>
  );
}
