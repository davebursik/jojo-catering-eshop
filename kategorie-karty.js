(function () {
    'use strict';

    var body = document.body;
    // Homepage řeší homepage-karty.js; košík/pokladna a detail produktu se nemění
    if (body.classList.contains('in-index') || /\bin-krok-/.test(body.className)) return;

    // ═══════════════════════════════════════════════════════════════════════════
    //  KARTY PRODUKTŮ VŠUDE – výpis produktů v kategoriích (a ve vyhledávání,
    //  u značek…) má stejnou kartu jako úvodní stránka.
    //
    //  • Produkty zůstávají pod sebou ve stejném pořadí jako v Shoptetu, jen v mřížce.
    //  • Původní karty ze šablony se jen skryjí (zůstávají na stránce) – filtry,
    //    řazení, stránkování i „načíst další" fungují dál a nové produkty se
    //    přestylují samy.
    //  • „Do košíku" stiskne původní tlačítko ze šablony (stejně jako na homepage).
    //  • Když kartu skript nedokáže přečíst, nechá ji beze změny.
    // ═══════════════════════════════════════════════════════════════════════════

    // Kolik sloupců na telefonu: 1 = velká karta přes celou šířku, 2 = dvě kompaktní vedle sebe
    var PHONE_COLUMNS = 1;
    // Nejmenší šířka karty na počítači/tabletu (px) – podle toho se mřížka sama rozloží
    var MIN_CARD_WIDTH = 250;

    // kde hledat výpis produktů
    var LIST_CONTAINERS = '#products, .products-page, .products-block';
    // kde se nikdy nic nepřestylovává (hlavička, boční panel, naše vlastní bloky…)
    var EXCLUDE = '.jdk-wrap, header, #header, aside, .sidebar, .search-whisperer, [id^="jojo-"]';
    // na detailu produktu se nic nemění (související produkty zatím necháváme původní)
    var DETAIL = '.p-detail, #product-detail-form, .p-detail-inner';

    var ADD_BUTTON = '.add-to-cart-button, form.pr-action button[type="submit"], button.btn-cart';

    // ─── Pomocné (stejné jako na homepage) ────────────────────────────────────

    var EMOJI = /[\u{1F000}-\u{1FAFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}]/gu;

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function clean(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }

    function norm(s) { return clean(s).toLowerCase(); }

    function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

    // „Grilované … omáčkou. Objednávka min. 3 dny předem" → název + čip;
    // „Chlebíčky … - 13 ks" → název + čip „13 ks"
    function parseName(raw) {
        var name = clean(raw), chips = [];
        var pre = name.match(/[.,;\-–]?\s*Objednávka\s+min\.?\s*(\d+)\s*dn\S*\s+předem\.?\s*$/i);
        if (pre && pre.index > 0) {
            var d = parseInt(pre[1], 10);
            chips.push('objednat ' + d + ' ' + (d === 1 ? 'den' : (d < 5 ? 'dny' : 'dní')) + ' předem');
            name = name.slice(0, pre.index).trim();
        }
        var q = name.match(/\s*[-–]?\s*(\d+(?:[.,]\d+)?)\s*(ks|kg|ml|g|l)\.?\s*$/i);
        if (q && q.index > 0) {
            chips.unshift(q[1] + ' ' + q[2].toLowerCase());
            name = name.slice(0, q.index).trim();
        }
        name = name.replace(/[\s,.;:–-]+$/, '');
        if (!name) name = clean(raw);
        return { name: cap(name), chips: chips };
    }

    // Popis bez emoji; úvodní název produktu (s koncovkou i bez ní) se odstraní, aby se neopakoval.
    function cleanDesc(txt, names) {
        var t = clean(String(txt || '').replace(EMOJI, ' '));
        if (!t) return '';
        names.slice().sort(function (a, b) { return b.length - a.length; }).forEach(function (n) {
            if (n && norm(t).indexOf(norm(n)) === 0) t = t.slice(n.length).replace(/^[\s,.:;–-]+/, '');
        });
        t = t.replace(/\.{3}$/, '…');
        if (t.length > 110) t = t.slice(0, 110).replace(/\s+\S*$/, '') + '…';
        return t;
    }

    function pick(el, selectors) {
        for (var i = 0; i < selectors.length; i++) {
            var f = el.querySelector(selectors[i]);
            if (f) return f;
        }
        return null;
    }

    // Přečte jednu produktovou kartu ze šablony. Vrací null, když chybí název nebo odkaz.
    function scrapeProduct(el) {
        var link = pick(el, ['a.name', '[data-micro="url"]', '.name a', 'a.image', 'a[href]']);
        var href = link ? link.getAttribute('href') : '';
        var nameEl = pick(el, ['[data-micro="name"]', '[data-testid="productCardName"]', 'a.name', '.name']);
        var rawName = clean(nameEl ? nameEl.textContent : '');
        var img = pick(el, ['.image img', 'a img', 'img']);
        if (!rawName && img) rawName = clean(img.getAttribute('alt'));
        if (!href || href.charAt(0) === '#' || !rawName) return null;

        var src = '';
        if (img) {
            src = img.getAttribute('data-micro-image') || img.getAttribute('data-src') ||
                  img.getAttribute('data-lazy') || img.getAttribute('data-original') ||
                  img.getAttribute('src') || '';
            if (/^data:/i.test(src)) src = '';
        }

        var parsed = parseName(rawName);

        var pf = pick(el, ['.price-final strong', '.price-final', '[data-micro="price"]']);
        var price = pf ? clean(pf.textContent) : '';
        if (!/\d/.test(price)) {
            var m = clean(el.textContent).match(/(\d[\d\s\u00a0]*)\s*Kč/);
            price = m ? clean(m[0]) : '';
        }
        var oldEl = pick(el, ['.price-standard']);
        var old = oldEl ? clean(oldEl.textContent) : '';
        if (!/\d/.test(old) || old === price) old = '';

        var badges = [];
        var flags = el.querySelectorAll('.flag');
        for (var i = 0; i < flags.length && badges.length < 2; i++) {
            var ft = clean(flags[i].textContent);
            if (ft && badges.indexOf(ft) === -1) badges.push(ft);
        }

        var rating = null;
        var rm = el.textContent.match(/hodnocení produktu je\s*([\d.,]+)\s*z\s*5/i);
        if (rm) {
            var cntEl = el.querySelector('[data-micro-rating-count]');
            rating = { v: rm[1].replace('.', ','), n: cntEl ? cntEl.getAttribute('data-micro-rating-count') : '' };
        }

        var descEl = pick(el, ['.description', '[data-micro="description"]']);
        var needsDetail = /(?:\bod|\bmin\.?|minimálně)\s*\d+\s*(?:ks|kusů|kusy|kus)\b|\b\d+\s*(?:ks|kusů)\s+a\s+více/i
            .test(rawName + ' ' + (descEl ? descEl.textContent : ''));

        return {
            name: parsed.name, chips: parsed.chips,
            tag: descEl ? cleanDesc(descEl.textContent, [rawName, parsed.name]) : '',
            price: price, old: old, badges: badges, rating: rating,
            img: src, href: href, needsDetail: needsDetail
        };
    }

    // ─── Styly ────────────────────────────────────────────────────────────────

    function injectStyles() {
        if (document.getElementById('jojo-kategorie-style')) return;
        var style = document.createElement('style');
        style.id = 'jojo-kategorie-style';
        style.textContent = [
            '.jdk-card{display:flex;flex-direction:column;background:#fff;border:1px solid #efe4eb;border-radius:18px;overflow:hidden;box-shadow:0 6px 18px rgba(76,21,54,.06);transition:transform .2s ease,box-shadow .2s ease}',
            '.jdk-link{display:flex;flex-direction:column;flex:1;color:inherit!important;text-decoration:none!important}',
            '@media (pointer:fine){.jdk-card:hover{transform:translateY(-4px);box-shadow:0 14px 28px rgba(76,21,54,.14)}.jdk-card:hover .jdk-img img{transform:scale(1.06)}}',
            '.jdk-img{position:relative;aspect-ratio:4/3;background:linear-gradient(135deg,#fdf6fa,#f3e6ee);overflow:hidden}',
            '.jdk-img img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;transition:transform .5s ease}',
            '.jdk-ph{position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:42px;opacity:.5}',
            '.jdk-badges{position:absolute;top:10px;left:10px;z-index:1;display:flex;flex-direction:column;align-items:flex-start;gap:5px}',
            '.jdk-badge{background:#DFC15E;color:#4C1536;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:4px 10px;border-radius:20px}',
            '.jdk-badge.jdk-sale{background:#c62828;color:#fff}',
            '.jdk-body{display:flex;flex-direction:column;flex:1;padding:14px 16px 0}',
            '.jdk-name{font-weight:800;color:#4C1536;font-size:16px;line-height:1.25;margin:0 0 5px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.5em}',
            '.jdk-tag{font-size:13px;line-height:1.45;color:#6b5a61;margin:0 0 10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.9em}',
            '.jdk-meta{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px;min-height:24px}',
            '.jdk-meta span{font-size:11.5px;color:#4C1536;background:#faf4f7;border:1px solid #efe2ea;padding:3px 9px;border-radius:7px}',
            '.jdk-rate{font-size:12px;color:#5b4b52;margin:0 0 10px}',
            '.jdk-rate b{color:#c39a32;letter-spacing:1px;font-weight:400;margin-right:4px}',
            '.jdk-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:12px 16px 16px;padding-top:12px;border-top:1px solid #f3e9ef}',
            '.jdk-price{font-weight:800;color:#4C1536;font-size:19px;line-height:1;white-space:nowrap}',
            '.jdk-old{font-size:12px;font-weight:600;color:#8c7a83;text-decoration:line-through;margin-right:6px}',
            '.jdk-unit{font-size:12px;font-weight:600;color:#8c7a83;margin-left:3px}',
            '.jdk-go,.jdk-add{font:inherit;font-size:13px;font-weight:700;line-height:1.2;color:#fff!important;background:#4C1536;border:0;border-radius:9px;padding:9px 14px;white-space:nowrap;cursor:pointer;text-decoration:none!important;transition:background .2s ease}',
            '.jdk-go:hover,.jdk-add:hover{background:#6a1e4b}',
            '.jdk-add:disabled{cursor:default}',
            '.jdk-add.jdk-ok{background:#1a7a40}',
            '.jdk-card a:focus-visible,.jdk-card button:focus-visible{outline:3px solid #DFC15E;outline-offset:3px}',

            /* původní karta ze šablony se skryje, zůstane v DOM */
            '.product[data-jdk="1"]>*:not(.jdk-card){display:none!important}',

            /* mřížka */
            '.jdk-grid{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(' + MIN_CARD_WIDTH + 'px,1fr))!important;gap:18px!important;width:100%!important;max-width:none!important;margin-left:0!important;margin-right:0!important;padding-left:0!important;padding-right:0!important;float:none!important;align-items:stretch}',
            '.jdk-grid::before,.jdk-grid::after{display:none!important;content:none!important}',
            '.jdk-grid>*:not(.jdk-item){grid-column:1/-1}',
            '.jdk-grid>.jdk-item{display:flex!important;width:auto!important;max-width:none!important;min-width:0!important;margin:0!important;padding:0!important;float:none!important;flex:none!important;border:0!important;background:none!important;box-shadow:none!important;transform:none!important;height:auto!important}',
            '.jdk-item>.product[data-jdk="1"],.product.jdk-item[data-jdk="1"]{display:flex!important;flex:1;width:100%!important;max-width:none!important;margin:0!important;padding:0!important;border:0!important;background:none!important;box-shadow:none!important;float:none!important;min-width:0}',
            '.jdk-grid .jdk-card{flex:1 1 auto;width:100%;max-width:none;min-width:0}',

            /* telefon */
            '@media (max-width:560px){',
            '  .jdk-grid{grid-template-columns:repeat(' + (PHONE_COLUMNS === 2 ? 2 : 1) + ',minmax(0,1fr))!important;gap:' + (PHONE_COLUMNS === 2 ? 12 : 16) + 'px!important}',
            PHONE_COLUMNS === 2 ? [
            '  .jdk-grid .jdk-body{padding:10px 11px 0}',
            '  .jdk-grid .jdk-name{font-size:14px}',
            '  .jdk-grid .jdk-tag{display:none}',
            '  .jdk-grid .jdk-meta{margin-bottom:8px;min-height:0}',
            '  .jdk-grid .jdk-foot{flex-direction:column;align-items:stretch;gap:8px;margin:10px 11px 12px}',
            '  .jdk-grid .jdk-price{font-size:16px}',
            '  .jdk-grid .jdk-go,.jdk-grid .jdk-add{text-align:center;padding:9px 8px}',
            ].join('') : '',
            '}',
            '@media (prefers-reduced-motion:reduce){.jdk-card,.jdk-img img{transition:none}}',
        ].join('');
        document.head.appendChild(style);
    }

    // ─── Karta ────────────────────────────────────────────────────────────────

    function renderCard(p, canCart) {
        var chips = (p.chips || []).map(function (m) { return '<span>' + esc(m) + '</span>'; }).join('');
        var badgeHtml = (p.badges && p.badges.length)
            ? '<span class="jdk-badges">' + p.badges.map(function (b) {
                return '<span class="jdk-badge' + (/%|akce|sleva/i.test(b) ? ' jdk-sale' : '') + '">' + esc(b) + '</span>';
            }).join('') + '</span>'
            : '';
        var rate = p.rating
            ? '<div class="jdk-rate"><b>★★★★★</b>' + esc(p.rating.v) + (p.rating.n ? ' (' + esc(p.rating.n) + ' hodnocení)' : '') + '</div>'
            : '';
        var priceHtml = p.price
            ? (p.old ? '<span class="jdk-old">' + esc(p.old) + '</span>' : '') + esc(p.price)
            : '';
        var action = canCart && !p.needsDetail
            ? '<button type="button" class="jdk-add">Do košíku</button>'
            : '<a class="jdk-go" href="' + esc(p.href) + '">Detail →</a>';
        return [
            '<div class="jdk-card">',
            '  <a class="jdk-link" href="' + esc(p.href) + '">',
            '    <div class="jdk-img">',
            badgeHtml,
            p.img
                ? '      <img src="' + esc(p.img) + '" alt="' + esc(p.name) + '" loading="lazy" decoding="async" width="1024" height="768">'
                : '      <span class="jdk-ph">🍽️</span>',
            '    </div>',
            '    <div class="jdk-body">',
            '      <div class="jdk-name">' + esc(p.name) + '</div>',
            '      <div class="jdk-tag">' + esc(p.tag || '') + '</div>',
            '      <div class="jdk-meta">' + chips + '</div>',
            rate,
            '    </div>',
            '  </a>',
            '  <div class="jdk-foot">',
            '    <div class="jdk-price">' + priceHtml + '</div>',
            action,
            '  </div>',
            '</div>',
        ].join('');
    }

    // ─── Přestylování karet ───────────────────────────────────────────────────

    function decorate() {
        if (document.querySelector(DETAIL)) return;

        var cards = document.querySelectorAll('.product:not([data-jdk])');
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            if (card.closest(EXCLUDE)) continue;
            var container = card.closest(LIST_CONTAINERS);
            if (!container) continue;

            var p = scrapeProduct(card);
            if (!p) {
                card.setAttribute('data-jdk', 'skip');
                if (window.console && console.warn) console.warn('[jojo-karty] Kartu produktu se nepodařilo přečíst – ponechána původní podoba.');
                continue;
            }

            var canCart = !!card.querySelector(ADD_BUTTON);
            card.insertAdjacentHTML('afterbegin', renderCard(p, canCart));
            card.setAttribute('data-jdk', '1');

            // položka mřížky = přímý potomek kontejneru, který obsahuje tuto kartu
            var item = card;
            while (item.parentElement && item.parentElement !== container) item = item.parentElement;
            item.classList.add('jdk-item');
            container.classList.add('jdk-grid');
        }
    }

    // „Do košíku" → stiskne původní tlačítko téže karty
    function onClick(e) {
        var btn = e.target.closest ? e.target.closest('.jdk-add') : null;
        if (!btn || btn.disabled) return;
        var prod = btn.closest('.product');
        if (!prod) return;
        e.preventDefault();

        var orig = prod.querySelector(ADD_BUTTON);
        var link = prod.querySelector('.jdk-link');
        if (!orig) { if (link) window.location.href = link.getAttribute('href'); return; }

        var label = btn.textContent;
        btn.disabled = true;
        btn.classList.add('jdk-ok');
        btn.textContent = 'Přidáno ✓';
        orig.click();
        setTimeout(function () {
            btn.disabled = false;
            btn.classList.remove('jdk-ok');
            btn.textContent = label;
        }, 1800);
    }

    // ─── Init ─────────────────────────────────────────────────────────────────

    function init() {
        injectStyles();
        document.addEventListener('click', onClick);
        decorate();

        // filtry, řazení, stránkování a „načíst další" produkty vykreslují nové karty – přestylovat je
        var timer;
        var obs = new MutationObserver(function () {
            clearTimeout(timer);
            timer = setTimeout(decorate, 60);
        });
        obs.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
