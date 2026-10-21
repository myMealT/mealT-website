// Home page behaviour: mobile menu, platform-aware store links, sticky download
// bar, and regional pricing.

var APP_STORE  = 'https://apps.apple.com/app/id6786082730';
var PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.et.mymealt';

// ─── Prices per region ───────────────────────────────────────────────────────
// Starting prices per region: the lowest plan each tier offers (Plus weekly,
// Gold monthly), from the App Store listings checked 2026-10-21. The final
// price depends on the store and local taxes, which the fine print says.
// Canada's Plus figure is the lowest price Google Play lists there (the iOS app
// isn't on the Canadian App Store yet); its Gold price isn't public, so null
// shows "Price shown in the app".
var PRICES = {
  US: { free: '$0',   plus: '$1.49',   gold: '$9.99' },
  IN: { free: '₹0',   plus: '₹99',     gold: '₹799' },
  CA: { free: 'CA$0', plus: 'CA$2.09', gold: null }
};

// ─── Mobile menu ─────────────────────────────────────────────────────────────
(function () {
  var toggle = document.querySelector('.burger');
  var links  = document.getElementById('navLinks');
  if (!toggle || !links) return;
  function set(open) {
    links.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  toggle.addEventListener('click', function () { set(!links.classList.contains('open')); });
  links.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
})();

// ─── Platform-aware store links ──────────────────────────────────────────────
// On a phone, the visitor's own store goes first and the sticky bar opens it
// directly. Desktop keeps both buttons and the QR code.
var platform = (function () {
  var ua = navigator.userAgent || '';
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  return null;
})();

(function () {
  if (!platform) return;
  document.querySelectorAll('.stores').forEach(function (wrap) {
    var mine = wrap.querySelector(platform === 'ios' ? '.store-ios' : '.store-play');
    if (mine) wrap.prepend(mine);
  });
  var cta = document.getElementById('stickyCta');
  var label = document.getElementById('stickyStore');
  if (cta) {
    cta.href = platform === 'ios' ? APP_STORE : PLAY_STORE;
    cta.target = '_blank';
    cta.rel = 'noopener';
  }
  if (label) label.textContent = platform === 'ios' ? 'Free on the App Store' : 'Free on Google Play';
})();

// Hide the sticky bar while store buttons are already on screen.
(function () {
  var bar = document.getElementById('stickyBar');
  if (!bar || !('IntersectionObserver' in window)) return;
  var visible = new Set();
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { en.isIntersecting ? visible.add(en.target) : visible.delete(en.target); });
    bar.classList.toggle('hidden', visible.size > 0);
  });
  document.querySelectorAll('.stores').forEach(function (el) { io.observe(el); });
})();

// ─── Regional pricing ────────────────────────────────────────────────────────
(function () {
  var buttons = document.querySelectorAll('.region button');
  if (!buttons.length) return;

  function guessRegion() {
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    if (/^Asia\/(Kolkata|Calcutta)$/.test(tz)) return 'IN';
    if (/^America\/(Toronto|Vancouver|Edmonton|Winnipeg|Halifax|St_Johns|Regina|Moncton|Whitehorse|Yellowknife|Iqaluit|Glace_Bay|Goose_Bay|Swift_Current|Dawson_Creek|Fort_Nelson|Rankin_Inlet|Resolute|Cambridge_Bay|Inuvik|Atikokan|Blanc-Sablon|Creston|Dawson)$/.test(tz)) return 'CA';
    var lang = (navigator.language || '').toUpperCase();
    if (/-IN$/.test(lang)) return 'IN';
    if (/-CA$/.test(lang)) return 'CA';
    return 'US';
  }

  function slot(name) { return document.querySelector('[data-price="' + name + '"]'); }

  function setFrom(el, amount, per) {
    if (amount) {
      el.className = 'price';
      el.innerHTML = '<small>From </small>' + amount + '<small> / ' + per + '</small>';
    } else {
      el.className = 'price local';
      el.textContent = 'Price shown in the app';
    }
  }

  function render(region) {
    var p = PRICES[region];
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.region === region ? 'true' : 'false'); });
    slot('free').textContent = p.free;
    setFrom(slot('plus-month'), p.plus, 'week');
    setFrom(slot('gold-month'), p.gold, 'month');
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () { render(b.dataset.region); });
  });
  render(guessRegion());
})();
