# O4K9 design preview

The O4K9 client-review concept is available at **`/o4k9`**. After this branch is deployed to the existing frontend, the address is **`https://prattprojects.com/o4k9`** (or the deployment's own hostname followed by `/o4k9`). This change does not itself deploy the branch.

## Implementation

- `frontend/public/o4k9/index.html` is the static entry point.
- Styles, JavaScript, and copied O4K9 images live under `frontend/public/o4k9/`.
- The exact `/o4k9` rewrite in `frontend/next.config.js` serves the static entry point. The normal Next.js trailing-slash normalization also handles `/o4k9/`.
- Asset URLs are rooted at `/o4k9/`, so images/styles/scripts work when the entry point has no trailing slash.
- Interior views use hash navigation, such as `/o4k9#/boarding` and `/o4k9#/book/daycare`, without adding routes to the recipe app's React tree.
- The page bypasses the recipe root layout, Firebase providers, Encore API calls, and recipe CSS. No authentication or backend configuration is required to serve this static preview.
- The existing root redirect and recipe routes are unchanged.
- Both HTML robots metadata and an `X-Robots-Tag` response header discourage indexing. This is a preview, not the official O4K9 website. **Noindex is not access control**; after deployment the URL is public unless deployment access restrictions are added separately.

## Local use

From `frontend`, install the locked dependencies with `npm ci` and run `npm run dev`. Open `http://localhost:3000/o4k9` (or the port printed by Next.js).

Check the preview route and its asset URLs. Recipe-page testing additionally requires this app's usual Firebase/Encore configuration; the O4K9 preview does not use it.

Validation on November 18, 2026 used Node 22.23.5. `/o4k9`, its HTML entry point, styles, script, and all ten copied images returned HTTP 200 with the preview's noindex header; `/o4k9/` normalized to `/o4k9`, and `/` retained its existing `/home` redirect. Browser checks confirmed the preview loaded only its own script/styles and its daycare flow worked under the `/o4k9` prefix. See `docs/o4k9-route-checks.json` for the HTTP results.

The full Next.js production build compiled and passed lint/type checks, then stopped while collecting existing recipe/signup pages because the local checkout has no valid `FIREBASE_SERVICE_ACCOUNT_KEY` (Firebase reports a missing `project_id`). Node 26 also exposed an older dependency compatibility error; Node 22 reached the credential check. No application credentials were fabricated and no recipe/authentication code was changed. A complete production build needs the existing application's normal environment configuration.

The local `/recipes` request compiled its existing page but returned HTTP 500 because Firebase's client API key is unconfigured and the local Encore backend refused the connection. This prevents a complete recipe-page runtime regression check in this checkout; `/o4k9` still returned 200 and completed a demo booking independently.

## What to review

Home, training packages, daycare, overnight boarding, founder biography, contact enquiries, a sample client area, and three existing shop products are interactive. Date/dog-count changes update the demo boarding total; daycare has an optional bath; booking details persist when editing within the current page session.

Use **Review this concept** to see assumptions, select a decision, and download feedback locally. Nothing is sent to a server. Form details are kept in memory and clear on reload. No messages, real availability checks, accounts, payments, reservations, or orders are created.

The real logo, photographs, published program/base prices, and existing testimonial came from O4K9's public site on November 18, 2026. The optional bath was observed in the earlier booking investigation. Asset sources are recorded in `docs/o4k9-assets.json`. New copy, sample availability, the proposed daycare whole-day reservation model, final arrival/eligibility rules, terms, and the visual direction require Blake's review before a live implementation.

## Source and future updates

This is a checked-in copy of the local concept prepared in `C:/Repos/o4k9/mockup/dist`. There is no runtime dependency on that directory or on the live O4K9 website. All image files are included locally; no remote fonts or tracking services are used. Asset rights remain with their owners.

When copying a newer concept into this app, preserve the `/o4k9/` prefixes in the HTML's stylesheet/script/favicon/image references and in the `asset()` helper in `app.js`. Keep the response header and demo-only connection/form restrictions. Repeat the route, asset, editing, pricing, and mobile checks before deployment.
