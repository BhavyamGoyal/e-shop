import Head from "next/head";
import type { SeoMeta } from "@/lib/seo/seo-meta";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SOCIAL_IMAGE, absoluteUrl } from "@/lib/site";

export function Seo({
  title,
  description = SITE_DESCRIPTION,
  canonical,
  robots,
  image = SOCIAL_IMAGE,
  ogType = "website",
  publishedTime,
  modifiedTime,
}: SeoMeta) {
  const pageTitle: string = title ? `${title} | ${SITE_NAME}` : SITE_TITLE;
  const socialTitle: string = title ?? SITE_TITLE;
  const imageUrl: string = absoluteUrl(image);
  return (
    <Head>
      <title>{pageTitle}</title>
      <meta key="description" name="description" content={description} />
      {canonical && <link key="canonical" rel="canonical" href={absoluteUrl(canonical)} />}
      {robots && <meta key="robots" name="robots" content={robots} />}
      <meta key="og:type" property="og:type" content={ogType} />
      <meta key="og:site_name" property="og:site_name" content={SITE_NAME} />
      <meta key="og:locale" property="og:locale" content="en_IN" />
      <meta key="og:title" property="og:title" content={socialTitle} />
      <meta key="og:description" property="og:description" content={description} />
      <meta key="og:image" property="og:image" content={imageUrl} />
      {canonical && <meta key="og:url" property="og:url" content={absoluteUrl(canonical)} />}
      {publishedTime && <meta key="article:published_time" property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta key="article:modified_time" property="article:modified_time" content={modifiedTime} />}
      <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
      <meta key="twitter:title" name="twitter:title" content={socialTitle} />
      <meta key="twitter:description" name="twitter:description" content={description} />
      <meta key="twitter:image" name="twitter:image" content={imageUrl} />
    </Head>
  );
}
