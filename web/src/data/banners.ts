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
      mobileImages: ["/banner3-mobile.webp", "/banner1-mobile.webp", "/banner-keychains-mobile.webp"],
      slides: [
        {
          href: "/gifting-products?minPrice=&maxPrice=&tag=custom&sort=newest",
          image: "/banner3.webp",
          alt: "Custom handcrafted gifts",
          aspectRatio: 3,
          radius: 24,
          hero: {
            title: "Made Just For Them",
            subtitle: "Personalised candles, resin art and 3D-printed keepsakes, crafted to order.",
            cta: "Create A Gift",
          },
        },
        {
          href: "/gifting-products?minPrice=&maxPrice=&tag=decor&sort=newest",
          image: "/banner1.webp",
          alt: "Handcrafted lamps and home decor",
          aspectRatio: 3,
          radius: 24,
          hero: {
            title: "Light Up Every Corner",
            subtitle: "Warm, handcrafted lamps and decor made to be gifted and loved.",
            cta: "Shop Decor",
          },
        },
        {
          href: "/gifting-products?minPrice=&maxPrice=&tag=keychain&sort=newest",
          image: "/banner-keychains.webp",
          alt: "3D printed keychains",
          aspectRatio: 3,
          radius: 24,
          hero: {
            title: "Little Charms, Big Smiles",
            subtitle: "Playful 3D-printed keychains and name tags for everyone you love.",
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
          href: "/gifts/birthday-lp?promo=desk_BAU_feed_birthday_made_special_all_gifts",
          image: "https://static-assets-prod.fnp.com/media/images/aa921811.jpg",
          alt: "birthday",
          aspectRatio: 6,
          radius: 20,
        },
      ],
    },
  ],
  id: "bannerWithTileRow",
  key: "bannerWithTileRow-5",
};
