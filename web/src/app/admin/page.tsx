import Link from "next/link";
import { Heading, Text } from "@/components/atoms";
import { Card } from "@/components/molecules";
import { AdminPage } from "@/components/templates";

const SECTIONS: { href: string; title: string; text: string }[] = [
  { href: "/admin/products", title: "Products", text: "View, add, edit and delete products and their details." },
  { href: "/admin/tags", title: "Tags", text: "Create, rename and delete tags shared by products." },
  { href: "/admin/blogs", title: "Blogs", text: "Write, edit, publish and delete blog posts." },
  { href: "/admin/faqs", title: "FAQs", text: "Add, edit and remove FAQs, optionally linked to a blog post." },
  { href: "/admin/pages", title: "Pages", text: "Edit About, Privacy Policy and any other text page in Markdown." },
  { href: "/admin/images", title: "Images", text: "Upload and delete images stored in Vercel Blob." },
  { href: "/admin/users", title: "Users", text: "See registered users and manage their roles." },
];

export default function AdminDashboardPage() {
  return (
    <AdminPage>
    <section className="flex flex-col gap-5">
      <Heading level={2}>Admin</Heading>
      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="h-full transition hover:border-primary">
              <Heading level={3}>{section.title}</Heading>
              <Text tone="muted" className="mt-1 text-sm">
                {section.text}
              </Text>
            </Card>
          </Link>
        ))}
      </div>
    </section>
    </AdminPage>
  );
}
