/* proto-live.js – NUR lokaler Prototyp im Live-Schnappschuss (R1). Stand-in für das Kopf-Skript des Shops, das der
   Schnappschuss nicht enthält: ab 768 px erscheint beim Scrollen im festen Shop-Kopf zwischen Logo und Suche der Knopf
   „Kategorien“ (#categories-btn, wie live), sobald die Kategorie-Leiste #cat-w unter dem Kopf verschwunden ist; er öffnet
   die Kategorien als Schublade von links (live: nav#mh-menu). Im Shop liefert ETK2022 dieses Verhalten selbst – diese
   Datei geht nie in den JTL-Ausschnitt, die Übergabe oder page-include.html. Abweichung von live (bewusst): der Knopf ist
   per Tastatur bedienbar (live: <a> ohne href/tabindex). R2/H1: Überlauf der Kategorie-Leiste wie live („Alle“ + .nav-ovf-hidden). */
(function () {
  'use strict';
  var d = document, btn = d.getElementById('categories-btn'), bar = d.querySelector('body > #cat-w'), head = d.getElementById('shop-nav');   // die Leiste unter dem Kopf; ein zweites #cat-w gehört zum Mobil-Menü
  if (!btn || !bar || !head) return;
  var a = btn.querySelector('a'), mq = window.matchMedia('(min-width: 48rem)'), panel = null, isOpen = false, back = null, raf = 0;
  a.setAttribute('role', 'button'); a.setAttribute('tabindex', '0');
  a.setAttribute('aria-expanded', 'false'); a.setAttribute('aria-controls', 'pl-cat');

  function sync() {
    raf = 0;
    var show = mq.matches && bar.getBoundingClientRect().bottom <= head.getBoundingClientRect().bottom;
    btn.style.display = show ? 'block' : 'none';
    d.documentElement.classList.toggle('pl-hdr-btn', show);   // R1b: gleicher Abstand Logo → Knopf → Suche (proto-live.css)
    if (!show && isOpen) close();
  }
  function onScroll() { if (!raf) raf = requestAnimationFrame(sync); }

  function el(tag, cls, text) { var e = d.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
  function build() {
    panel = el('div', 'pl-cat'); panel.id = 'pl-cat';
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-label', 'Kategorien');
    var top = el('div', 'pl-cat__top'), logo = d.querySelector('#logo img'), x = el('button', 'pl-cat__x');
    if (logo) { var li = el('img'); li.src = logo.src; li.alt = 'Metzler'; top.appendChild(li); }
    x.type = 'button'; x.setAttribute('aria-label', 'Menü schließen');
    x.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    x.addEventListener('click', close); top.appendChild(x); panel.appendChild(top);
    var ul = el('ul', 'pl-cat__list');
    [].forEach.call(bar.querySelectorAll('#cat-ul > li > a'), function (l) {
      var row = el('li'), link = el('a'), pic = el('span', 'pl-cat__img'), im = l.querySelector('img'), name = l.querySelector('.col-7');
      link.href = l.href;
      if (im) { var i2 = el('img'); i2.src = im.getAttribute('data-mega-src') || im.src; i2.alt = ''; i2.loading = 'lazy'; pic.appendChild(i2); }
      link.appendChild(pic); link.appendChild(el('span', 'pl-cat__nm', (name || l).textContent.trim()));
      row.appendChild(link); ul.appendChild(row);
    });
    panel.appendChild(ul); d.body.appendChild(panel);
    var ov = d.getElementById('cls-catw'); if (ov) ov.addEventListener('click', close);
  }
  function open() {
    if (!panel) build();
    back = d.activeElement; isOpen = true;
    d.body.classList.add('shw-sb'); panel.classList.add('is-open'); a.setAttribute('aria-expanded', 'true');
    panel.querySelector('.pl-cat__x').focus();
  }
  function close() {
    if (!isOpen) return;
    isOpen = false; d.body.classList.remove('shw-sb'); panel.classList.remove('is-open'); a.setAttribute('aria-expanded', 'false');
    if (back && back.focus) back.focus();
  }
  a.addEventListener('click', function (e) { e.preventDefault(); if (isOpen) close(); else open(); });
  a.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  d.addEventListener('keydown', function (e) {
    if (!isOpen) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') {   // Fokus bleibt in der Schublade (aria-modal)
      var f = panel.querySelectorAll('button, a[href]'), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  /* R2/H1: Kategorie-Leiste wie live – passen die Einträge nicht in die Containerbreite (768–1100 px), erscheint vorn
     „Alle“ (li.all-categories) und jeder Eintrag jenseits der Inhaltskante bekommt .nav-ovf-hidden; „Alle“ öffnet die Schublade */
  var ul = bar.querySelector('#cat-ul'), all = ul && ul.querySelector('li.all-categories'), fitRaf = 0;
  function fit() {
    fitRaf = 0;
    if (!ul || !all) return;
    var items = [].filter.call(ul.children, function (li) { return li !== all; });
    items.forEach(function (li) { li.classList.remove('nav-ovf-hidden'); });
    all.hidden = true;
    if (!mq.matches) return;
    var box = ul.parentElement, edge = box.getBoundingClientRect().right - parseFloat(getComputedStyle(box).paddingRight);
    var over = function (li) { return li.getBoundingClientRect().right > edge + 1; };
    if (!items.some(over)) return;
    all.hidden = false;
    var cut = false;
    items.forEach(function (li) { if (cut || over(li)) { cut = true; li.classList.add('nav-ovf-hidden'); } });
  }
  if (all) {
    var allBtn = all.querySelector('button');
    if (allBtn) { allBtn.setAttribute('aria-controls', 'pl-cat'); allBtn.addEventListener('click', function (e) { e.preventDefault(); open(); }); }
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', function () { onScroll(); if (!fitRaf) fitRaf = requestAnimationFrame(fit); });
  sync();
  fit();
})();
