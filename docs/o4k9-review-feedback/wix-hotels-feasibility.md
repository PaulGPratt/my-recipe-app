# Wix Hotels wording: confirmed editing path

Checked against Wix’s official documentation on November 19, 2026. The captured O4K9 boarding widget uses HotelRunner resources (`be.hotelrunner.com`, `o4k9.hotelrunner.com`), so documentation for **Wix Hotels by HotelRunner** is relevant. Older “original Wix Hotels” instructions should not be assumed to match this app.

Wix documents these customization paths:

- In the editor, select the **Booking Page** element → **Settings** → **Text**. Wix says this covers text in the search bar, reservation summary and room listings. [Adding and setting up your hotel, step 2](https://support.wix.com/en/article/wix-hotels-by-hotelrunner-adding-and-setting-up-your-hotel).
- For default accommodation terms, the current Languages documentation points to **Hotels dashboard → Languages → Property Settings → Booking Engine → Translate**. Its example changes “Add room” to wording suited to another property type. [Managing site languages, room-type FAQ](https://support.wix.com/en/article/wix-hotels-by-hotelrunner-managing-your-site-languages#frequently-asked-questions-faqs).
- Room display names, descriptions and amenities are editable in **Room Types**. [Creating room types](https://support.wix.com/en/article/wix-hotels-by-hotelrunner-adding-room-types).

The user has now confirmed that the language changes are available in Blake’s installed app through **Hotels → Property Setup → Languages → Booking Engine**. This site-specific confirmation resolves the uncertainty that remained from the general documentation alone.

Proposed therefore uses **Dogs** instead of **Adults** and **Kennels** instead of **Rooms**, including the summary, details panels and accessible labels. Use the confirmed Booking Engine language settings to implement these changes in Wix. Review the resulting selection, summary and detail states after saving, preserving any dynamic placeholders used by the app.

This is a wording/layout recommendation. It does not change inventory, capacity, prices, scheduling or booking persistence.
