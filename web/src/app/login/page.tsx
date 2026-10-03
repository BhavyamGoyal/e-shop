import { AuthTemplate } from "@/components/templates";
import { resolveAuthPage } from "@/lib/auth-page";

export default async function LoginPage(props: PageProps<"/login">) {
  const { next } = await props.searchParams;
  return <AuthTemplate mode="login" next={await resolveAuthPage(next)} />;
}
