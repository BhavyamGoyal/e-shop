# Product Customizer Plan

## 1. Goal

Products can link to a **customizer**. A product with a customizer shows a **Customize** button instead of Add to cart and Buy it now. The button opens an internal page where the shopper edits params and sees a live 3D preview. The shopper adds the result to the cart with the params attached. The cart, checkout and order carry the params, and the shopper can re-edit from the cart. Admin opens any customized line, sees the exact model re-rendered from the stored params, and downloads a 3MF.

The first customizer is the text keychain ported from `Test/`. The design must let a different renderer be added later (another 3D model renderer, or a 2D photo editor) without changing existing code.

## 2. What already exists

- Storefront is Pages Router. The product page is `src/pages/product/[handle].tsx`. Admin and API live under `src/app/admin` and `src/app/api`.
- `ProductActions.tsx` and `StickyBuyBar.tsx` hold the buy buttons.
- The cart is a Zustand store (`stores/cart/Cart.store.ts`, `Cart.types.ts`), keyed `handle:variantId`, persisted to localStorage and synced to the `carts` collection (`CartSync`, `cart.model.ts`).
- `checkout-pricing.service.ts` re-prices lines server-side. `order.model.ts` lines have no customization data.
- Server layering is model, repository, service, controller, validator, with routes under `app/api`.
- `Test/js/core.js` is the keychain geometry engine. It uses opentype.js (glyph outlines), clipper-lib (2D boolean and offset ops) and a custom mesher. `threemf.js` exports 3MF through jszip. `app.js` is the UI glue.
- Repo rules: no comments, explicit types, 150-200 line cap per file, atomic design, theme tokens only. Before writing any Next.js code, read the matching guide in `node_modules/next/dist/docs/` (per `AGENTS.md`).

## 3. Decisions taken

| # | Decision |
|---|---|
| 1 | Product stores `customizerSlug`. The customizer URL is always internal: `/customize/[slug]`. |
| 2 | Customizers live in a new MongoDB `customizers` collection, editable in admin. |
| 3 | Each param has `mutable`. `mutable: false` means a constant: hidden from the shopper, always equal to its default. |
| 4 | Each customizer names a `renderer` key. A registry maps the key to a renderer implementation. Only `text-keychain` exists for now. |
| 5 | Full port of all keychain params. Admin chooses which are `mutable`. |
| 6 | Plain three.js behind a renderer interface. Geometry is framework independent. |
| 7 | Fonts stay on the CDN. No user font upload. The font list lives in the config. |
| 8 | Add to cart with params attached. The cart shows the product image. The shopper can edit the customization from the cart. |
| 9 | No price changes. |
| 10 | Admin gets a **See customization** button that re-renders from stored params and offers **Download 3MF**. |
| 11 | Guests can customize and buy, like the existing guest checkout. |
| 12 | Customize replaces both Add to cart and Buy it now. |

## 4. Core concepts and data

### 4.1 Customizer document (`customizers` collection)

```
{
  slug: "name-keychain",
  title: "Name keychain",
  renderer: "text-keychain",
  params: ParamDefinition[],
  active: true,
  version: 1,
  createdAt, updatedAt
}
```

```
ParamDefinition = {
  key: string,
  type: "text" | "textarea" | "number" | "select" | "color" | "boolean" | "font",
  label: string,
  group?: string,
  default: string | number | boolean,
  mutable: boolean,
  min?, max?, step?, unit?,
  maxLength?,
  options?: [{ value, label, meta? }],
  hint?
}
```

- `font` is a `select` whose options carry the CDN data (`meta: { id, weight }`) used by the renderer's font provider.
- Constants (`mutable: false`) are never sent by the client. The resolver fills them from `default`.
- `version` increments on every admin save.

### 4.2 Param values

`ParamValues = Record<string, string | number | boolean>`. **Resolved params** are the full set: constants plus the shopper's values, each validated and clamped. Resolved params are what the cart, the order and the renderer all use. Storing the full resolved set means an old order renders identically even if the config changes later.

### 4.3 Customization on cart and order lines

```
CartCustomization = { slug, version, params: ParamValues }
```

- `CartItem.customization?: CartCustomization`.
- Cart key becomes `handle:variantId` for plain products and `handle:variantId:<customizationId>` for customized ones. `customizationId` is a short random id generated when the line is added, so two designs of one product are separate lines.
- `cart.model.ts` and `order.model.ts` lines gain an optional `customization` sub-document with `slug, renderer, version, params`.
- The order snapshot also records `renderer`, so admin can render without loading the live config.

## 5. Architecture (frontend and shared)

New top-level module `src/customizers/`, split so the framework-free parts are shared by client and server.

```
src/customizers/
  core/                       (pure TS, no DOM, no three, usable on server)
    types.ts                  ParamDefinition, ParamValues, CustomizerConfig
    ParamValidator.ts         IParamValidator interface
    validators/               TextValidator, NumberValidator, SelectValidator, ColorValidator, BooleanValidator
    ParamValidatorRegistry.ts
    ParamResolver.ts          resolve(config, input) -> ParamValues
  rendering/                  (browser only)
    ICustomizerRenderer.ts    interface
    IModelExporter.ts         interface
    RendererRegistry.ts       key -> factory
    RendererHost.tsx          mounts a renderer into a div, wires update/dispose
  renderers/
    text-keychain/
      index.ts                registers itself
      TextKeychainRenderer.ts implements ICustomizerRenderer
      geometry/
        GlyphLayout.ts        text to contours (from layoutText, densify, bend)
        PathOps.ts            clipper wrapper: union, difference, offset, closing
        ShapeBuilders.ts      ring, base, text outline
        MeshBuilder.ts        polygons to extruded mesh
        MeshAnalyzer.ts       open edges, non-manifold stats
        KeychainGeometry.ts   orchestrates build(font, params) -> layers
      FontProvider.ts         IFontProvider + CdnFontProvider (cache, abort)
      ThreeSceneAdapter.ts    layers -> THREE meshes, lights, orbit, fit/reset
      ThreeMfExporter.ts      implements IModelExporter
  components/
    ParamField.tsx            picks a control by param type
    fields/                   TextField, NumberField, SelectField, ColorField, BooleanField, FontField
    ParamForm.tsx             groups + renders mutable params only
    CustomizerStudio.tsx      form + renderer host + add to cart / save
```

Key interfaces:

```
interface ICustomizerRenderer {
  mount(container: HTMLElement): void
  update(params: ParamValues): Promise<RenderResult>
  resetView(): void
  dispose(): void
}

interface IModelExporter {
  export(params: ParamValues, fileName: string): Promise<Blob>
}

interface IFontProvider {
  load(meta: FontMeta, signal: AbortSignal): Promise<Font>
}
```

- A renderer registers itself: `RendererRegistry.register("text-keychain", factory)`. The factory receives dependencies (font provider, exporter), so tests and future renderers can swap them.
- A future photo editor implements the same `ICustomizerRenderer` with a 2D canvas and registers under `"photo-editor"`. The Studio, API, cart and order need no change.
- Exporters are optional per renderer. The admin "Download 3MF" button appears only if the renderer exposes an exporter. Other renderers expose their own (for example PNG).
- Three.js, opentype.js, clipper-lib and jszip are loaded with dynamic `import()` inside the renderer factory. Nothing heavy ships to non-customizer pages, and SSR never touches them.

### Port notes from `Test/`

- Split `core.js` (406 lines) into the six geometry files above so each stays under the cap. Logic stays identical so the output matches.
- Replace `window.THREE` r147 globals with the modern `three` package (`OrbitControls` from `three/examples/jsm`). Check material and geometry API differences when porting `app.js`.
- `clipper-lib` has no types. Add a minimal `.d.ts` declaring only the functions used.
- DOM reading (`readParams`, `data-p`) goes away. The React form owns state and passes `ParamValues` to `update()`.
- Debounce updates (about 120 ms) and cancel stale font loads with `AbortController`, replacing the `loadToken` counter.

## 6. Architecture (server)

Same layering as the rest of `src/server`:

- `models/customizer.model.ts`: mongoose schema with `slug` unique and indexed.
- `repositories/customizer.repository.ts`: `findBySlug`, `list`, `create`, `update`, `remove`.
- `services/customizer.service.ts`: `getActive(slug)`, and `resolveCustomization(slug, input) -> { params, version, renderer }`. It calls the shared `ParamResolver` from `src/customizers/core`, so client and server validate with the same code.
- `validators/customizer-input.ts`: validates admin payloads (unique keys, defaults valid for their own type, `min <= default <= max`, select defaults exist in options, known renderer key).
- `controllers/customizer.controller.ts`.
- Routes:
  - `GET /api/customizers/[slug]` (public, active only).
  - `POST /api/customizers/[slug]/resolve` (validates and returns resolved params, used by add to cart and by the checkout path).
  - `GET/POST/PUT/DELETE /api/admin/customizers[/id]` (admin).
- Product model gains `customizerSlug: String`. Admin product validator checks the slug exists.
- Cart sync and order creation pass through `resolveCustomization` again, so params in a stored cart or order can never be unvalidated client input.
- `checkout-pricing.service.ts`: customized lines are validated and the price is unchanged. An invalid or inactive customizer fails that line with a clear error.

## 7. Shopper flow

1. Product page: if `product.customizerSlug` is set, `ProductActions` and `StickyBuyBar` render a single **Customize** link to `/customize/<slug>?product=<handle>`. Plain products are untouched.
2. `/customize/[slug]` (Pages Router, `getServerSideProps` since configs are admin-editable and per-request): loads the customizer config and the product summary. It renders `CustomizerStudio` through `next/dynamic` with `ssr: false`.
3. The form shows mutable params grouped by `group`. The renderer updates live.
4. **Add to cart**: POST to `/resolve`, then `cart.add({ ...productItem, customization })`. The cart image is the product's featured image.
5. Cart line shows the key param values (for example the text) and an **Edit** link to `/customize/<slug>?product=<handle>&edit=<cartKey>`. The Studio preloads the stored params, and **Update cart** replaces that line in place.
6. Checkout and order creation carry `customization` into the order line.

## 8. Admin flow

- **Customizers manager** at `app/admin/customizers`: list, create, edit, activate or deactivate, delete (blocked if products reference the slug).
- **Editor**: a structured param builder (add, reorder, remove a param, pick type, set default, mutable toggle, ranges, options) with a **live preview** using the real renderer. A raw JSON tab edits the same document and is validated by the same validator. The renderer dropdown comes from `RendererRegistry` keys.
- **Product editor**: new `customizerSlug` picker (select of active customizers, empty means a normal product).
- **Order detail** (`OrderDetailView`, `AdminOrdersManager`) and **cart detail** (`CartDetailView`): customized lines show the param table and a **See customization** button. It opens a modal with `RendererHost` in read-only mode, fed the stored params, plus **Download 3MF** from the renderer's exporter.

## 9. SOLID and OOP mapping

| Principle | Where |
|---|---|
| Single responsibility | Geometry, layout, font loading, scene, export and form are separate classes. Validation is one class per param type. |
| Open/closed | New param type: add a validator and a field component, register both. New renderer: add a folder and register the key. Existing code is not edited. |
| Liskov | Every renderer honors `ICustomizerRenderer`. Studio and admin viewer work with any of them. |
| Interface segregation | `ICustomizerRenderer`, `IModelExporter`, `IFontProvider` and `IParamValidator` are each small. A renderer without export just does not provide an exporter. |
| Dependency inversion | `TextKeychainRenderer` depends on `IFontProvider` and `IModelExporter`, injected by its factory. The Studio depends on the registry, not on concrete renderers. Server services depend on the repository interface. |
| Encapsulation | Clipper scaling, scene and renderer state stay private to their classes. Callers see only `ParamValues` in and `RenderResult` out. |
| DRY | One shared resolver and validators for client and server. One `ParamField` for the storefront form and the admin preview. |

## 10. Phases

0. **Prep**: read the Next.js docs in `node_modules/next/dist/docs/`. Add deps `three`, `@types/three`, `opentype.js`, `clipper-lib`, `jszip` and a clipper `.d.ts`.
1. **Core and server**: `src/customizers/core`, the customizer model, repository, service, controller, validators, public and admin API, seed script for `name-keychain` (all current `Test` params with sensible `mutable` flags and the 15 CDN fonts).
2. **Keychain renderer port**: geometry files, font provider, scene adapter, exporter, renderer registration. Verify parity against `Test/` using fixed param sets and comparing triangle counts and bounding boxes.
3. **Studio UI**: fields, `ParamForm`, `RendererHost`, `/customize/[slug]` page.
4. **Commerce wiring**: `customizerSlug` on product, Customize button, cart type and key changes, cart Edit, cart sync, order line snapshot, checkout validation.
5. **Admin**: customizers manager and editor with preview, product picker, See customization modal with 3MF download on order and cart detail.
6. **Hardening**: slug deletion guard, text length and character limits, mobile performance (debounce, disposal of GPU resources on unmount), error states when a font fails to load, guest cart sync check.

## 11. Open points

I have defaults for each of these. Say "defaults" to accept them all.

1. **Variants:** Customize does not choose a variant. Default: the customize page uses the product's first available variant. Do customizable products have variants that matter (size, colour)? If yes, I add a variant picker on the customize page.
2. **Cart image:** I read "use the products preview png" as using the product's existing featured image in the cart, with no snapshot taken from the 3D canvas. Default: product image. Say so if you want a snapshot of the shopper's design.
3. **Quantity:** Customize page has a quantity stepper (default 1) and the cart line holds quantity as usual.
4. **Config changes later:** an old cart line keeps its stored params. If a param was removed or became constant, Edit re-resolves against the live config: unknown keys are dropped and out-of-range values are clamped.
5. **Admin editor:** structured builder with a raw JSON tab as described, rather than JSON only.
6. **Param grouping:** the keychain groups are Text, Curve, Joining and base, Key ring (as in `Test/`), set through each param's `group`.
7. **Tests:** the project has no test runner. Default: no new test framework, and parity is checked with a one-off script in `scripts/`.
