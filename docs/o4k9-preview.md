# O4K9 original-site improvement preview

Open **`/o4k9`**. This branch retains the actual O4K9 Wix presentation and applies a bounded set of proposed improvements. It does not publish to O4K9 or deploy this app. Once deployed through the recipe app's normal process, its URL would be `https://prattprojects.com/o4k9`.

## Preserved source

The checked-in copy contains 98 desktop/mobile snapshots: 43 public pages and six booking UI states, each with a mobile counterpart. They include home, services, boarding, daycare, consultation, about, contact, shop, product pages, blog/posts, gift cards and subscriptions. The original HTML, stylesheet order, fonts, colors, photography, image crops, section order and published content are retained. Desktop interactive booking states came from rendered public Wix/HotelRunner screens. Mobile uses Wix's actual mobile HTML and 320px viewport model; booking widgets unavailable in mobile server HTML reuse the captured native widget markup with narrow-screen layout fixes.

`docs/o4k9-capture.json` records page URLs and asset provenance, captured November 18, 2026. `frontend/public/o4k9/files/` contains all referenced styles, images and fonts locally (426 files, about 23 MiB). Rights remain with the source owners. There is no runtime dependency on `C:/Repos/o4k9`, Wix, HotelRunner or a capture tool.

This is a faithful static baseline, not an export of the Wix editor/project. Live animations are held at their visible resting state, and live integrations are replaced with local demonstrations. Not every third-party widget state is reproduced: product option menus, gallery effects, account management, search/filtering and checkout integrations are outside this preview. Captured content can become stale after the live site changes.

## Specific proposed changes

1. Use Training, Boarding, Daycare consistently in navigation, homepage actions and service copy. Rename “Book a Stay” to “Book Boarding.” All three homepage actions use solid orange backgrounds, dark 18px labels at the original 400 weight and at least 54px height on desktop. On the original mobile canvas they use 16px labels, 48px minimum height and a full-width stack. Preserve the original hero headline and photograph.
2. Enlarge the Moscow, Idaho service/location line to 18px on desktop and 15px on the mobile canvas. A dark gradient over the original photo improves text contrast. The hero grows when necessary so the location line and actions do not collide with the next section. Keyboard users receive a visible white focus outline.
3. Link Training and Start Training directly to the existing `/service-page/one-hour-dog-training-consultation` page, retaining its native details and disconnected Book Now flow. Retire the separate Services listing. Proposed visits to both `#/services` and the earlier `#/training` alias normalize to the existing consultation URL; Baseline preserves the original Services snapshot. Add all five published program prices, durations and inclusions before the consultation gallery and cancellation policy. Blake confirmed that the required $150 consultation is additional to the program price and is not credited. Keep the additional-fee explanation above the pricing table. The table contains Program, Duration and Program price only: Bronze $1,050, Bronze Plus $1,100, Silver $1,250, Silver Plus $1,400 and Platinum $2,300. Do not show combined costs or repeat the consultation fee on each card. The consultation booking itself remains $150. The rejected package-details popup remains removed.
4. Make the published phone, email and address visible in a restrained footer using the existing palette and typography.
5. Use Dogs/Kennels terminology alongside care/rate information, and remove irrelevant hotel amenities. The user confirmed the language controls in Blake’s setup at **Hotels → Property Setup → Languages → Booking Engine**. Apply the wording to details panels and accessible labels as well. Retain the native rate/details panels. See [Wix feasibility research](o4k9-review-feedback/wix-hotels-feasibility.md).
6. Replace the daycare instruction to choose an 8AM-5PM start time with a request to confirm arrival arrangements. Keep the calendar presentation and 8AM daycare sample; do not invent a change to staffing, duration or capacity.
7. Add a readable booking-help panel with dark 18px body text on white, a phone link and a prominent date-enquiry action. New action labels use normal text weight. Local sample selections remain in memory to support the disconnected demonstration; changing Wix’s edit/persistence behavior is not a proposed deliverable.
8. Improve local page titles/descriptions, image text and one O4K9 spelling error; hide the unavailable rewards promotion while preserving header spacing.
9. Replace the homepage's “Choose your Plan” section with “Training Programs & Pricing.” Five informational cards retain the published program information and link to consultation-page pricing. Explain the extra required $150 once in the section introduction, above the cards. One Book a Consultation action follows the cards. Reactive Rehab has its own variable-price entry with the additional consultation fee explained. Separate Boarding and Daycare cards show their published rates and direct booking links. Preserve the original section photograph and site typography.

The small **Review changes · Demo only** control lists these edits and switches between the original baseline and Proposed on the current route. It also downloads a local review-notes text file. Direct baseline URL: `/o4k9?mode=baseline`. The review UI is preview infrastructure, not a recommendation to add it to the live site. The 15-slide presentation is titled **O4K9 Website Proposal** and omits repetitive comparison subtitles. Actual before/after captures show the existing consultation page, program pricing with the additional fee, revised homepage program information and separate care services. The combined “Proposed Additions” slide focuses on the consultation notice and program-price table. Its closing slide focuses on review links and Blake’s decisions.

For Wix implementation, point navigation to the existing consultation service page, retain its native booking action and configure a [301 redirect](https://support.wix.com/en/article/setting-up-a-301-redirect-for-a-page-on-your-site) from `/services` to `/service-page/one-hour-dog-training-consultation`. The local hash-router normalization is a demonstration, not a production HTTP redirect. Put pricing in the consultation's service-specific description or supported page elements; verify the editor supports the proposed table placement before promising an exact widget layout. Keep this content specific to the consultation so it does not appear on the shared Daycare service-page template.

Blake must confirm final arrival rules, package details, terms and housing suitability. The preview does not diagnose or fix the live intermittent booking error or availability configuration. SEO titles/copy are proposed; no production ranking or speed improvement is claimed from this static mockup.

## Local flows and isolation

Daycare uses the original add-ons → summary → calendar → client-details screens. Bath ($50), extra walks ($15) and cot rental ($3) can be added/removed from the published $25 daily base. Consultation uses a $150 base and clearly illustrative time choices. Boarding supports dates, 1-3 dogs, native rate/details views, a demo kennel selection and client details. Published nightly bases are $50/$90/$110; a three-dog, three-night sample totals $330. These exclude unverified fees/taxes and final live terms. Product carts use the captured product price. Contact and booking completion show local-only feedback.

No reservation, order, payment, email, message, login, account or calendar event is created. State stays in memory and clears on reload. All original scripts, live frames and event handlers were removed. The snapshot CSP includes `connect-src 'none'`, `frame-src 'none'` and `form-action 'none'`; the shell permits only its local iframe. External links display an inert explanation. HTML metadata and the existing response header specify noindex. Noindex does not restrict access if this preview is publicly deployed.

## Structure and updates

- `frontend/public/o4k9/index.html`, `styles.css`, `app.js`: isolated iframe shell, route selection and review controls.
- `routes.js`, `pages/`, `files/`: source snapshots and retained source resources. Preserve original CSS order and component IDs when updating captures.
- `preview.js`, `preview.css`: proposed edits and offline UI behavior. Edits are gated by `mode=baseline`; static-rendering fixes and offline behavior are present in both modes.
- `scripts/check-o4k9-preview.mjs`: checks offline CSP, scripts/frames, local resource references and optional HTTP responses.

Keep `/o4k9/` asset prefixes. Internal navigation uses the original paths in a hash, for example `/o4k9#/service-page/one-hour-dog-training-consultation` and `/o4k9#/service-page/dog-daycare-1`. This bypasses the recipe app's React layout, Firebase providers and backend. The existing exact `/o4k9` rewrite and noindex response header are unchanged in this branch, as are the root redirect, recipe routes and dependencies.

From `frontend`, install the locked app dependencies and run the existing Next development command. Node 22 was used for verification. The current review server uses port 3050. From the repository root, run:

```sh
node --check frontend/public/o4k9/app.js
node --check frontend/public/o4k9/preview.js
node scripts/check-o4k9-preview.mjs http://127.0.0.1:3050
```

## Validation and limits

All 98 snapshots and every referenced local resource returned HTTP 200; 533 HTTP checks passed, including the existing `/` → `/home` and `/o4k9/` → `/o4k9` redirects. See `docs/o4k9-route-checks.json`. Static checks found no remote image/CSS resource, unexpected script, embedded live frame, missing resource, or missing offline/noindex policy.

Browser review covered original/proposed home, mobile navigation/image loading, native add-ons/editing/summary, calendar month/date selection, consultation time selection, client form/local completion, boarding dates/dog-count/rates, product cart and review-mode switching. At a 1280×720 desktop viewport, original and baseline homepage headlines had identical measured geometry (x164.33, y282.82, width779, height210) and the original 70px Lulo font/line height. Mobile was checked at 390×844 using the original 320px Wix canvas; home has no horizontal overflow.

The consultation/pricing revision was checked on desktop and mobile: both legacy URLs normalize to the existing consultation route, program links jump to its pricing, the five program prices are correct and the table has only three columns, and pricing precedes the gallery and cancellation policy. The mobile table becomes labeled rows without horizontal overflow. Native consultation booking continues to a $150 summary without submission. Baseline has no added fee notice or pricing section, and Daycare has no consultation pricing. See [current screenshots and checks](o4k9-review-feedback/README.md).

The existing Next production build previously compiled and passed lint/type checks, then failed during recipe/signup page collection because this checkout lacks a valid `FIREBASE_SERVICE_ACCOUNT_KEY`. The existing `/recipes` page also requires Firebase client configuration and its Encore backend. This static-only revision does not resolve or alter those app configuration requirements; a complete production regression/build needs the normal deployment environment.
