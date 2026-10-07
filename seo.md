# SEO Checklist

Stack: Next.js 16 (App Router), `next-seo@7.3.0` installed.

Status legend: `[x]` done and checked in code, `[ ]` not done or not yet verified.

Done so far:
- `next-seo@7.3.0` installed. `src/components/atoms/JsonLd.tsx` renders all JSON-LD through next-seo's `JsonLdScript`.
- Site title and description rewritten (`SITE_TITLE`, `SITE_DESCRIPTION` in `src/lib/site.ts`), including the "contact us to get gifts customised" line.
- Instagram link (`@tinglet_gifts`) added to the footer, and Organization JSON-LD now has `logo` (`/logo_v1.svg`) and `sameAs` (Instagram).
- Existing before this work: `robots.ts`, `sitemap.ts`, `metadataBase`, OG/Twitter defaults, favicon, JSON-LD for Product, Breadcrumb, FAQ, BlogPosting, CollectionPage, WebSite, Organization.

Still open in JSON-LD: return policy, shipping details, `contactPoint`, blog `author`, video, more `sameAs` profiles. See the audit table in section 3.

Note on next-seo: the `master` branch is the legacy v6 docs. v7 lives on `main`. In the App Router, v7 is JSON-LD only. Meta tags come from Next's built-in `metadata` / `generateMetadata`. The `NextSeo` / `DefaultSeo` components are Pages Router only (`next-seo/pages`), so we do not need them.

Page types in this site: home, `/product/[handle]`, `/products/[tag]`, `/catalog-query/[[...handle]]`, `/blog`, `/blog/[slug]`, `/faq`, `/[handle]` (CMS pages), `/login`, `/register`, `/admin/*`, `/api/*`.

---

## 1. SEO task list

### Technical
- [x] `robots.ts`: allow public pages, disallow `/admin`, `/api`, `/login`, `/register`, cart/checkout, search/filter query URLs. Point to sitemap.
- [x] `sitemap.ts`: include home, all products, tag/collection pages, blogs, FAQ, CMS pages. Real `lastModified`, no noindex URLs. Split into multiple sitemaps if over 50k URLs.
- [x] `metadataBase` set in root `layout.tsx` so relative canonical and OG URLs resolve.
- [ ] Canonical on every indexable page. Strip tracking params and filter/sort/pagination params from canonical.
- [ ] `noindex` on admin, auth, cart, checkout, thank-you, internal search, empty tag pages.
- [ ] Proper 404 (`not-found.tsx`) returning HTTP 404, not a soft 404. Fix dead links like `/flowers-lp` listed in `build.md`.
- [ ] 301 redirects for renamed or removed product handles. Single canonical host (www vs non-www) and force HTTPS.
- [ ] Trailing-slash policy consistent.
- [ ] Pagination: self-canonical per page, crawlable `<a href>` links (no JS-only "load more").
- [ ] Facet/filter URLs: block or canonicalise to avoid duplicate content.
- [ ] Server-render all product, collection and blog content (no client-only fetching of main content).
- [ ] Verify with Google Search Console and Bing Webmaster Tools. Submit sitemap.
- [ ] Hreflang only if multiple languages or regions are added (`alternates.languages`).

### Performance / Core Web Vitals
- [ ] LCP: hero banner via `next/image` with `priority`, correct `sizes`, AVIF/WebP. Currently plain `<img>` tags (see `build.md`). Replace them.
- [ ] CLS: explicit width/height on all images and embeds, reserved space for banners and sliders.
- [ ] INP: keep the hero slider and showcase JS light, lazy-load below-the-fold sections.
- [ ] Fonts via `next/font` (layout still on Geist, reference uses Inter), `display: swap`.
- [ ] Videos (`products/*/videos/*.mp4`): lazy load, `preload="none"`, poster image.
- [ ] Compression, caching headers on `/public` assets, CDN.
- [ ] Lighthouse and PageSpeed run on home, product, collection, blog. Target LCP < 2.5s, CLS < 0.1, INP < 200ms.

### On-page
- [ ] One `<h1>` per page, logical H2/H3 hierarchy.
- [x] Unique title and description per page (product, blog, CMS pages use `generateMetadata`; verify collection and FAQ) (templates below).
- [ ] Descriptive, keyword-aware image `alt` text. Descriptive filenames (many product images have names like `IMG_2025...`, `il_794xN...`).
- [ ] Clean, readable slugs (several product handles are very long, consider shortening).
- [ ] Unique product descriptions (not copied from suppliers or Etsy).
- [ ] Internal linking: breadcrumbs, related products, tag to product, blog to product.
- [ ] Visible breadcrumbs matching the BreadcrumbList JSON-LD.
- [ ] Descriptive anchor text, no "click here".
- [ ] Category/collection pages get an intro text block, not only a product grid.
- [ ] Semantic HTML: `<main>`, `<nav>`, `<header>`, `<footer>`, `<article>`.
- [ ] Accessible, mobile-friendly layout (mobile-first indexing).

### Content
- [ ] Keyword research per collection and product type, map one primary keyword per page.
- [ ] Blog plan: buying guides, gift ideas, how-to, comparison posts that link to products.
- [ ] FAQ content on product and collection pages (matches FAQ JSON-LD).
- [ ] Trust pages: About, Contact, Shipping, Returns, Privacy, Terms.
- [ ] Customer reviews on product pages (needed for review/rating rich results).

### Off-page / tracking
- [ ] Google Business Profile if there is a physical presence.
- [x] Instagram linked in footer and in Organization `sameAs`. Add Facebook, Pinterest, YouTube if they exist.
- [ ] Google Merchant Center product feed (free listings).
- [ ] Backlinks: directories, gifting blogs, PR, influencer collaboration.
- [ ] GA4 and Search Console linked, track organic landing pages and conversions.
- [ ] Monitor index coverage, crawl errors, rich result reports monthly.

---

## 2. Metadata to add

Use Next's `metadata` export (static) or `generateMetadata` (dynamic).

### Root layout (site-wide defaults)
| Field | Value |
|---|---|
| `metadataBase` | `new URL("https://<domain>")` |
| `title.default` / `title.template` | `Brand: tagline` / `%s \| Brand` |
| `description` | Default 140 to 160 chars |
| `applicationName`, `generator` | Brand name |
| `authors`, `creator`, `publisher` | Brand |
| `keywords` | Optional, low value for Google |
| `formatDetection` | `{ telephone: false }` unless wanted |
| `robots` | `index, follow`, `googleBot`: `max-image-preview: large`, `max-snippet: -1`, `max-video-preview: -1` |
| `alternates.canonical` | `/` |
| `icons` | favicon (`fevicon.svg`), apple-touch-icon, 192/512 PNG |
| `manifest` | `manifest.webmanifest` |
| `themeColor` (viewport export) | Brand colour |
| `openGraph` | `type`, `siteName`, `locale` (`en_IN`?), default `images` (1200x630). Done, but the image is `logo_v2.jpeg`, not a 1200x630 social card. |
| `twitter` | `card: summary_large_image`, `site`, `creator`, default image |
| `verification` | `google`, `bing` (`other: { "msvalidate.01": ... }`), Pinterest if used |
| `other` | `facebook-domain-verification`, `p:domain_verify` (Pinterest) if used |

### Per page type
| Page | title | description | canonical | OG type | robots |
|---|---|---|---|---|---|
| Home | Brand: tagline | Value proposition | `/` | `website` | index |
| Product | `{Product name}` + key attribute, price optional | First 150 chars of description, benefit led | `/product/{handle}` | `website` (or `og:type=product` via `other`) plus `product:price:amount`, `product:price:currency`, `product:availability` | index |
| Collection / tag | `{Tag} Gifts and Products` | Collection intro summary | `/products/{tag}` | `website` | index (noindex if empty) |
| Blog index | `Blog` | Summary | `/blog` | `website` | index |
| Blog post | Post title | Excerpt | `/blog/{slug}` | `article` with `publishedTime`, `modifiedTime`, `authors`, `tags`, `section` | index |
| FAQ | `FAQs` | Summary | `/faq` | `website` | index |
| CMS page | Page title | Summary | `/{handle}` | `website` | index |
| Login / register / admin / search results | Plain title | none | none | none | `noindex, nofollow` |

Per page OG/Twitter: `og:title`, `og:description`, `og:url`, `og:image` (1200x630, with `alt`, width, height), `og:type`, `og:locale`; `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`.

Rules: title 50 to 60 chars, description 140 to 160 chars, unique per page, no keyword stuffing.

---

## 3. JSON-LD schemas

Source: next-seo v7 components (`main` branch), mapped to schema.org types. Correction: next-seo 7.3.0 has no `MarkupJsonLd`. For WebSite, CollectionPage, shipping details and other types without a component, use the exported `JsonLdScript` with a plain object (this is what `src/components/atoms/JsonLd.tsx` does). Alternative with no dependency: render `<script type="application/ld+json">` yourself (escape every less-than character inside the JSON string). next-seo adds typed props and handles that.

### Audit of must-haves (current state)
| Schema | Status | Gap |
|---|---|---|
| Product | Done | No return policy or shipping details. No ratings (no review data yet). |
| BreadcrumbList | Done | Product, collection, blog. Check the collection step path resolves. |
| Article (BlogPosting) | Done | No `author`. Publisher has no logo. |
| FAQPage | Done | Home, `/faq`, blog posts with FAQs. |
| WebSite | Done | `SearchAction` points to `/product?q=`, confirm it works or remove. |
| Organization | Mostly done | Has name, url, description, logo, sameAs. Missing `contactPoint` (email or phone) and more social profiles. |
| MerchantReturnPolicy | Not done | Needs return window, fees, and policy for customised items. |

### MUST HAVE (e-shop)
| Component | Where | Why |
|---|---|---|
| `OrganizationJsonLd` | Root layout / home | Brand name, logo, `sameAs` socials, contact points. Knowledge panel and logo. |
| `ProductJsonLd` | `/product/[handle]` | Core e-commerce rich result: name, image[], description, sku, brand, `offers` (price, currency, availability, URL, `priceValidUntil`), `aggregateRating` and `review` if real reviews exist. |
| `BreadcrumbJsonLd` | Product, collection, blog post | Breadcrumb trail in results. |
| `MerchantReturnPolicyJsonLd` | Organization level or inside Product offers | Return policy shown in product results and Merchant listings. Pair with shipping details (`OfferShippingDetails`, via `MarkupJsonLd` if not covered). |
| `ArticleJsonLd` (type `BlogPosting`) | `/blog/[slug]` | Article rich results, author, dates, image. |
| `FAQJsonLd` | `/faq`, product pages with FAQs | FAQ markup. Note: Google shows FAQ rich results only for authoritative gov/health sites now, but it still helps AI search and parsers. Treat as must if FAQ exists, low effort. |
| `MarkupJsonLd` with `WebSite` (+ `SearchAction` if site search exists) | Home | Site name in results, sitelinks search box. next-seo v7 has no dedicated WebSite component. |

### GOOD TO HAVE
| Component | Where | Why |
|---|---|---|
| `CarouselJsonLd` (ItemList) | Collection / tag pages | Lists products in a collection. |
| `LocalBusinessJsonLd` | Home / contact | Only if there is a physical store or pickup point. |
| `VideoJsonLd` | Product pages with `videos/01-video.mp4`, blog | Video rich result and video tab. |
| `ImageJsonLd` | Original product/lifestyle images | Licensable badge, image metadata. |
| `HowToJsonLd` | Care/usage guides in blog | Step-by-step content. |
| `MarkupJsonLd` with `CollectionPage`, `AboutPage`, `ContactPage`, `WebPage` | Collection, About, Contact | Page type clarity. |
| `MarkupJsonLd` with `ItemList` + `ProfilePage` for authors | Blog | Author entity signals (E-E-A-T). |
| `MarkupJsonLd` with `Brand` | Product | Brand entity (also in `ProductJsonLd.brand`). |
| `MarkupJsonLd` with `OfferShippingDetails` / `ShippingService` | Product / org | Shipping cost and delivery time in results. |
| `MarkupJsonLd` with `Review` / `AggregateRating` | Product, once reviews exist | Star ratings. Only with real reviews, never fabricated. |

### NOT NEEDED for this site
`RecipeJsonLd`, `EventJsonLd`, `JobPostingJsonLd`, `CourseJsonLd`, `QuizJsonLd`, `DatasetJsonLd`, `MovieCarouselJsonLd`, `PodcastJsonLd`, `BookJsonLd`, `SoftwareAppJsonLd`, `ClaimReviewJsonLd`, `DiscussionForumPostingJsonLd`, `CreativeWorkJsonLd`. Revisit only if matching content is added (for example a recipe or event blog series).

### Legacy v6 only (not in v7 App Router)
Sitelinks Search Box, Social Profile, Corporate Contact, Logo, Brand, WebPage, Collection Page, Profile Page, Q&A, Campground, Park, VideoGame. In v7 use `OrganizationJsonLd` or `MarkupJsonLd` for these.

---

## 4. Suggested implementation order
Steps 1 to 3 and most of 4 are done. Remaining: return policy, shipping details, `contactPoint`, blog author, image work, Search Console, good-to-have schemas.

1. `metadataBase`, root metadata defaults, favicon/manifest, default OG image.
2. `generateMetadata` for product, collection, blog, CMS pages (title, description, canonical, OG, Twitter).
3. Fix `robots.ts` and `sitemap.ts`, add noindex to admin, auth, empty or filtered pages.
4. JSON-LD must-haves: Organization, WebSite, Product, Breadcrumb, Article, FAQ, return policy.
5. Image work: `next/image`, alt text, rename key files, LCP priority.
6. Search Console and Bing setup, submit sitemap, Rich Results Test on one URL per template.
7. Good-to-have schemas (Carousel, Video, shipping) and content plan.

Validation tools: Google Rich Results Test, Schema Markup Validator (validator.schema.org), Search Console Enhancements reports, PageSpeed Insights.
