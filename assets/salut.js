/* ==========================================================================
   UT SALUT MANDALIKA JEPARA — Interaksi
   Vanilla JS, tanpa dependensi. Tidak mengubah konten apa pun.
   1. Bayangan header saat scroll      4. Tab
   2. Drawer menu mobile               5. Reveal saat di-scroll (halus)
   3. Akordeon FAQ                     6. Tombol kembali ke atas
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;

  /* Reveal hanya aktif bila JS berjalan — tanpa JS konten tetap terbaca */
  root.classList.add('js-reveal');

  /* ---------- 1. Header ---------- */
  var head = doc.querySelector('.site-head');
  if (head) {
    var onScrollHead = function () {
      head.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScrollHead();
    window.addEventListener('scroll', onScrollHead, { passive: true });
  }

  /* ---------- 2. Drawer mobile ---------- */
  var toggle = doc.querySelector('.nav-toggle');
  var drawer = doc.getElementById('menu-mobile');
  if (toggle && drawer) {
    var setDrawer = function (open) {
      drawer.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
      var icon = toggle.querySelector('i');
      if (icon) icon.className = open ? 'fas fa-xmark' : 'fas fa-bars';
    };

    toggle.addEventListener('click', function () {
      setDrawer(!drawer.classList.contains('is-open'));
    });

    /* Tutup saat pindah halaman / anchor dipilih */
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setDrawer(false); });
    });

    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        setDrawer(false);
        toggle.focus();
      }
    });

    /* Tutup bila layar diperbesar ke ukuran desktop */
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 980 && drawer.classList.contains('is-open')) setDrawer(false);
    });
  }

  /* ---------- 3. Akordeon FAQ ---------- */
  doc.querySelectorAll('.acc__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.acc__item');
      if (!item) return;
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ---------- 4. Tab ---------- */
  doc.querySelectorAll('[data-tab]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var name = btn.getAttribute('data-tab');
      var scope = btn.closest('.cta__panel, .cta, .tabs-wrap') || doc;

      scope.querySelectorAll('[data-tab]').forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
      });
      scope.querySelectorAll('[data-panel]').forEach(function (p) {
        p.classList.toggle('is-active', p.getAttribute('data-panel') === name);
      });
    });
  });

  /* ---------- 5. Reveal saat di-scroll ---------- */
  var reveals = doc.querySelectorAll('.reveal');
  if (reveals.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('is-in');
            io.unobserve(en.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: .05 });

      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add('is-in'); });
    }
  }

  /* ---------- 6. Tombol ke atas ---------- */
  var toTop = doc.querySelector('.to-top');
  if (toTop) {
    var onScrollTop = function () {
      toTop.classList.toggle('is-visible', window.scrollY > 480);
    };
    onScrollTop();
    window.addEventListener('scroll', onScrollTop, { passive: true });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 7. Tandai menu aktif ---------- */
  /* Hanya SATU tautan yang ditandai aktif. Tautan ke halaman lain (fakultas.html,
     gallery.html, dst.) lebih diprioritaskan daripada tautan anchor ke index. */
  var here = location.pathname.split('/').pop() || 'index.html';
  var hash = location.hash || '';
  var candidates = [];
  doc.querySelectorAll('.nav__link, .nav-drawer__link').forEach(function (a) {
    var raw = a.getAttribute('href') || '';
    var parts = raw.split('#');
    var path = parts[0];
    var frag = parts[1] ? '#' + parts[1] : '';
    if (!path && !frag) return;
    // Tautan dianggap cocok bila menunjuk halaman yang sama
    if (path && path !== here) return;
    if (!path && here !== 'index.html') return;
    candidates.push({ el: a, frag: frag, path: path });
  });

  // Pilih: hash saat ini → halaman utuh (tanpa fragmen) → fragment pertama
  var pick = candidates.filter(function (c) { return c.frag && c.frag === hash; })[0]
          || (hash === '' ? (candidates[0] || null) : null);

  // Bila halaman dalam (mis. fakultas.html) belum ada, pakai kandidat pertama
  if (!pick && candidates.length && here !== 'index.html') pick = candidates[0];

  candidates.forEach(function (c) {
    var on = c === pick;
    c.el.classList.toggle('is-active', on);
    if (on) { c.el.setAttribute('aria-current', 'page'); }
    else { c.el.removeAttribute('aria-current'); }
  });

  /* ---------- 8. Tahun berjalan di footer (bila ada penanda) ---------- */
  doc.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
