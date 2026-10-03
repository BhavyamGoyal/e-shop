import { AuthTemplate } from "@/components/templates";
import { resolveAuthPage } from "@/lib/auth-page";

export default async function RegisterPage(props: PageProps<"/register">) {
  const { next } = await props.searchParams;
  return <AuthTemplate mode="register" next={await resolveAuthPage(next)} />;
}
