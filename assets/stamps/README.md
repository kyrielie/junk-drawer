# assets/stamps/

Reserved for standalone reusable stamp SVG files if you want to reference
them via <img> or <object> in future fragments.

The five stamp designs used in the current fragments are **inline SVG**
inside each mail fragment — they do not depend on files in this directory.

Inline SVG is preferred because:
- No extra HTTP request per stamp
- Fill colors can use CSS custom properties (var(--color-*))
- No CORS or path issues on GitHub Pages

If you add a standalone .svg here, import it in your fragment with:
  <img src="../../assets/stamps/stamp-flora.svg" alt="32 cent flora stamp"
       width="52" height="62">
