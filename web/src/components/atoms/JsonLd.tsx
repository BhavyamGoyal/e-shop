import Head from "next/head";

interface JsonLdProps {
  data: object | object[];
}

const serialize = (node: object): string => JSON.stringify(node).replace(/</g, "\u003c");

export function JsonLd({ data }: JsonLdProps) {
  const nodes: object[] = Array.isArray(data) ? data : [data];
  return (
    <Head>
      {nodes.map((node: object, index: number) => (
        <script
          key={`json-ld-${index}`}
          id={`json-ld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialize(node) }}
        />
      ))}
    </Head>
  );
}
