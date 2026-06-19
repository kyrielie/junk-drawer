/**
 * sound.js
 *
 * Web Audio API singleton for Postcard.
 * Lazy-loads all buffers on the first user gesture to satisfy browser
 * autoplay policy. Playback silently no-ops if files are missing.
 *
 * Expected files (WebM/Opus primary, MP3 fallback for Safari):
 *   sounds/rustle.webm        sounds/rustle.mp3
 *   sounds/drawer-open.webm   sounds/drawer-open.mp3
 *   sounds/drawer-close.webm  sounds/drawer-close.mp3
 *
 * Exports:
 *   playRustle(opts?)   — paper rustle; pitch-varied; throttled during drag
 *   playDrawer(type)    — type: 'open' | 'close'
 *
 * RUSTLE OVERLAP NOTE:
 * The rustle file may be long (ambient recording). To avoid overlap:
 *   — only RUSTLE_DURATION seconds of the file are played per hit
 *   — the previous rustle source is stopped before starting a new one
 * Tune RUSTLE_DURATION to taste; 0.6 s gives a clean single-hit feel.
 */

// ── Sound file map ─────────────────────────────────────────────────────────

const SOUND_URLS = {
  rustle:      ['sounds/rustle.webm',       'sounds/rustle.mp3'],
  drawerOpen:  ['sounds/drawer-open.webm',  'sounds/drawer-open.mp3'],
  drawerClose: ['sounds/drawer-close.webm', 'sounds/drawer-close.mp3'],
};

// How many seconds of the rustle file to play per hit.
// Increase if your recording has a slow attack; decrease for a sharper snap.
const RUSTLE_DURATION = 0.6;

// Gain for drawer open/close sounds. 1.0 was far too loud; 0.35 sits
// comfortably below the rustle without disappearing entirely.
const DRAWER_GAIN = 0.35;

// ── State ──────────────────────────────────────────────────────────────────

let   ctx     = null;       // AudioContext singleton
const buffers = {};         // key → AudioBuffer (populated after first gesture)
let   loaded  = false;

// Calls to playRustle() that arrived before loadAll() finished are queued
// here (capped at 1 so a held-down drag never stacks dozens of plays).
const pendingPlay = [];

let rustleSource = null;    // currently-playing rustle node (may still be audible)

// ── AudioContext ───────────────────────────────────────────────────────────

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended — some browsers require a gesture to unlock
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// ── Load helpers ───────────────────────────────────────────────────────────

async function fetchBuffer(key, urls) {
  const context = getCtx();
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const raw   = await res.arrayBuffer();
      const audio = await context.decodeAudioData(raw);
      buffers[key] = audio;
      return; // success — stop trying fallbacks
    } catch {
      // File missing or decode error — try next URL silently
    }
  }
  // All URLs failed: buffers[key] stays undefined; plays will silently no-op
}

async function loadAll() {
  if (loaded) return;
  loaded = true;
  getCtx();
  await Promise.all(
    Object.entries(SOUND_URLS).map(([key, urls]) => fetchBuffer(key, urls))
  );
  // Flush any plays that were requested before buffers were ready.
  while (pendingPlay.length) {
    const { opts } = pendingPlay.shift();
    playRustle(opts);
  }
}

// ── Low-level playback (drawer sounds) ────────────────────────────────────

function playBuffer(key, { rate = 1.0, gain = 1.0 } = {}) {
  const buf = buffers[key];
  if (!buf || !ctx) return;

  const source = ctx.createBufferSource();
  source.buffer = buf;
  source.playbackRate.value = rate;

  const gainNode = ctx.createGain();
  gainNode.gain.value = gain;

  source.connect(gainNode);
  gainNode.connect(ctx.destination);
  source.start(0);
}

// ── Public: rustle ─────────────────────────────────────────────────────────

const RUSTLE_THROTTLE_MS = 120;
let   lastRustleAt = 0;

/**
 * Play a paper rustle with slight pitch randomisation.
 * Stops any currently-playing rustle first so long files never stack.
 *
 * @param {{ quiet?: boolean, force?: boolean }} opts
 *   quiet — lower gain (for mid-drag ticks, so pickup sounds louder)
 *   force — bypass the inter-call throttle (use for initial pickup)
 */
export function playRustle(opts = {}) {
  // Buffers not ready yet — queue this call so it plays as soon as
  // loadAll() finishes. Cap the queue at 1 to avoid stacking.
  if (!ctx || !loaded) {
    if (pendingPlay.length === 0) pendingPlay.push({ opts });
    return;
  }

  const now = Date.now();
  if (!opts.force && now - lastRustleAt < RUSTLE_THROTTLE_MS) return;
  lastRustleAt = now;

  const buf = buffers['rustle'];
  if (!buf) return;

  // Stop the previous hit before it runs the full 30 s
  if (rustleSource) {
    try { rustleSource.stop(); } catch { /* already ended */ }
    rustleSource = null;
  }

  const source = ctx.createBufferSource();
  source.buffer = buf;
  source.playbackRate.value = 0.88 + Math.random() * 0.24; // ±12% pitch variance

  const gainNode = ctx.createGain();
  gainNode.gain.value = opts.quiet ? 0.45 : 0.9;

  source.connect(gainNode);
  gainNode.connect(ctx.destination);

  // start(when, offset, duration) — play only the first RUSTLE_DURATION seconds
  source.start(0, 0, RUSTLE_DURATION);
  rustleSource = source;

  source.onended = () => {
    // Clear the reference when the clip naturally finishes
    if (rustleSource === source) rustleSource = null;
  };
}

// ── Public: drawer ─────────────────────────────────────────────────────────

/**
 * @param {'open'|'close'} type
 */
export function playDrawer(type) {
  if (!ctx || !loaded) return;
  playBuffer(type === 'open' ? 'drawerOpen' : 'drawerClose', {
    rate: 1.0,
    gain: DRAWER_GAIN,
  });
}

// ── Bootstrap on first user gesture ───────────────────────────────────────
// Browsers block AudioContext creation until a user gesture fires. We listen
// for the first pointerdown or keydown, both of which always precede any
// sound-triggering interaction.

document.addEventListener('pointerdown', loadAll, { once: true });
document.addEventListener('keydown',     loadAll, { once: true });

// ── Drawer event bridge ────────────────────────────────────────────────────
// The drawer mechanic lives in an inline <script> in index.html (not a
// module) so it cannot import playDrawer directly. Instead it dispatches
// custom events that we listen for here.

document.addEventListener('drawer:open',  () => playDrawer('open'));
document.addEventListener('drawer:close', () => playDrawer('close'));
