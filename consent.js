/**
 * THE WAR WITHIN — consent.js
 * Cookie consent and privacy compliance for:
 *   - GDPR (EU General Data Protection Regulation)
 *   - Nigeria Data Protection Regulation (NDPR) / Nigeria Data Protection Act (NDPA) 2023
 *
 * What this does:
 *   1. On first visit, shows a consent banner explaining cookies and data use.
 *   2. User can Accept All, Reject Non-Essential, or open Manage Preferences.
 *   3. Consent choice is stored in localStorage for 180 days.
 *   4. Google Analytics (GA4) and Microsoft Clarity are blocked until the user
 *      consents to analytics cookies. They are loaded dynamically on consent.
 *   5. A floating "Cookie Preferences" link is added to the footer for users
 *      who want to change their choice at any time.
 *   6. Exposes window.TWW_CONSENT for other scripts to check consent status.
 *
 * Usage: <script src="/consent.js"></script>
 *   Place BEFORE the GA/Clarity script tags (or remove those tags entirely
 *   and let this file load them conditionally — the recommended approach).
 *
 * Required: remove the GA4 + Clarity <script> tags from individual pages.
 *   This file handles loading them based on consent.
 */

(function () {
  'use strict';

  // ── Configuration ─────────────────────────────────────────────
  var CONFIG = {
    GA_ID:          'G-39E56ELNQ5',
    CLARITY_ID:     'x5hzkv6naq',
    STORAGE_KEY:    'tww_consent_v1',
    EXPIRY_DAYS:    180,
    COOKIE_POLICY_URL: '/privacy.html#cookies'
  };

  // ── Consent state ─────────────────────────────────────────────
  var consent = {
    necessary: true,   // always true — can't opt out
    analytics: false,
    timestamp: null,
    version: '1'
  };

  // ── Expose to window ─────────────────────────────────────────
  window.TWW_CONSENT = {
    get: function () { return consent; },
    hasAnalytics: function () { return consent.analytics; }
  };

  // ── Helpers ───────────────────────────────────────────────────
  function saveConsent() {
    consent.timestamp = Date.now();
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(consent));
    } catch (e) {}
  }

  function loadConsent() {
    try {
      var raw = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (!raw) return null;
      var saved = JSON.parse(raw);
      if (!saved.timestamp) return null;
      var age = (Date.now() - saved.timestamp) / (1000 * 60 * 60 * 24);
      if (age > CONFIG.EXPIRY_DAYS) { localStorage.removeItem(CONFIG.STORAGE_KEY); return null; }
      return saved;
    } catch (e) { return null; }
  }

  function loadGA() {
    if (window._tww_ga_loaded) return;
    window._tww_ga_loaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + CONFIG.GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', CONFIG.GA_ID, {
      page_path: window.location.pathname,
      anonymize_ip: true,
      send_page_view: true
    });
  }

  function loadClarity() {
    if (window._tww_clarity_loaded) return;
    window._tww_clarity_loaded = true;
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window,document,'clarity','script',CONFIG.CLARITY_ID);
  }

  function activateAnalytics() {
    if (consent.analytics) {
      loadGA();
      loadClarity();
    }
  }

  function applyConsent(choice) {
    consent.analytics  = choice.analytics;
    consent.necessary  = true;
    consent.timestamp  = Date.now();
    consent.version    = '1';
    saveConsent();
    activateAnalytics();
    hideBanner();
    updatePrefToggle();
  }

  function acceptAll() {
    applyConsent({ analytics: true });
  }

  function rejectNonEssential() {
    applyConsent({ analytics: false });
    // Opt out GA if already loaded
    if (window.gtag) {
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }
  }

  // ── Banner ────────────────────────────────────────────────────
  function showBanner() {
    var banner = document.getElementById('tww-consent-banner');
    if (banner) { banner.classList.add('visible'); return; }

    var html = `
<div id="tww-consent-banner" class="tww-cb" role="dialog" aria-modal="true" aria-label="Cookie preferences" aria-live="polite">
  <div class="tww-cb-inner">
    <div class="tww-cb-body">
      <p class="tww-cb-title">Your Privacy Matters</p>
      <p class="tww-cb-text">
        This site uses cookies and similar technologies for essential operation and — with your permission — analytics
        (Google Analytics, Microsoft Clarity) to understand how combatants engage the campaign. We comply with
        <strong>GDPR</strong> and <strong>Nigeria's Data Protection Act (NDPA 2023)</strong>.
        No data is sold. No profiling for advertising.
        <a href="${CONFIG.COOKIE_POLICY_URL}" target="_blank" rel="noopener">Cookie policy →</a>
      </p>
    </div>
    <div class="tww-cb-actions">
      <button id="tww-reject-btn"  class="tww-cb-btn tww-cb-btn--ghost">Necessary Only</button>
      <button id="tww-manage-btn"  class="tww-cb-btn tww-cb-btn--ghost">Manage</button>
      <button id="tww-accept-btn"  class="tww-cb-btn tww-cb-btn--gold">Accept All</button>
    </div>
  </div>
</div>

<div id="tww-pref-panel" class="tww-pp" role="dialog" aria-modal="true" aria-label="Manage cookie preferences" hidden>
  <div class="tww-pp-inner">
    <div class="tww-pp-header">
      <p class="tww-pp-title">Manage Preferences</p>
      <button id="tww-pp-close" class="tww-pp-close" aria-label="Close preferences panel">✕</button>
    </div>
    <div class="tww-pp-body">

      <div class="tww-pp-row">
        <div class="tww-pp-info">
          <p class="tww-pp-cat">Necessary Cookies</p>
          <p class="tww-pp-desc">Required for the site to function. Cannot be disabled.</p>
        </div>
        <div class="tww-pp-toggle tww-pp-toggle--locked" aria-label="Always enabled">On</div>
      </div>

      <div class="tww-pp-row">
        <div class="tww-pp-info">
          <p class="tww-pp-cat">Analytics Cookies</p>
          <p class="tww-pp-desc">Google Analytics 4 and Microsoft Clarity help us understand how visitors engage the campaign. Data is anonymised (IP anonymisation enabled). We do not use this data for advertising.</p>
        </div>
        <label class="tww-pp-toggle" aria-label="Toggle analytics cookies">
          <input type="checkbox" id="tww-analytics-toggle" ${consent.analytics ? 'checked' : ''}>
          <span class="tww-pp-slider"></span>
        </label>
      </div>

      <div class="tww-pp-legal">
        <p>This site is operated from Lagos, Nigeria and serves a global audience. We comply with the <strong>Nigeria Data Protection Act 2023 (NDPA)</strong>, the <strong>Nigeria Data Protection Regulation (NDPR 2019)</strong>, and the <strong>EU General Data Protection Regulation (GDPR)</strong>. You have the right to access, rectify, or erase your personal data. Contact: <a href="mailto:info@techspibus.com">info@techspibus.com</a></p>
      </div>
    </div>
    <div class="tww-pp-footer">
      <button id="tww-pp-save" class="tww-cb-btn tww-cb-btn--gold">Save Preferences</button>
    </div>
  </div>
</div>`;

    document.body.insertAdjacentHTML('beforeend', html);
    injectCSS();
    wireEvents();

    // Slight delay so CSS transition plays
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var b = document.getElementById('tww-consent-banner');
        if (b) b.classList.add('visible');
      });
    });
  }

  function hideBanner() {
    var b = document.getElementById('tww-consent-banner');
    if (b) { b.classList.remove('visible'); setTimeout(function () { b.remove(); }, 400); }
    var pp = document.getElementById('tww-pref-panel');
    if (pp) { pp.hidden = true; }
  }

  function wireEvents() {
    var acceptBtn = document.getElementById('tww-accept-btn');
    var rejectBtn = document.getElementById('tww-reject-btn');
    var manageBtn = document.getElementById('tww-manage-btn');
    var ppClose   = document.getElementById('tww-pp-close');
    var ppSave    = document.getElementById('tww-pp-save');

    if (acceptBtn) acceptBtn.addEventListener('click', acceptAll);
    if (rejectBtn) rejectBtn.addEventListener('click', rejectNonEssential);
    if (manageBtn) manageBtn.addEventListener('click', function () {
      var pp = document.getElementById('tww-pref-panel');
      if (pp) { pp.hidden = false; pp.querySelector('button, input').focus(); }
    });
    if (ppClose) ppClose.addEventListener('click', function () {
      var pp = document.getElementById('tww-pref-panel');
      if (pp) pp.hidden = true;
    });
    if (ppSave) ppSave.addEventListener('click', function () {
      var toggle = document.getElementById('tww-analytics-toggle');
      applyConsent({ analytics: toggle ? toggle.checked : false });
    });
  }

  // ── Floating "Cookie Preferences" link ───────────────────────
  function updatePrefToggle() {
    var existing = document.getElementById('tww-pref-link');
    if (existing) return;
    var link = document.createElement('button');
    link.id = 'tww-pref-link';
    link.className = 'tww-pref-link';
    link.textContent = 'Cookie Preferences';
    link.setAttribute('aria-label', 'Open cookie preferences');
    link.addEventListener('click', function () {
      var pp = document.getElementById('tww-pref-panel');
      if (!pp) { showBanner(); return; }
      var tog = document.getElementById('tww-analytics-toggle');
      if (tog) tog.checked = consent.analytics;
      pp.hidden = false;
    });
    document.body.appendChild(link);
  }

  // ── CSS ───────────────────────────────────────────────────────
  function injectCSS() {
    if (document.getElementById('tww-consent-css')) return;
    var style = document.createElement('style');
    style.id = 'tww-consent-css';
    style.textContent = `
/* TWW CONSENT BANNER */
.tww-cb {
  position:fixed; bottom:0; left:0; right:0; z-index:9000;
  background:rgba(19,7,5,0.97); border-top:1px solid rgba(139,26,26,.5);
  backdrop-filter:blur(16px);
  transform:translateY(100%); transition:transform .38s cubic-bezier(.4,0,.2,1);
  font-family:'Crimson Pro',Georgia,serif;
}
.tww-cb.visible { transform:translateY(0); }
.tww-cb-inner {
  max-width:1260px; margin:0 auto; padding:20px 48px;
  display:flex; align-items:center; justify-content:space-between; gap:32px; flex-wrap:wrap;
}
.tww-cb-body { flex:1; min-width:260px; }
.tww-cb-title {
  font-family:'Cinzel',serif; font-size:10px; letter-spacing:.28em;
  color:#D4A017; text-transform:uppercase; margin-bottom:6px;
}
.tww-cb-text { font-size:15px; color:rgba(242,237,228,0.7); line-height:1.6; }
.tww-cb-text strong { color:#F2EDE4; }
.tww-cb-text a { color:#B8922A; text-decoration:none; border-bottom:1px solid rgba(184,146,42,.3); }
.tww-cb-text a:hover { color:#D4A017; }
.tww-cb-actions { display:flex; gap:10px; flex-wrap:wrap; flex-shrink:0; align-items:center; }
.tww-cb-btn {
  font-family:'Cinzel',serif; font-size:9px; letter-spacing:.22em;
  text-transform:uppercase; border:none; cursor:pointer; padding:10px 20px;
  transition:all .22s; white-space:nowrap;
}
.tww-cb-btn--gold { background:#D4A017; color:#0E0806; }
.tww-cb-btn--gold:hover { background:#FFD700; }
.tww-cb-btn--ghost { background:transparent; color:rgba(242,237,228,0.55); border:1px solid rgba(139,26,26,.45); }
.tww-cb-btn--ghost:hover { color:#F2EDE4; border-color:rgba(212,160,23,.5); }

/* TWW PREFERENCES PANEL */
.tww-pp {
  position:fixed; inset:0; z-index:9100;
  background:rgba(14,8,6,0.85); backdrop-filter:blur(8px);
  display:flex; align-items:center; justify-content:center; padding:24px;
}
.tww-pp[hidden] { display:none; }
.tww-pp-inner {
  background:#130705; border:1px solid rgba(139,26,26,.5);
  max-width:560px; width:100%;
  max-height:90vh; overflow-y:auto;
  display:flex; flex-direction:column;
}
.tww-pp-header {
  display:flex; align-items:center; justify-content:space-between;
  padding:20px 28px; border-bottom:1px solid rgba(139,26,26,.3); flex-shrink:0;
}
.tww-pp-title { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.28em; color:#D4A017; text-transform:uppercase; }
.tww-pp-close { background:none; border:1px solid rgba(139,26,26,.4); color:rgba(242,237,228,.55); cursor:pointer; width:30px; height:30px; font-size:14px; transition:all .2s; }
.tww-pp-close:hover { border-color:#D4A017; color:#D4A017; }
.tww-pp-body { padding:24px 28px; flex:1; }
.tww-pp-row { display:flex; align-items:center; gap:20px; padding:18px 0; border-bottom:1px solid rgba(139,26,26,.18); }
.tww-pp-row:last-of-type { border-bottom:none; }
.tww-pp-info { flex:1; }
.tww-pp-cat { font-family:'Cinzel',serif; font-size:9px; letter-spacing:.22em; color:#F2EDE4; text-transform:uppercase; margin-bottom:6px; }
.tww-pp-desc { font-size:14px; color:rgba(242,237,228,0.55); line-height:1.55; }
.tww-pp-legal { margin-top:20px; padding-top:16px; border-top:1px solid rgba(139,26,26,.25); font-size:13px; color:rgba(242,237,228,0.4); line-height:1.6; }
.tww-pp-legal strong { color:rgba(242,237,228,.65); }
.tww-pp-legal a { color:#B8922A; text-decoration:none; }

/* Toggle switch */
.tww-pp-toggle {
  flex-shrink:0; position:relative; display:inline-flex;
  align-items:center; cursor:pointer; user-select:none;
}
.tww-pp-toggle input { position:absolute; opacity:0; width:0; height:0; }
.tww-pp-slider {
  width:42px; height:24px; background:rgba(139,26,26,.4); border:1px solid rgba(139,26,26,.5);
  transition:background .25s; display:block; position:relative; border-radius:0;
}
.tww-pp-slider::after {
  content:''; position:absolute; top:3px; left:3px;
  width:16px; height:16px; background:rgba(242,237,228,0.3);
  transition:transform .25s, background .25s;
}
.tww-pp-toggle input:checked + .tww-pp-slider { background:rgba(212,160,23,.25); border-color:#D4A017; }
.tww-pp-toggle input:checked + .tww-pp-slider::after { transform:translateX(18px); background:#D4A017; }
.tww-pp-toggle--locked {
  font-family:'Cinzel',serif; font-size:8px; letter-spacing:.2em;
  color:#D4A017; text-transform:uppercase; border:1px solid rgba(212,160,23,.35);
  padding:4px 10px; cursor:default;
}
.tww-pp-footer {
  padding:20px 28px; border-top:1px solid rgba(139,26,26,.3); flex-shrink:0; text-align:right;
}

/* Floating preferences button */
.tww-pref-link {
  position:fixed; bottom:16px; left:16px; z-index:8000;
  font-family:'Cinzel',serif; font-size:8px; letter-spacing:.2em;
  text-transform:uppercase; color:rgba(242,237,228,0.25);
  background:none; border:1px solid rgba(139,26,26,.25);
  padding:6px 12px; cursor:pointer; transition:all .25s;
}
.tww-pref-link:hover { color:rgba(242,237,228,0.7); border-color:rgba(212,160,23,.35); }

@media(max-width:760px) {
  .tww-cb-inner { padding:16px 20px; flex-direction:column; align-items:flex-start; gap:16px; }
  .tww-cb-actions { width:100%; justify-content:flex-end; }
  .tww-pp-inner { max-height:95vh; }
  .tww-pp-row { flex-direction:column; align-items:flex-start; gap:12px; }
}
`;
    document.head.appendChild(style);
  }

  // ── Init ──────────────────────────────────────────────────────
  function init() {
    var saved = loadConsent();

    if (saved) {
      // User has already consented — apply silently
      consent.analytics = saved.analytics;
      consent.necessary = true;
      activateAnalytics();
      updatePrefToggle();
    } else {
      // First visit or expired — show banner
      // Slight delay to avoid blocking page render
      setTimeout(showBanner, 800);
    }
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
