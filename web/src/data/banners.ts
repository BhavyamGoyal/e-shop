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
      slides: [
        {
          href: "/gifts/birthday-lp?promo=desk_BAU_feed_banner_carousel_birthday",
          image: "https://static-assets-prod.fnp.com/media/images/eb5e29ee.jpg",
          alt: "",
          aspectRatio: 3,
          radius: 24,
        },
        {
          href: "/flowers-lp?promo=desk_BAU_feed_banner_carousel_flowers",
          image: "https://static-assets-prod.fnp.com/media/images/5d7b0744.jpg",
          alt: "",
          aspectRatio: 3,
          radius: 24,
        },
        {
          href: "/cakes-lp?promo=desk_BAU_feed_banner_carousel_cakes",
          image: "https://static-assets-prod.fnp.com/media/images/67b73b08.jpg",
          alt: "",
          aspectRatio: 3,
          radius: 24,
        },
        {
          href: "/balloon-decorations-lp?promo=desk_BAU_feed_banner_carousel_balloon_decor",
          image: "https://static-assets-prod.fnp.com/media/images/1ce4b7d5.jpg",
          alt: "",
          aspectRatio: 3,
          radius: 24,
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
