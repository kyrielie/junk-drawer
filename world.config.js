/**
 * world.config.js
 * ═══════════════════════════════════════════════════════════════════════════
 * Single source of truth for the entire Postcard site.
 *
 * Edit this file to change the narrative. loader.js imports WORLD and uses
 * it to resolve {{template.variables}} in every mail fragment at runtime.
 * Nothing in this file touches the DOM.
 *
 * TABLE OF CONTENTS
 *   1. Recipient
 *   2. Senders
 *   3. Per-piece config (placeholder copy for individual fragments)
 *   4. Time period & postmarks
 *   5. Images
 *   6. Stamp designs
 *   7. Desk surface
 *   8. Site metadata
 */

export const WORLD = {


  // ── 1. RECIPIENT ──────────────────────────────────────────────────────────
  //
  // The person whose mail we are reading.
  // All {{recipient.*}} tokens in fragments resolve from here.

  recipient: {
    name:    "Clara Voss",
    address: "412 Elm Street",
    city:    "Ashford",
    state:   "OR",
    zip:     "97401",
  },


  // ── 2. SENDERS ────────────────────────────────────────────────────────────
  //
  // Add as many senders as the story needs.
  // Each sender needs a unique `id` — this is what manifest.js references
  // via `senderId`. loader.js looks up the sender by id and makes all
  // {{sender.*}} tokens available to the fragment.
  //
  // `relationship` is not used as a template variable; it's for your own
  // reference when writing fragment content.

  senders: [
    {
      id:           "mom",
      name:         "Edith Voss",
      address:      "88 Birch Lane",
      city:         "Medford",
      state:        "OR",
      zip:          "97501",
      relationship: "mother",
    },
    {
      id:           "ex",
      name:         "T. Hargrove",
      address:      "231 Lakeview Dr #4B",
      city:         "Portland",
      state:        "OR",
      zip:          "97209",
      relationship: "ex-partner",
    },
    {
      id:           "friend",
      name:         "Margot Reyes",
      address:      "5 Cactus Rd",
      city:         "Tucson",
      state:        "AZ",
      zip:          "85701",
      relationship: "college friend",
    },
    {
      id:           "dentist",
      name:         "Ashford Family Dental",
      address:      "19 Commerce Blvd Ste 3",
      city:         "Ashford",
      state:        "OR",
      zip:          "97401",
      relationship: "dentist",
    },
    {
      id:           "video",
      name:         "SunCoast Video",
      address:      "PO Box 882",
      city:         "Tampa",
      state:        "FL",
      zip:          "33602",
      relationship: "mail-order video club",
    },
    {
      id:           "landlord",
      name:         "Dale Pringle",
      address:      "900 Mill Ave",
      city:         "Ashford",
      state:        "OR",
      zip:          "97401",
      relationship: "landlord",
    },

    // ── New senders ──────────────────────────────────────────────────────
    // The 8 newest pieces (AOL, Columbia House, credit, grocery, court,
    // charity, ValPak, wedding, campaign) plus the nursery postcard were
    // built separately and may hardcode their own copy or pull from these
    // entries — fill them in either way so no {{sender.*}} token in those
    // fragments resolves blank.
    // NOTE: placeholder values. Reconcile against whatever the fragment
    // author already hardcoded before shipping, so this file and the
    // fragment markup don't quietly disagree.

    {
      id:           "nursery",
      name:         "Pacific Garden Nursery",
      address:      "1840 Highway 62",
      city:         "Ashford",
      state:        "OR",
      zip:          "97401",
      relationship: "local business — spring sale postcard",
    },
    {
      id:           "aol",
      name:         "America Online",
      address:      "PO Box 6000",
      city:         "Vienna",
      state:        "VA",
      zip:          "22182",
      relationship: "ISP signup mailer",
    },
    {
      id:           "columbia",
      name:         "Columbia House Music Club",
      address:      "1400 N. Fruitridge Ave",
      city:         "Terre Haute",
      state:        "IN",
      zip:          "47811",
      relationship: "mail-order CD club",
    },
    {
      id:           "credit",
      name:         "FirstCard Financial",
      address:      "PO Box 15470",
      city:         "Wilmington",
      state:        "DE",
      zip:          "19850",
      relationship: "pre-approved credit card offer",
    },
    {
      id:           "grocery",
      name:         "Ashford Market",
      address:      "305 Main St",
      city:         "Ashford",
      state:        "OR",
      zip:          "97401",
      relationship: "weekly grocery circular",
    },
    {
      id:           "court",
      name:         "Jackson County Circuit Court",
      address:      "100 S. Oakdale Ave",
      city:         "Medford",
      state:        "OR",
      zip:          "97501",
      relationship: "juror summons",
    },
    {
      id:           "charity",
      name:         "Oregon Wildlife Alliance",
      address:      "PO Box 4417",
      city:         "Eugene",
      state:        "OR",
      zip:          "97401",
      relationship: "charitable solicitation",
    },
    {
      id:           "valpak",
      name:         "ValPak of Southern Oregon",
      address:      "PO Box 1080",
      city:         "Medford",
      state:        "OR",
      zip:          "97501",
      relationship: "coupon mailer",
    },
    {
      id:           "wedding",
      name:         "K. Albright & J. Mora",
      address:      "44 Hollyhock Ln",
      city:         "Eugene",
      state:        "OR",
      zip:          "97401",
      relationship: "wedding invitation",
    },
    {
      id:           "campaign",
      name:         "Citizens for Harlow",
      address:      "PO Box 771",
      city:         "Ashford",
      state:        "OR",
      zip:          "97401",
      relationship: "local political campaign mailer",
    },
  ],


  // ── 3. PER-PIECE CONFIG ───────────────────────────────────────────────────
  //
  // Placeholder copy for individual fragments that don't fit the generic
  // {{recipient.*}} / {{sender.*}} / {{postmark}} tokens — headlines, prices,
  // menu items, letter paragraphs, color values, and similar one-off detail
  // for a specific piece. Referenced in fragments as {{config.pieceId.field}}.
  //
  // None of this is narrative-load-bearing; it's filler copy so the page
  // renders something concrete. Swap any of it out freely — nothing else
  // depends on these values matching anything.

  config: {

    // ── postcard-scenic-01 ─────────────────────────────────────────────────
    scenicPostcard: {
      location:   "Crater Lake, Oregon",
      message:    "Wish you could see this view. The water is the most unreal shade of blue. Thinking of you.",
      signoff:    "E.",
      stampDenom: "32¢",
    },

    // ── clipping-dispatch-01 ──────────────────────────────────────────────
    clippingDispatch: {
      paperName: "The Ashford Courier",
      volume:    "Vol. 44 · No. 31",
      headline:  "Local Post Office Reports Record Package Volume Ahead of Holidays",
      byline:    "Staff Reporter",
      date:      "November 18, 1998",
      body:      "Ashford's central post office processed more than 14,000 pieces of mail last week, a figure the postmaster called unprecedented for a town of this size. Seasonal hiring is already underway, with four temporary sorters joining the evening shift beginning Monday.",
    },

    // ── letter-found-01 ───────────────────────────────────────────────────
    letterFound: {
      salutation:  "To whoever finds this —",
      paragraph1:  "I don't know how this letter ended up in this book, or which book it was, or whose hands it passed through to get here. I wrote it a long time ago and never sent it.",
      paragraph2:  "The person it was meant for probably wouldn't have wanted it anyway. But I needed to write it. I hope that counts for something.",
      paragraph3:  "If you're reading this: I hope you sent yours.",
      signature:   "— unsigned",
    },

    // ── menu-restaurant-01 ────────────────────────────────────────────────
    menu: {
      restaurantName: "Golden Dragon",
      tagline:        "Family Restaurant · Est. 1981",
      phone:          "(541) 555-0182",
      deliveryNote:   "Free delivery over $15",
      section1Title:  "Soups & Starters",
      item1name: "Egg Drop Soup",      item1price: "$1.75",
      item2name: "Spring Rolls (2)",   item2price: "$2.50",
      item3name: "Wonton Soup",        item3price: "$2.25",
      section2Title:  "House Specialties",
      item4name: "Kung Pao Chicken",   item4price: "$7.50",
      item5name: "Beef with Broccoli", item5price: "$7.95",
      item6name: "Shrimp Fried Rice",  item6price: "$7.25",
      item7name: "Moo Shu Pork",       item7price: "$8.25",
      section3Title:  "Desserts",
      item8name: "Fortune Cookie",     item8price: "incl.",
      item9name: "Almond Cookie",      item9price: "$0.75",
    },

    // ── mailer-clearance-01 ───────────────────────────────────────────────
    mailerClearance: {
      accentColor:    "#8B4A0A",
      banner:         "CLEARANCE EVENT · FINAL PRICES",
      preText:        "Up To",
      discountAmount: "70",
      companyName:    "Whitmore Stationery & Paper Co.",
      subheader:      "Since 1962",
      bodyText:       "Overstocked on fine writing papers, specialty envelopes, and correspondence sets. Quantities are limited. No backorders. First come, first served.",
      address:        "PO Box 114, Eugene, OR 97401",
      phone:          "1-800-555-0133",
    },

    // ── postcard-city-01 ──────────────────────────────────────────────────
    cityPostcard: {
      frontLabel:  "Greetings from Portland, Oregon",
      message:     "Still raining here, big surprise. Found the weirdest used bookstore. Bought four things I don't need. Miss you.",
      signoff:     "T.",
      stampDenom:  "32¢",
    },

    // ── clipping-classifieds-01 ───────────────────────────────────────────
    classifieds: {
      paperName: "Medford Mail Tribune",
      section:   "Classifieds · Pg. D6",
      heading:   "Personal Exchange",
      ad1: "Pen pal, age 30–45, any location. I write long letters. I expect the same. Box 441.",
      ad2: "Vintage postage for current-year stamps, any denomination. Call evenings. (541) 555-0174.",
      ad3: "One blue airmail envelope, addressed to no one, found in the Ashford Library drop box. Call to claim. (541) 555-0199.",
    },

    // ── mailer-seeds-01 ───────────────────────────────────────────────────
    mailerSeeds: {
      accentColor:   "#2E6B2E",
      companyName:   "Rogue Valley Seed Exchange",
      catalogTitle:  "Spring 1998 Catalog — Now Available",
      catalogDesc:   "Heirloom vegetables, Pacific Northwest natives, and old-fashioned cutting flowers. Grown without pesticides in southern Oregon.",
      freeShipping:  "Free shipping on orders over $18.",
      featured:      "This month: Brandywine tomato, Lupine mix, Shasta daisy, and our new Willamette Sweet Onion starter kit.",
      offerStrip:    "Use code SPRING98 for 10% off your first order",
    },

    // ── envelope-airmail-01 ───────────────────────────────────────────────
    airmailEnvelope: {
      letterDate:      "October 3rd",
      salutation:      "Dear friend —",
      paragraph1:      "I have been meaning to write since we met at the conference in Seattle. The time passed strangely. I hope this letter finds you in good health and that the autumn is treating you gently.",
      paragraph2:      "Things here are much the same. The autumn here is brief and beautiful. Please write back when you can.",
      closing:         "With warm regards,",
      signature:       "K. Nakamura",
      senderName:      "K. Nakamura",
      senderStreet:    "2-14-8 Shimokitazawa",
      senderCityline:  "Setagaya-ku, Tokyo 155-0031, Japan",
      postmarkCity:    "TOKYO",
      postmarkCountry: "JAPAN",
      stampLabel:      "Japanese postage stamp",
      stampColor1:     "#C0392B",
      stampColor2:     "white",
      stampColor3:     "#C0392B",
      stampCountryCode: "NIPPON",
      stampDenom:      "¥80",
    },

    // ── photo-polaroid-01 ─────────────────────────────────────────────────
    photoPolaroid: {
      caption: "picnic — July '97",
    },

    // ── note-reminders-01 ─────────────────────────────────────────────────
    noteReminders: {
      title: "to do",
      item1: "- call Mom back",
      item2: "- buy more stamps",
      item3: "- return library book",
      item4: "- check on Dale's thing",
      item5: "- write Margot",
      item6: "- find that receipt",
    },

    // ── postcard-beach-01 ─────────────────────────────────────────────────
    beachPostcard: {
      frontLabel:  "Coastal Highway, California",
      message:     "Drove down Highway 1 on a whim. It was exactly as good as everyone says. Wish you'd been here for it.",
      stampDenom:  "32¢",
    },

    // ── note-ps-01 ────────────────────────────────────────────────────────
    notePs: {
      title:       "P.S.",
      body:        "I keep starting letters and not finishing them. I have a whole drawer full of them.",
      postscript:  "Maybe that's enough.",
    },

    // ── postcard-forest-01 ────────────────────────────────────────────────
    forestPostcard: {
      frontLabel:  "Mt. Hood National Forest",
      message:     "Took the wrong trail. Found something better. Back soon. Don't worry.",
      stampDenom:  "32¢",
    },

    // ── clipping-lifestyle-01 ─────────────────────────────────────────────
    clippingLifestyle: {
      sourceName:  "Sunset Magazine",
      pageRef:     "February 1998 · Pg. 62",
      headline:    "The Lost Art of Waiting for the Mail",
      subhead:     "In an age of instant everything, some rituals are worth preserving.",
      body:        "There is a particular quality of attention that comes with waiting. The letter has already been written, sealed, and sent — it exists somewhere between the sender and you. This interval, which once felt like deprivation, looks increasingly like a gift.",
    },

    // ── letter-personal-01 ────────────────────────────────────────────────
    letterPersonal: {
      date:        "August 15, 1998",
      salutation:  "Clara —",
      paragraph1:  "I've been meaning to write since December, or possibly longer. Time has a way of not cooperating.",
      paragraph2:  "I'm not going to explain where I've been. You probably know some of it. The rest doesn't translate well to paper.",
      paragraph3:  "I found the photograph. The one from the coast. I don't know if you meant to leave it or if it was an accident. Either way I've kept it.",
      paragraph4:  "There are things I should have said a long time ago that I'm still not saying now. I think you know what they are.",
      closing:     "As ever,",
    },

    // ── mailer-magazine-01 ────────────────────────────────────────────────
    mailerMagazine: {
      accentColor:     "#6B2D8B",
      publicationName: "COUNTRY SAMPLER",
      offerLine1:      "12 issues for just",
      price:           "$9.97",
      offerDesc:       "That's less than 84¢ per issue — over 60% off the newsstand price.",
      bulletItem1:     "&#10003;  Seasonal home decorating",
      bulletItem2:     "&#10003;  Craft projects & recipes",
      bulletItem3:     "&#10003;  Reader home features",
      promoCode:       "Enter code SAMPLER98 by Dec. 31",
    },

    // ── clipping-recipe-01 ────────────────────────────────────────────────
    recipe: {
      cardLabel:    "Recipe Clipping",
      dishName:     "Grandma's Lemon Pound Cake",
      ingredients:  "3 cups flour · 1 tsp baking powder · ½ tsp salt · 1 cup butter (softened) · 2 cups sugar · 4 eggs · 1 cup milk · zest of 2 lemons · 2 tbsp lemon juice",
      method:       "Cream butter and sugar. Beat in eggs one at a time. Mix in flour and milk alternately. Fold in lemon. Bake 350° for 60–65 min.",
      attribution:  "— Medford Mail Tribune, Home & Garden, Sept. 1991",
    },

    // ── photo-polaroid-02 ─────────────────────────────────────────────────
    photoPolaroid2: {
      caption: "coast road — summer '97",
    },

    // ── note-about-01 ─────────────────────────────────────────────────────
    noteAbout: {
      title:      "WHY I KEEP EVERYTHING",
      paragraph1: "My grandmother kept every letter she ever received. After she died we found shoeboxes of them. Years of ordinary life, written in ordinary handwriting, about ordinary things.",
      paragraph2: "I don't think she thought she was preserving anything. I think she just couldn't bring herself to throw them away.",
      paragraph3: "I understand now.",
    },

    // ── greeting-card-seasonal-01 ─────────────────────────────────────────
    greetingCard: {
      frontBg:       "#f8f4ee",
      motifColor1:   "#C0392B",
      motifColor2:   "#6C3483",
      frontText:     "Thinking of you.",
      message:       "I know things have been strange this year. I just wanted you to know I'm thinking of you. Call me when you can. Or don't. Either way I'll still be thinking of you.",
      closing:       "With love,",
    },

    // ── clipping-newsletter-01 ────────────────────────────────────────────
    newsletter: {
      name:      "The Correspondence Review",
      tagline:   "For those who still believe in letters · Vol. 12 · Spring 1998",
      headline1: "On the Discipline of the Long Letter",
      article1:  "The long letter is not about length. It is about sustained attention — giving someone an hour of your uninterrupted thought. That is rarer and more valuable than most gifts.",
      headline2: "Reader Notes",
      article2:  "Several readers wrote in after our piece on airmail paper to say they'd tracked down the old Croxley brand through a specialty importer. We'll have details in the next issue.",
      footer:    "Published quarterly · Correspondence welcome · PO Box 771, Eugene, OR 97401",
    },

    // ── mailer-sweepstakes-01 ─────────────────────────────────────────────
    mailerSweepstakes: {
      borderColor:     "#C4860A",
      urgencyLabel:    "IMPORTANT — TIME SENSITIVE",
      companyName:     "National Publishers Clearing",
      headline:        "You may already be a winner",
      prizeAmount:     "$10,000,000",
      finePrint:       "If you hold the winning number. See enclosed rules. Odds 1:185,000,000.",
      body:            "Our records indicate your entry number has been pre-selected as a finalist in our Grand Prize Drawing. To claim your prize, you must return the enclosed Verification Seal no later than the date shown on the outer envelope.",
      scratchLabel:    "PRIZE VERIFICATION NUMBER",
      confirmNumber:   "0047 · 9918 · 2234 · A",
    },

    // ── mailer-bookclub-01 ────────────────────────────────────────────────
    mailerBookclub: {
      accentColor:   "#004B87",
      clubName:      "QUALITY PAPERBACK BOOK CLUB",
      clubTagline:   "Books chosen by readers, for readers",
      headline:      "Introductory Offer for New Members",
      offerQuantity: "4 books",
      offerPrice:    "$1",
      offerDetail:   "With membership. Select from over 200 titles. Cancel anytime.",
      body:          "Choose any 4 books from our current selections for just $1 when you agree to buy 4 more books in the next 2 years at regular member prices.",
      selectionLabel: "FEATURED TITLES THIS MONTH",
      title1:        "The English Patient — Michael Ondaatje",
      title2:        "Cold Mountain — Charles Frazier",
      title3:        "Beloved — Toni Morrison",
    },

    // ── desk objects (obj-pen, obj-letter-opener, obj-wax-seal, etc.) ──────
    objects: {
      penLabel:           "Ballpoint pen on the desk",
      penBodyColor:       "#1A3A6B",
      penCapColor:        "#152E55",
      penClipColor:       "#C0A020",
      penGripColor:       "#0E2444",
      penTipColor:        "#8B8B8B",
      penNibColor:        "#444",
      penAccentColor:     "#C0A020",

      letterOpenerLabel:        "Silver letter opener",
      letterOpenerHandleColor:  "#8B6914",
      letterOpenerBolsterColor: "#C0A020",
      letterOpenerBladeColor:   "#C8C8C8",

      waxSealLabel:      "Red wax seal",
      waxSealColor:      "#8B1A1A",
      waxSealHighlight:  "#C0392B",
      waxSealTextColor:  "rgba(255,240,220,0.9)",
      waxSealInitials:   "CV",

      stampStripLabel:      "Strip of four unused stamps",
      stampStripBg:         "#D4E8F0",
      stampStripMotifColor: "#2E6B2E",
      stampStripDenom:      "32¢",

      stampEagleLabel:     "Large eagle commemorative stamp",
      stampEagleBg:        "#1A3A6B",
      stampEagleColor:     "#F5F0E8",
      stampEagleHeadColor: "white",
      stampEagleAccent:    "#D4A017",
      stampEagleDenom:     "32¢",

      postmarkDecoColor: "#6C3483",
      postmarkDecoCity:  "ASHFORD",
      postmarkDecoState: "OREGON",
      postmarkDecoDate:  "SEP 1997",

      pencilLabel:       "Yellow pencil",
      pencilBodyColor:   "#E8C820",
      pencilBodyDark:    "#C4A010",
      pencilEraserColor: "#E8A8A0",
      pencilFerRule:     "#C0A020",
      pencilWoodColor:   "#D4A060",
      pencilLabelColor:  "#1A3A6B",
      pencilBrand:       "TICONDEROGA",

      airmailLabelLabel: "Par Avion airmail sticker",
    },

  }, // end config


  // ── 4. TIME PERIOD & POSTMARKS ────────────────────────────────────────────
  //
  // All mail on this page falls within this range.
  // dateRange is for your reference only — it is not rendered directly.
  //
  // postmarks[] is the canonical list of date strings used on stamps.
  // Each manifest entry references a postmark by index (postmarkIndex).
  // loader.js mod-wraps the index so it never goes out of bounds.
  //
  // Denomination rule (US first-class):
  //   32¢  →  Jan 1, 1995 – Dec 31, 1998
  //   33¢  →  Jan 10, 1999 onward
  // Stamp SVGs in fragments must use the correct denomination for their date.

  dateRange: {
    start: "1997-03",
    end:   "1999-11",
  },

  postmarks: [
    "Mar 14 '97",   // index  0  → postcard-mom-01         (32¢)
    "Apr 02 '97",   // index  1  → postcard-friend-01      (32¢)
    "May 30 '97",   // index  2  → postcard-nursery-01     (32¢)
    "Jul 11 '97",   // index  3  → mailer-aol-01            (32¢)
    "Aug 23 '97",   // index  4  → envelope-dentist-01      (32¢)
    "Sep 04 '97",   // index  5  → mailer-columbia-01       (32¢)
    "Oct 17 '97",   // index  6  → envelope-credit-01       (32¢)
    "Nov 28 '97",   // index  7  → circular-grocery-01      (32¢)
    "Jan 06 '98",   // index  8  → letter-ex-01             (32¢)
    "Feb 14 '98",   // index  9  → greeting-card-friend-01  (32¢)
    "Mar 27 '98",   // index 10  → summons-court-01         (32¢)
    "Jun 01 '98",   // index 11  → envelope-landlord-01     (32¢)
    "Aug 15 '98",   // index 12  → mailer-video-01          (32¢)
    "Sep 19 '98",   // index 13  → envelope-charity-01      (32¢)
    "Oct 05 '98",   // index 14  → envelope-valpak-01       (32¢)
    "Dec 24 '98",   // index 15  → card-wedding-01          (32¢)
    "Feb 09 '99",   // index 16  (33¢ — first post-cutover date; unused so far)
    "May 18 '99",   // index 17  → mailer-campaign-01       (33¢)
  ],


  // ── 5. IMAGES ─────────────────────────────────────────────────────────────
  //
  // Drop image files into /assets/media/.
  // The `file` field is the filename — no path prefix needed.
  // `usedOn` cross-references which fragment uses this image; it is for
  // your bookkeeping only and is not parsed by loader.js.
  //
  // Fragments reference images directly via src="./assets/media/FILENAME"
  // and use the onerror fallback pattern for missing files:
  //
  //   <div class="img-frame">
  //     <img src="./assets/media/photo-01.jpg"
  //          alt="DESCRIPTION"
  //          onerror="this.closest('.img-frame').classList.add('img-missing')">
  //   </div>

  images: [
    {
      id:     "photo-01",
      file:   "photo-01.jpg",
      alt:    "a polaroid of two women laughing at a picnic table",
      usedOn: "postcard-friend-01",
    },
    {
      id:     "photo-02",
      file:   "photo-02.jpg",
      alt:    "a blurry shot of a coastal town at dusk",
      usedOn: "postcard-mom-01",
    },
    {
      id:     "photo-03",
      file:   "photo-03.jpg",
      alt:    "a scan of a hand-drawn apartment floor plan",
      usedOn: "letter-ex-01",
    },
    {
      id:     "photo-04",
      file:   "photo-04.jpg",
      alt:    "a newspaper clipping folded in thirds",
      usedOn: "clipping-01",
    },
    {
      id:     "photo-05",
      file:   "photo-05.jpg",
      alt:    "a restaurant menu from a Chinese takeout place",
      usedOn: "menu-01",
    },
  ],


  // ── 6. STAMP DESIGNS ──────────────────────────────────────────────────────
  //
  // Reference list of the five SVG stamp designs used across fragments.
  // Inline SVG is used in every fragment (no external .svg files for stamps)
  // so this list is for authoring reference only.
  //
  // Designs:
  //   flora      — stylised flower, pink petals, yellow centre
  //   bird       — swallow in flight, blue
  //   geometric  — concentric diamonds, red + blue
  //   landscape  — mountain peak with snow cap and sun
  //   firstclass — eagle silhouette, patriotic colours

  stampDesigns: [
    "flora",
    "bird",
    "geometric",
    "landscape",
    "firstclass",
  ],


  // ── 7. DESK SURFACE ───────────────────────────────────────────────────────
  //
  // Controls the visual character of the canvas.
  // These values inform CSS decisions but are not injected as tokens.
  // If you change lightSource, update the canvas vignette in main.css too.

  surface: {
    color:       "#C8B99A",      // warm oak desk tone (matches --color-desk)
    grain:       true,           // woodgrain CSS pattern on <body>
    lightSource: "top-left",     // drop shadows offset right + down
  },


  // ── 8. SITE METADATA ──────────────────────────────────────────────────────
  //
  // Used in <head> meta tags. Update index.html OG tags to match if you
  // change these — they are not auto-injected into <head> by loader.js
  // (loader.js only touches #canvas children).

  meta: {
    siteTitle:   "Postcard",
    description: "Letters, postcards, and the things people leave behind.",
    ogImage:     "/assets/og-preview.jpg",
    ogImageW:    1200,
    ogImageH:    630,
    twitterCard: "summary_large_image",
  },


  // ── ADDING A NEW SENDER ───────────────────────────────────────────────────
  //
  // 1. Add an entry to senders[] with a unique id.
  // 2. Create a mail fragment that uses {{sender.*}} tokens.
  // 3. Add the fragment to mail/manifest.js with the matching senderId.
  // 4. Drop any referenced images into /assets/media/.
  //
  // ── ADDING A NEW PAGE ─────────────────────────────────────────────────────
  //
  // 1. mkdir pages/chapter-two/
  // 2. Copy index.html → pages/chapter-two/index.html
  //    Update the <title> and OG tags.
  // 3. Create pages/chapter-two/manifest.js with that chapter's mail list.
  // 4. Add mail fragments (can live in mail/ or mail/chapter-two/).
  // 5. world.config.js is shared — all senders and postmarks are available
  //    to every chapter automatically.

};
