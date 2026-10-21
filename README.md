# 🛒 FreshCart — AI-Powered Grocery Delivery with A2UI v1.0

**FreshCart** is an Instacart-inspired grocery delivery web application built with **React 19**, **TypeScript**, and **Tailwind CSS** that showcases **A2UI v1.0** (`version: "v1.0"`) interactive generative UI surfaces side-by-side with a full e-commerce storefront, slide-over cart, 4-step checkout flow, and real-time A2UI v1.0 protocol inspector.

It also serves as a comprehensive **Zero-Prior-Knowledge Public Onboarding Evaluation** of the public A2UI v1.0 specification and npm ecosystem (`@a2ui/react@0.14.0`, `@a2ui/web_core@0.14.0`, `@a2ui/markdown-it@0.2.2`).

---

## ✨ Key Features

### 1. Multi-Store Grocery Storefront (`src/components/storefront/`)
- **4 Retail Banners:** *FreshCart Organic Market*, *ValueMart Bulk & Save*, *GreenLeaf Local Co-op*, and *importFoods Artisanal*.
- **50 Richly Detailed Grocery SKUs (`src/data/products.ts`):** Spanning 8 categories (*Produce*, *Meat & Seafood*, *Dairy & Eggs*, *Bakery*, *Pantry*, *Frozen*, *Beverages*, *Snacks*) with nutrition facts (`calories`, `proteinG`, `carbsG`, `fatG`, `fiberG`), dietary badges (`organic`, `vegan`, `gluten-free`, `keto`, `high-protein`, `SNAP EBT`, `local`), unit pricing, and substitution recommendations.
- **Instant Filtering & Promotional Carousel:** Real-time search (`Cmd/Ctrl+K`), category pills, dietary toggles, sort controls, and interactive hero banners that deep-link into the **AI Personal Shopper** with pre-filled prompts.

### 2. Slide-Over Cart & 4-Step Checkout (`src/components/cart/` & `src/components/checkout/`)
- **Free Delivery Progress Bar:** Dynamic visual tracker toward the `$35.00` free delivery threshold.
- **Per-Item Substitution Preferences:** Choose between *Best Match (AI Recommended)*, *Specific Replacement SKU*, or *Refund if Unavailable* per cart line item.
- **Promo Codes:** Built-in support for `FRESH10` ($10 off $35+), `A2UIV1` (20% off + free delivery), and `FREEDEL` (free delivery).
- **Full Checkout Modal & Live Order Tracker:** 4-step guided checkout (*Delivery Address & Speed*, *Substitution Review*, *Payment & Tip*, *Live 4-Stage Shopper Order Tracker*) with simulated shopper progress and live A2UI v1.0 Substitution Approval Card.

### 3. A2UI v1.0 Runtime Engine & Catalog (`src/a2ui/`)
- **Strict A2UI v1.0 Wire Envelope Support (`version: "v1.0"`):**
  - `createSurface` (with `surfaceId`, `catalogId`, `theme`, `sendDataModel`)
  - `updateComponents` (flat adjacency list with `id`, `component`, `ChildList` static arrays & `{ componentId, path }` dynamic templates, `weight`, and `checks`)
  - `updateDataModel` (RFC 6901 JSON Pointer path updates at root `/` or nested paths)
  - `deleteSurface`
  - `callRendererFunction` / `agentFunctionResponse`
- **Full v1.0 Dynamic Value Resolution:**
  - Data binding via `{ path: "/..." }` (RFC 6901 JSON Pointer, root-relative and template-item-relative)
  - Function evaluation via `{ call: "formatNumber" | "formatCurrency" | "formatString" | "required" | "numeric" | "regex" | "length" | "and" | "or" | "not", args: { ... } }`
  - Collection template index evaluation via `{ "@index": { offset: 1 } }`
  - Client-side validation checks (`checks: [{ condition, message }]`) gating `Button` enabled state and inline error banners.
- **18 Standard v1.0 Basic Catalog Components + 2 Custom Grocery Catalog Components:**
  - **Basic Catalog (`https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json`):** `Text`, `Image`, `Icon`, `Video`, `AudioPlayer`, `Row`, `Column`, `List`, `Card`, `Tabs`, `Divider`, `Modal`, `Button`, `CheckBox`, `TextField`, `DateTimeInput`, `ChoicePicker`, `Slider`.
  - **Custom Grocery Catalog (`https://freshcart.app/catalogs/grocery/v1/catalog.json`):** `ProductDealCard` (rich grocery SKU card with quantity stepper, dietary badges, and instant cart binding) and `NutritionSummary` (calorie/macro visual progress widget).

### 4. AI Personal Shopper Drawer & Protocol Inspector (`src/components/ai-shopper/`)
- **3 Interactive Multi-Surface A2UI v1.0 Scenarios (`src/scenarios/`):**
  1. **🍝 AI Meal Planner (`meal-planner-surface`):** Build a Mediterranean Dinner Party or High-Protein Weeknight Meal Plan with dynamic servings slider (`Slider`), dietary restrictions (`ChoicePicker`), interactive ingredient list (`List` template with `CheckBox` toggles), and one-click **Add All Selected to FreshCart** (`addAllToCart` action).
  2. **🔄 Smart Cart Substitution Optimizer (`cart-optimizer-surface`):** Inspects your live cart or sample items to propose organic/store-brand swaps with side-by-side savings (`ProductDealCard`) and one-click swap actions (`applySubstitution`).
  3. **🥗 Weekly Budget & High-Protein Macro Builder (`budget-nutrition-surface`):** Interactive weekly budget slider (`$40–$200`) and protein target (`50g–220g/day`) with `checks` validation, `Tabs` (*Macro Breakdown*, *Recommended Bundle*, *Custom Prompt*), and `NutritionSummary`.
- **Live Protocol Inspector (`A2uiInspectorDrawer.tsx`):**
  - **Wire Log (`v1.0`):** Inspect every incoming `createSurface`, `updateComponents`, and `updateDataModel` JSON envelope and outgoing client `action` / `dataModel` payload.
  - **Data Model Tree:** Live JSON Pointer state viewer for the active surface.
  - **Component Graph:** Inspect the flat adjacency list and resolved hierarchy.
  - **Onboarding & Audit Findings:** In-app viewer for our A2UI v1.0 onboarding discovery, documentation gaps, and package bug reports.

---

## 🚀 Quickstart

### Prerequisites
- **Node.js** `>= 20` (tested with Node `v24.18.0`)
- **npm** `>= 10`

### Install & Run Development Server
```bash
npm install
npm run dev
```

### Production Build & Typecheck
```bash
npm run build
```

### Verify A2UI v1.0 Envelopes Against `@a2ui/web_core/v1_0`
Run the standalone verification script to validate all A2UI v1.0 scenario envelopes against the installed `@a2ui/web_core/v1_0` `MessageProcessor` and `PayloadValidator`:
```bash
node scripts/verify-a2ui-v1.mjs
```

---

## 📂 Project Architecture

```text
freshcart-a2ui/
├── docs/
│   ├── A2UI_ONBOARDING_DISCOVERY.md   # Phase 1: Public A2UI v1.0 discovery & npm package audit
│   ├── A2UI_DOCUMENTATION_GAPS.md     # Phase 1–3: 10+ public documentation gaps & mismatches
│   ├── A2UI_BUGS_AND_ISSUES.md        # Phase 1–3: 8+ verified package & runtime bugs in @a2ui/*@0.14.0
│   ├── SYSTEM_DESIGN.md               # Master System Design Document & Cross-Section Contracts
│   └── designs/
│       ├── 01-storefront-catalog.md   # Section 1 Design: Storefront, Navigation & Catalog
│       ├── 02-cart-checkout.md        # Section 2 Design: Cart, Substitutions & Checkout
│       ├── 03-a2ui-v1-engine.md       # Section 3 Design: A2UI v1.0 Runtime Engine & Catalog
│       └── 04-ai-shopper-inspector.md # Section 4 Design: AI Personal Shopper & Inspector
├── scripts/
│   └── verify-a2ui-v1.mjs             # Automated v1.0 envelope validator using @a2ui/web_core/v1_0
├── src/
│   ├── types/index.ts                 # Shared TypeScript interfaces & A2UI v1.0 wire types
│   ├── data/
│   │   ├── stores.ts                  # 4 grocery retail store banners
│   │   └── products.ts                # 50 realistic grocery SKUs with full macros & dietary tags
│   ├── context/
│   │   ├── StoreContext.tsx           # Active store, search, category, dietary filters & sort
│   │   └── CartContext.tsx            # Persistent cart, substitutions, promos & order history
│   ├── a2ui/
│   │   ├── engine/                    # A2UI v1.0 SurfaceStore, JSON Pointer & Function Evaluator
│   │   ├── catalog/                   # 18 Basic v1.0 components + 2 Custom Grocery components
│   │   └── A2uiSurfaceRenderer.tsx    # React 19 renderer for A2UI v1.0 surfaces
│   ├── scenarios/
│   │   ├── mealPlannerScenario.ts     # Surface 1: AI Meal Planner v1.0 envelopes
│   │   ├── cartOptimizerScenario.ts   # Surface 2: Smart Cart Substitution Optimizer v1.0 envelopes
│   │   ├── budgetBuilderScenario.ts   # Surface 3: Weekly Budget & Macro Builder v1.0 envelopes
│   │   └── onboardingFindingsData.ts  # Structured onboarding findings for the Inspector UI
│   └── components/
│       ├── layout/                    # Navbar, StoreSwitcherModal, HeroBanner
│       ├── storefront/                # CategorySidebar, ProductGrid, ProductCard, ProductDetailModal
│       ├── cart/                      # CartDrawer, CartItemRow, SubstitutionSelector, FreeDeliveryBar
│       ├── checkout/                  # CheckoutModal, OrderSuccessTracker
│       └── ai-shopper/                # AiShopperDrawer, ScenarioSelector, A2uiInspectorDrawer
└── package.json
```

---

## 🔍 Summary of A2UI v1.0 Onboarding Evaluation

During development, we simulated a **first-time external React developer** discovering and integrating **A2UI v1.0** solely via public channels (`a2ui.org`, `github.com/google/A2UI`, and the npm registry). Full reports are located in `docs/`:

1. **[docs/A2UI_ONBOARDING_DISCOVERY.md](./docs/A2UI_ONBOARDING_DISCOVERY.md)**
   - Audits `a2ui.org` docs vs. `github.com/google/A2UI` (`main`) vs. published npm packages (`@a2ui/react@0.14.0`, `@a2ui/web_core@0.14.0`, `@a2ui/markdown-it@0.2.2`, `@a2ui/lit@0.14.0`).
   - Documents the complete A2UI v1.0 wire specification (`createSurface`, `updateComponents`, `updateDataModel`, `deleteSurface`, `callRendererFunction`, `agentFunctionResponse`, `@path`, `@call`, `@index`).
2. **[docs/A2UI_DOCUMENTATION_GAPS.md](./docs/A2UI_DOCUMENTATION_GAPS.md)**
   - **DOC-GAP-01:** `a2ui.org/roadmap/` and `renderers.md` list v1.0 as `🚧 Planned` and React docs only show `@a2ui/react/v0_9`, hiding that `@a2ui/web_core@0.14.0` already ships `./v1_0` and `./catalogs/basic/v1`.
   - **DOC-GAP-02:** `client-setup.md` references fictional `<A2UISurface>` and `useA2UI()` exports that do not exist in `@a2ui/react`.
   - **DOC-GAP-03:** `renderers/react/README.md` only documents `v0.8` (`A2UIProvider`, `A2UIRenderer`, `useA2UIMessageHandler`).
   - **DOC-GAP-04:** Undocumented strict Unicode UAX #31 identifier constraint (`^[\p{XID_Start}_][\p{XID_Continue}]*$`) on component `id`s in `@a2ui/web_core/v1_0` (causing component IDs with hyphens like `"main-col"` to throw `A2uiValidationError`).
   - **DOC-GAP-05 to DOC-GAP-10:** Undocumented `formatString` v1.0 arg signature (`{ value }` vs `{ template, values }`), `@index(offset)` syntax, `callRendererFunction`, and React peer dependency expectations.
3. **[docs/A2UI_BUGS_AND_ISSUES.md](./docs/A2UI_BUGS_AND_ISSUES.md)**
   - **BUG-01 (High):** Importing `@a2ui/react` in SSR/Node crashes immediately (`ReferenceError: HTMLElement is not defined` at module top level in `ReactWcHost`).
   - **BUG-02 (High):** `@a2ui/react@0.14.0` lacks `./v1_0` and `./catalogs/basic/v1` subpath exports in `package.json`.
   - **BUG-03 (High):** `@a2ui/web_core/v1_0` `PayloadValidator` rejects hyphenated component `id`s even though `common_types.json` allows `type: "string"`.
   - **BUG-04 to BUG-08:** `@a2ui/markdown-it@0.2.2` broken Lit peer dependency on npm, `globalThis.Document` crash in `@lit/reactive-element` under JSDOM, strict `.strict()` Zod rejections on v0.8/v0.9 property names, and silent failures on missing root components.
