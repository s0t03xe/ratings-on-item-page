(function () {
  'use strict';

  var A = 'assets/';
  var SHARED_FLOW = {
    revHeader: { src: A + 'revHeader.png', h: 136, back: { x: 4, y: 34, w: 52, h: 52 } },
    revBody:   { src: A + 'revBody.png',   h: 1612, how: { x: 0, y: 232, w: 227, h: 44 } },
    revBottom: { src: A + 'revBottom.png', h: 128 },
    sheetHead: { src: A + 'sheetHeader.png', h: 56, close: { x: 327, y: 8, w: 40, h: 40 } },
    sheetBody: { src: A + 'sheetBody.png',  h: 854 }
  };

  var NAV = { src: A + 'nav.png', h: 86 };
  var BOTTOM = { src: A + 'bottom.png', h: 128 };

  function item(body, bodyH, extra) {
    var o = { body: A + body, bodyH: bodyH, nav: NAV, bottom: BOTTOM, height: 812 };
    for (var k in extra) o[k] = extra[k];
    return o;
  }

  var TABS = [
    {
      id: 'headphone', label: 'Headphone',
      desc: 'v2-B · Neutral rating chip over the hero image.',
      variants: [item('hp.png', 7814, { flow: { x: 12, y: 501, w: 100, h: 44, label: 'Open ratings and reviews' } })]
    },
    {
      id: 'fashion', label: 'Fashion',
      desc: 'Fashion item page with the rating badge.',
      variants: [{
        body: A + 'fashion.png', bodyH: 8412, height: 796,
        nav: { src: A + 'fashionNav.png', h: 86 }, bottom: { src: A + 'fashionBottom.png', h: 72 }
      }]
    },
    {
      id: 'v2-c', label: 'Top rated',
      desc: 'Image overlay with a “Top rated” tab above the chip.',
      variants: [item('v2c.png', 7814, { flow: { x: 12, y: 487, w: 100, h: 52, label: 'Open ratings and reviews' } })]
    },
    {
      id: 'v2-d', label: 'Seller rating',
      desc: 'Image overlay with a “Seller rating” tab, brand rating fallback (no count).',
      variants: [item('v2d.png', 7814, { flow: { x: 12, y: 487, w: 90, h: 52, label: 'Open ratings and reviews' } })]
    },
    {
      id: 'colour', label: 'Ratings in colour',
      variants: [
        ['colour1', 'Option 1 · +ve'],
        ['colour6', 'Option 1 · -ve'],
        ['colour3', 'Option 2 · +ve'],
        ['colour5', 'Option 2 · -ve'],
        ['colour2', 'Option 3'],
        ['colour4', 'Option 4']
      ].map(function (c) {
        return item(c[0] + '.png', 7818, { label: c[1] });
      })
    }
  ];

  var tabsEl = document.getElementById('tabs');
  var variantsEl = document.getElementById('variants');
  var descEl = document.getElementById('desc');
  var phoneEl = document.getElementById('phone');
  var wrapEl = document.getElementById('phoneWrap');
  var stageEl = document.getElementById('stage');
  var hintsEl = document.getElementById('hints');

  var state = { tab: 0, variant: 0 };
  var current = null; // { reviews, sheet, hasFlow }

  function el(tag, cls, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function img(src, cls, alt) {
    var i = el('img', cls, { alt: alt || '', draggable: 'false' });
    i.src = src;
    return i;
  }
  function hotspot(box, label, onClick) {
    var b = el('button', 'hotspot', { type: 'button', 'aria-label': label });
    b.style.left = box.x + 'px'; b.style.top = box.y + 'px'; b.style.width = box.w + 'px'; b.style.height = box.h + 'px';
    b.addEventListener('click', onClick);
    return b;
  }

  function buildItemScreen(v, hooks) {
    var screen = el('section', 'screen');
    var scroll = el('div', 'scroll'); scroll.style.top = '0';
    var content = el('div', 'content'); content.style.height = v.bodyH + 'px';
    content.appendChild(img(v.body, 'body', ''));
    if (v.flow) content.appendChild(hotspot(v.flow, v.flow.label, hooks.openReviews));
    scroll.appendChild(content);
    screen.appendChild(scroll);
    var nav = img(v.nav.src, 'pin top', ''); nav.style.height = v.nav.h + 'px';
    var bot = img(v.bottom.src, 'pin bottom', ''); bot.style.height = v.bottom.h + 'px';
    screen.appendChild(nav); screen.appendChild(bot);
    return screen;
  }

  function buildReviews(hooks) {
    var F = SHARED_FLOW;
    var layer = el('section', 'layer reviews', { 'aria-label': 'Customer ratings and reviews', 'aria-hidden': 'true' });
    var scroll = el('div', 'scroll'); scroll.style.top = F.revHeader.h + 'px';
    var content = el('div', 'content'); content.style.height = F.revBody.h + 'px';
    content.appendChild(img(F.revBody.src, 'body', ''));
    content.appendChild(hotspot(F.revBody.how, 'How item rating is calculated', hooks.openSheet));
    scroll.appendChild(content); layer.appendChild(scroll);
    var head = img(F.revHeader.src, 'pin top', ''); head.style.height = F.revHeader.h + 'px';
    var bot = img(F.revBottom.src, 'pin bottom', ''); bot.style.height = F.revBottom.h + 'px';
    layer.appendChild(head); layer.appendChild(bot);
    layer.appendChild(hotspot(F.revHeader.back, 'Back', hooks.closeReviews));
    layer._scroll = scroll;
    return layer;
  }

  function buildSheet(hooks) {
    var F = SHARED_FLOW;
    var layer = el('section', 'layer sheet-layer', { 'aria-label': 'How item rating is calculated', 'aria-hidden': 'true' });
    var scrim = el('button', 'scrim', { type: 'button', 'aria-label': 'Close' });
    scrim.addEventListener('click', hooks.closeSheet);
    layer.appendChild(scrim);
    var sheet = el('div', 'sheet');
    var scroll = el('div', 'scroll');
    var content = el('div', 'content'); content.style.height = (F.sheetBody.h + F.sheetHead.h) + 'px';
    var body = img(F.sheetBody.src, 'body', ''); body.style.position = 'absolute'; body.style.top = F.sheetHead.h + 'px'; body.style.height = F.sheetBody.h + 'px';
    content.appendChild(body); scroll.appendChild(content);
    sheet.appendChild(scroll);
    sheet.appendChild(img(F.sheetHead.src, 'sheet-head', ''));
    sheet.appendChild(el('div', 'sheet-shadow'));
    scroll.addEventListener('scroll', function () { sheet.classList.toggle('scrolled', scroll.scrollTop > 2); });
    var close = hotspot(F.sheetHead.close, 'Close', hooks.closeSheet); close.classList.add('close');
    sheet.appendChild(close);
    layer.appendChild(sheet);
    layer._scroll = scroll;
    layer._sheet = sheet;
    return layer;
  }

  function render() {
    var tab = TABS[state.tab];
    var v = tab.variants[Math.min(state.variant, tab.variants.length - 1)];
    descEl.textContent = v.desc || tab.desc;
    phoneEl.style.setProperty('--phone-h', v.height + 'px');
    phoneEl.setAttribute('aria-label', tab.label + (tab.variants.length > 1 ? ' · ' + v.label : ''));
    phoneEl.innerHTML = '';
    current = { reviews: null, sheet: null };

    var hooks = {
      openReviews: function () { if (current.reviews) { current.reviews._scroll.scrollTop = 0; setOn(current.reviews, true); } },
      closeReviews: function () { setOn(current.reviews, false); },
      openSheet: function () { current.sheet._scroll.scrollTop = 0; current.sheet._sheet.classList.remove('scrolled'); setOn(current.sheet, true); },
      closeSheet: function () { setOn(current.sheet, false); }
    };
    phoneEl.appendChild(buildItemScreen(v, hooks));
    if (v.flow) {
      current.reviews = buildReviews(hooks); phoneEl.appendChild(current.reviews);
      current.sheet = buildSheet(hooks); phoneEl.appendChild(current.sheet);
    }
    fit();
  }

  function setOn(layer, on) {
    layer.classList.toggle('on', on);
    layer.setAttribute('aria-hidden', on ? 'false' : 'true');
  }

  function renderTabs() {
    tabsEl.innerHTML = '';
    TABS.forEach(function (t, i) {
      var b = el('button', 'tab', { type: 'button', role: 'tab', id: 'tab-' + t.id, 'aria-selected': String(i === state.tab) });
      b.textContent = t.label;
      b.addEventListener('click', function () { go(i, 0); });
      tabsEl.appendChild(b);
    });
    var tab = TABS[state.tab];
    variantsEl.innerHTML = '';
    variantsEl.hidden = tab.variants.length < 2;
    if (tab.variants.length > 1) {
      tab.variants.forEach(function (v, i) {
        var b = el('button', 'tab', { type: 'button', role: 'tab', 'aria-selected': String(i === state.variant), 'aria-label': v.label });
        b.textContent = v.label;
        b.addEventListener('click', function () { go(state.tab, i); });
        variantsEl.appendChild(b);
      });
    }
  }

  function go(t, v) {
    state.tab = t; state.variant = v;
    var id = TABS[t].id + (TABS[t].variants.length > 1 ? '-' + (v + 1) : '');
    if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
    renderTabs(); render();
  }

  function fromHash() {
    var h = (location.hash || '').replace('#', '');
    var m = h.match(/^(.*?)(?:-(\d+))?$/);
    for (var i = 0; i < TABS.length; i++) {
      if (TABS[i].id === h) return [i, 0];
      if (m && TABS[i].id === m[1] && m[2]) return [i, Math.max(0, Math.min(TABS[i].variants.length - 1, parseInt(m[2], 10) - 1))];
    }
    return [0, 0];
  }

  function fit() {
    wrapEl.style.transform = '';
    var h = parseFloat(getComputedStyle(phoneEl).height);
    var top = wrapEl.getBoundingClientRect().top + window.scrollY;
    var scale = Math.min(1, Math.max(0.5, (window.innerHeight - top - 64) / h));
    wrapEl.style.transform = scale < 1 ? 'scale(' + scale + ')' : '';
    stageEl.style.height = Math.round(h * scale) + 'px';
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !current) return;
    if (current.sheet && current.sheet.classList.contains('on')) setOn(current.sheet, false);
    else if (current.reviews && current.reviews.classList.contains('on')) setOn(current.reviews, false);
  });
  hintsEl.addEventListener('change', function () { document.body.classList.toggle('hints', hintsEl.checked); });
  window.addEventListener('resize', fit);
  window.addEventListener('hashchange', function () { var s = fromHash(); go(s[0], s[1]); });

  var s0 = fromHash();
  state.tab = s0[0]; state.variant = s0[1];
  renderTabs(); render();
})();
