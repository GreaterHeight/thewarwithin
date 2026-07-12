/**
 * THE WAR WITHIN — nav.js
 * Injects the shared site navigation (top nav + mobile drawer) into every page.
 * Usage: place <div id="site-nav"></div> at the top of <body>, then:
 *   <script src="/nav.js"></script>
 *
 * To update the nav for the entire site, edit this file only.
 */

(function () {
  'use strict';

  var NAV_HTML = `
<!-- ═════════════════════════════════════════════════
     READING PROGRESS BAR
═════════════════════════════════════════════════ -->
<div class="reading-bar" aria-hidden="true">
  <div class="reading-bar-fill" id="rFill"></div>
</div>

<!-- ═════════════════════════════════════════════════
     MAIN NAVIGATION
═════════════════════════════════════════════════ -->
<nav class="b-nav" id="bNav" aria-label="Main navigation">

  <a href="/" class="b-nav-brand">
    <img src="/logo.png" alt="The War Within — 17 Battles, One Mission" class="nav-logo-img">
  </a>

  <!-- Central site-wide links -->
  <ul class="b-nav-center" aria-label="Site navigation">
    <li><a href="/start-here.html">Start</a></li>
    <li><a href="/join-the-movement.html">Join The Movement</a></li>
    <li><a href="/all-battles.html">Campaign Map</a></li>
    <li><a href="/armory.html">Resources</a></li>
    <li><a href="/about.html">About</a></li>
  </ul>

  <!-- Right: Order Now (desktop) + hamburger (mobile) -->
  <ul class="b-nav-links">
    <li><a href="/order.html" class="nav-order">Order Now</a></li>
  </ul>

  <button class="b-nav-menu-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false">
    <span></span>
    <span></span>
    <span></span>
  </button>

</nav>

<!-- ═════════════════════════════════════════════════
     DRAWER OVERLAY
═════════════════════════════════════════════════ -->
<div class="drawer-overlay" id="drawerOverlay"></div>

<!-- ═════════════════════════════════════════════════
     MOBILE NAVIGATION DRAWER
═════════════════════════════════════════════════ -->
<aside class="mobile-drawer" id="mobileDrawer" aria-hidden="true">

  <div class="drawer-header">
    <a href="/" class="drawer-brand">
      <img src="/logo.png" alt="The War Within — 17 Battles, One Mission" class="drawer-logo-img">
    </a>
    <button class="drawer-close" id="drawerClose" aria-label="Close menu"></button>
  </div>

  <nav class="drawer-nav" aria-label="Mobile navigation">
    <span class="drawer-nav-label">Navigation</span>
    <a href="/start-here.html">Start</a>
    <a href="/join-the-movement.html">Join The Movement</a>
    <a href="/armory.html">Resources</a>
    <a href="/about.html">About</a>
    <span class="drawer-nav-label" style="margin-top:8px;">Campaign</span>
    <a href="/all-battles.html">Campaign Map</a>
    <a href="/battle-1.html">Battle 1</a>
    <a href="/war-letters.html">War Letters</a>
  </nav>

  <div class="drawer-cta-wrap">
    <a href="/order.html" class="drawer-cta">Order Now</a>
  </div>

</aside>
`;

  // Inject HTML
  var placeholder = document.getElementById('site-nav');
  if (placeholder) {
    placeholder.outerHTML = NAV_HTML;
  } else {
    // Fallback: prepend to body if placeholder missing
    document.body.insertAdjacentHTML('afterbegin', NAV_HTML);
  }

  // ── Highlight active nav link ──────────────────────────────────
  var path = window.location.pathname;
  document.querySelectorAll('.b-nav-center a, .drawer-nav a').forEach(function (a) {
    if (a.getAttribute('href') === path ||
        (path !== '/' && path.startsWith(a.getAttribute('href').replace('.html', '')))) {
      a.setAttribute('aria-current', 'page');
      a.style.color = 'var(--edge)';
    }
  });

  // ── Reading progress bar ──────────────────────────────────────
  var rFill = document.getElementById('rFill');
  if (rFill) {
    window.addEventListener('scroll', function () {
      var pct = document.documentElement.scrollTop /
        (document.documentElement.scrollHeight - window.innerHeight) * 100;
      rFill.style.width = Math.min(pct, 100) + '%';
    }, { passive: true });
  }

  // ── Nav scroll state ──────────────────────────────────────────
  var bNav = document.getElementById('bNav');
  if (bNav) {
    window.addEventListener('scroll', function () {
      bNav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // ── Mobile drawer ─────────────────────────────────────────────
  var menuBtn       = document.getElementById('menuBtn');
  var mobileDrawer  = document.getElementById('mobileDrawer');
  var drawerOverlay = document.getElementById('drawerOverlay');
  var drawerClose   = document.getElementById('drawerClose');

  if (!menuBtn || !mobileDrawer) return;

  function openDrawer() {
    mobileDrawer.classList.add('open');
    drawerOverlay.classList.add('visible');
    menuBtn.classList.add('open');
    menuBtn.setAttribute('aria-expanded', 'true');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    mobileDrawer.classList.remove('open');
    drawerOverlay.classList.remove('visible');
    menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', function () {
    mobileDrawer.classList.contains('open') ? closeDrawer() : openDrawer();
  });

  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) closeDrawer();
  });

  // Close when any drawer link is tapped
  mobileDrawer.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeDrawer);
  });

}());
