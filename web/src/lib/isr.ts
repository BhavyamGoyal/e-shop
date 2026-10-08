import type { GetStaticProps, GetStaticPropsResult } from "next";

export const REVALIDATE_SECONDS: number = 60 * 60 * 24;

export const isr = <T extends object>(props: T): GetStaticPropsResult<T> => ({
  props: JSON.parse(JSON.stringify(props)) as T,
  revalidate: REVALIDATE_SECONDS,
});

export const isrNotFound = (): GetStaticPropsResult<never> => ({
  notFound: true,
  revalidate: REVALIDATE_SECONDS,
});

export const staticPage: GetStaticProps = async () => isr({});
