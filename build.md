# Landing Page Build

The landing page is built to match `fnp-homepage-clone.html`. `next build` passes and type-check has no errors. Lint has warnings only (plain `<img>` tags and the anonymous default export in the data file). It has not been checked visually in a browser against the reference.

## Sections by UI

1. Sticky Site Header and Icon Nav Bar
2. Circular Category Strip
3. Landscape Card Scroller
4. Hero Banner Slider (autoplay, arrows, dots)
5. Tabbed Product Showcase
6. Landscape Tile Grid
7. Wide Banner with Square Tile Row (the birthday banner and its tiles, clubbed into one)
8. Captioned Card Scroller
9. Portrait Tile Grid (reused for Favourite Flower, Freshly Baked Cakes and Plants)
10. Portrait Overlay Tile Grid
11. Gradient Product Rail
12. Offer Banner Grid

## What was built

- **Data:** `web/src/data/website-date.js` was empty, so it was filled by extracting from the reference HTML. It holds the header, 11 nav items, 4 header actions and 13 sections with all text, images and links.
- **Data access:** `web/src/lib/website-data.ts` is the only file that imports the data file. It adds types and exports `websiteData`, which `web/src/app/page.tsx` passes down as props.
- **Molecules:** `TileCard`, `ProductCard`, `SectionHeading`.
- **Organisms:** `SiteHeader`, `TileGrid`, `TileScroller`, `ProductRail`, `HeroSlider`, `TabbedProductShowcase`, `HomeSection`.
- **Template:** `HomeTemplate`.
- **Plan:** `web/plan.md` holds the full plan. Its step list still shows the last few steps as pending, so it needs a status update.
- **Old page:** the previous theme demo page moved to `/showcase`.

## Things to know

- A bare JSON object can't be imported from a `.js` file, so the data file starts with `export default`. That prefix is the only non-JSON part.
- Links like `/flowers-lp` point to pages that don't exist yet, so they will 404.
- The reference uses the Inter font and the layout still uses Geist. It has not been switched.
- Mobile layouts (fewer columns, narrower padding) were added and are not in the reference.
