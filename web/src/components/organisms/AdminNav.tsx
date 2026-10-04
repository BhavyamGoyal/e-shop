import Link from "next/link";
import { logoutAction } from "@/server/actions/auth.actions";
import { Button, Text } from "../atoms";

const LINKS: { href: string; label: string }[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/tags", label: "Tags" },
  { href: "/admin/blogs", label: "Blogs" },
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/images", label: "Images" },
  { href: "/admin/queries", label: "Queries" },
  { href: "/admin/users", label: "Users" },
];

export function AdminNav({ email }: { email: string }) {
  return (
    <header className="border-b bg-surface text-surface-foreground">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-3">
        <nav className="flex items-center gap-5 text-sm font-medium">
          <Link href="/" className="shrink-0">
            <img src="/logo_v1.svg" alt="Tinglet" className="block h-10 w-auto" />
          </Link>
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-primary">
              {link.label}
            </Link>
          ))}
          <Link href="/" className="text-muted-foreground hover:text-primary">
            View store
          </Link>
        </nav>
        <form action={logoutAction} className="flex items-center gap-3">
          <Text tone="muted" className="text-sm">
            {email}
          </Text>
          <Button type="submit" variant="outline" tone="secondary" size="sm">
            Log out
          </Button>
        </form>
      </div>
    </header>
  );
}
