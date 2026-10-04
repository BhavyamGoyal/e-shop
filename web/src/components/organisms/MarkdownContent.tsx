import Markdown, { type Components } from "react-markdown";

const COMPONENTS: Components = {
  h1: ({ node: _node, ...props }) => <h1 className="text-4xl font-bold" {...props} />,
  h2: ({ node: _node, ...props }) => <h2 className="mt-4 text-xl font-semibold" {...props} />,
  h3: ({ node: _node, ...props }) => <h3 className="mt-2 text-lg font-semibold" {...props} />,
  p: ({ node: _node, ...props }) => <p className="leading-relaxed text-(--pp-muted)" {...props} />,
  ul: ({ node: _node, ...props }) => <ul className="list-disc space-y-1 pl-6 leading-relaxed text-(--pp-muted)" {...props} />,
  ol: ({ node: _node, ...props }) => <ol className="list-decimal space-y-1 pl-6 leading-relaxed text-(--pp-muted)" {...props} />,
  a: ({ node: _node, ...props }) => <a className="underline underline-offset-2" {...props} />,
  blockquote: ({ node: _node, ...props }) => <blockquote className="border-l-4 pl-4 italic text-(--pp-muted)" {...props} />,
  hr: ({ node: _node, ...props }) => <hr className="my-2" {...props} />,
};

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="flex flex-col gap-3">
      <Markdown components={COMPONENTS}>{content}</Markdown>
    </div>
  );
}
