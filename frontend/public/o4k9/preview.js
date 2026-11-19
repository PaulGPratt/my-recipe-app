"use strict";

(() => {
  const original = document.documentElement.dataset.originalPage;
  const proposed =
    new URLSearchParams(location.search).get("mode") !== "baseline";

  const shared = window.parent !== window ? window.parent.O4K9_DEMO : null;
  const state = shared || {
    extras: {},
    date: "2026-11-19",
    time: "8:00 am",
    service: "daycare",
    checkout: "2026-11-20",
    dogs: 1,
    owner: {},
    enquiry: {},
    cart: [],
  };

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const escape = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );

  function navigate(path) {
    if (window.parent !== window)
      window.parent.postMessage(
        { type: "o4k9:navigate", path },
        location.origin,
      );
    else location.href = "/o4k9#" + path;
  }

  function dialog(title, body) {
    let el = $("#preview-dialog");
    if (!el) {
      el = document.createElement("dialog");
      el.id = "preview-dialog";
      el.className = "preview-dialog";
      document.body.append(el);
    }
    el.innerHTML = `<button type="button" class="preview-close" aria-label="Close">×</button><h2>${title}</h2>${body}`;
    el.querySelector(".preview-close").onclick = () => el.close();
    if (!el.open) el.showModal();
    return el;
  }

  function info(title, copy) {
    dialog(
      title,
      `<p>${copy}</p><p class="preview-note">Local preview only. Nothing is sent or changed on the live site.</p>`,
    );
  }

  const mobile = document.documentElement.dataset.originalDevice === "mobile";

  const boardingPage = original.startsWith("boarding");

  const extras = [
    { name: "Bath", price: 50 },
    { name: "Extra Walks", price: 15 },
    { name: "Dog Cot Rental", price: 3 },
  ];

  const money = (n) => "$" + Number(n).toFixed(2);

  const isBoarding = () => state.service === "boarding";

  const total = () =>
    isBoarding()
      ? [0, 50, 90, 110][state.dogs] *
        Math.max(
          1,
          Math.round(
            (new Date(state.checkout + "T12:00:00") -
              new Date(state.date + "T12:00:00")) /
              86400000,
          ),
        )
      : state.service === "consultation"
        ? 150
        : 25 +
          extras.reduce((n, x) => n + (state.extras[x.name] ? x.price : 0), 0);

  const dateLabel = (value) =>
    new Date(value + "T12:00:00").toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  function replaceText(root, pattern, replacement) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement.closest("script,style")) continue;
      node.nodeValue = node.nodeValue.replace(pattern, replacement);
    }
  }

  function buttonText(button, text) {
    const span = button.querySelector(".sLhdrcV");
    if (span) span.textContent = text;
    else button.textContent = text;
  }

  function addHelp(root) {
    if (!root || root.querySelector(".preview-booking-help")) return;
    const help = document.createElement("aside");
    help.className = "preview-booking-help";
    help.setAttribute("aria-label", "Booking help");
    help.innerHTML =
      '<strong>Need help booking?</strong><p>If you see an error or cannot find your date, call <a href="/o4k9#/contact" data-preview-route="/contact">(225) 773-3264</a> or ask Blake about availability.</p><button type="button">Ask about your date</button>';
    help.querySelector("button").onclick = () => {
      state.enquiry.message =
        "I would like to ask about " + dateLabel(state.date) + ".";
      navigate("/contact");
    };
    root.append(help);
  }

  function boardingWording(value) {
    return value.replace(/\b(adults?|rooms?)\b/gi, (word) => {
      const replacement = {
        adult: "dog",
        adults: "dogs",
        room: "kennel",
        rooms: "kennels",
      }[word.toLowerCase()];
      return word[0] === word[0].toUpperCase()
        ? replacement[0].toUpperCase() + replacement.slice(1)
        : replacement;
    });
  }

  const trainingRoute = "/service-page/one-hour-dog-training-consultation";
  const trainingPrograms = [
    {
      name: "Bronze",
      price: 1050,
      weeks: "5 weeks · Management",
      items: [
        "Loose-leash walking",
        "Place command",
        "Kennel, crate and potty training",
        "Equipment included",
      ],
    },
    {
      name: "Bronze Plus",
      price: 1100,
      weeks: "6 weeks",
      items: ["Management", "Basic commands", "Equipment included"],
    },
    {
      name: "Silver",
      price: 1250,
      weeks: "7 weeks · Off-leash preparation",
      items: [
        "Puppy foundations",
        "Play and games, positions, place and recall",
        "Equipment included",
      ],
    },
    {
      name: "Silver Plus",
      price: 1400,
      weeks: "8 weeks · Off-leash preparation",
      items: ["Puppy foundations", "Public places", "Equipment included"],
    },
    {
      name: "Platinum",
      price: 2300,
      weeks: "12+ weeks",
      items: [
        "Puppy foundations",
        "Management",
        "Off-leash obedience",
        "Equipment included",
      ],
    },
  ];
  const programMoney = (value) => "$" + value.toLocaleString("en-US");

  function programCards() {
    return trainingPrograms
      .map(
        (p) =>
          `<article><h3><a href="/o4k9#${trainingRoute}?section=pricing" data-preview-route="${trainingRoute}?section=pricing">${p.name}</a></h3><p class="preview-training-price">${programMoney(p.price)}</p><p class="preview-training-duration">${p.weeks}</p><ul>${p.items.map((item) => `<li>${item}</li>`).join("")}</ul></article>`,
      )
      .join("");
  }

  function showHomeOfferings() {
    const root = $("#comp-lt8r2k23");
    if (!root) return;
    const photo = root.querySelector("img")?.getAttribute("src");
    const section = document.createElement("section");
    section.className = "preview-training-programs";
    section.innerHTML = `<div class="preview-training-inner"><h2>Training Programs &amp; Pricing</h2><p class="preview-training-lead">Training starts with a required one-hour consultation ($150). The consultation fee is additional to program prices. Blake will help you choose the right program for your dog.</p><div class="preview-training-grid">${programCards()}</div><p class="preview-training-next"><a class="preview-training-action" href="/o4k9#${trainingRoute}" data-preview-route="${trainingRoute}">Book a Consultation</a></p><section class="preview-training-rehab"><div><h3>Reactive Rehab</h3><p>Support for concerns such as lunging, growling, nipping, biting or resource guarding. Program pricing varies. The required $150 consultation is additional to the program fee.</p></div><a href="/o4k9#${trainingRoute}" data-preview-route="${trainingRoute}">Discuss at a consultation</a></section><section class="preview-other-care" aria-labelledby="other-care-title"><h2 id="other-care-title">Boarding &amp; Daycare</h2><div class="preview-other-care-grid"><article><h3>Dog Boarding</h3><p class="preview-training-price">$50 per night</p><p>First dog: $50/night. Add $40/night for a second dog and $20/night for a third.</p><p>Dogs are let out multiple times daily, walked, worked and played with.</p><a class="preview-training-action" href="/o4k9#/dog-boarding" data-preview-route="/dog-boarding">Book Boarding</a></article><article><h3>Dog Daycare</h3><p class="preview-training-price">$25 per day</p><p>Daycare during operating hours. Confirm arrival arrangements with Blake.</p><a class="preview-training-action" href="/o4k9#/service-page/dog-daycare-1" data-preview-route="/service-page/dog-daycare-1">Book Daycare</a></article></div></section></div>`;
    if (photo)
      section.style.backgroundImage = `linear-gradient(#0009, #000b), url("${photo}")`;
    root.classList.add("preview-training-page", "preview-home-offerings");
    root.replaceChildren(section);
  }

  function addConsultationPricing() {
    const root = $("#TPAMultiSection_kj2y03fv");
    const body = root?.querySelector('[data-hook="body-children-wrapper"]');
    if (!body) return;
    const description = body.querySelector('[data-section-type="DESCRIPTION"]');
    const note = document.createElement("aside");
    note.className = "preview-consultation-note";
    note.innerHTML =
      '<p><strong>Consultation required before training.</strong> This one-hour consultation costs $150, in addition to the training program price.</p><button type="button">View training program pricing</button>';
    note.querySelector("button").onclick = () =>
      $("#training-pricing")?.scrollIntoView({ block: "start" });
    description?.before(note);
    const pricing = document.createElement("section");
    pricing.id = "training-pricing";
    pricing.className = "preview-training-page preview-consultation-pricing";
    pricing.setAttribute("aria-labelledby", "training-pricing-title");
    pricing.innerHTML = `<h2 id="training-pricing-title">Training Programs &amp; Pricing</h2><p>All programs require the $150 consultation. The consultation fee is additional to the program price and is not credited toward it. Choose your program with Blake after the consultation.</p><table class="preview-program-prices"><caption>Program prices</caption><thead><tr><th scope="col">Program</th><th scope="col">Duration</th><th scope="col">Program price</th></tr></thead><tbody>${trainingPrograms.map((p) => `<tr><th scope="row">${p.name}</th><td data-label="Duration">${p.weeks.split(" · ")[0]}</td><td data-label="Program price">${programMoney(p.price)}</td></tr>`).join("")}</tbody></table><h3 class="preview-inclusions-title">What the programs include</h3><div class="preview-training-grid">${trainingPrograms.map((p) => `<article><h3>${p.name}</h3><ul>${p.items.map((item) => `<li>${item}</li>`).join("")}</ul></article>`).join("")}</div><section class="preview-training-rehab"><div><h3>Reactive Rehab</h3><p>Program pricing varies with your dog’s needs. The required $150 consultation is additional to the program fee.</p></div></section>`;
    const before =
      body.querySelector('[data-section-type="GALLERY"]') ||
      body.querySelector('[data-section-type="POLICY"]');
    if (before) before.before(pricing);
    else body.append(pricing);
    if (new URLSearchParams(location.search).get("section") === "pricing")
      document.fonts.ready.then(() =>
        pricing.scrollIntoView({ block: "start" }),
      );
  }

  if (proposed) {
    const nav = $("#iebebgbnitemsContainer");
    if (nav) {
      const source = [...nav.children].find(
        (e) => e.textContent.trim() === "Services",
      );
      if (source) {
        const item = source.cloneNode(true);
        item.id = "preview-daycare-menu";
        item.style.width = "90px";
        item.setAttribute("data-state", "menu false link");
        item.querySelectorAll("[id]").forEach((e) => (e.id += "-daycare"));
        const a = item.querySelector("a");
        a.setAttribute("data-preview-route", "/service-page/dog-daycare-1");
        a.href = "/o4k9#/service-page/dog-daycare-1";
        a.removeAttribute("aria-current");
        item.querySelector("p").textContent = "Daycare";
        const boarding = [...nav.children].find((e) =>
          e.querySelector('a[data-preview-route="/dog-boarding"]'),
        );
        source.querySelector("p").textContent = "Training";
        source.style.width = "96px";
        if (boarding) {
          boarding.querySelector("p").textContent = "Boarding";
          boarding.style.width = "100px";
          boarding.before(source);
          boarding.after(item);
        } else source.after(item);
      }
    }

    const mobileNav = $("#MENU_AS_CONTAINER_EXPANDABLE_MENU");
    if (mobileNav) {
      const a = [...mobileNav.querySelectorAll("a")].find(
        (a) => a.textContent.trim() === "Services",
      );
      if (a) {
        const item = a.closest("li").cloneNode(true);
        item.querySelectorAll("[id]").forEach((e) => (e.id += "-daycare"));
        const next = item.querySelector("a");
        next.textContent = "Daycare";
        next.setAttribute("data-preview-route", "/service-page/dog-daycare-1");
        next.href = "/o4k9#/service-page/dog-daycare-1";
        const training = a.closest("li");
        const boarding = mobileNav.querySelector(
          'a[data-preview-route="/dog-boarding"]',
        )?.closest("li");
        a.textContent = "Training";
        if (boarding) {
          boarding.querySelector("a").textContent = "Boarding";
          boarding.before(training);
          boarding.after(item);
        } else training.after(item);
      }
    }

    $$('a[data-preview-route*="my-rewards"]').forEach(
      (a) => (a.style.visibility = "hidden"),
    );

    $$('a[data-preview-route="/services"]').forEach((a) => {
      const text = a.textContent.trim();
      if (/^(Dog|Boarding)$/.test(text)) {
        a.dataset.previewRoute = "/dog-boarding";
        a.href = "/o4k9#/dog-boarding";
        return;
      }
      a.dataset.previewRoute = trainingRoute;
      a.href = "/o4k9#" + trainingRoute;
    });

    $$('[data-hook="breadcrumb"]').forEach((item) => {
      if (item.textContent.trim() === "Service list") item.remove();
    });

    const footer = $("#SITE_FOOTER");
    if (footer) {
      footer.style.height = "auto";
      footer.style.minHeight = "76px";
      const contact = document.createElement("div");
      contact.className = "preview-contact-footer";
      contact.innerHTML =
        '<div><strong>O4K9</strong><p>Training · Boarding · Daycare</p></div><div><strong>Get in touch</strong><br><a href="/o4k9#/contact" data-preview-route="/contact">(225) 773-3264</a><br><a href="/o4k9#/contact" data-preview-route="/contact">o4k9.training@gmail.com</a></div><div><strong>Visit us</strong><p>2711 Foothill Road<br>Moscow, ID 83843</p></div>';
      footer.append(contact);
    }

    const descriptions = {
      home: [
        "Dog Training, Boarding & Daycare | Moscow, Idaho | O4K9",
        "Dog training, overnight boarding and daycare in Moscow, Idaho and Latah County. Explore programs, published prices and how to book.",
      ],
      consultation: [
        "Dog Training Consultation & Program Prices | Moscow, ID | O4K9",
        "Book the required one-hour O4K9 dog training consultation in Moscow, Idaho for $150. Explore program prices; the consultation fee is additional.",
      ],
      boarding: [
        "Dog Boarding in Moscow, Idaho | O4K9",
        "Explore O4K9 boarding care, kennels and published rates in Moscow, Idaho.",
      ],
      daycare: [
        "Dog Daycare in Moscow, Idaho | O4K9",
        "Dog daycare in Moscow, Idaho. Review the published daily rate and discuss care and arrival arrangements with Blake.",
      ],
      about: ["Meet Blake Marretta | Dog Trainer in Moscow, ID | O4K9", null],
      contact: ["Contact O4K9 Dog Training & Boarding | Moscow, ID", null],
      shop: [
        "Dog Training Gear & Supplies | O4K9",
        "Explore dog training equipment, treats and food from O4K9. Ask Blake what suits your dog.",
      ],
    };
    if (descriptions[original]) {
      document.title = descriptions[original][0];
      if (descriptions[original][1]) {
        let meta = $('meta[name="description"]');
        if (!meta) {
          meta = document.createElement("meta");
          meta.name = "description";
          document.head.append(meta);
        }
        meta.content = descriptions[original][1];
      }
    }

    $$("img").forEach((image) => {
      if (/IMG_7153/.test(image.alt))
        image.alt = "Blake working with a dog in a field";
      else if (/hanging\+up|IMG_7146|IMG_7154/.test(image.alt)) image.alt = "";
      else if (/Blake Cigars/.test(image.alt))
        image.alt = "Blake Marretta at O4K9";
    });

    if (original === "about")
      replaceText(document.body, /Let 04K9 Help/g, "Let O4K9 Help");

    if (original === "consultation") addConsultationPricing();

    if (["daycare", "daycare-addons", "daycare-summary"].includes(original))
      replaceText(
        document.body,
        /Choose a drop-off start time between 8:00 AM and 5:00 PM\./g,
        "Reserve your daycare day and confirm arrival arrangements with Blake.",
      );

    if (original === "home") {
      const hero = $("#comp-lt8r2k21");
      const links = [...hero.querySelectorAll("a")];
      const first = links.find(
          (a) => a.textContent.trim() === "START TRAINING",
        ),
        stay = links.find((a) => a.textContent.trim() === "BOOK A STAY");
      const subtitle = [...hero.querySelectorAll("p")].find((e) =>
        e.textContent.includes("Veteran Dog Trainer"),
      );
      if (first && stay && subtitle) {
        const stayLabel = stay.querySelector(".wixui-button__label");
        if (stayLabel) stayLabel.textContent = "BOOK BOARDING";
        else stay.textContent = "BOOK BOARDING";
        stay.setAttribute("aria-label", "BOOK BOARDING");
        const heroRect = hero.getBoundingClientRect();
        const originalHeight = heroRect.height;
        const originalActionTop =
          first.getBoundingClientRect().top - heroRect.top;
        hero.classList.add("preview-readable-hero");
        subtitle.classList.add("preview-hero-subtitle");
        const shade = document.createElement("div");
        shade.className = "preview-hero-shade";
        shade.setAttribute("aria-hidden", "true");
        hero.querySelector("#bgLayers_comp-lt8r2k21").append(shade);

        const locationLine = document.createElement("p");
        locationLine.className = "preview-hero-location";
        locationLine.textContent =
          "Moscow, Idaho · Dog Training, Boarding & Daycare";
        const actions = document.createElement("div");
        actions.className = "preview-hero-actions";
        const daycare = document.createElement("a");
        daycare.textContent = "BOOK DAYCARE";
        daycare.dataset.previewRoute = "/service-page/dog-daycare-1";
        daycare.href = "/o4k9#/service-page/dog-daycare-1";
        actions.append(first, stay, daycare);
        hero.append(locationLine, actions);

        const place = () => {
          const h = hero.getBoundingClientRect();
          const s = subtitle.getBoundingClientRect();
          const left = Math.max(16, s.left - h.left);
          const width = Math.min(
            760,
            document.documentElement.clientWidth - left * 2,
          );
          Object.assign(locationLine.style, {
            left: left + "px",
            top: s.bottom - h.top + 12 + "px",
            width: width + "px",
          });
          const locationBottom =
            locationLine.getBoundingClientRect().bottom - h.top;
          const top = Math.max(originalActionTop, locationBottom + 20);
          Object.assign(actions.style, {
            left: left + "px",
            top: top + "px",
            width: width + "px",
          });
          hero.style.minHeight =
            Math.max(
              originalHeight,
              top + actions.getBoundingClientRect().height + 28,
            ) + "px";
        };
        document.fonts.ready.then(place);
        requestAnimationFrame(place);
        window.addEventListener("resize", place);
      }
      showHomeOfferings();
    }

    if (boardingPage) {
      const engine = $("booking-engine");
      if (engine) {
        // Match the Booking Engine language settings, including details panels.
        replaceText(document.body, /\b(adults?|rooms?)\b/gi, boardingWording);
        $$('[aria-label],[title]').forEach((element) => {
          for (const attribute of ["aria-label", "title"]) {
            const value = element.getAttribute(attribute);
            if (value) element.setAttribute(attribute, boardingWording(value));
          }
        });
        $$("span")
          .filter((e) =>
            /^\d+ bedrooms$|^Mountain view$|^Pets allowed$/.test(
              e.textContent.trim(),
            ),
          )
          .forEach((e) => e.remove());
        const intro = document.createElement("section");
        intro.className = "preview-boarding-intro";
        intro.innerHTML =
          '<h1>Dog Boarding in Moscow, Idaho</h1><p>Temperature-controlled kennels, five daily outings and two walks, with food included twice daily.</p><p>Nightly rates: $50 for the first dog, + $40 for the second, + $20 for the third. Confirm shared-kennel suitability and arrival arrangements with Blake.</p>';
        engine.prepend(intro);
        addHelp(engine);
      }
    }
  }

  function showMobileMenu() {
    const menu = $("#MENU_AS_CONTAINER");
    if (!menu) return;
    menu.removeAttribute("data-undisplayed");
    Object.assign(menu.style, {
      display: "block",
      visibility: "visible",
      opacity: "1",
      position: "fixed",
      inset: "0",
      height: "100vh",
      width: "320px",
      zIndex: "15000",
      background: "#000",
      transform: "none",
    });
    let close = menu.querySelector("[data-preview-close-menu]");
    if (!close) {
      close = document.createElement("button");
      close.textContent = "×";
      close.setAttribute("aria-label", "Close navigation menu");
      close.dataset.previewCloseMenu = "true";
      Object.assign(close.style, {
        position: "absolute",
        right: "16px",
        top: "12px",
        fontSize: "30px",
        background: "#000",
        color: "#fff",
        border: "0",
        zIndex: "15001",
      });
      menu.append(close);
      close.onclick = () => {
        menu.style.display = "none";
        menu.setAttribute("data-undisplayed", "true");
      };
    }
  }

  function showCart() {
    const el = dialog(
      "My Cart",
      `${state.cart.length ? state.cart.map((x, i) => `<div class="preview-line"><span>${escape(x.name)} × ${x.quantity}</span><span>${money(x.price * x.quantity)} <button type="button" data-remove="${i}" aria-label="Remove ${escape(x.name)}">×</button></span></div>`).join("") : "<p>Your demo cart is empty.</p>"}<div class="preview-line"><b>Subtotal</b><b>${money(state.cart.reduce((n, x) => n + x.price * x.quantity, 0))}</b></div><p class="preview-note">Demo cart only. No order or payment is created. Shipping, tax, product choices and booking terms require confirmation.</p><button class="preview-btn" data-checkout>Preview checkout</button>`,
    );
    el.querySelectorAll("[data-remove]").forEach(
      (b) =>
        (b.onclick = () => {
          state.cart.splice(Number(b.dataset.remove), 1);
          showCart();
        }),
    );
    el.querySelector("[data-checkout]").onclick = () =>
      info(
        "Checkout preview",
        "The selected items would be reviewed before a live checkout. No order or payment has been created.",
      );
  }

  function addProduct(button) {
    const card =
      button.closest('[data-hook="product-list-grid-item"],li') ||
      button.parentElement.parentElement;
    const title =
      $('[data-hook="product-title"]')?.textContent ||
      card.querySelector('[data-hook="product-item-name"]')?.textContent ||
      card.querySelector("h3")?.textContent ||
      "Selected product";
    const priceText =
      $('[data-hook="formatted-primary-price"]')?.textContent ||
      card.querySelector('[data-hook="product-item-price-to-pay"]')
        ?.textContent ||
      card.textContent;
    const amount = Number(
      priceText.match(/\$([\d,]+(?:\.\d+)?)/)?.[1]?.replaceAll(",", ""),
    );
    if (!Number.isFinite(amount)) {
      info(
        "Product preview",
        "Open the product page to review its price and options. No item was ordered.",
      );
      return;
    }
    const quantity = Number($('input[type="number"]')?.value) || 1;
    state.cart.push({ name: title.trim(), price: amount, quantity });
    showCart();
  }

  function saveFields() {
    for (const input of $$('input:not([type="checkbox"]),textarea')) {
      const label = input.getAttribute("aria-label") || input.id;
      if (label) state.owner[label] = input.value;
    }
  }

  function finishBooking() {
    saveFields();
    const name = $('input[aria-label="Name"]');
    const email = $('input[type="email"]');
    if (name && !name.value.trim()) {
      name.setCustomValidity("Please enter a sample name.");
      name.reportValidity();
      name.oninput = () => name.setCustomValidity("");
      return;
    }
    if ((email && !email.validity.valid) || (email && !email.value.trim())) {
      email?.setCustomValidity("Please enter a valid sample email address.");
      email?.reportValidity();
      if (email) email.oninput = () => email.setCustomValidity("");
      return;
    }
    dialog(
      "Booking preview complete",
      `<p><b>${isBoarding() ? "Dog Boarding" : state.service === "consultation" ? "One Hour Dog Training Consultation" : "Dog Daycare"}</b></p><p>${dateLabel(state.date)}${isBoarding() ? " to " + dateLabel(state.checkout) : " at " + state.time}</p><p>Estimated base total: <b>${money(total())}</b></p><p class="preview-note">No reservation, calendar event, email, phone notification, account or payment has been created. This is a local demonstration.</p><div class="preview-buttons"><button class="preview-btn" data-edit-booking>Edit details</button><button class="preview-btn" data-booking-home>Back to home</button></div>`,
    ).querySelector("[data-booking-home]").onclick = () => navigate("/");
    $("#preview-dialog [data-edit-booking]").onclick = () =>
      $("#preview-dialog").close();
  }

  function showDatePicker(boarding = false) {
    const base = new Date(state.date + "T12:00:00");
    let month = base.getMonth(),
      year = base.getFullYear();
    const el = dialog(
      boarding ? "Choose stay dates" : "Choose a sample date",
      '<div id="local-dates"></div>',
    );
    function draw() {
      const count = new Date(year, month + 1, 0).getDate(),
        start = new Date(year, month, 1).getDay();
      el.querySelector("#local-dates").innerHTML =
        `<div class="preview-calendar-head"><button data-prev aria-label="Previous month">‹</button><strong>${new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</strong><button data-next aria-label="Next month">›</button></div><div class="preview-calendar">${["S", "M", "T", "W", "T", "F", "S"].map((x) => `<span>${x}</span>`).join("")}${"<span></span>".repeat(start)}${Array.from(
          { length: count },
          (_, i) => {
            const value = `${year}-${String(month + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
            return `<button data-date="${value}" aria-pressed="${state.date === value}">${i + 1}</button>`;
          },
        ).join(
          "",
        )}</div><p class="preview-note">Illustrative dates only. This does not check staff or kennel availability.</p>`;
      el.querySelector("[data-prev]").onclick = () => {
        if (--month < 0) {
          month = 11;
          year--;
        }
        draw();
      };
      el.querySelector("[data-next]").onclick = () => {
        if (++month > 11) {
          month = 0;
          year++;
        }
        draw();
      };
      el.querySelectorAll("[data-date]").forEach(
        (b) =>
          (b.onclick = () => {
            state.date = b.dataset.date;
            if (new Date(state.checkout) <= new Date(state.date)) {
              const d = new Date(state.date + "T12:00:00");
              d.setDate(d.getDate() + 1);
              state.checkout = d.toISOString().slice(0, 10);
            }
            el.close();
            if (boarding) showBoardingDates();
            else updateCalendar();
          }),
      );
    }
    draw();
  }

  function showBoardingDates() {
    const el = dialog(
      "Check-in and check-out",
      `<div class="preview-row"><div><label for="preview-checkin">Check-in</label><input id="preview-checkin" type="date" value="${state.date}"></div><div><label for="preview-checkout">Check-out</label><input id="preview-checkout" type="date" value="${state.checkout}"></div></div><p class="preview-note">Sample stay dates. No kennel availability is checked.</p><div class="preview-buttons"><button class="preview-btn" data-save-dates>Apply dates</button></div>`,
    );
    el.querySelector("[data-save-dates]").onclick = () => {
      const start = el.querySelector("#preview-checkin").value,
        end = el.querySelector("#preview-checkout").value;
      if (!start || !end || end <= start) {
        el.querySelector("#preview-checkout").setCustomValidity(
          "Choose a check-out date after check-in.",
        );
        el.querySelector("#preview-checkout").reportValidity();
        return;
      }
      state.date = start;
      state.checkout = end;
      el.close();
      updateBoarding();
    };
  }

  function updateBoarding() {
    state.service = "boarding";
    if (state.checkout <= state.date) {
      const next = new Date(state.date + "T12:00:00");
      next.setDate(next.getDate() + 1);
      state.checkout = next.toLocaleDateString("en-CA");
    }
    const button = $("#dropdownMenuButtonOne");
    if (button) {
      const span = button.querySelector("span");
      if (span)
        span.textContent = proposed
          ? `${state.dogs} ${state.dogs === 1 ? "dog" : "dogs"}`
          : `1 room, ${state.dogs} adults`;
      button.setAttribute("aria-label", `Number of dogs: ${state.dogs}`);
    }
    const input = $("#datepicker-desktop-input");
    if (input)
      input.value = dateLabel(state.date) + " - " + dateLabel(state.checkout);
    const short = (d) =>
      new Date(d + "T12:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    const long = (d) =>
      new Date(d + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    $$(".checkin-date").forEach((e) => (e.textContent = short(state.date)));
    $$(".checkout-date").forEach(
      (e) => (e.textContent = short(state.checkout)),
    );
    $$(".dates-info-check-in span:last-child").forEach(
      (e) => (e.textContent = long(state.date)),
    );
    $$(".dates-info-check-out span:last-child").forEach(
      (e) => (e.textContent = long(state.checkout)),
    );
    const nights = Math.max(
      1,
      Math.round(
        (new Date(state.checkout + "T12:00:00") -
          new Date(state.date + "T12:00:00")) /
          86400000,
      ),
    );
    $$(".guest-info").forEach((e) => {
      const spans = e.querySelectorAll("span");
      if (spans[0]) spans[0].textContent = proposed ? "1 kennel, " : "1 room, ";
      if (spans[1])
        spans[1].textContent =
          state.dogs +
          (proposed ? (state.dogs === 1 ? " dog, " : " dogs, ") : " adults, ");
      if (spans[2])
        spans[2].textContent = nights + (nights === 1 ? " night" : " nights");
    });
    $$(".room .price > div").forEach(
      (e) => (e.textContent = money([0, 50, 90, 110][state.dogs])),
    );
    $$(".rate-group .price,.rate-price").forEach(
      (e) => (e.textContent = money([0, 50, 90, 110][state.dogs] * nights)),
    );
    $$(".rate-center > span").forEach(
      (e) => (e.textContent = nights + (nights === 1 ? " night" : " nights")),
    );
    const search = $$("button").find((b) =>
      (b.getAttribute("aria-label") || "").startsWith("Search for"),
    );
    if (search)
      search.setAttribute(
        "aria-label",
        `Search for ${state.dogs} dogs between ${dateLabel(state.date)} and ${dateLabel(state.checkout)}`,
      );
    if (state.kennelSelected) syncBoardingCart();
  }

  function syncBoardingCart() {
    const empty = $(".cart-empty");
    if (empty)
      empty.textContent = `Dog Boarding Kennel · ${state.dogs} ${state.dogs === 1 ? "dog" : "dogs"}`;
    $$(
      ".cart-price .price,.cart-price .total-price,.cart-total .price,.cart-total .amount,.cart-total .value",
    ).forEach((e) => (e.textContent = money(total())));
    const next = $$("button").find((b) => b.textContent.trim() === "Continue");
    if (next) {
      next.disabled = false;
      next.removeAttribute("disabled");
      next.setAttribute("aria-disabled", "false");
    }
  }

  function showBoardingRate() {
    state.service = "boarding";
    const el = dialog(
      "Dog Boarding Kennel",
      `<p>${dateLabel(state.date)} â†' ${dateLabel(state.checkout)}</p><p>${state.dogs} ${state.dogs === 1 ? "dog" : "dogs"} · ${money([0, 50, 90, 110][state.dogs])} per night</p><div class="preview-line"><span>Estimated base total</span><b>${money(total())}</b></div><p class="preview-note">Local sample only. Housing suitability, availability, taxes/fees, arrival times and final terms need confirmation.</p><button class="preview-btn" data-board-continue>Continue</button>`,
    );
    el.querySelector("[data-board-continue]").onclick = () =>
      navigate("/booking-form?service=boarding");
  }

  function updateExtras() {
    $$('[data-hook="addon-row-add-button"]').forEach((b, i) => {
      const item = extras[i];
      if (!item) return;
      buttonText(b, state.extras[item.name] ? "Remove" : "Add");
      b.setAttribute("aria-pressed", String(!!state.extras[item.name]));
      b.setAttribute(
        "aria-label",
        (state.extras[item.name] ? "Remove " : "Add ") + item.name,
      );
    });
  }

  function updateCalendar() {
    const table = $("table[aria-label]");
    if (table) {
      const view = new Date((state.calendarView || state.date) + "T12:00:00"),
        year = view.getFullYear(),
        month = view.getMonth();
      const template =
        [...table.querySelectorAll("td")].find(
          (td) =>
            td.querySelector('[data-available="true"]') &&
            !td.classList.contains("o_1KN4h--selected"),
        ) || table.querySelector("td");
      const row = table.querySelector("tr");
      if (template && row) {
        const cell = template.cloneNode(true),
          rowClass = row.className;
        const tbody = table.querySelector("tbody") || table;
        const start = new Date(year, month, 1).getDay(),
          count = new Date(year, month + 1, 0).getDate();
        tbody.innerHTML = "";
        let current;
        for (let n = 0; n < Math.ceil((start + count) / 7) * 7; n++) {
          if (n % 7 === 0) {
            current = document.createElement("tr");
            current.className = rowClass;
            tbody.append(current);
          }
          const day = n - start + 1;
          if (day < 1 || day > count) {
            current.append(document.createElement("td"));
            continue;
          }
          const value = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const td = cell.cloneNode(true),
            b = td.querySelector("button");
          td.dataset.day = value;
          const selected = state.date === value;
          td.classList.toggle("o_1KN4h--selected", selected);
          td.setAttribute("aria-selected", String(selected));
          b.disabled = value < new Date().toLocaleDateString("en-CA");
          b.setAttribute(
            "aria-label",
            new Date(value + "T12:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            }) + (selected ? ", selected" : ""),
          );
          const number = b.querySelector("span");
          if (number) number.textContent = day;
          const dot = b.querySelector("[data-available]");
          if (dot) dot.classList.toggle("oX8k7cO--selected", selected);
          current.append(td);
        }
        const label = view.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
        table.setAttribute("aria-label", label);
        const wrapper = table.parentElement;
        const walker = document.createTreeWalker(wrapper, NodeFilter.SHOW_TEXT);
        let text;
        while ((text = walker.nextNode())) {
          if (
            /^(January|February|March|April|May|June|July|August|September|October|November|December)$/.test(
              text.nodeValue.trim(),
            )
          )
            text.nodeValue = view.toLocaleDateString("en-US", {
              month: "long",
            });
          else if (/^20\d\d$/.test(text.nodeValue.trim()))
            text.nodeValue = String(year);
        }
      }
    }
    const slot = $('input[name^="time-slots-selection"]');
    if (slot) {
      slot.checked = true;
      slot.id = state.date + "T08:00:00";
      const label = slot.closest("label") || slot.parentElement;
      const availability = label.parentElement;
      availability?.setAttribute(
        "aria-label",
        "Sample availability for " + dateLabel(state.date),
      );
      if (
        state.service === "consultation" &&
        !availability.querySelector("[data-preview-consultation]")
      ) {
        const sample = label.cloneNode(true);
        label.remove();
        for (const time of [
          "8:00 am",
          "9:30 am",
          "11:00 am",
          "2:00 pm",
          "3:30 pm",
        ]) {
          const next = sample.cloneNode(true);
          next.dataset.previewConsultation = "true";
          const input = next.querySelector("input");
          input.id = state.date + "-" + time.replace(/\W/g, "");
          next.htmlFor = input.id;
          input.setAttribute("aria-label", time);
          input.checked = time === state.time;
          replaceText(next, /8:00 am/gi, time);
          availability.append(next);
        }
      }
    }
    if (state.service === "consultation")
      $$('input[name^="time-slots-selection"]').forEach(
        (i) => (i.checked = i.getAttribute("aria-label") === state.time),
      );
    if ($("#header-title") && state.service === "consultation")
      replaceText(
        document.body,
        /Dog Daycare/g,
        "One Hour Dog Training Consultation",
      );
  }

  if (original === "daycare-addons") updateExtras();

  if (original === "daycare-summary") {
    const el = $('[data-hook="dialog-container-root"]');
    if (el) {
      replaceText(el, /\$25\b/g, money(total()));
      const note = document.createElement("p");
      note.className = "preview-draft-note";
      note.textContent = extras
        .filter((x) => state.extras[x.name])
        .map((x) => x.name + " " + money(x.price))
        .join(" · ");
      if (note.textContent)
        el.querySelector('[data-hook="header-root"]')?.after(note);
    }
  }

  if (original === "daycare-calendar") {
    if (new URLSearchParams(location.search).get("service") === "consultation")
      state.service = "consultation";
    updateCalendar();
    if (proposed) addHelp($("#TPAMultiSection_ky9sy6zq"));
    const note = document.createElement("p");
    note.className = "preview-sample";
    note.textContent =
      "Sample calendar for design review. No live staff availability is shown.";
    $("#TPAMultiSection_ky9sy6zq")?.append(note);
  }

  if (original === "booking-form") {
    if (new URLSearchParams(location.search).get("service") === "boarding")
      state.service = "boarding";
    for (const input of $$("input,textarea")) {
      const key = input.getAttribute("aria-label") || input.id;
      if (key && state.owner[key]) input.value = state.owner[key];
    }
    const root = $("#TPAMultiSection_ky9syaq2");
    if (root) {
      replaceText(root, /25 US dollars/g, total().toFixed(0) + " US dollars");
      replaceText(root, /\$25\b/g, money(total()));
      replaceText(root, /November 19, 2026/g, dateLabel(state.date));
      if (state.service === "consultation")
        replaceText(root, /8:00 am/g, state.time);
      if (isBoarding())
        replaceText(root, /at 8:00 am/g, "to " + dateLabel(state.checkout));
      if (state.service !== "daycare")
        replaceText(
          root,
          /Dog Daycare/g,
          isBoarding() ? "Dog Boarding" : "One Hour Dog Training Consultation",
        );
      replaceText(
        root,
        /By completing your booking, you agree to receive related phone notifications\./g,
        "Local preview only. No reservation, payment or notifications will be created.",
      );
      if (proposed) addHelp(root);
    }
  }

  if (boardingPage && proposed) updateBoarding();

  if (original === "contact") {
    const plan =
      new URLSearchParams(location.search).get("plan") || state.enquiry.plan;
    const message = $("textarea");
    if (message && plan && !message.value)
      message.value = "I would like to ask about " + plan + ".";
    else if (message && state.enquiry.message && !message.value)
      message.value = state.enquiry.message;
  }

  document.addEventListener("input", (e) => {
    if (original === "booking-form") saveFields();
  });

  document.addEventListener("change", (e) => {
    if (e.target.matches('input[name^="time-slots-selection"]')) {
      state.time = e.target.getAttribute("aria-label");
      $$('input[name^="time-slots-selection"]').forEach(
        (i) => (i.checked = i === e.target),
      );
    }
  });

  document.addEventListener("keydown", (e) => {
    if (
      (e.key === "Enter" || e.key === " ") &&
      e.target.id === "MENU_AS_CONTAINER_TOGGLE"
    ) {
      e.preventDefault();
      showMobileMenu();
    }
  });

  const chat = document.createElement("button");
  chat.id = "preview-chat";
  chat.type = "button";
  chat.setAttribute("aria-label", "Let's Chat!");
  chat.innerHTML =
    '<svg viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M12 2a10 10 0 0 0-9 14L1 23l7-3A10 10 0 1 0 12 2"/><path d="M8 9h8M8 12h6" fill="none" stroke="#ff653b" stroke-width="1.5"/></svg>';
  chat.onclick = () => navigate("/contact");
  document.body.append(chat);

  document.addEventListener(
    "submit",
    (e) => {
      e.preventDefault();
      info(
        "Enquiry preview",
        "Your sample enquiry would be reviewed here. No message has been sent.",
      );
    },
    true,
  );

  document.addEventListener(
    "click",
    (e) => {
      const element = e.target.closest('button,a,[role="button"]');
      if (!element) return;
      const hook = element.getAttribute("data-hook") || "",
        label = element.getAttribute("aria-label") || "",
        text = element.textContent.trim();

      if (element.id === "MENU_AS_CONTAINER_TOGGLE") {
        e.preventDefault();
        showMobileMenu();
        return;
      }

      if (
        (label.startsWith("More ") && label.endsWith(" pages")) ||
        element.dataset.testid === "expandablemenu-toggle"
      ) {
        e.preventDefault();
        const menu = element.parentElement.querySelector("ul");
        if (menu) {
          const open = menu.style.display !== "block";
          menu.style.display = open ? "block" : "none";
          menu.setAttribute("aria-hidden", String(!open));
          if (!mobile) menu.classList.add("preview-submenu");
          menu
            .querySelectorAll("a")
            .forEach((a) => (a.tabIndex = open ? 0 : -1));
        }
        return;
      }

      if (/Log [Ii]n/.test(text) || hook === "login-bar-login-button") {
        e.preventDefault();
        const el = dialog(
          "Log In",
          '<p>Preview the client sign-in entry point. No real login or password is required here.</p><button class="preview-btn" data-sample-account>View sample client area</button>',
        );
        el.querySelector("[data-sample-account]").onclick = () =>
          info(
            "Client area preview",
            "A connected client area would show confirmed visits and management options. No customer records are used in this preview.",
          );
        return;
      }

      if (hook === "book-button-DETAILS" || /^Book It/.test(label)) {
        e.preventDefault();
        state.service =
          original === "consultation" || /Consultation/.test(label)
            ? "consultation"
            : "daycare";
        state.time = "8:00 am";
        navigate(
          state.service === "consultation"
            ? "/booking-calendar/dog-daycare-1?service=consultation"
            : "/preview/daycare-addons",
        );
        return;
      }

      if (hook === "addon-row-add-button") {
        e.preventDefault();
        const index = $$('[data-hook="addon-row-add-button"]').indexOf(element),
          item = extras[index];
        state.extras[item.name] = !state.extras[item.name];
        updateExtras();
        return;
      }

      if (hook === "footer-next-button") {
        e.preventDefault();
        navigate(
          original === "daycare-addons"
            ? "/preview/daycare-summary"
            : "/booking-calendar/dog-daycare-1",
        );
        return;
      }

      if (label === "Exit booking") {
        e.preventDefault();
        navigate("/service-page/dog-daycare-1");
        return;
      }

      if (
        /Edit Dog Daycare/.test(label) ||
        hook === "open-preferences-modal-button"
      ) {
        e.preventDefault();
        navigate("/preview/daycare-addons");
        return;
      }

      if (text === "Schedule Appointment") {
        e.preventDefault();
        navigate("/booking-calendar/dog-daycare-1");
        return;
      }

      if (text === "Add Another Service") {
        e.preventDefault();
        info(
          "Add another service",
          "Explore Training for a consultation or the Daycare page for daycare. No second booking is created in this local preview.",
        );
        return;
      }

      if (original === "daycare-calendar" && element.closest("table")) {
        e.preventDefault();
        const day = element.closest("td")?.dataset.day;
        if (day) {
          state.date = day;
          updateCalendar();
        }
        return;
      }

      if (
        original === "daycare-calendar" &&
        /previous month|next month/i.test(label)
      ) {
        e.preventDefault();
        const date = new Date((state.calendarView || state.date) + "T12:00:00");
        date.setDate(1);
        date.setMonth(date.getMonth() + (/previous/i.test(label) ? -1 : 1));
        state.calendarView = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
        updateCalendar();
        return;
      }

      if (hook === "sidebar-cta") {
        e.preventDefault();
        navigate("/booking-form");
        return;
      }

      if (
        hook === "back-button" ||
        (text === "Back" &&
          ["booking-form", "daycare-calendar"].includes(original))
      ) {
        e.preventDefault();
        navigate(
          original === "booking-form"
            ? "/booking-calendar/dog-daycare-1"
            : "/service-page/dog-daycare-1",
        );
        return;
      }

      if (hook === "booking-details-book-now-cta") {
        e.preventDefault();
        finishBooking();
        return;
      }

      if (hook === "booking-details-add-to-cart-cta") {
        e.preventDefault();
        saveFields();
        state.cart.push({
          name: isBoarding() ? "Dog Boarding" : "Dog Daycare",
          price: total(),
          quantity: 1,
        });
        showCart();
        return;
      }

      if (hook === "policy-description-text-button") {
        e.preventDefault();
        info(
          "Cancellation Policy",
          "O4K9’s published daycare policy says cancellation incurs credit for a later date. Confirm the terms that apply to your chosen service before a live booking.",
        );
        return;
      }

      if (hook === "accordion-item-header") {
        e.preventDefault();
        info(
          "Service details",
          `${isBoarding() ? "Dog Boarding" : state.service === "consultation" ? "Training consultation" : "Dog Daycare"} · ${dateLabel(state.date)} · ${money(total())}`,
        );
        return;
      }

      if (
        /PayPal|Apple Pay|Google Pay|Payment Options/.test(label + " " + text)
      ) {
        e.preventDefault();
        info(
          "Payment preview",
          "Payments are disabled. No payment details are requested or transmitted.",
        );
        return;
      }

      if (element.id === "dropdownMenuButtonOne") {
        e.preventDefault();
        const el = dialog(
          "Number of Dogs",
          `<label for="preview-dogs">Dogs</label><select id="preview-dogs"><option value="1">1 dog · $50/night</option><option value="2">2 dogs · $90/night</option><option value="3">3 dogs · $110/night</option></select><p class="preview-note">Confirm shared-kennel suitability before a live reservation.</p><button class="preview-btn" data-save-dogs>Apply</button>`,
        );
        el.querySelector("select").value = String(state.dogs);
        el.querySelector("[data-save-dogs]").onclick = () => {
          state.dogs = Number(el.querySelector("select").value);
          el.close();
          updateBoarding();
        };
        return;
      }

      if (
        boardingPage &&
        (label === "Check-in and check-out" ||
          element.id === "datepicker-desktop-input" ||
          element.closest(".datepicker-container"))
      ) {
        e.preventDefault();
        showBoardingDates();
        return;
      }

      if (
        label.startsWith("Search for") ||
        (boardingPage && text === "Search")
      ) {
        e.preventDefault();
        state.service = "boarding";
        updateBoarding();
        return;
      }

      if (label.startsWith("Show more details of")) {
        e.preventDefault();
        navigate("/preview/boarding-details");
        return;
      }

      if (
        label.startsWith("Close Dog Boarding Kennel") ||
        label.startsWith("Hide rates of")
      ) {
        e.preventDefault();
        navigate("/dog-boarding");
        return;
      }

      if (label.startsWith("Show rates of")) {
        e.preventDefault();
        state.service = "boarding";
        navigate("/preview/boarding-rates");
        return;
      }

      if (label === "Add room to cart" || label === "Add kennel to cart") {
        e.preventDefault();
        state.service = "boarding";
        state.kennelSelected = true;
        syncBoardingCart();
        info(
          "Kennel added to demo stay",
          `Estimated base total: ${money(total())}. No reservation is created until a real connected checkout; this preview never creates one.`,
        );
        return;
      }

      if (boardingPage && text === "Continue") {
        e.preventDefault();
        if (state.kennelSelected) navigate("/booking-form?service=boarding");
        else showBoardingRate();
        return;
      }

      if (
        hook === "product-item-add-to-cart-button" ||
        hook === "add-to-cart" ||
        (/Add to Cart|Pre-Order/.test(text) &&
          !element.closest("#preview-dialog"))
      ) {
        e.preventDefault();
        addProduct(element);
        return;
      }

      if (hook === "cart-icon-button" || /Cart with/.test(label)) {
        e.preventDefault();
        showCart();
        return;
      }

      if (hook === "submit-button" || text === "Submit") {
        e.preventDefault();
        const inputs = $$('input[type="text"],input[type="email"]');
        const invalid = inputs.find(
          (i) =>
            (i.getAttribute("aria-label") === "Email" ||
              i.getAttribute("aria-required") === "true") &&
            !i.value.trim(),
        );
        if (invalid) {
          invalid.focus();
          invalid.setCustomValidity("Please enter sample details.");
          invalid.reportValidity();
          invalid.oninput = () => invalid.setCustomValidity("");
          return;
        }
        info(
          "Enquiry preview",
          "Your sample enquiry is ready. No form, email or message has been sent to O4K9.",
        );
        return;
      }

      if (element.dataset.previewRoute) {
        e.preventDefault();
        let route = element.dataset.previewRoute;
        if (route.includes("#")) {
          const anchor = route.split("#")[1];
          if (route.split("#")[0] === "/" && original === "home") {
            const target =
              anchor === "about"
                ? $("#comp-ihkkejy6")
                : anchor === "contact"
                  ? $("#comp-ihkkejy8")
                  : $("#SCROLL_TO_TOP");
            target?.scrollIntoView();
            return;
          }
          route = route.split("#")[0] + "?anchor=" + encodeURIComponent(anchor);
        }
        if (route.startsWith("/cart-page")) {
          showCart();
          return;
        }
        if (route.startsWith("/plan-customization"))
          route = "/contact?plan=Custom%20plan";
        if (route.startsWith("/account") || route.startsWith("/loyalty")) {
          info(
            "Client area preview",
            "Account and loyalty services are not connected in this local preview.",
          );
          return;
        }
        navigate(route);
        return;
      }

      if (element.dataset.previewExternal) {
        e.preventDefault();
        info(
          "External link",
          `The live website would open ${escape(element.dataset.previewExternal)}.`,
        );
        return;
      }

      if (original === "gift-card" && /Buy Now|Checkout|Continue/.test(text)) {
        e.preventDefault();
        info(
          "Gift card preview",
          "Your gift card details would be reviewed before a live purchase. No gift card or payment is created.",
        );
        return;
      }

      if (original === "subscriptions" && /Select|Buy|Subscribe/.test(text)) {
        e.preventDefault();
        info(
          "Subscription preview",
          "The selected blog subscription is a local demonstration. No subscription or payment is created.",
        );
        return;
      }
    },
    true,
  );

  window.parent.postMessage(
    { type: "o4k9:title", title: document.title },
    location.origin,
  );

  document.fonts.ready.then(() =>
    window.parent.postMessage(
      { type: "o4k9:ready", url: location.href },
      location.origin,
    ),
  );
})();
