import { Seo } from "@/components/atoms";
import { AuthTemplate } from "@/components/templates";
import { NOINDEX } from "@/lib/seo/seo-meta";
import { useAuthPage } from "@/lib/use-auth-page";

export { staticPage as getStaticProps } from "@/lib/isr";

export default function RegisterPage() {
  const next: string = useAuthPage();
  return (
    <>
      <Seo title="Register" robots={NOINDEX} />
      <AuthTemplate mode="register" next={next} />
    </>
  );
}
