/**
 * loader.js
 *
 * Responsibilities:
 *   1. Import WORLD from world.config.js (shared by every page/chapter)
 *   2. Dynamically import MANIFEST — defaults to mail/manifest.js, or
 *      whatever path window.POSTCARD_MANIFEST names, so additional pages
 *      (e.g. pages/chapter-two/) can reuse this file with their own
 *      manifest instead of re-implementing the loader
 *   3. fetch() all fragments in parallel
 *   4. Substitute {{token}} placeholders with WORLD values
 *   5. Set z-index, position, and rotation from manifest entry
 *   6. Inject into #canvas in manifest order
 *   7. Centre the pile within the available canvas area
 *   8. Dispatch 'mailLoaded' so rustle.js can initialize
 *
 * PILE MODE: When #canvas has .canvas--pile, pieces are stacked together
 * and the canvas is sized to the viewport rather than a long scroll surface.
 * Positions from the manifest are relative to the pile center, and we
 * translate the whole group to the canvas centre on load.
 */

import { WORLD } from '../world.config.js';

// MANIFEST is loaded dynamically rather than via a static import so this
// same loader.js can serve more than one page/"chapter". Each page can set
// `window.POSTCARD_MANIFEST` (a path resolved relative to *this file*,
// i.e. relative to js/loader.js — same resolution rules as a static
// import) in an inline <script> placed before this module's <script
// type="module"> tag. If unset, it defaults to the original chapter-one
// manifest, so index.html needs no changes at all.
const MANIFEST_PATH = (typeof window !== 'undefined' && window.POSTCARD_MANIFEST)
  || '../mail/manifest.js';

// ── Helpers ────────────────────────────────────────────────────────────────

function buildTokenMap(entry) {
  const r      = WORLD.recipient;
  const sender = WORLD.senders.find(s => s.id === entry.senderId) ?? {};
  const postmarks = WORLD.postmarks ?? [];
  const pmIndex   = entry.postmarkIndex ?? 0;
  const postmark  = postmarks[pmIndex % postmarks.length] ?? '';

  return {
    'recipient.name':    r.name    ?? '',
    'recipient.address': r.address ?? '',
    'recipient.city':    r.city    ?? '',
    'recipient.state':   r.state   ?? '',
    'recipient.zip':     r.zip     ?? '',
    'sender.name':    sender.name    ?? '',
    'sender.address': sender.address ?? '',
    'sender.city':    sender.city    ?? '',
    'sender.state':   sender.state   ?? '',
    'sender.zip':     sender.zip     ?? '',
    'postmark': postmark,
  };
}

// ── Generic WORLD path resolver ─────────────────────────────────────────
//
// Supports arbitrary token paths against WORLD itself, e.g.:
//   {{config.menu.item1name}}   → WORLD.config.menu.item1name
//   {{images[0].file}}          → WORLD.images[0].file
//   {{images[0].alt}}           → WORLD.images[0].alt
//
// This is a superset of the flat senders[]/recipient/postmark lookups
// above — those stay as fast-path shortcuts (and the only ones that
// know about per-entry context like senderId/postmarkIndex). Anything
// else falls through to a literal dotted/bracketed walk of WORLD,
// so any future top-level key added to world.config.js (config, images,
// or whatever an individual fragment author needs) just works without
// touching this file again.
//
// Bracket segments (e.g. "images[0]") are split into ['images', '0']
// before walking, so both arrays and plain objects resolve the same way.

function resolveWorldPath(path) {
  const segments = path
    .split('.')
    .flatMap(part => {
      const matches = [...part.matchAll(/[^[\]]+/g)];
      return matches.map(m => m[0]);
    });

  let node = WORLD;
  for (const seg of segments) {
    if (node == null) return undefined;
    node = node[seg];
  }
  return node;
}

function applyTokens(html, tokens) {
  return html.replace(/\{\{([\w.\[\]]+)\}\}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(tokens, key)) {
      return tokens[key];
    }
    const resolved = resolveWorldPath(key);
    if (resolved === undefined || resolved === null) {
      console.warn(`[loader] Unresolved token {{${key}}} — leaving literal in output.`);
      return match;
    }
    return String(resolved);
  });
}

function buildPieceElement(innerHtml, entry) {
  const wrap     = document.createElement('div');
  wrap.className = entry.decorative ? 'mail-piece is-decorative-object' : 'mail-piece';
  wrap.id        = entry.id;
  wrap.innerHTML = innerHtml;

  wrap.style.top    = `${entry.top  ?? 0}px`;
  wrap.style.left   = `${entry.left ?? 0}px`;
  wrap.style.zIndex = String(entry.zIndex ?? 1);

  const rot      = entry.rotation ?? 0;
  wrap.dataset.rot   = String(rot);
  wrap.dataset.speed = String(entry.speed ?? 0);

  wrap.style.transform = `rotate(${rot}deg)`;

  if (entry.flip) {
    wrap.dataset.flip = entry.flip; // 'rotate' | 'rise' — read by rustle.js's zoom/flip system
  }

  if (entry.ariaLabel) {
    wrap.setAttribute('role', 'img');
    wrap.setAttribute('aria-label', entry.ariaLabel);
  }

  return wrap;
}

// Centre the pile: compute bounding box of all pieces and translate
// the canvas so the pile sits in the visual centre of the drawer face.
function centrePile(canvas) {
  const pieces = [...canvas.querySelectorAll('.mail-piece')];
  if (pieces.length === 0) return;

  let minL = Infinity, minT = Infinity, maxR = -Infinity, maxB = -Infinity;

  pieces.forEach(piece => {
    const l = parseInt(piece.style.left, 10) || 0;
    const t = parseInt(piece.style.top,  10) || 0;
    const w = piece.offsetWidth  || 420;
    const h = piece.offsetHeight || 200;
    minL = Math.min(minL, l);
    minT = Math.min(minT, t);
    maxR = Math.max(maxR, l + w);
    maxB = Math.max(maxB, t + h);
  });

  const pileW = maxR - minL;
  const pileH = maxB - minT;

  // Available area: canvas width × canvas height
  const canvasW = canvas.offsetWidth  || window.innerWidth  - 72;
  const canvasH = canvas.offsetHeight || window.innerHeight - 200;

  const offsetX = Math.max(20, (canvasW - pileW) / 2) - minL;
  const offsetY = Math.max(20, (canvasH - pileH) / 2) - minT;

  pieces.forEach(piece => {
    const l = parseInt(piece.style.left, 10) || 0;
    const t = parseInt(piece.style.top,  10) || 0;
    piece.style.left = `${l + offsetX}px`;
    piece.style.top  = `${t + offsetY}px`;
  });
}

// ── Core loader ────────────────────────────────────────────────────────────

async function fetchFragment(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) {
      console.warn(`[loader] Failed to fetch "${path}" (HTTP ${res.status})`);
      return null;
    }
    return res.text();
  } catch (err) {
    console.warn(`[loader] Network error fetching "${path}":`, err);
    return null;
  }
}

async function loadMail() {
  const canvas = document.getElementById('canvas');
  if (!canvas) {
    console.error('[loader] #canvas element not found.');
    return;
  }

  let MANIFEST;
  try {
    ({ MANIFEST } = await import(MANIFEST_PATH));
  } catch (err) {
    console.error(`[loader] Failed to load manifest "${MANIFEST_PATH}":`, err);
    canvas.dispatchEvent(new CustomEvent('mailLoaded', { bubbles: true }));
    return;
  }

  if (!MANIFEST || MANIFEST.length === 0) {
    console.warn('[loader] MANIFEST is empty — nothing to load.');
    canvas.dispatchEvent(new CustomEvent('mailLoaded', { bubbles: true }));
    return;
  }

  const htmlStrings = await Promise.all(
    MANIFEST.map(entry => fetchFragment(entry.src))
  );

  const frag = document.createDocumentFragment();

  MANIFEST.forEach((entry, i) => {
    const raw = htmlStrings[i];
    if (raw === null) return;

    const tokens      = buildTokenMap(entry);
    const substituted = applyTokens(raw, tokens);
    const piece       = buildPieceElement(substituted, entry);

    frag.appendChild(piece);
  });

  canvas.appendChild(frag);

  // In pile mode, centre the stack after layout
  if (canvas.classList.contains('canvas--pile')) {
    // rAF so offsetWidth/offsetHeight are available
    requestAnimationFrame(() => {
      requestAnimationFrame(() => centrePile(canvas));
    });
  }

  canvas.dispatchEvent(new CustomEvent('mailLoaded', { bubbles: true }));
}

// ── Init ───────────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadMail);
} else {
  loadMail();
}
