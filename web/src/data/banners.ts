import type { HomeSectionData } from "@/lib/website-data";

export const heroBannerSection: HomeSectionData = {
  background: "var(--background)",
  padding: "24px 48px 0px 48px",
  margin: "0px 0px 0px 0px",
  header: null,
  blocks: [
    {
      type: "slider",
      autoplay: 4000,
      mobileImages: [
        "/banner3-mobile.webp",
        "/banner1-mobile.webp",
        "/banner-keychains-mobile.webp",
      ],
      slides: [
        {
          href: "/product",
          image: "/banner3.webp",
          alt: "Custom handcrafted gifts",
          aspectRatio: 3,
          radius: 24,
          hero: {
            title: "Made Just For Them",
            subtitle:
              "Personalised candles, resin art and 3D-printed keepsakes, crafted to order.",
            cta: "Create A Gift",
          },
        },
        {
          href: "/products/lamps",
          image: "/banner1.webp",
          alt: "Handcrafted lamps and home decor",
          aspectRatio: 3,
          radius: 24,
          hero: {
            title: "Light Up Every Corner",
            subtitle:
              "Warm, handcrafted lamps and decor made to be gifted and loved.",
            cta: "Shop Decor",
          },
        },
        {
          href: "/products/keychains",
          image: "/banner-keychains.webp",
          alt: "3D Printed keychains",
          aspectRatio: 3,
          radius: 24,
          hero: {
            title: "Little Charms, Big Smiles",
            subtitle:
              "Playful 3D-printed keychains and name tags for everyone you love.",
            cta: "Shop Keychains",
          },
        },
      ],
    },
  ],
  id: "heroBannerSlider",
  key: "heroBannerSlider-2",
};

export const promoBannerSection: HomeSectionData = {
  background: "var(--background)",
  padding: "0px 48px 0px 48px",
  margin: "0px 0px 0px 0px",
  header: null,
  blocks: [
    {
      type: "tileGrid",
      columns: 1,
      gap: 0,
      tiles: [
        {
          href: "/#contact-us",
          image: "/banner-home.jpg",
          mobileImage: "/banner-home-mobile.jpg",
          mobileHeight: 40,
          alt: "Custom gift hamper being personalised",
          aspectRatio: 1024 / 318,
          radius: 20,
          hero: {
            title: "Gifts Made Just For Them",
            subtitle: "Custom gifting solutions at no extra charge.",
            cta: "Talk To Us",
            tone: "dark",
            mobileAnchor: "bottom",
          },
        },
      ],
    },
  ],
  id: "bannerWithTileRow",
  key: "bannerWithTileRow-5",
};
