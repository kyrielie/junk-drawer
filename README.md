# Postcard — Architecture Reference

> **For AI engineers:** This document is the single source of truth for the codebase.
> **Update it every time you change the code.** Treat it as a living spec, not a snapshot.
> If you rename an ID, refactor a module, add a piece type, or change an animation contract,
> edit the relevant section here before closing the task.

---

## What this is

A static, no-build web app. A fictional pile of physical mail sits inside a drawer.
The user pulls the drawer open to reveal the mail, then drags it around, opens envelopes,
reads letters, and optionally "sends" pieces to the desk surface (the drawer face).
There is no server, no bundler, no framework. Everything runs directly in the browser.

---

## Mental model — the physical drawer

This is the most important concept in the codebase. Get this wrong and every name will confuse you.

```
┌────────────────────────────────────┐
│        DRAWER CLOSED (on load)     │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  #drawer > #drawer-face      │  │
│  │                              │  │
│  │  This is the DESK SURFACE.   │  │
│  │  It is the outside of the    │  │
│  │  drawer — what you see when  │  │
│  │  the drawer is shut.         │  │
│  │                              │  │
│  │  Contains: #desk (pile of    │  │
│  │  pieces sent from interior)  │  │
│  │  and the PULL tab at top.    │  │
│  │                              │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│        DRAWER OPEN (after pull)    │
│                                    │
│  #drawer-interior ← revealed       │
│                                    │
│  This is the INSIDE of the drawer. │
│  Mail lives here on load. The      │
│  user sees this after pulling.     │
│  The drawer face has slid away     │
│  downward off-screen.              │
│                                    │
└────────────────────────────────────┘
```

The drawer *face* (`#drawer > #drawer-face`) covers the screen on load.
Pulling the PULL tab slides the entire `#drawer` element **downward** off-screen,
revealing `#drawer-interior` behind it.

---

## Key DOM IDs

| ID | What it is |
|---|---|
| `#drawer` | The full drawer element. Slides down on open, up on close. |
| `#drawer-face` | The visible front panel of the drawer (kraft-paper surface). Contains `#desk`, `#drawer-label`, and `#pull-tab-wrapper`. |
| `#drawer-interior` | The inside of the drawer. Mail lives here on load. Revealed when the drawer opens. |
| `#desk` | A zone inside `#drawer-face` where pieces land after "Send to desk". The outside desk surface, visible when drawer is closed. |
| `#desk-empty` | Empty-state label inside `#desk`. Hidden once a piece arrives. |
| `#pull-tab` | The button/handle at the top of `#drawer-face` that the user pulls to open the drawer. |
| `#pull-tab-wrapper` | Wrapper positioning the pull tab at the top of the drawer face. |
| `#retract-handle` | A "▲ close drawer" button injected into `<body>` after the drawer opens. Removed on close. |
| `#drawer-floor` | A decorative floor bar at the bottom of the viewport (permanent). |
| `#scroll-progress` | A scroll-position indicator bar (permanent). |
| `#letter-overlay` | A modal overlay injected by `rustle.js` for reading letter content. |

---

## Key CSS classes

| Class | Where used | Meaning |
|---|---|---|
| `.drawer-interior--pile` | `#drawer-interior` | Pile mode: pieces are stacked centred, viewport-sized container, no scroll. |
| `.drawer--open` | `#drawer` | Triggers the animated open transition (translateY to off-screen bottom). |
| `.drawer--open-instant` | `#drawer` | Opens without animation (e.g. on direct-link load). |
| `.drawer--closing` | `#drawer` | Applied during close transition; removed after 1.1s. |
| `.mail-piece` | Every piece | Base wrapper for all mail fragments. |
| `.is-dragging` | `.mail-piece` | Active drag state. |
| `.is-liftable` | `.mail-piece` | Top 10 pieces by z-index; shows hover ring in pile mode. |
| `.is-lifting` | `.mail-piece` | Brief class during z-index promotion animation. |
| `.is-arriving` | `.mail-piece` | Drop-in animation when a piece lands on `#desk`. |
| `.is-decorative-object` | `.mail-piece` | Desk props (pen, stamp, etc); use `filter: drop-shadow` not `box-shadow`. |
| `.envelope`, `.envelope-front` | Inside mail fragments | Clickable envelope with flap open/close. |
| `.postcard`, `.postcard-back` | Inside mail fragments | Clickable postcard with flip-to-back overlay. |
| `.letter-peek`, `.letter-content` | Inside mail fragments | Collapsed letter reveal inside an open envelope. |
| `.pull-tab` | Injected by `rustle.js` | Inline expand/collapse tab on multi-part pieces. |
| `.overlay-actions` | Inside `#letter-overlay` | "Send to desk" action bar, only shown when piece is in `#drawer-interior`. |

---

## File map

```
postcard-app/
│
├── index.html                  Root page (Chapter One). Contains:
│                                 — DOM shell (#drawer-interior, #drawer, #desk, etc.)
│                                 — Inline drawer pull mechanic (IIFE, no module)
│                                 — <script type="module"> tags for loader + rustle
│
├── world.config.js             Narrative config. Single source of truth for:
│                                 recipient, senders, postmarks, images, stamps,
│                                 desk surface colour, site metadata.
│                                 Imported by loader.js. Never touches the DOM.
│
├── css/
│   └── main.css                All styles. ~2600 lines. Sections numbered 1–32+
│                                 in block comments. No preprocessor.
│
├── js/
│   ├── loader.js               Fetches + injects mail pieces into #drawer-interior.
│   │                             Imports WORLD from world.config.js.
│   │                             Supports window.POSTCARD_MANIFEST override for
│   │                             multi-chapter pages.
│   │                             Dispatches 'mailLoaded' when done.
│   │
│   ├── rustle.js               All user interaction with mail pieces.
│   │                             Listens for 'mailLoaded' then runs init().
│   │                             Exports: setTransform(), generateBarcode()
│   │
│   └── sound.js                Audio: rustle, drawer-open, drawer-close.
│                                 Exports: playRustle()
│
├── mail/
│   ├── manifest.js             Array of piece descriptors for Chapter One.
│   │                             Each entry: { id, src, senderId, postmarkIndex,
│   │                               top, left, zIndex, rotation, speed }
│   │
│   └── *.html                  Individual mail fragment files.
│                                 Injected verbatim by loader.js after
│                                 {{token}} substitution.
│
├── pages/
│   └── chapter-two/
│       ├── index.html          Chapter Two page. Identical shell to root index.html.
│       │                         Sets window.POSTCARD_MANIFEST before loader import.
│       │                         Contains full drawer mechanic + interior sync copy.
│       └── manifest.js         Chapter Two piece list (currently sparse/empty).
│
├── assets/
│   ├── stamps/                 Stamp image assets. See assets/stamps/README.md.
│   └── media/                  Other media assets. See assets/media/README.md.
│
└── sounds/
    ├── rustle.{mp3,webm}
    ├── drawer-open.{mp3,webm}
    └── drawer-close.{mp3,webm}
```

---

## Data flow

```
world.config.js  ──→  loader.js  ──→  #drawer-interior  ──→  rustle.js (via 'mailLoaded')
     WORLD              MANIFEST         DOM pieces              interaction layer
                     (per-chapter)
```

1. `loader.js` imports `WORLD` statically and `MANIFEST` dynamically.
2. All fragment HTML files are fetched in parallel.
3. `{{token}}` placeholders are replaced with values from `WORLD` (recipient, sender, postmark).
4. Each piece is positioned (top/left/zIndex/rotation) from its manifest entry, then appended to `#drawer-interior`.
5. The pile is centred within the viewport by `centrePile()`.
6. `'mailLoaded'` is dispatched → `rustle.js` binds hover, drag, envelope, postcard, mailer, click, and barcode generation on every piece.

---

## Drawer mechanic — how it works

The drawer pull is a vanilla IIFE in `index.html` (and duplicated in `pages/chapter-two/index.html`). It is **not** a module.

### Open sequence
1. User clicks/drags PULL tab downward (or presses Space/Enter).
2. `openDrawer()` adds `.drawer--open` to `#drawer` → CSS transition slides `#drawer` to `translateY(100vh + 80px)`.
3. `syncInteriorOpen()` simultaneously animates `#drawer-interior` **down** from a negative offset to `translateY(0)`, using the same cubic-bezier curve, giving the illusion the interior is being physically revealed as the face slides away.
4. After 1.1s, `addRetractHandle()` injects `#retract-handle` into `<body>`.

### Close sequence
1. User clicks/drags `#retract-handle` upward (or it is clicked).
2. `closeDrawer()` removes `.drawer--open`, adds `.drawer--closing` → `#drawer` transitions back to `translateY(0)`.
3. `syncInteriorClose()` animates `#drawer-interior` **up** to the same negative offset, matching the drawer face travel.
4. After 2s (animation complete) the interior transform is silently reset to `translateY(0)` (off-screen is now correct origin again).
5. After 1.1s `.drawer--closing` is removed and scroll is reset.

### Drag-to-open / drag-to-close
Both the pull tab and retract handle support pointer-based drag. During drag, `syncInteriorDrag()` / `syncInteriorCloseDrag()` mirror the drawer's live `translateY` pixel-for-pixel onto the interior, so pieces track with the face during manual pull.

### Animation constants (must match CSS)
```js
DRAWER_TRAVEL = 'calc(-1 * (100vh + 80px))'  // how far interior offsets to park behind face
DRAWER_EASING = 'transform 2s cubic-bezier(0.16, 1, 0.3, 1)'  // matches CSS transition
```
If you change the drawer CSS transition duration or easing, update these constants in both HTML files and the `setTimeout(, 2000)` reset timer in `syncInteriorClose()`.

---

## Adding a new mail piece

1. Create `mail/your-piece-id.html` using an existing fragment as a template.
2. Add an entry to `mail/manifest.js` with a unique `id`, `src`, `senderId`, `zIndex`, `rotation`, `top`, `left`.
3. Ensure `senderId` exists in `world.config.js`'s `senders` array, or use `null` for institutional mail.
4. `{{recipient.*}}` and `{{sender.*}}` tokens resolve automatically.

---

## Adding a new chapter / page

1. Create `pages/your-chapter/index.html` — copy `pages/chapter-two/index.html` as the scaffold.
2. Create `pages/your-chapter/manifest.js` with the chapter's piece list.
3. In the new `index.html`, set `window.POSTCARD_MANIFEST = '../pages/your-chapter/manifest.js'` **before** the `<script type="module" src="../../js/loader.js">` tag.
4. The path in `POSTCARD_MANIFEST` is relative to `js/loader.js`, not to the page — one `../` reaches the project root.
5. Update `world.config.js` if the new chapter needs new senders or postmarks.
6. The drawer mechanic IIFE in `index.html` is duplicated in each chapter page. If you change it significantly, update all copies (or extract to `js/drawer.js` — see note below).

> **Note:** The drawer mechanic IIFE exists in two places (root `index.html` and `pages/chapter-two/index.html`) because the project has no build step. If a third chapter is added or the mechanic grows more complex, extract it to `js/drawer.js` as a proper module rather than copy-pasting a third time.

---

## Rustle.js — interaction module reference

| Function | Exported | Purpose |
|---|---|---|
| `setTransform(el)` | ✓ | Applies rotation + hover lift to a piece. Single source of truth for transforms. |
| `generateBarcode(el)` | ✓ | Renders a POSTNET SVG barcode into a `.barcode[data-zip]` element. |
| `sendToDesk(pieceEl)` | ✗ | Animates a piece out of `#drawer-interior` and drops it into `#desk`. |
| `openOverlay(html, type, pieceEl)` | ✗ | Opens `#letter-overlay` with given content. Shows "Send to desk" button if piece is in `#drawer-interior`. |
| `liftPiece(piece, container)` | ✗ | Promotes piece to top z-index, refreshes liftable set. |
| `init()` | ✗ | Called once on `'mailLoaded'`. Binds all interactions. |

---

## CSS section index (main.css)

| Section | Contents |
|---|---|
| 1–3 | Custom properties, reset, body/layout |
| 4 | `#drawer-interior` — the inside of the open drawer |
| 5 | `.mail-piece` base wrapper |
| 6–15 | Mail piece types: envelopes, postcards, letters, mailers, clippings, notes, etc. |
| 16–19 | Stamps, postmarks, barcodes, address blocks |
| 20 | Print styles |
| 21–25 | Drawer shell: `#drawer`, `#drawer-face`, `#drawer-label`, `#pull-tab`, `#retract-handle` |
| 26 | Drawer open/close transitions and keyframes |
| 27 | `#desk` and `#desk-empty` (the outside desk surface on the drawer face) |
| 28 | Pile mode (`.drawer-interior--pile`) |
| 29 | Overlay (`#letter-overlay`, `.overlay-actions`, "Send to desk" button) |
| 30 | `#drawer-floor`, `#scroll-progress`, side rails |
| 31 | `#desk` piece arrival animation (`drawerArrive` keyframe) |
| 32+ | Permit block, decorative object variants, responsive overrides |

---

## Naming reference (canonical — last updated 2026-06-21)

| Concept | ID / class | Notes |
|---|---|---|
| Inside of the drawer | `#drawer-interior` | Revealed on open. Mail lives here. |
| Pile mode on interior | `.drawer-interior--pile` | Class on `#drawer-interior` when in stacked pile layout. |
| Outside desk surface | `#desk` | Inside `#drawer-face`. Visible when drawer is closed. |
| Empty state on desk | `#desk-empty` | Hidden once a piece arrives on the desk. |
| Drawer face/shell | `#drawer` | The whole drawer element that slides. |
| Drawer front panel | `#drawer-face` | The visible kraft-paper surface of the closed drawer. |

> **Previous names (do not use):** `#canvas`, `.canvas--pile`, `#drawer-pile`, `#drawer-pile-empty`.
> These were renamed on 2026-06-21 because the old names implied the opposite of the physical metaphor.

---

## Change log

| Date | Change | Files affected |
|---|---|---|
| 2026-06-21 | Renamed `#canvas` → `#drawer-interior`, `.canvas--pile` → `.drawer-interior--pile`, `#drawer-pile` → `#desk`, `#drawer-pile-empty` → `#desk-empty` across all files | `index.html`, `pages/chapter-two/index.html`, `js/loader.js`, `js/rustle.js`, `css/main.css`, `world.config.js` |
| 2026-06-21 | Added `#drawer-interior` sync animation: mail pieces on the interior now move in sync with the drawer face during open, close, and manual drag — giving the physical illusion of pieces inside a real drawer | `index.html`, `pages/chapter-two/index.html` |
