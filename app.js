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
