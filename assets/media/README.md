# assets/media/

Drop image files here. Any size or format — the site uses `object-fit: cover`
inside fixed containers so portrait, landscape, and square all work.

## Expected files (referenced by fragments)

| File         | Used on              | Description                                      |
|--------------|----------------------|--------------------------------------------------|
| photo-01.jpg | postcard-friend-01   | A polaroid of two women laughing at a picnic table |
| photo-02.jpg | postcard-mom-01      | A blurry shot of a coastal town at dusk           |
| photo-03.jpg | letter-ex-01         | A scan of a hand-drawn apartment floor plan       |
| photo-04.jpg | clipping-01          | A newspaper clipping folded in thirds             |
| photo-05.jpg | menu-01              | A restaurant menu from a Chinese takeout place    |

Missing files degrade gracefully — the `onerror` fallback pattern in each
fragment shows a warm tan placeholder with `[ photo ]` label instead.

## Open Graph preview

og-preview.jpg belongs in /assets/ (not /assets/media/).
Recommended size: 1200 × 630px.
