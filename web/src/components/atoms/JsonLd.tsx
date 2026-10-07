import { JsonLdScript } from "next-seo";

interface JsonLdProps {
  data: object | object[];
}

export function JsonLd({ data }: JsonLdProps) {
  const nodes: object[] = Array.isArray(data) ? data : [data];
  return (
    <>
      {nodes.map((node: object, index: number) => (
        <JsonLdScript key={index} scriptKey={`json-ld-${index}`} data={node as Record<string, unknown>} />
      ))}
    </>
  );
}
