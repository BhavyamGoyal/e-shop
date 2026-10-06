import { SITE_NAME } from "./site";

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterGroup {
  title: string;
  links: FooterLink[];
}

export const FOOTER_ADDRESS: string[] = [
  "110029, Safdarjung Enclave",
  "New Delhi, India",
];

export const FOOTER_TAGLINE: string = `${SITE_NAME}: 3D Printed lamps, planters, desk organisers and gifts, crafted for you.`;

export const FOOTER_GROUPS: FooterGroup[] = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/#contact-us" },
      { label: "Blog", href: "/blog" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Refund Policy", href: "/refund-policy" },
      { label: "Shipping Policy", href: "/shipping-policy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];
