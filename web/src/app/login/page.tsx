import type { Metadata } from "next";
import { AuthTemplate } from "@/components/templates";
import { resolveAuthPage } from "@/lib/auth-page";
import { NOT_INDEXED } from "@/lib/seo/metadata";

export const metadata: Metadata = { title: "Log in", robots: NOT_INDEXED };

export default async function LoginPage(props: PageProps<"/login">) {
  const { next } = await props.searchParams;
  return <AuthTemplate mode="login" next={await resolveAuthPage(next)} />;
}
