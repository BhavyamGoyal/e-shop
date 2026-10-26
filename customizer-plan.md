# 3D Model Customizer Plan

## What the codebase already has

- **Routing:** Pages Router, not `app/`. The product page is `src/pages/product/[handle].tsx`, and `src/pages/[handle].tsx` also exists. Assumption: "web/[slug]" means the product page, where the customizer lives.
- **Product model:** `product.model.ts` already has a `models3d[]` field (url, filename, etc.), but nothing in the UI uses it.
- **Cart:** the Zustand cart is keyed `handle:variantId` and persisted in localStorage. It is synced to the `carts` collection (`CartSync`, `cart.model.ts`).
- **Pricing:** `checkout-pricing.service.ts` re-prices every line on the server from the product and variant. The client never sets the price, and that stays the same.
- **Order lines:** `order.model.ts` stores `key, handle, variantId, title, image, unitAmount, quantity`, with no customization data.
- **Storage:** `@vercel/blob` is installed for file uploads. Admin pages already exist for orders, carts and products.
- **Not installed:** there is no three.js. We would add `three`, `@react-three/fiber` and `@react-three/drei`.
- **Repo rules:** no comments, explicit types, and a 150-200 line cap per file. The plan keeps files small to fit.

## Plan

### 1. Data model

**Customizer config, attached to a product (admin-defined):**

```
product.customizer = {
  enabled,
  baseModelUrl,
  parameters: [
    { id, type: "text",   label, maxLength, fonts[], defaultValue, target: "<mesh/node name>", priceDelta },
    { id, type: "size",   label, min, max, step, unit, axis/scale target, priceDelta/priceFormula },
    { id, type: "choice", label, options: [{ label, value, modelUrl?, color?, priceDelta }] },
    { id, type: "color",  label, palette[] }
  ]
}
```

- **A model per option:** a `choice` option can carry its own `modelUrl`. This covers different customizations having different models or URLs (for example, a heart shape and a star shape as separate `.glb` files).
- **Admin model upload:** uploaded to Vercel Blob and recorded on the product, reusing `models3d`.

**A saved design, in a new `customizations` collection:**

```
{ _id, productHandle, userId|guestId, configVersion, params: { [paramId]: value },
  modelUrl (resolved base model), previewImage (PNG snapshot), exportedModelUrl? (.glb/.stl),
  computedPrice, createdAt }
```

- Order and cart lines gain `customizationId`, plus a small snapshot of `params`. The snapshot keeps the order readable even if the product config changes later.
- `cart.model.ts`, `order.model.ts`, `Cart.types.ts` and `OrderLineRecord` all gain the optional field.
- The cart key becomes `handle:variantId:customizationId`, so two different designs of the same product are separate lines.

### 2. Storefront editor (product page)

- A `CustomizerCanvas` organism (react-three-fiber, lazy-loaded with `next/dynamic`, `ssr: false`) sits next to or replaces the image gallery for customizable products.
- A `CustomizerPanel` renders controls from `parameters`: text input with font picker, size slider, option swatches, colour picker. Each is a small molecule.
- Text is rendered with `TextGeometry` or a texture/decal on the target mesh. Size is applied as scale on the target node, with min/max clamped.
- A live price is shown from `priceDelta`/`priceFormula`.
- "Add to cart" takes a PNG snapshot from the canvas, uploads it to Blob, and `POST /api/customizations` saves the params.
- The cart then holds the line with `customizationId`.

### 3. Server

- `POST /api/customizations`: validate params against the product's config. This checks text length and characters, size within min/max, and that the option exists. It then computes the price server-side and saves the design.
- `priceLine` in `checkout-pricing.service.ts` adds the customization's `priceDelta` to the unit amount, recomputed from the stored params, never from client input.
- Order creation copies `customizationId`, the params snapshot and the preview image into the order line.
- Cart sync stores and restores the `customizationId`.
- New files follow the existing layering: `customization.model.ts`, `customization.repository.ts`, `customization.service.ts`, `customization.controller.ts`, `customization-input.ts` (validator), and the route under `api/customizations`.

### 4. Admin

- **Product editor:** a "Customizer" section with the base model upload, a parameter builder (add, edit and reorder parameters, per-option models) and a live preview.
- **Order detail (`OrderDetailView` / `AdminOrdersManager`):** each customized line shows a read-only 3D viewer of the user's exact model, the parameter table (text, size and so on) and a download button for the production file.
- The admin carts view shows the same for items that are still in a cart.

### 5. Phases

1. Data model and API, with the cart and order carrying `customizationId`.
2. Storefront viewer and a minimal text and size editor on one test product.
3. Admin config builder and per-option models.
4. Admin order viewer, preview snapshot and file export.
5. Hardening: guest handling, model size limits, cleanup of unused designs, mobile performance.

## Open questions

Recommended default is given for each. Answering "defaults" accepts all of them.

1. **Product types:** which products need this first (keychains, candles, tingle products)? Are all their models already `.glb`, or are there STL/OBJ/Blender files that need converting?
2. **Text on the model:** extruded 3D geometry (it prints or cuts), or a flat engraving or decal texture? *(Default: engraved decal for the preview, extruded for the production file if you manufacture from the model.)* Which fonts will be offered?
3. **Size:** free scaling in cm/mm on a slider, or fixed presets (S/M/L) mapped to variants? *(Default: free slider within admin min/max.)* Does price change with size? If so, is it a formula, a per-step table, or a flat add-on?
4. **Pricing:** should customizations change the price at all, or is the base price fixed? *(Default: optional `priceDelta` per option, computed server-side.)*
5. **Admin's file:** is seeing the model in 3D enough, or is a downloadable production file (`.glb`, `.stl` for 3D printing) with the user's text and size applied also needed? *(Default: both.)*
6. **Who can customize:** logged-in users only, or guests too? Orders already support guests (`isLoggedOutOrder`). *(Default: guests allowed, with the design saved when they add to cart.)*
7. **Reuse:** should users be able to save designs to an account and re-edit them from the cart or an order? *(Default: re-edit from the cart yes, from past orders no.)*
8. **Text moderation:** is a blocklist or a character set restriction on user text needed? *(Default: length limit and basic character allowlist.)*
9. **Mobile:** what share of traffic is mobile? Heavy `.glb` files need to stay small, so the plan caps uploads around 5 MB and requires Draco compression. Is that acceptable?
10. **Scope of "different models or URLs":** (a) one product where options swap the model, or (b) separate products at separate URLs that each have their own customizer? The plan supports both. (b) is just a per-product config, while (a) needs the per-option `modelUrl`. Which is needed?
11. **Route:** does the editor live on the existing `product/[handle]` page and not on a new `/customize/[slug]` route? *(Default: on the product page.)*
