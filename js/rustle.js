/**
 * rustle.js
 *
 * Handles all direct user interaction with mail pieces.
 * Initialises after 'mailLoaded' is dispatched by loader.js.
 *
 * RESPONSIBILITIES:
 *   — Hover lift & shadow
 *   — Drag & drop (free repositioning within the current container)
 *   — Rustle sounds on pickup and during movement
 *   — Pile z-index management (click-to-top, liftable hints)
 *   — Envelope flap open/close
 *   — Postcard flip
 *   — Pull-tab reveal mechanic
 *   — Mailer open/close
 *   — Letter overlay (modal)
 *   — "Send to drawer" — moves pieces from #canvas into #drawer-pile
 *   — POSTNET barcode generation
 *
 * NOTE: parallax.js has been removed. setTransform() no longer reads
 * data-parallaxOffset; it composes only rotation + hover lift.
 */

import { playRustle } from './sound.js';

// ── TRANSFORM ENGINE ──────────────────────────────────────────────────────────
// Single source of truth for all CSS transforms on mail pieces.
// Call whenever hover state changes.

export function setTransform(el) {
  const rot    = parseFloat(el.dataset.rot || '0');
  const liftPx = el.dataset.hover === 'true' ? -4 : 0;
  el.style.transform = `rotate(${rot}deg) translateY(${liftPx}px)`;
}

// ── PILE Z-INDEX MANAGEMENT ───────────────────────────────────────────────────

const LIFT_LIMIT = 10;
const BASE_Z     = 999;
let   pileHighZ  = BASE_Z;

function getLiftablePieces(container) {
  const pieces = [...container.querySelectorAll('.mail-piece')];
  pieces.sort((a, b) =>
    (parseInt(b.style.zIndex, 10) || 0) - (parseInt(a.style.zIndex, 10) || 0)
  );
  return pieces.slice(0, LIFT_LIMIT);
}

function refreshLiftable(container) {
  container.querySelectorAll('.mail-piece')
    .forEach(p => p.classList.remove('is-liftable'));
  getLiftablePieces(container)
    .forEach(p => p.classList.add('is-liftable'));
}

function liftPiece(piece, container) {
  pileHighZ++;
  piece.classList.add('is-lifting');
  piece.style.zIndex  = String(pileHighZ);
  piece.dataset.baseZ = String(pileHighZ);
  setTimeout(() => piece.classList.remove('is-lifting'), 300);
  refreshLiftable(container);
}

// ── HOVER ─────────────────────────────────────────────────────────────────────

const SHADOW_HOVER =
  '5px 8px 16px rgba(80,55,30,0.45), 2px 3px 6px rgba(80,55,30,0.25), inset 0 0 0 1px rgba(255,255,255,0.50)';
const SHADOW_REST =
  '3px 5px 8px rgba(80,55,30,0.35), 1px 2px 3px rgba(80,55,30,0.20), inset 0 0 0 1px rgba(255,255,255,0.40)';

// Desk props (.is-decorative-object) use a shape-following drop-shadow
// instead of box-shadow (see css/main.css's note by the same class) — a
// box-shadow's inset white "paper edge" highlight is exactly what produced
// the rectangle-around-a-circle artifact this is fixing, so these need
// their own filter-based hover/rest pair rather than reusing SHADOW_*.
const FILTER_HOVER = 'drop-shadow(5px 7px 6px rgba(80,55,30,0.50))';

function onPieceEnter(e) {
  const piece = e.currentTarget;
  piece.dataset.hover = 'true';
  if (piece.classList.contains('is-decorative-object')) {
    piece.style.filter = FILTER_HOVER;
  } else {
    piece.style.boxShadow = SHADOW_HOVER;
  }
  setTransform(piece);
}

function onPieceLeave(e) {
  const piece = e.currentTarget;
  piece.dataset.hover = 'false';
  if (piece.classList.contains('is-decorative-object')) {
    // Clear the inline override and fall back to the CSS base filter
    // (.mail-piece.is-decorative-object's drop-shadow) rather than
    // duplicating that value here.
    piece.style.filter = '';
  } else {
    piece.style.boxShadow = SHADOW_REST;
  }
  setTransform(piece);
}

function bindHover(piece) {
  piece.dataset.baseZ = piece.style.zIndex || '1';
  piece.addEventListener('mouseenter', onPieceEnter);
  piece.addEventListener('mouseleave', onPieceLeave);
}

// ── DRAG & DROP ───────────────────────────────────────────────────────────────
//
// Uses Pointer Events so a single code path handles mouse, touch, and stylus.
// setPointerCapture() keeps events flowing even when the pointer leaves the
// element mid-drag.
//
// Click suppression: if the pointer moved more than 6px we set
// piece._suppressClick so the subsequent 'click' event (which always fires
// after pointerup) is swallowed without reaching onPieceClick().

function bindDrag(piece, container) {
  let startX   = null;
  let startY   = null;
  let origLeft = 0;
  let origTop  = 0;
  let hasMoved = false;
  let rustleAt = 0;

  piece.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    // Lift to top of pile and play pickup sound
    liftPiece(piece, container);
    playRustle({ force: true });

    startX   = e.clientX;
    startY   = e.clientY;

    // Read the piece's current layout position. (Previously this was read
    // via getBoundingClientRect() as a workaround for pieces whose
    // style.left/top was never set — but getBoundingClientRect() returns
    // the rotated element's axis-aligned bounding box, which is offset from
    // the unrotated style.left/top by a rotation-dependent amount, causing
    // a visible snap on every drag start. The real cause of "style.left
    // never set" was the duplicate-wrapper bug in mail/*.html, now fixed
    // (every .mail-piece in the DOM is the single node loader.js creates
    // and positions), so the simple, accurate read is safe again.)
    origLeft = parseInt(piece.style.left, 10) || 0;
    origTop  = parseInt(piece.style.top, 10) || 0;

    hasMoved = false;

    piece.setPointerCapture(e.pointerId);
  });

  piece.addEventListener('pointermove', (e) => {
    if (startX === null) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (!hasMoved && Math.hypot(dx, dy) > 6) {
      hasMoved = true;
      piece.classList.add('is-dragging');
      piece.style.cursor = 'grabbing';
    }
    if (!hasMoved) return;

    // Throttled rustle ticks during movement
    const now = Date.now();
    if (now - rustleAt > 120) {
      playRustle({ quiet: true });
      rustleAt = now;
    }

    const maxLeft = Math.max(0, container.offsetWidth  - piece.offsetWidth);
    const maxTop  = Math.max(0, container.offsetHeight - piece.offsetHeight);

    piece.style.left = `${Math.max(0, Math.min(maxLeft, origLeft + dx))}px`;
    piece.style.top  = `${Math.max(0, Math.min(maxTop,  origTop  + dy))}px`;
  });

  piece.addEventListener('pointerup', () => {
    if (startX === null) return;

    const didMove = hasMoved;
    startX   = null;
    hasMoved = false;

    piece.classList.remove('is-dragging');
    piece.style.cursor = '';

    if (didMove) {
      piece._suppressClick = true;
    }
  });

  piece.addEventListener('pointercancel', () => {
    startX   = null;
    hasMoved = false;
    piece.classList.remove('is-dragging');
    piece.style.cursor = '';
  });
}

// ── ENVELOPE FLAP ─────────────────────────────────────────────────────────────

function openEnvelope(envelope) {
  if (envelope.dataset.open === 'true') return;
  envelope.dataset.open = 'true';
  envelope.classList.add('is-open');
  const peek = envelope.querySelector('.letter-peek');
  if (peek) peek.addEventListener('click', onLetterPeekClick, { once: true });
}

function closeEnvelope(envelope) {
  if (envelope.dataset.open !== 'true') return;
  envelope.dataset.open = 'false';
  envelope.classList.remove('is-open');
}

function onEnvelopeClick(e) {
  const envelope = e.currentTarget.closest('.envelope');
  if (!envelope) return;
  if (e.target.closest('.letter-peek') && envelope.dataset.open === 'true') return;
  envelope.dataset.open === 'true' ? closeEnvelope(envelope) : openEnvelope(envelope);
}

function bindEnvelope(piece) {
  const envelope = piece.querySelector('.envelope');
  if (!envelope) return;
  envelope.dataset.open = 'false';
  const front = envelope.querySelector('.envelope-front');
  if (front) {
    front.style.cursor = 'pointer';
    front.addEventListener('click', onEnvelopeClick);
  }
}

// ── POSTCARD FLIP ─────────────────────────────────────────────────────────────

function onPostcardClick(e) {
  const postcard = e.currentTarget;
  const back     = postcard.querySelector('.postcard-back');
  if (!back) return;
  openOverlay(back.innerHTML, 'postcard', postcard.closest('.mail-piece'));
}

function bindPostcard(piece) {
  const postcard = piece.querySelector('.postcard');
  if (!postcard) return;
  postcard.style.cursor = 'pointer';
  postcard.addEventListener('click', onPostcardClick);
}

// ── PULL TAB ──────────────────────────────────────────────────────────────────

function buildPullTab(el) {
  const reveal = el.querySelector('[data-pull-reveal]');
  if (!reveal) return;

  const tab = document.createElement('div');
  tab.className = 'pull-tab';
  tab.setAttribute('role', 'button');
  tab.setAttribute('tabindex', '0');
  tab.setAttribute('aria-label', 'Pull to reveal more');
  tab.innerHTML = `
    <svg class="pull-tab-svg" viewBox="0 0 80 22" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="1" y="1" width="78" height="20" rx="3"
            fill="rgba(212,184,150,0.85)" stroke="rgba(80,55,30,0.35)" stroke-width="0.75"/>
      <line x1="18" y1="11" x2="62" y2="11"
            stroke="rgba(80,55,30,0.5)" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M14,11 L10,7 L10,15 Z" fill="rgba(80,55,30,0.45)"/>
      <path d="M66,11 L70,7 L70,15 Z" fill="rgba(80,55,30,0.45)"/>
      <text x="40" y="14.5" text-anchor="middle"
            font-family="'Courier Prime', monospace" font-size="6"
            fill="rgba(80,55,30,0.65)" letter-spacing="0.12em">PULL</text>
    </svg>`;

  reveal.style.maxHeight  = '0';
  reveal.style.overflow   = 'hidden';
  reveal.style.transition = 'max-height 0.55s cubic-bezier(0.34,1.06,0.64,1)';

  let isOpen = false;
  function toggle() {
    isOpen = !isOpen;
    reveal.style.maxHeight = isOpen ? `${reveal.scrollHeight + 40}px` : '0';
    tab.classList.toggle('pull-tab--open', isOpen);
  }

  tab.style.cursor = 'pointer';
  tab.addEventListener('click', toggle);
  tab.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
  });
  el.appendChild(tab);
}

function bindPullTabs(canvas) {
  canvas.querySelectorAll('[data-pull-tab]').forEach(buildPullTab);
}

// ── MAILER ────────────────────────────────────────────────────────────────────

function bindMailer(piece) {
  const mailer = piece.querySelector('.envelope--mailer');
  if (!mailer) return;
  const front = mailer.querySelector('.envelope-front--mailer');
  if (!front) return;
  front.style.cursor = 'pointer';
  front.addEventListener('click', () => {
    if (mailer.dataset.open === 'true') {
      mailer.dataset.open = 'false';
      mailer.classList.remove('is-open');
    } else {
      mailer.dataset.open = 'true';
      mailer.classList.add('is-open');
      const peek = mailer.querySelector('.letter-peek');
      if (peek) peek.addEventListener('click', onLetterPeekClick, { once: true });
    }
  });
}

// ── SEND TO DRAWER ────────────────────────────────────────────────────────────

let drawerPileZ = 10;

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function sendToDrawer(pieceEl) {
  const drawerPile = document.getElementById('drawer-pile');
  const emptyLabel = document.getElementById('drawer-pile-empty');
  if (!drawerPile) return;

  const h    = hashStr(pieceEl.id || String(Math.random()));
  const newX = 40 + (h        % 300);
  const newY = 40 + ((h >> 4) % 180);
  const rot  = parseFloat(pieceEl.dataset.rot || '0');

  pieceEl.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
  pieceEl.style.opacity    = '0';
  pieceEl.style.transform  = `rotate(${rot}deg) scale(0.92) translateY(-12px)`;

  setTimeout(() => {
    pieceEl.remove();

    pieceEl.style.transition = '';
    pieceEl.style.opacity    = '';
    pieceEl.style.transform  = `rotate(${rot}deg)`;
    pieceEl.style.left       = `${newX}px`;
    pieceEl.style.top        = `${newY}px`;
    pieceEl.style.zIndex     = String(++drawerPileZ);
    pieceEl.dataset.rot      = String(rot);
    pieceEl.style.setProperty('--arrive-rot', `${rot}deg`);

    pieceEl.classList.add('is-arriving');
    drawerPile.appendChild(pieceEl);

    bindHover(pieceEl);
    bindDrag(pieceEl, drawerPile);

    setTimeout(() => pieceEl.classList.remove('is-arriving'), 500);
    if (emptyLabel) emptyLabel.classList.add('is-hidden');
  }, 380);
}

// ── OVERLAY ───────────────────────────────────────────────────────────────────

let overlay     = null;
let overlayBody = null;

function buildOverlay() {
  overlay = document.createElement('div');
  overlay.id = 'letter-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Letter contents');
  overlay.setAttribute('aria-hidden', 'true');

  const closeBtn = document.createElement('button');
  closeBtn.className   = 'overlay-close';
  closeBtn.textContent = '✕';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.addEventListener('click', closeOverlay);

  overlayBody = document.createElement('div');
  overlayBody.className = 'overlay-body';

  overlay.appendChild(closeBtn);
  overlay.appendChild(overlayBody);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeOverlay();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-visible')) closeOverlay();
  });
}

function buildActionsBar(pieceEl) {
  const bar = document.createElement('div');
  bar.className = 'overlay-actions';

  const sendBtn = document.createElement('button');
  sendBtn.className = 'btn-send-desktop';
  sendBtn.setAttribute('aria-label', 'Send this piece to the drawer');
  sendBtn.innerHTML = `
    <svg viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="1" y="3" width="11" height="8" rx="1"
            stroke="currentColor" stroke-width="1.1" fill="none"/>
      <path d="M1.5 3.5L6.5 8L11.5 3.5"
            stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
      <path d="M6.5 1V5.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
      <path d="M4.5 3L6.5 1L8.5 3"
            stroke="currentColor" stroke-width="1.1"
            stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Send to drawer`;

  const label = document.createElement('span');
  label.className = 'overlay-sent-label';

  sendBtn.addEventListener('click', () => {
    if (!pieceEl) return;
    sendBtn.classList.add('sent');
    sendBtn.textContent = '✓  Sent to drawer';
    label.textContent   = '— close the overlay to see it';
    sendToDrawer(pieceEl);
    setTimeout(closeOverlay, 900);
  });

  bar.appendChild(sendBtn);
  bar.appendChild(label);
  return bar;
}

function openOverlay(contentHTML, type = 'letter', pieceEl = null) {
  if (!overlay) buildOverlay();

  overlay.querySelectorAll('.overlay-actions').forEach(el => el.remove());

  overlayBody.innerHTML           = contentHTML;
  overlayBody.dataset.overlayType = type;

  const closeBtn = overlay.querySelector('.overlay-close');
  if (closeBtn) overlay.insertBefore(closeBtn, overlayBody);

  if (pieceEl && pieceEl.closest('#canvas')) {
    overlayBody.after(buildActionsBar(pieceEl));
  }

  overlay.classList.add('is-visible');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  overlay.querySelector('.overlay-close')?.focus();
}

function closeOverlay() {
  if (!overlay) return;
  overlay.classList.remove('is-visible');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// ── LETTER PEEK ───────────────────────────────────────────────────────────────

function onLetterPeekClick(e) {
  const peek    = e.currentTarget;
  const content = peek.querySelector('.letter-content');
  if (!content) return;
  openOverlay(content.innerHTML, 'letter', peek.closest('.mail-piece'));
}

// ── PIECE CLICK ───────────────────────────────────────────────────────────────

function onPieceClick(e) {
  const piece = e.currentTarget;

  if (piece._suppressClick) {
    piece._suppressClick = false;
    return;
  }

  // Let child-element click handlers take precedence
  if (
    e.target.closest('.envelope-front')         ||
    e.target.closest('.envelope-front--mailer') ||
    e.target.closest('.postcard')               ||
    e.target.closest('.letter-peek')
  ) return;

  // Prefer a designated overlay-content container so the overlay shows only
  // the intended "zoomed" view rather than the full piece interior.
  // Any element tagged [data-overlay-content] in the piece's HTML opts in;
  // pieces without it fall back to piece.innerHTML (existing behaviour).
  const overlayContent = piece.querySelector('[data-overlay-content]');
  const html  = overlayContent ? overlayContent.innerHTML : piece.innerHTML;
  const type  = overlayContent
    ? (overlayContent.dataset.overlayType || 'piece')
    : 'piece';
  openOverlay(html, type, piece);
}

function bindPieceClick(piece) {
  piece.addEventListener('click', onPieceClick);
}

// ── POSTNET BARCODE GENERATOR ─────────────────────────────────────────────────

const POSTNET = {
  '0': [1,1,0,0,0], '1': [0,0,0,1,1], '2': [0,0,1,0,1],
  '3': [0,0,1,1,0], '4': [0,1,0,0,1], '5': [0,1,0,1,0],
  '6': [0,1,1,0,0], '7': [1,0,0,0,1], '8': [1,0,0,1,0],
  '9': [1,0,1,0,0],
};

export function generateBarcode(el) {
  const zip    = (el.dataset.zip || '00000').replace(/\D/g, '').slice(0, 5).padEnd(5, '0');
  const digits = zip.split('');
  const check  = (10 - (digits.reduce((s, d) => s + parseInt(d, 10), 0) % 10)) % 10;
  const bars   = [];

  ['|', ...digits, String(check), '|'].forEach(d => {
    if (d === '|') {
      bars.push(1);
    } else {
      (POSTNET[d] || POSTNET['0']).forEach(b => bars.push(b));
    }
  });

  const BAR_W = 2, GAP = 1.5, TALL = 9, SHORT = 4, SVG_H = 12;
  const totalW = bars.length * (BAR_W + GAP);
  const NS     = 'http://www.w3.org/2000/svg';
  const svg    = document.createElementNS(NS, 'svg');

  svg.setAttribute('viewBox',     `0 0 ${totalW} ${SVG_H}`);
  svg.setAttribute('width',       String(totalW));
  svg.setAttribute('height',      String(SVG_H));
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('barcode-svg');

  bars.forEach((tall, i) => {
    const barH = tall ? TALL : SHORT;
    const rect = document.createElementNS(NS, 'rect');
    rect.setAttribute('x',      String(i * (BAR_W + GAP)));
    rect.setAttribute('y',      String(SVG_H - barH));
    rect.setAttribute('width',  String(BAR_W));
    rect.setAttribute('height', String(barH));
    rect.setAttribute('fill',   'var(--color-ink-black, #1A1A1A)');
    svg.appendChild(rect);
  });

  el.innerHTML = '';
  el.appendChild(svg);
}

// ── INIT ──────────────────────────────────────────────────────────────────────

function init() {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;

  canvas.querySelectorAll('.mail-piece').forEach(piece => {
    bindHover(piece);
    bindEnvelope(piece);
    bindPostcard(piece);
    bindMailer(piece);
    bindPieceClick(piece);
    bindDrag(piece, canvas);
  });

  bindPullTabs(canvas);
  canvas.querySelectorAll('.barcode[data-zip]').forEach(generateBarcode);
  buildOverlay();

  if (canvas.classList.contains('canvas--pile')) {
    refreshLiftable(canvas);
  }
}

document.addEventListener('mailLoaded', init, { once: true });
