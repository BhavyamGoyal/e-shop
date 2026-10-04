const HEADING = /^#\s+(.+)$/m;
const MAX_DESCRIPTION: number = 160;

const titleCase = (url: string): string =>
  url
    .split("-")
    .filter(Boolean)
    .map((word: string): string => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const markdownTitle = (content: string, url: string): string =>
  content.match(HEADING)?.[1].trim() || titleCase(url);

export const markdownDescription = (content: string): string => {
  const paragraph: string =
    content
      .split(/\n\s*\n/)
      .map((block: string): string => block.trim())
      .find((block: string): boolean => block !== "" && !/^(#|[-*+]\s|\d+\.\s|>|```|\|)/.test(block)) ?? "";
  const plain: string = paragraph
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > MAX_DESCRIPTION ? `${plain.slice(0, MAX_DESCRIPTION - 1).trimEnd()}…` : plain;
};
