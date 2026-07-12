/**
 * THE WAR WITHIN — footer.js
 * Injects the shared site footer into every page.
 * Usage: place <div id="site-footer"></div> at the bottom of <body>, then:
 *   <script src="/footer.js"></script>
 *
 * For battle pages that have a footer-band (prev/next navigation),
 * pass the battle data via data attributes on the placeholder:
 *
 *   <div id="site-footer"
 *        data-prev-url="/battle-9.html"
 *        data-prev-title="When the Spirit Starves"
 *        data-prev-num="Battle 9"
 *        data-next-url="/battle-11.html"
 *        data-next-title="The Inner Saboteur"
 *        data-next-num="Battle 11"
 *        data-next-label="Stage IV →">
 *   </div>
 *
 * If none of the data-* attributes are present, no footer-band is rendered.
 * To update the footer for the entire site, edit this file only.
 */

(function () {
  'use strict';

  function buildFooterBand(el) {
    var prevUrl   = el.getAttribute('data-prev-url');
    var prevTitle = el.getAttribute('data-prev-title');
    var prevNum   = el.getAttribute('data-prev-num');
    var nextUrl   = el.getAttribute('data-next-url');
    var nextTitle = el.getAttribute('data-next-title');
    var nextNum   = el.getAttribute('data-next-num');
    var nextLabel = el.getAttribute('data-next-label') || 'Next →';

    if (!prevUrl && !nextUrl) return '';

    var prevCell = prevUrl
      ? `<a href="${prevUrl}" class="fband-cell">
           <span class="fbc-dir">← Previous</span>
           <span class="fbc-title">${prevTitle || ''}</span>
           <span class="fbc-num">${prevNum || ''}</span>
         </a>`
      : `<div class="fband-cell" aria-hidden="true"></div>`;

    var nextCell = nextUrl
      ? `<a href="${nextUrl}" class="fband-cell">
           <span class="fbc-dir">${nextLabel}</span>
           <span class="fbc-title">${nextTitle || ''}</span>
           <span class="fbc-num">${nextNum || ''}</span>
         </a>`
      : `<div class="fband-cell" aria-hidden="true"></div>`;

    return `
<nav class="footer-band" aria-label="Battle navigation">
  ${prevCell}
  <div class="fband-center">
    <span class="fbc-ctr-lbl">The Campaign</span>
    <a href="/all-battles.html" class="btn-sm">All 17 Battles</a>
  </div>
  ${nextCell}
</nav>`;
  }

  var FOOTER_HTML = `
<!-- ═════════════════════════════════════════════════
     FOOT STRIP — © left · links centre · legal right
═════════════════════════════════════════════════ -->
<footer class="foot-strip" aria-label="Site footer">

  <!-- Left: copyright -->
  <span class="foot-copy-left">© 2026 · TheWarWithin.you</span>

  <!-- Centre: site links -->
  <ul class="foot-links" aria-label="Site links">
    <li><a href="/start-here.html">Start Here</a></li>
    <li><a href="/all-battles.html">Campaign Map</a></li>
    <li><a href="/armory.html">Armoury</a></li>
    <li><a href="/about.html">The Architect</a></li>
    <li><a href="/war-letters.html">War Letters</a></li>
  </ul>

  <!-- Right: legal links -->
  <ul class="foot-legal" aria-label="Legal links">
    <li><a href="/privacy.html">Privacy Policy</a></li>
    <li><a href="/disclaimer.html">Disclaimer</a></li>
    <li><a href="/terms.html">Terms</a></li>
  </ul>

</footer>`;

  var placeholder = document.getElementById('site-footer');
  if (!placeholder) return;

  var band = buildFooterBand(placeholder);
  placeholder.outerHTML = band + FOOTER_HTML;

  // ── Highlight active footer link ───────────────────────────────
  var path = window.location.pathname;
  document.querySelectorAll('.foot-links a, .foot-legal a').forEach(function (a) {
    if (a.getAttribute('href') === path) {
      a.setAttribute('aria-current', 'page');
    }
  });

}());
