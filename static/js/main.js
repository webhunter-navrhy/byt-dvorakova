// Formulář: demo režim neodesílá nic, ostrý režim posílá na endpoint ze site.json (data-endpoint).
(function () {
  document.querySelectorAll('form.formular').forEach(function (f) {
    var stav = f.querySelector('.formular-stav');
    f.addEventListener('submit', function (e) {
      var endpoint = f.getAttribute('data-endpoint');
      var demo = f.getAttribute('data-demo') === '1';
      if (f.querySelector('.past input').value) { e.preventDefault(); return; }   // robot
      if (demo || !endpoint) {
        e.preventDefault();
        stav.textContent = 'Ukázka formuláře: nic se neodesílá. Po spuštění webu bude zpráva doručena na e-mail firmy.';
        return;
      }
      e.preventDefault();
      stav.textContent = 'Odesílám…';
      fetch(endpoint, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); f.reset(); stav.textContent = 'Děkujeme, zpráva byla odeslána.'; })
        .catch(function () { stav.textContent = 'Odeslání se nepodařilo. Napište nám prosím e-mailem.'; });
    });
  });
})();

// Půdorys: klik na místnost ukáže její fotky.
(function () {
  var mistnosti = document.querySelectorAll('.m[data-m]');
  var tlacitka = document.querySelectorAll('.plan-seznam button[data-m]');
  var panely = document.querySelectorAll('.mistnost[data-panel]');
  if (!panely.length) return;
  var uzky = window.matchMedia('(max-width: 1100px)');
  function ukaz(id, posun) {
    mistnosti.forEach(function (g) { var a = g.getAttribute('data-m') === id; g.classList.toggle('aktivni', a); g.setAttribute('aria-pressed', a ? 'true' : 'false'); });
    tlacitka.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-m') === id ? 'true' : 'false'); });
    var cil;
    panely.forEach(function (p) {
      var a = p.getAttribute('data-panel') === id;
      if (a) { cil = p; if (p.hidden) { p.hidden = false; p.classList.remove('vchazi'); void p.offsetWidth; p.classList.add('vchazi'); } }
      else p.hidden = true;
    });
    if (cil) { var g = cil.querySelector('.galerie'); if (g) g.scrollLeft = 0; }
    if (posun && cil && uzky.matches) cil.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }
  mistnosti.forEach(function (g) {
    g.addEventListener('click', function () { ukaz(g.getAttribute('data-m'), true); });
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ukaz(g.getAttribute('data-m'), true); } });
  });
  tlacitka.forEach(function (b) { b.addEventListener('click', function () { ukaz(b.getAttribute('data-m'), true); }); });
  ukaz(panely[0].getAttribute('data-panel'), false);
})();

// Šipky galerií.
(function () {
  document.querySelectorAll('.sipka').forEach(function (s) {
    s.addEventListener('click', function () {
      var g = s.closest('.mistnost').querySelector('.galerie');
      g.scrollBy({ left: Number(s.getAttribute('data-smer')) * g.clientWidth * 0.8, behavior: 'smooth' });
    });
  });
})();

// Lightbox.
(function () {
  var lb = document.querySelector('dialog.lb');
  if (!lb || !lb.showModal) return;
  var obr = lb.querySelector('.lb-img'), sada = [], i = 0;
  function nastav() { var b = sada[i]; obr.src = b.getAttribute('data-lb'); obr.alt = b.getAttribute('data-alt') || ''; }
  function posun(k) { i = (i + k + sada.length) % sada.length; nastav(); }
  document.querySelectorAll('.zvetsit[data-lb]').forEach(function (b) {
    b.addEventListener('click', function () {
      var g = b.closest('.galerie');
      sada = Array.prototype.slice.call((g || document).querySelectorAll(g ? '.zvetsit[data-lb]' : 'main .zvetsit[data-lb]:not(.galerie .zvetsit)'));
      if (sada.indexOf(b) < 0) sada = [b];
      i = sada.indexOf(b); nastav(); lb.showModal();
      var vic = sada.length > 1;
      lb.querySelector('.lb-pred').hidden = !vic; lb.querySelector('.lb-dal').hidden = !vic;
    });
  });
  lb.querySelector('.lb-x').addEventListener('click', function () { lb.close(); });
  lb.querySelector('.lb-pred').addEventListener('click', function () { posun(-1); });
  lb.querySelector('.lb-dal').addEventListener('click', function () { posun(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') posun(-1); if (e.key === 'ArrowRight') posun(1); });
  lb.addEventListener('close', function () { obr.removeAttribute('src'); });
})();

// Hlavička: po odjetí z fotky plná.
(function () {
  var h = document.querySelector('[data-hlavicka]'), hero = document.querySelector('.hero');
  if (!h) return;
  function stav() { var mez = hero ? hero.offsetHeight - h.offsetHeight - 10 : 40; h.classList.toggle('plna', window.scrollY > mez); }
  stav(); window.addEventListener('scroll', stav, { passive: true }); window.addEventListener('resize', stav);
})();

// Odhalení při scrollu.
(function () {
  var prvky = document.querySelectorAll('.odhal');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { prvky.forEach(function (p) { p.classList.add('vidno'); }); return; }
  var io = new IntersectionObserver(function (zaznamy) {
    zaznamy.forEach(function (z) { if (z.isIntersecting) { z.target.classList.add('vidno'); io.unobserve(z.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  prvky.forEach(function (p) { io.observe(p); });
})();
