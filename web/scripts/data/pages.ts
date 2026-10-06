export interface PageSeed {
  url: string;
  content: string;
}

const ADDRESS: string = "110029, Safdarjung Enclave, New Delhi, India";

export const PAGES: PageSeed[] = [
  {
    url: "about",
    content: `# About Us

## Who we are

Tinglet designs and 3D prints lamps, planters, desk organisers and gifts, made with care in New Delhi.

Every piece is printed to order, so each one is crafted for the person who receives it.

## What we believe

Good design should be personal, durable and accessible. We keep our process simple and our products honest.
`,
  },
  {
    url: "contact",
    content: `# Contact Us

## Visit us

${ADDRESS}

## Questions about an order

Include your order number when you write to us so we can help you faster. You can also browse our [FAQ](/faq) for quick answers.
`,
  },
  {
    url: "privacy-policy",
    content: `# Privacy Policy

## Information we collect

We collect the details you give us when you create an account or place an order, such as your name, email, phone number and delivery address.

## How we use it

We use your information to process orders, deliver products, provide support and improve our store. We do not sell your personal data.

## Sharing

We share information only with service providers needed to fulfil your order, such as payment processors and couriers, or when required by law.

## Your choices

You can ask us to access, correct or delete your data at any time by contacting us at ${ADDRESS}.
`,
  },
  {
    url: "refund-policy",
    content: `# Refund Policy

## Damaged or defective items

If your order arrives damaged or defective, contact us within 7 days of delivery with photos and we will replace it or refund you.

## Custom and made-to-order items

Items printed to your specification cannot be returned unless they arrive faulty.

## How refunds are issued

Approved refunds are returned to the original payment method within 5 to 7 business days.
`,
  },
  {
    url: "shipping-policy",
    content: `# Shipping Policy

## Processing time

Because each item is printed to order, please allow 2 to 5 business days for production before dispatch.

## Delivery

Delivery typically takes 3 to 7 business days after dispatch, depending on your location. Tracking details are shared once your order ships.
`,
  },
  {
    url: "terms",
    content: `# Terms of Service

## Using our store

By browsing or purchasing from our store you agree to these terms and to use the site lawfully.

## Orders and pricing

Prices are listed in Indian rupees. We may cancel an order if a product is unavailable or a pricing error occurs, and will refund any payment taken.

## Product variation

3D Printed products can vary slightly in colour and finish from the images shown.
`,
  },
];
