# izLanding Module

This module provides the core functionality to build, host, and track landing pages dynamically within izhubs ERP.

## izForm Integration (Embedded Forms)

The integration between `izLanding` and `izForm` aims to completely reuse the existing, feature-rich izForm builder and submit flow without duplicating code, while achieving a seamless visual integration on Landing Pages.

### How it works (Architectural Decisions)

**1. Database Model (iz_forms):**
When a Landing Page embeds a form, it uses the `iframe-form` block. The block simply stores the endpoint URL of the form (`/forms/[formId]`) inside the `content_json` payload.

**2. SSR Form Load (Zero-Loading Time):**
The public `/forms/[id]/page.tsx` was optimized to use **Server-Side Rendering (SSR)**.
It queries the `iz_forms` table natively via `db.query` from Postgres, then hydrates `PublicFormView` directly with `initialForm` data.
*Why?* This eliminates the slow Client-Side Request cascade (the white screen with "Loading form..." text) meaning that an iFrame embedded on a landing page pops up instantly.

**3. Transparent Embed (`?embed=true`):**
When `LandingRenderer` encounters an `iframe-form` block, it appends `?embed=true` to the form's URL (`src={content.url}?embed=true`).
Inside `PublicFormView`, the component detects this flag and:
- Strips the `.standaloneWrapper` (which normally displays a full-screen gradient background).
- Enforces the `.embedded` class on the form card.
- Result: Background becomes `transparent`, removing border/shadows and letting the form blend 100% naturally into the Landing Page body.
  
**4. Dynamic Height & Auto-Resize Strategy:**
iFrames normally cause a "scrolling box" or a massive blank white space if height is mismatched.
To solve this cleanly across domain boundaries (even though they are same-origin here):
- **Form Side (`PublicFormView.tsx`):**
  Uses `MutationObserver` (and `requestAnimationFrame`) to read the exact `offsetHeight` of the `.card` container (with a bit of margin padding), circumventing Next.js's artificial `100vh` body inflation.
  It sends this pixel height to the parent via `window.parent.postMessage({ type: 'IZFORM_RESIZE', height: h }, '*')`.
- **Landing Side (`LandingRenderer.tsx`):**
  Injects a lightweight inline `<script>` below the iframe listening for `IZFORM_RESIZE`. 
  Once received, it stretches the `<iframe style="height: [X]px">` boundary perfectly. No blank space below the submit button!

**5. Clean UI Adjustments:**
- The footer ("Powered by izhubs ERP") was updated to be right-aligned with 60% opacity to act as a very subtle watermark compared to a disruptive text block.
- The wrapper around the iframe form in `LandingRenderer` has had all `border`, `bg-slate-50`, and `shadow-inner` container styling removed when embedded, acting purely as a transparent structural `div`.

### Where to adjust in the future:
- Layout and API payload of Embedded blocks: `components/plugins/izlanding/LandingRenderer.tsx`
- Layout and SSR logic of standalone Forms: `app/forms/[id]/page.tsx`
- Form visuals and postMessage logic: `components/plugins/izform/PublicFormView.tsx`
- Module routing and schema engine: `core/engine/izlanding.ts` and `core/engine/izform.ts`
