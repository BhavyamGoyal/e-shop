import { Label } from "../atoms";

export interface DescriptionPreviewProps {
  html: string;
}

export function DescriptionPreview({ html }: DescriptionPreviewProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>Live preview</Label>
      <div className="min-h-48 overflow-auto rounded-md border border-border bg-background p-4">
        {html.trim() ? (
          <div className="pdp-prose text-[16px] leading-[1.75] text-foreground" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
        )}
      </div>
    </div>
  );
}
