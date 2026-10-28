import type { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Seo } from "@/components/atoms";
import { ContentTemplate } from "@/components/templates";
import { buildCustomizePage, type CustomizePageData } from "@/lib/customize-page";
import { NOINDEX } from "@/lib/seo/seo-meta";
import { loadSiteChrome, type SiteChrome } from "@/lib/site-chrome";

const CustomizerStudio = dynamic(
  () => import("@/customizers/components/CustomizerStudio").then((module) => module.CustomizerStudio),
  { ssr: false, loading: () => <p className="py-20 text-center text-muted-foreground">Loading customizer…</p> },
);

type CustomizeProps = CustomizePageData & SiteChrome;

const first = (value: string | string[] | undefined): string => (Array.isArray(value) ? (value[0] ?? "") : (value ?? ""));

export const getServerSideProps: GetServerSideProps<CustomizeProps> = async ({ params, query }) => {
  const variant: number = Number(first(query.variant));
  const [page, chrome] = await Promise.all([
    buildCustomizePage(first(params?.slug), first(query.product), Number.isInteger(variant) ? variant : null),
    loadSiteChrome(),
  ]);
  if (!page) return { notFound: true };
  return { props: JSON.parse(JSON.stringify({ ...page, ...chrome })) as CustomizeProps };
};

export default function CustomizePage({ header, shop, customizer, product }: CustomizeProps) {
  const router = useRouter();
  const edit: string = first(router.query.edit);
  return (
    <>
      <Seo title={`Customize ${product.title}`} robots={NOINDEX} />
      <ContentTemplate header={header} shop={shop} widthClass="max-w-[1200px]" paddingClass="pt-6 pb-12">
        <CustomizerStudio customizer={customizer} product={product} editKey={edit || null} />
      </ContentTemplate>
    </>
  );
}
