/**
 * pages/chapter-two/manifest.js
 *
 * Mail manifest for Chapter Two.
 * Follows the same schema as /mail/manifest.js.
 *
 * This file is genuinely wired up: pages/chapter-two/index.html sets
 * `window.POSTCARD_MANIFEST` to point the shared js/loader.js at this file
 * instead of /mail/manifest.js, so adding entries below is enough to make
 * them appear on that page — no other code changes needed. It's still
 * intentionally empty for now (no chapter-two content has been written
 * yet); this is the scaffold, not "broken."
 *
 * Two different relative-path rules are in play here — easy to mix up:
 *   - `window.POSTCARD_MANIFEST` (set in chapter-two/index.html) is an ES
 *     module specifier, resolved relative to js/loader.js's own location.
 *   - the `src` fields *inside* this manifest (below) are fetch() URLs,
 *     resolved relative to the page that's loading them — i.e. relative to
 *     pages/chapter-two/index.html. That's why they use ../../mail/ to
 *     reach the shared mail/ directory, not ../mail/.
 *
 * Example:
 *
 * export const MANIFEST = [
 *   {
 *     id:            'postcard-video-01',
 *     src:           '../../mail/chapter-two/postcard-video-01.html',
 *     senderId:      'video',
 *     postmarkIndex: 14,        // "Feb 09 '99" — 33¢ era
 *     top:           120,
 *     left:          80,
 *     zIndex:        4,
 *     rotation:      -9,
 *     speed:         0.15,
 *     ariaLabel:     'Postcard from SunCoast Video, February 1999',
 *   },
 * ];
 */

export const MANIFEST = [
  // Add chapter-two mail pieces here
];
