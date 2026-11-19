# O4K9 Website Proposal — current review evidence

The 15-slide presentation compares the current O4K9 site with **Proposed**. Fresh November 19 browser captures show the existing consultation page, transparent program pricing, revised homepage program information and separate care services. The help and footer slides show full browser screenshots of help and the contact footer in page context, without focus-highlight boxes. The trainer-title slide uses one page image beside its metadata comparison. The decisions slide has two columns, fuller training/navigation and homepage summaries, and no booking-reliability row. The order groups homepage changes, consultation/pricing, booking language/help, contact details, SEO and the review summary. All proposed screens come from the local disconnected mockup at `http://127.0.0.1:3050/o4k9`.

## Training uses the existing consultation page

Training and Start Training open `/service-page/one-hour-dog-training-consultation`. Proposed normalizes legacy `/services` and `/training` links to this existing URL. The native consultation details and Book Now path remain. Blake confirmed that its required **$150 consultation fee is additional to the program price and is not credited**.

Current live page:

![Current consultation page](consultation-pricing/consultation-before.jpg)

Proposed:

![Consultation with additional-fee notice](simplified-pricing/consultation-proposed.jpg)

[Combined Proposed Additions comparison](simplified-pricing/proposed-additions-slide.png)

## Program prices before the cancellation policy

Pricing and published inclusions appear before the gallery and cancellation policy. The table shows program name, duration and program price only. The additional $150 consultation fee is explained above the table; the consultation booking itself remains $150. The presentation combines the consultation notice and pricing into “Proposed Additions,” using actual screenshot crops focused on these new sections.

| Program | Duration | Program price |
| --- | --- | ---: |
| Bronze | 5 weeks | $1,050 |
| Bronze Plus | 6 weeks | $1,100 |
| Silver | 7 weeks | $1,250 |
| Silver Plus | 8 weeks | $1,400 |
| Platinum | 12+ weeks | $2,300 |

Current policy area:

![Current page without program pricing](consultation-pricing/pricing-before.jpg)

Proposed desktop and mobile:

![Proposed program pricing table](simplified-pricing/pricing-proposed.jpg)

![Mobile pricing with labeled rows](simplified-pricing/pricing-mobile-proposed.jpg)

![Native consultation booking summary remains $150](consultation-pricing/consultation-booking-summary.jpg)

## Homepage explains programs before booking

Replace “Choose your Plan” with “Training Programs & Pricing.” Five informational cards retain the published prices, durations and inclusions. The section introduction explains the extra consultation fee once, above the cards; links jump to the existing consultation page's pricing. One Book a Consultation action follows the cards. Reactive Rehab remains a separate variable-price entry with the additional consultation explained.

Current live section:

![Current Choose your Plan section](consultation-pricing/home-training-before.jpg)

Proposed:

![Proposed training programs and pricing](simplified-pricing/home-training-proposed.jpg)

![Mobile program card and fee disclosure](simplified-pricing/home-mobile-proposed.jpg)

## Boarding and Daycare have their own care group

Published rates and direct booking links sit outside the training programs. Boarding starts at $50/night for the first dog, plus $40 for a second and $20 for a third. Daycare is $25/day. Reactive Rehab has its own entry rather than sharing a numbered plan list.

Current live section:

![Current mixed training and care list](consultation-pricing/home-care-before.jpg)

Proposed:

![Separate Boarding and Daycare cards](consultation-pricing/home-care-proposed.jpg)

![Separate Reactive Rehab entry](consultation-pricing/home-reactive-proposed.jpg)

![Mobile care cards](consultation-pricing/home-care-mobile-proposed.jpg)

## Other accepted recommendations

The hero retains the original photograph and headline. Its solid orange actions use normal 400-weight labels and larger targets. Navigation and service text use Training, Boarding, Daycare consistently, with Book Boarding wording. The readable help panel, contact footer, Dogs/Kennels labels and amenities cleanup remain in the presentation.

- [Desktop hero](home-desktop-after.jpg) and [mobile hero](home-mobile-after.jpg)
- [Boarding wording](boarding-proposed.jpg)
- [Readable help](booking-help-proposed.jpg) and [footer](footer-proposed.jpg)
- [Mobile menu](menu-mobile-proposed.jpg) and [mobile help/footer](help-footer-mobile-proposed.jpg)

The user confirmed the installed language controls at **Hotels → Property Setup → Languages → Booking Engine**. See [Wix Hotels documentation](wix-hotels-feasibility.md).

## Verification and Wix implementation

[Current browser checks](simplified-pricing/browser-checks.json) record all five program prices, three-column pricing, fee explanations above the cards/table, the program-to-pricing link and mobile layout. [Earlier flow checks](consultation-pricing/browser-checks.json) record canonical routing, aliases, section order, the $150 consultation summary and separate care destinations; their combined-cost display has since been removed. At 390×844, the original Wix canvas has matching client/scroll widths of 320px on home and consultation. Mobile pricing uses stacked labeled rows. Baseline has no added pricing or fee notice, and Daycare has no consultation pricing. No real booking, login, payment or message was submitted.

JS syntax and isolation/resource checks pass. [Route checks](../o4k9-route-checks.json) cover 98 snapshots and 530 resources with 533 successful HTTP checks. Earlier hero/focus evidence is in [browser-checks.json](browser-checks.json), and boarding/footer checks are in [blake-review-checks.json](blake-review-checks.json). Earlier bespoke Training-page captures are historical, not the current proposal.

In Wix, redirect `/services` to the existing consultation URL and point navigation there. Add pricing to the consultation's service-specific description or supported elements. Verify the editor's placement/table controls; do not add consultation content indiscriminately to the shared Daycare service-page template. This local hash redirect is a demonstration, not an HTTP 301. No production Wix content was changed. See [preview documentation](../o4k9-preview.md) for app isolation and the existing Firebase-dependent production-build limitation.
