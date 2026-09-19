/* ==========================================================================
   ĐỒNG PHỤC Y TẾ QUỲNH CHÂU — main.js
   Progressive enhancement only. The page is fully readable and navigable
   with JavaScript disabled or failing: nothing here is required for layout.
   ========================================================================== */
(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  var VI = document.documentElement.lang === 'vi';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function t(vi, en) { return VI ? vi : en; }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ── Business facts ──────────────────────────────────────────────────
     Fill elements from site-config.js. Anything the owner has not supplied
     is REMOVED from the DOM rather than shown as a placeholder — a fake
     phone number is a real number belonging to somebody else.             */
  // Any config key may carry a "<key>_en" sibling used on the English page.
  function cfg(key) {
    if (!VI && CFG[key + '_en']) return CFG[key + '_en'];
    return CFG[key];
  }

  function applyConfig() {
    // data-cfg-text="phone" -> textContent
    $$('[data-cfg-text]').forEach(function (el) {
      var v = cfg(el.getAttribute('data-cfg-text'));
      if (v) { el.innerHTML = v; } else { el.textContent = ''; }
    });

    // data-cfg-href="tel:phone" / "zalo:zalo" / "mailto:email" / "url:facebook"
    $$('[data-cfg-href]').forEach(function (el) {
      var spec = el.getAttribute('data-cfg-href').split(':');
      var v = cfg(spec[1]);
      if (!v) return;
      var scheme = spec[0];
      if (scheme === 'tel') el.href = 'tel:' + v.replace(/[^\d+]/g, '');
      else if (scheme === 'zalo') el.href = 'https://zalo.me/' + encodeURIComponent(v);
      else if (scheme === 'mailto') el.href = 'mailto:' + v;
      else el.href = v;
    });

    // data-requires="phone zalo" -> remove element unless every key is set
    $$('[data-requires]').forEach(function (el) {
      var ok = el.getAttribute('data-requires').split(/\s+/).every(function (k) { return !!cfg(k); });
      if (!ok && el.parentNode) el.parentNode.removeChild(el);
    });

    // If no contact channel at all exists, say so plainly instead of showing an empty shell.
    var anyChannel = CFG.phone || CFG.zalo || CFG.email;
    var notice = $('#noContactNotice');
    if (notice && anyChannel) notice.parentNode.removeChild(notice);
  }

  /* ── Mobile navigation ── */
  function initNav() {
    var toggle = $('#navToggle'), menu = $('#navMenu');
    if (!toggle || !menu) return;

    var overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    function focusables() {
      return $$('a[href], button:not([disabled])', menu)
        .filter(function (el) { return el.offsetParent !== null; });
    }

    function open() {
      toggle.setAttribute('aria-expanded', 'true');
      menu.classList.add('active');
      overlay.classList.add('active');
      document.body.classList.add('no-scroll');
      var f = focusables(); if (f.length) f[0].focus();
      document.addEventListener('keydown', onKey);
    }

    function close(returnFocus) {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('active');
      overlay.classList.remove('active');
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', onKey);
      if (returnFocus) toggle.focus();
    }

    function onKey(e) {
      if (e.key === 'Escape') { close(true); return; }
      if (e.key !== 'Tab') return;
      var f = focusables(); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    toggle.addEventListener('click', function () {
      toggle.getAttribute('aria-expanded') === 'true' ? close(false) : open();
    });
    overlay.addEventListener('click', function () { close(false); });
    $$('.nav-link', menu).forEach(function (l) {
      l.addEventListener('click', function () { close(false); });
    });
    // Leaving the mobile breakpoint while open would strand the overlay
    window.matchMedia('(min-width: 861px)').addEventListener('change', function (e) {
      if (e.matches) close(false);
    });
  }

  /* ── Active nav link (IntersectionObserver, not a per-scroll offsetTop loop) ── */
  function initActiveNav() {
    var links = $$('.nav-link[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;

    var map = {};
    links.forEach(function (l) { map[l.getAttribute('href').slice(1)] = l; });
    var sections = Object.keys(map)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
    if (!sections.length) return;

    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
      var current = sections.filter(function (s) { return visible[s.id]; })[0];
      links.forEach(function (l) { l.removeAttribute('aria-current'); });
      if (current && map[current.id]) map[current.id].setAttribute('aria-current', 'true');
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { io.observe(s); });
  }

  /* ── Language switcher: keep the reader where they are ── */
  function initLangLinks() {
    $$('.lang-btn').forEach(function (a) {
      a.addEventListener('click', function () {
        if (location.hash) a.href = a.getAttribute('href').split('#')[0] + location.hash;
      });
    });
  }

  /* ── Product filter: one attribute toggle, no inline styles, no racing timers ── */
  function initProductFilter() {
    var btns = $$('.filter-btn');
    var cards = $$('.product-card');
    var status = $('#productCount');
    if (!btns.length || !cards.length) return;

    function apply(filter) {
      var shown = 0;
      cards.forEach(function (card) {
        var match = filter === 'all' || card.getAttribute('data-category') === filter;
        card.hidden = !match;
        if (match) shown++;
      });
      if (status) {
        status.textContent = t('Hiển thị ' + shown + ' sản phẩm', 'Showing ' + shown + ' products');
      }
    }

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        apply(btn.getAttribute('data-filter'));
      });
    });
    apply('all');
  }

  /* ── Product card CTA carries the product through to the form ── */
  function initServicePrefill() {
    $$('.product-link[data-service]').forEach(function (link) {
      link.addEventListener('click', function () {
        var sel = $('#service');
        if (!sel) return;
        var val = link.getAttribute('data-service');
        if ([].some.call(sel.options, function (o) { return o.value === val; })) {
          sel.value = val;
        }
        var name = $('#name');
        if (name) setTimeout(function () { name.focus({ preventScroll: true }); }, 400);
      });
    });
  }

  /* ── Broken hotlinked photos degrade to a branded tile (delegated, CSP-safe) ── */
  function initImageFallback() {
    document.addEventListener('error', function (e) {
      var img = e.target;
      if (!img || img.tagName !== 'IMG') return;
      var box = img.closest('.media');
      if (box) box.classList.add('img-failed');
    }, true);
  }

  /* ── Scroll reveal ── */
  function initReveal() {
    var els = $$('.reveal');
    if (!els.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('visible');
        io.unobserve(en.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });

    // Last-resort guard: if the observer never fires (odd webviews, restored
    // bfcache pages), show everything rather than leave the page blank.
    setTimeout(function () {
      els.forEach(function (el) { el.classList.add('visible'); });
      io.disconnect();
    }, 2500);
  }

  /* ── Back to top ── */
  function initBackToTop() {
    var btn = $('#backToTop');
    if (!btn) return;
    var ticking = false;
    function update() { btn.hidden = window.scrollY < 600; ticking = false; }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    update();
  }

  /* ── Quote form ──────────────────────────────────────────────────────
     Rules: never claim success without a 2xx from the endpoint; never
     destroy the form node; errors get text + icon, not colour alone.     */
  function initForm() {
    var form = $('#contactForm');
    if (!form) return;

    var errBox = $('#formError');
    var okBox = $('#formSuccess');
    var keyInput = $('#accessKey');
    var submitBtn = form.querySelector('button[type="submit"]');
    var configured = !!CFG.formAccessKey;

    if (configured && keyInput) keyInput.value = CFG.formAccessKey;
    else form.removeAttribute('action');   // no endpoint => no silent POST into the void

    function showNotice(box, html) {
      [errBox, okBox].forEach(function (b) { if (b) b.hidden = true; });
      if (!box) return;
      if (html) box.querySelector('[data-slot]').innerHTML = html;
      box.hidden = false;
      box.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      box.focus();
    }

    function setError(field, msg) {
      var box = document.getElementById(field.id + '-error');
      if (msg) {
        field.setAttribute('aria-invalid', 'true');
        if (box) box.textContent = msg;
      } else {
        field.removeAttribute('aria-invalid');
        if (box) box.textContent = '';
      }
    }

    function validate() {
      var ok = true, firstBad = null;
      [['name', t('Vui lòng nhập họ và tên.', 'Please enter your name.')],
       ['phone', t('Vui lòng nhập số điện thoại.', 'Please enter your phone number.')],
       ['service', t('Vui lòng chọn loại đồng phục.', 'Please choose a uniform type.')]
      ].forEach(function (pair) {
        var f = document.getElementById(pair[0]);
        if (!f) return;
        if (!f.value.trim()) { setError(f, pair[1]); ok = false; firstBad = firstBad || f; }
        else setError(f, '');
      });

      var phone = $('#phone');
      if (phone && phone.value.trim() && !/^[0-9+\-\s().]{8,20}$/.test(phone.value.trim())) {
        setError(phone, t('Số điện thoại không hợp lệ.', 'That phone number does not look valid.'));
        ok = false; firstBad = firstBad || phone;
      }
      if (firstBad) firstBad.focus();
      return ok;
    }

    form.addEventListener('submit', function (e) {
      // Not configured: refuse honestly and hand the visitor a channel that works.
      if (!configured) {
        e.preventDefault();
        showNotice(errBox, t(
          'Biểu mẫu chưa được kích hoạt nên yêu cầu của bạn <strong>chưa được gửi đi</strong>. ' +
          'Vui lòng liên hệ trực tiếp với chúng tôi qua các kênh bên dưới.',
          'The form is not activated yet, so your request <strong>has not been sent</strong>. ' +
          'Please contact us directly using the options below.'));
        return;
      }
      if (!validate()) { e.preventDefault(); return; }
      if (!window.fetch) return;   // let the native POST happen

      e.preventDefault();
      var original = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.textContent = t('Đang gửi…', 'Sending…');

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok || res.j.success === false) throw new Error('rejected');
          form.reset();
          showNotice(okBox);
        })
        .catch(function () {
          showNotice(errBox, t(
            'Rất tiếc, yêu cầu <strong>chưa gửi được</strong>. Vui lòng thử lại hoặc liên hệ trực tiếp:',
            'Sorry — your request <strong>was not sent</strong>. Please try again or contact us directly:'));
        })
        .then(function () {
          submitBtn.disabled = false;
          submitBtn.innerHTML = original;
        });
    });

    // Clear an error as soon as the visitor starts fixing it
    $$('input, select, textarea', form).forEach(function (f) {
      f.addEventListener('input', function () { setError(f, ''); });
      f.addEventListener('change', function () { setError(f, ''); });
    });

    var again = $('#sendAnother');
    if (again) again.addEventListener('click', function () {
      if (okBox) okBox.hidden = true;
      var n = $('#name'); if (n) n.focus();
    });
  }

  function init() {
    applyConfig();
    initNav();
    initActiveNav();
    initLangLinks();
    initProductFilter();
    initServicePrefill();
    initImageFallback();
    initReveal();
    initBackToTop();
    initForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
