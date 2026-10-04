import { FOOTER_ADDRESS } from "./footer";
import { SITE_NAME } from "./site";

export interface StaticSection {
  heading: string;
  body: string[];
}

export interface StaticPage {
  slug: string;
  title: string;
  description: string;
  sections: StaticSection[];
}

const ADDRESS_LINE: string = FOOTER_ADDRESS.join(", ");

export const STATIC_PAGES: StaticPage[] = [
  {
    slug: "about",
    title: "About Us",
    description: `Learn more about ${SITE_NAME}.`,
    sections: [
      {
        heading: "Who we are",
        body: [
          `${SITE_NAME} designs and 3D prints lamps, planters, desk organisers and gifts, made with care in New Delhi.`,
          "Every piece is printed to order, so each one is crafted for the person who receives it.",
        ],
      },
      {
        heading: "What we believe",
        body: ["Good design should be personal, durable and accessible. We keep our process simple and our products honest."],
      },
    ],
  },
  {
    slug: "contact",
    title: "Contact Us",
    description: `Get in touch with ${SITE_NAME}.`,
    sections: [
      {
        heading: "Visit us",
        body: [ADDRESS_LINE],
      },
      {
        heading: "Questions about an order",
        body: ["Include your order number when you write to us so we can help you faster. You can also browse our FAQ for quick answers."],
      },
    ],
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    description: `How ${SITE_NAME} collects, uses and protects your information.`,
    sections: [
      {
        heading: "Information we collect",
        body: ["We collect the details you give us when you create an account or place an order, such as your name, email, phone number and delivery address."],
      },
      {
        heading: "How we use it",
        body: ["We use your information to process orders, deliver products, provide support and improve our store. We do not sell your personal data."],
      },
      {
        heading: "Sharing",
        body: ["We share information only with service providers needed to fulfil your order, such as payment processors and couriers, or when required by law."],
      },
      {
        heading: "Your choices",
        body: [`You can ask us to access, correct or delete your data at any time by contacting us at ${ADDRESS_LINE}.`],
      },
    ],
  },
  {
    slug: "refund-policy",
    title: "Refund Policy",
    description: `Returns, replacements and refunds at ${SITE_NAME}.`,
    sections: [
      {
        heading: "Damaged or defective items",
        body: ["If your order arrives damaged or defective, contact us within 7 days of delivery with photos and we will replace it or refund you."],
      },
      {
        heading: "Custom and made-to-order items",
        body: ["Items printed to your specification cannot be returned unless they arrive faulty."],
      },
      {
        heading: "How refunds are issued",
        body: ["Approved refunds are returned to the original payment method within 5 to 7 business days."],
      },
    ],
  },
  {
    slug: "shipping-policy",
    title: "Shipping Policy",
    description: `Delivery timelines and charges at ${SITE_NAME}.`,
    sections: [
      {
        heading: "Processing time",
        body: ["Because each item is printed to order, please allow 2 to 5 business days for production before dispatch."],
      },
      {
        heading: "Delivery",
        body: ["Delivery typically takes 3 to 7 business days after dispatch, depending on your location. Tracking details are shared once your order ships."],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms of Service",
    description: `The terms that apply when you use ${SITE_NAME}.`,
    sections: [
      {
        heading: "Using our store",
        body: ["By browsing or purchasing from our store you agree to these terms and to use the site lawfully."],
      },
      {
        heading: "Orders and pricing",
        body: ["Prices are listed in Indian rupees. We may cancel an order if a product is unavailable or a pricing error occurs, and will refund any payment taken."],
      },
      {
        heading: "Product variation",
        body: ["3D printed products can vary slightly in colour and finish from the images shown."],
      },
    ],
  },
];

export const findStaticPage = (slug: string): StaticPage => {
  const page: StaticPage | undefined = STATIC_PAGES.find((entry: StaticPage): boolean => entry.slug === slug);
  if (!page) throw new Error(`Unknown static page: ${slug}`);
  return page;
};
