const API = 'https://tbe-mp-bb0eaace2ee0.herokuapp.com';

const form     = document.getElementById('contactForm');
const btn      = document.getElementById('submitBtn');
const btnText  = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');
const feedback = document.getElementById('formFeedback');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = document.getElementById('message').value.trim();
    if (!message) {
      showFeedback('error', 'Please enter a message before sending.');
      return;
    }

    const name  = document.getElementById('name').value.trim() || null;
    const email = document.getElementById('email').value.trim() || null;

    setLoading(true);
    feedback.hidden = true;

    try {
      const res = await fetch(`${API}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        showFeedback('success', "Thanks! We've received your message and will get back to you if you left an email.");
        form.reset();
      } else {
        const data = await res.json().catch(() => ({}));
        showFeedback('error', data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      showFeedback('error', 'Unable to send — please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  });
}

// Mobile nav: toggle the dropdown menu, and close it after a link is tapped.
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navLinks.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    })
  );
}

function setLoading(on) {
  btn.disabled   = on;
  btnText.hidden = on;
  btnSpinner.hidden = !on;
}

function showFeedback(type, text) {
  feedback.className = `form-feedback ${type}`;
  feedback.textContent = text;
  feedback.hidden = false;
}

// ─── Scroll-in animations (AOS) ──────────────────────────────────────────────
// Attributes are injected here so the markup stays lean; feature cards stagger
// by column. once:true = animate a single time, no re-trigger on scroll-up.
window.addEventListener('load', function () {
  if (!window.AOS) return;
  document
    .querySelectorAll('.section-title, .contact-card, .hero-badge, .hero-title, .hero-sub, .hero-actions')
    .forEach(function (el) { el.setAttribute('data-aos', 'fade-up'); });
  document.querySelectorAll('.feature-card').forEach(function (el, i) {
    el.setAttribute('data-aos', 'fade-up');
    el.setAttribute('data-aos-delay', String((i % 3) * 75));
  });
  AOS.init({ duration: 600, once: true, offset: 60 });
});

// ─── Stat strip count-up ─────────────────────────────────────────────────────
(function () {
  var stats = document.querySelectorAll('.stat-num[data-count]');
  if (!stats.length || !('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      var target = parseInt(en.target.getAttribute('data-count'), 10) || 0;
      var start = null;
      function tick(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / 900, 1);
        en.target.textContent = String(Math.round(target * (0.4 + 0.6 * p)));
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  stats.forEach(function (el) { io.observe(el); });
})();

// ─── Platform-aware store buttons ────────────────────────────────────────────
// On a phone, the visitor's own store is the only button that matters: put it
// first and let it dominate. Desktop (and anything ambiguous) keeps both.
(function () {
  var ua = navigator.userAgent || '';
  var isAndroid = /android/i.test(ua);
  // iPadOS 13+ reports as Mac — detect via touch points.
  var isIOS = /iphone|ipad|ipod/i.test(ua) ||
    (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
  if (!isAndroid && !isIOS) return;

  document.querySelectorAll('.hero-actions').forEach(function (wrap) {
    var buttons = wrap.querySelectorAll('.store-btn');
    buttons.forEach(function (btn) {
      var toPlay = /play\.google\.com/.test(btn.href);
      var mine = (isAndroid && toPlay) || (isIOS && !toPlay);
      if (mine) {
        wrap.prepend(btn);           // visitor's store first
        btn.classList.add('store-btn-primary');
      } else {
        btn.classList.add('store-btn-secondary');
      }
    });
  });
})();
