(function () {
    'use strict';

    if (!document.body.classList.contains('in-index')) return;
    if (window.__jojoHomeV3) return;
    window.__jojoHomeV3 = true;

    // ═══════════════════════════════════════════════════════════════════════════
    //  JOJO CATERING – HOMEPAGE v3
    //
    //  Přístup: skript nepřebarvuje šablonu (ta má slider, líné fotky a spoustu
    //  vlastních stylů). Z původních karet si přečte jen odkaz, název, cenu,
    //  fotku, štítek a tlačítko Do košíku a z toho postaví čisté vlastní sekce.
    //  Původní bloky pak skryje (zůstanou v HTML, jen se nezobrazují).
    //
    //  Co skript dělá:
    //    1) rychlá navigace po kategoriích
    //    2) každá kategorie = jedna sekce s kartami (Doporučujeme = posuvný pás)
    //    3) fotky: z karty, a když chybí, dotáhne se og:image z detailu produktu
    //    4) pás „Jak objednat" s telefonem
    //    5) benefity, text „Proč právě Jojo", recenze a články dostanou stejný styl
    //
    //  NAHRAZUJE: doporucujeme-karty-v2.js  (ten odeber ze zápatí)
    //  ZACHOVEJ:  homepage-top-9.js (hero), party-bedynka-baner-v2.js
    // ═══════════════════════════════════════════════════════════════════════════

    var CFG = {
        perGroup: 8,       // kolik karet ukázat v mřížce, zbytek se rozbalí (0 = všechny)
        quickAdd: true,    // přesunout původní tlačítko „Do košíku" na kartu (false = jen „Detail")
        ogFallback: true   // chybějící fotku dohledat z detailu produktu
    };

    var CATS = [
        { k: 'doporučujeme', short: 'Doporučujeme', title: 'Doporučujeme', layout: 'scroll',
          sub: 'Výběr dobrot, které se skvěle doplní s párty bedýnkou.', href: '/nabidka/', all: 'Celá nabídka' },
        { k: 'párty', short: 'Párty bedýnky',
          sub: 'Mísy, saláty a bedýnky, které zvládnou celou oslavu.', href: '/party-bedynky-misy-salaty/' },
        { k: 'chlebíčky', short: 'Chlebíčky',
          sub: 'Chlebíčky, kanapky a slané koláče, bohatě zdobené.', href: '/chlebicky-a-pomazanky/' },
        { k: 'sladké', short: 'Sladké',
          sub: 'Domácí zákusky, buchty a cukroví podle rodinných receptů.', href: '/sladke-dobroty/' },
        { k: 'teplé', short: 'Teplé pokrmy',
          sub: 'Vaříme čerstvě na váš termín. U některých jídel objednávejte min. 3 dny předem.', href: '/teple-pokrmy/' },
        { k: 'nápoje', short: 'Nápoje',
          sub: 'Sekt a moravská vína k přípitku.', href: '/napoje/' }
    ];

    var EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu;

    // ─── Pomocné ──────────────────────────────────────────────────────────────

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function txt(el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; }
    function norm(s) { return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase(); }
    function abs(u) { try { return new URL(u, location.href).href; } catch (e) { return ''; } }
    function pathOf(u) { try { return new URL(u, location.href).pathname; } catch (e) { return u; } }
    function layoutBox(el) { return el.matches('.container,.content-wrapper,.content-wrapper-in,#content,body'); }
    function contentRoot() { return document.getElementById('content') || document.body; }

    // ─── Čtení původních karet ────────────────────────────────────────────────

    function pickImage(p) {
        var imgs = p.querySelectorAll('img');
        function ok(u) { return u && !/^data:/i.test(u) && !/placeholder|blank|loader|spacer|pixel/i.test(u); }
        for (var i = 0; i < imgs.length; i++) {
            var im = imgs[i];
            if (im.closest('.flags,.ratings-wrapper,.stars-wrapper')) continue;
            var cand = [
                im.getAttribute('data-src'), im.getAttribute('data-lazy'),
                im.getAttribute('data-original'), im.getAttribute('data-lazy-src'),
                (im.getAttribute('data-srcset') || '').split(/\s+/)[0],
                (im.getAttribute('srcset') || '').split(/\s+/)[0],
                im.getAttribute('src')
            ];
            for (var j = 0; j < cand.length; j++) if (ok(cand[j])) return abs(cand[j]);
        }
        return '';
    }

    function pickLink(p) {
        var a = p.querySelector('a.name[href]') || p.querySelector('a[data-micro="url"][href]');
        if (a) return a;
        var best = null, len = 0;
        Array.prototype.forEach.call(p.querySelectorAll('a[href]'), function (x) {
            var h = x.getAttribute('href') || '';
            if (!h || h.charAt(0) === '#' || /^javascript:/i.test(h)) return;
            var l = txt(x).length;
            if (l > len) { best = x; len = l; }
        });
        return best || p.querySelector('a[href]');
    }

    function parsePrice(p) {
        var sels = ['.price-final', '[data-micro="price"]', '.prices'];
        var re = /(\d[\d ]*(?:,\d+)?)\s*(?:Kč|CZK)/i;
        for (var i = 0; i < sels.length; i++) {
            var el = p.querySelector(sels[i]);
            if (!el) continue;
            var m = el.textContent.replace(/\u00a0/g, ' ').match(re);
            if (m) return m[1].trim().replace(/\s+/g, '\u00a0') + '\u00a0Kč';
        }
        var m2 = p.textContent.replace(/\u00a0/g, ' ').match(re);
        return m2 ? m2[1].trim().replace(/\s+/g, '\u00a0') + '\u00a0Kč' : '';
    }

    function parseBadge(p) {
        var f = p.querySelector('.flags .flag,.flag');
        if (f && txt(f)) return txt(f);
        var leaves = p.querySelectorAll('span,div,strong,em,i');
        for (var i = 0; i < leaves.length; i++) {
            var l = leaves[i];
            if (!l.children.length && /^(Novinka|Akce|Tip|Doprodej|Výprodej)$/i.test(txt(l))) return txt(l);
        }
        return '';
    }

    function parseRating(p) {
        var m = p.textContent.replace(/\s+/g, ' ').match(/hodnocení produktu je\s*([\d.,]+)\s*z\s*5/i);
        return m ? m[1].replace('.', ',') : '';
    }

    // Název bez „- 13 ks" a „Objednávka min. 3 dny předem" (to jde do štítků).
    function splitName(raw) {
        var chips = [];
        var t = raw.replace(/\s+/g, ' ').trim();
        var m = t.match(/\.?\s*Objednávka\s+min\.?\s*(\d+)\s*dn\w*\s+předem\.?/i);
        if (m) { chips.push('objednat ' + m[1] + ' dny předem'); t = t.replace(m[0], '').trim(); }
        t = t.replace(/[.\s]+$/, '');
        var u = t.match(/\s(?:[-–—]\s*)?(\d+(?:,\d+)?\s*(?:ks|kg|l))\s*$/i);
        if (u) { chips.unshift(u[1].replace(/\s+/g, ' ')); t = t.slice(0, t.length - u[0].length).replace(/[\s\-–—]+$/, ''); }
        t = t.charAt(0).toUpperCase() + t.slice(1);
        return { title: t, chips: chips };
    }

    function parseDesc(p, title) {
        var el = p.querySelector('[data-micro="description"],.p-desc,.description,.p-short-description,.short-description');
        if (!el) {
            var leaves = p.querySelectorAll('*');
            for (var i = 0; i < leaves.length; i++) {
                var l = leaves[i];
                if (l.children.length || l.closest('.name,.prices,.add-to-cart,.pr-action,.p-code,.ratings-wrapper,.flags,button,a.name')) continue;
                if (txt(l).length > 40) { el = l; break; }
            }
        }
        if (!el) return '';
        var t = txt(el).replace(EMOJI, ' ').replace(/\s+/g, ' ').trim();
        var nt = norm(title);
        if (nt && norm(t).indexOf(nt) === 0) t = t.slice(title.length).replace(/^[\s\-–—:,.]+/, '');
        var cut = /(\.{3}|…)$/.test(t);
        t = t.replace(/(\.{3}|…)$/, '').trim();
        if (t.length > 110) { t = t.slice(0, 110).replace(/\s+\S*$/, ''); cut = true; }
        t = t.charAt(0).toUpperCase() + t.slice(1);
        if (cut) t += '…';
        return t.length < 15 ? '' : t;
    }

    function parseCard(p) {
        var a = pickLink(p);
        if (!a) return null;
        var href = a.getAttribute('href');
        var nameEl = p.querySelector('[data-micro="name"]') || p.querySelector('.name') || a;
        var split = splitName(txt(nameEl));
        if (!split.title) return null;
        var price = parsePrice(p);
        var cart = null;
        if (CFG.quickAdd) {
            cart = p.querySelector('form.pr-action') || p.querySelector('.pr-action') || p.querySelector('.add-to-cart');
            if (cart && !cart.querySelector('button,input[type="submit"],a')) cart = null;
        }
        var desc = parseDesc(p, split.title);
        // popis občas nese gramáž / průměr
        var extra = (p.textContent || '').match(/(?:množství|hmotnost)\s*([\d,]+\s*(?:kg|g))\b/i);
        var chips = split.chips.slice();
        if (extra && chips.length < 2 && !chips.some(function (c) { return /kg|g$/i.test(c); })) chips.push(extra[1].replace(/\s+/g, ' '));
        var dia = (p.textContent || '').match(/průměr[^\d]{0,20}(\d{2})\s*cm/i);
        if (dia && chips.length < 2) chips.push('ø ' + dia[1] + ' cm');
        return {
            node: p, href: href, title: split.title, chips: chips.slice(0, 3),
            price: price, badge: parseBadge(p), rating: parseRating(p),
            desc: desc, img: pickImage(p), cart: cart
        };
    }

    function collect() {
        var titles = Array.prototype.slice.call(document.querySelectorAll('.homepage-group-title'));
        if (!titles.length) return [];
        var prods = Array.prototype.filter.call(document.querySelectorAll('.product'), function (p) {
            return !p.closest('.slick-cloned,.jh-root,.jdk') && p.querySelector('a[href]');
        });
        var groups = titles.map(function (t) { return { title: t, items: [], seen: {} }; });
        prods.forEach(function (p) {
            var g = null;
            for (var i = 0; i < titles.length; i++) {
                if (titles[i].compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING) g = groups[i]; else break;
            }
            if (!g) return;
            var it = parseCard(p);
            if (!it) return;
            var key = pathOf(it.href);
            if (g.seen[key]) return;
            g.seen[key] = 1;
            g.items.push(it);
        });
        return groups.filter(function (g) { return g.items.length; });
    }

    // ─── Vykreslení ───────────────────────────────────────────────────────────

    var uid = 0;

    function catFor(titleText) {
        var t = norm(titleText);
        for (var i = 0; i < CATS.length; i++) if (t.indexOf(CATS[i].k) === 0) return CATS[i];
        return null;
    }

    function cardHTML(it, eager) {
        it.uid = ++uid;
        var chips = it.chips.map(function (c) { return '<span>' + esc(c) + '</span>'; }).join('');
        return [
            '<article class="jh-card">',
            '  <a class="jh-img" href="' + esc(it.href) + '" tabindex="-1" aria-hidden="true">',
            '    <img id="jh-img-' + it.uid + '" alt="" decoding="async" loading="' + (eager ? 'eager' : 'lazy') + '" width="423" height="318">',
            it.badge ? '    <span class="jh-badge">' + esc(it.badge) + '</span>' : '',
            '  </a>',
            '  <div class="jh-body">',
            '    <div class="jh-name"><a href="' + esc(it.href) + '">' + esc(it.title) + '</a></div>',
            it.desc ? '    <p class="jh-tag">' + esc(it.desc) + '</p>' : '',
            chips ? '    <div class="jh-meta">' + chips + '</div>' : '',
            it.rating ? '    <div class="jh-rate"><b aria-hidden="true">★★★★★</b>' + esc(it.rating) + ' z 5</div>' : '',
            '    <div class="jh-foot">',
            '      <div class="jh-price">' + (it.price ? esc(it.price) : '') + '</div>',
            '      <div class="jh-buy" id="jh-buy-' + it.uid + '"></div>',
            '    </div>',
            '  </div>',
            '</article>'
        ].join('');
    }

    function sectionHTML(g, idx) {
        var cat = catFor(txt(g.title));
        var title = cat && cat.title ? cat.title : txt(g.title).replace(/[\s….]+$/, '');
        var scroll = cat && cat.layout === 'scroll';
        g.cat = cat; g.label = (cat && cat.short) || title; g.id = 'jh-s-' + idx;
        var all = cat && cat.href
            ? '<a class="jh-all" href="' + esc(cat.href) + '">' + esc(cat.all || 'Celá kategorie') + '</a>' : '';
        var nav = scroll
            ? '<div class="jh-nav"><button type="button" class="jh-arrow jh-prev" aria-label="Předchozí produkty">←</button><button type="button" class="jh-arrow jh-next" aria-label="Další produkty">→</button></div>' : '';
        var cards = g.items.map(function (it, i) { return cardHTML(it, idx === 0 && i < 4); }).join('');
        return [
            '<section class="jh-sec' + (scroll ? ' jh-sec-scroll' : '') + '" id="' + g.id + '" aria-label="' + esc(title) + '">',
            '  <div class="jh-head">',
            '    <div><h2 class="jh-title">' + esc(title) + '</h2>',
            cat && cat.sub ? '    <p class="jh-sub">' + esc(cat.sub) + '</p>' : '',
            '    </div>',
            '    <div class="jh-head-r">' + nav + all + '</div>',
            '  </div>',
            scroll ? '  <div class="jh-track">' + cards + '</div>' : '  <div class="jh-grid">' + cards + '</div>',
            '</section>'
        ].join('');
    }

    function howHTML() {
        return [
            '<section class="jh-sec jh-how" aria-label="Jak objednat">',
            '  <h2 class="jh-title">Jak objednat</h2>',
            '  <ol class="jh-steps">',
            '    <li><b>1</b><div><strong>Vyberete si</strong><span>Z nabídky, nebo nám zavolejte. Poradíme s množstvím i skladbou.</span></div></li>',
            '    <li><b>2</b><div><strong>Doladíme detaily</strong><span>Každou objednávku osobně probereme a upravíme podle vašich přání.</span></div></li>',
            '    <li><b>3</b><div><strong>Doručíme čerstvé</strong><span>Vše připravujeme na váš termín. V Ostravě doprava zdarma nad 1 000 Kč.</span></div></li>',
            '  </ol>',
            '  <div class="jh-cta">',
            '    <a class="jh-btn" href="tel:+420776003155">Zavolat Janě: 776 003 155</a>',
            '    <a class="jh-btn jh-btn-2" href="/blog/pruvodce-objednavkou/">Průvodce první objednávkou</a>',
            '  </div>',
            '</section>'
        ].join('');
    }

    // ─── Fotky: doplnění z detailu produktu (og:image) ────────────────────────

    var ogQueue = [], ogActive = 0;

    function ogGet(href, cb) {
        var key = 'jh-og:' + pathOf(href);
        try { var c = sessionStorage.getItem(key); if (c) return cb(c); } catch (e) {}
        if (new URL(href, location.href).origin !== location.origin) return cb('');
        fetch(href, { credentials: 'same-origin' })
            .then(function (r) { return r.ok ? r.text() : ''; })
            .then(function (html) {
                if (!html) return cb('');
                var d = new DOMParser().parseFromString(html, 'text/html');
                var m = d.querySelector('meta[property="og:image"]');
                var u = m ? m.getAttribute('content') : '';
                if (u) { try { sessionStorage.setItem(key, u); } catch (e) {} }
                cb(u || '');
            })
            .catch(function () { cb(''); });
    }

    function pumpOg() {
        while (ogActive < 4 && ogQueue.length) {
            (function (job) {
                ogActive++;
                ogGet(job.it.href, function (u) {
                    ogActive--;
                    if (u) job.set(abs(u));
                    pumpOg();
                });
            })(ogQueue.shift());
        }
    }

    function wireImage(it) {
        var img = document.getElementById('jh-img-' + it.uid);
        if (!img) return;
        var triedOg = false;
        function show() { img.classList.add('is-in'); }
        function setSrc(u) { img.src = u; }
        function needOg() {
            if (triedOg || !CFG.ogFallback) return;
            triedOg = true;
            ogQueue.push({ it: it, set: setSrc });
            pumpOg();
        }
        img.addEventListener('load', show);
        img.addEventListener('error', needOg);
        if (it.img) {
            img.src = it.img;
            if (img.complete && img.naturalWidth) show();
        } else {
            needOg();
        }
    }

    // ─── Ovládání ─────────────────────────────────────────────────────────────

    function wireScroll(sec) {
        var track = sec.querySelector('.jh-track');
        var prev = sec.querySelector('.jh-prev');
        var next = sec.querySelector('.jh-next');
        if (!track) return;
        function update() {
            var max = track.scrollWidth - track.clientWidth;
            if (prev) prev.disabled = track.scrollLeft <= 4;
            if (next) next.disabled = track.scrollLeft >= max - 4;
        }
        function step(d) { track.scrollBy({ left: d * Math.max(240, track.clientWidth * 0.85), behavior: 'smooth' }); }
        if (prev) prev.addEventListener('click', function () { step(-1); });
        if (next) next.addEventListener('click', function () { step(1); });
        track.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        update();
        setTimeout(update, 600);
    }

    function wireExpand(sec) {
        var grid = sec.querySelector('.jh-grid');
        if (!grid || !CFG.perGroup) return;
        var cards = grid.children;
        if (cards.length <= CFG.perGroup + 1) return;
        var total = cards.length;
        for (var i = CFG.perGroup; i < total; i++) cards[i].classList.add('jh-x');
        var wrap = document.createElement('div');
        wrap.className = 'jh-more';
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-expanded', 'false');
        b.textContent = 'Zobrazit všech ' + total + ' produktů';
        b.addEventListener('click', function () {
            Array.prototype.forEach.call(grid.querySelectorAll('.jh-x'), function (c) { c.classList.remove('jh-x'); });
            wrap.parentNode.removeChild(wrap);
        });
        wrap.appendChild(b);
        grid.insertAdjacentElement('afterend', wrap);
    }

    // ─── Původní bloky: skrýt ─────────────────────────────────────────────────

    function groupUnit(title) {
        var u = title;
        while (u.parentElement && u.parentElement !== document.body &&
               u.parentElement.querySelectorAll('.homepage-group-title').length === 1 &&
               !u.parentElement.querySelector('#jojo-hero,#jojo-banner-party-bedynka,.banners-row,.carousel,.jh-root')) {
            u = u.parentElement;
        }
        return u;
    }

    function hideOriginals(groups) {
        groups.forEach(function (g) {
            var u = groupUnit(g.title);
            if (!u.querySelector('.jh-root')) u.classList.add('jh-orig');
            g.title.classList.add('jh-orig');
            g.items.forEach(function (it) {
                it.node.classList.add('jh-orig');
                var pb = it.node.closest('.products-block');
                if (pb && !pb.querySelector('.jh-root')) pb.classList.add('jh-orig');
            });
        });
    }

    function placeAfterBanner(root) {
        var banner = document.getElementById('jojo-banner-party-bedynka');
        if (!banner) return false;
        if (banner.compareDocumentPosition(root) & Node.DOCUMENT_POSITION_FOLLOWING) return true;
        banner.insertAdjacentElement('afterend', root);
        return true;
    }

    // ─── Ostatní sekce šablony (jen třídy + CSS) ──────────────────────────────

    function styleRest() {
        // benefity (rozpoznání podle ikon)
        var imgs = document.querySelectorAll('img[src*="/adamin/img/"],img[src*="award.svg"],img[src*="clock.svg"]');
        Array.prototype.forEach.call(imgs, function (img) {
            if (img.closest('.jj-benefit,.jh-root')) return;
            var item = img;
            while (item.parentElement && !layoutBox(item.parentElement) &&
                   item.parentElement.querySelectorAll('img[src$=".svg"]').length === 1) item = item.parentElement;
            if (!item.parentElement || layoutBox(item.parentElement)) return;
            item.classList.add('jj-benefit');
            item.parentElement.classList.add('jj-benefits');
            // text vedle ikony vždy v jednom bloku (nadpis nad popiskem)
            var kids = Array.prototype.slice.call(item.children);
            var pic = kids.filter(function (k) { return k.tagName === 'IMG' || k.querySelector('img'); })[0];
            var rest = kids.filter(function (k) { return k !== pic; });
            if (rest.length > 1) {
                var w = document.createElement('div');
                w.className = 'jj-bt';
                rest.forEach(function (k) { w.appendChild(k); });
                item.appendChild(w);
            }
        });

        function heading(match, skipH1) {
            var els = contentRoot().querySelectorAll('h1,h2,h3,h4,h5,h6,div,p,span,strong');
            for (var i = 0; i < els.length; i++) {
                var el = els[i];
                if (el.closest('.jh-root')) continue;
                if (el.children.length && !/^H[1-6]$/.test(el.tagName)) continue;
                if (skipH1 && el.tagName === 'H1') continue;
                var t = norm(el.textContent);
                if (t.length < 60 && match(t)) return el;
            }
            return null;
        }
        var about = heading(function (t) { return t.indexOf('proč právě jojo') === 0; }, true);
        var reviews = heading(function (t) { return t === 'poslední hodnocení'; }, false);
        var blog = heading(function (t) { return t === 'nové články'; }, false);
        [about, reviews, blog].forEach(function (el) { if (el) el.classList.add('jj-sec-title'); });

        function unitOf(title) {
            var u = title;
            while (u.parentElement && u.parentElement !== contentRoot() && !layoutBox(u.parentElement) &&
                   u.parentElement.querySelectorAll('.homepage-group-title,.jj-sec-title,.jh-root').length <= 1) u = u.parentElement;
            return u;
        }
        if (about && !about.closest('.jj-about')) {
            var box = about;
            for (var i = 0; i < 4; i++) {
                var p = box.parentElement;
                if (!p || p === contentRoot() || layoutBox(p) || p.textContent.length > 1600) break;
                box = p;
            }
            if (box === about && about.parentElement && !layoutBox(about.parentElement)) box = about.parentElement;
            box.classList.add('jj-about');
        }
        [reviews, blog].forEach(function (title) {
            if (!title) return;
            var scope = [];
            var unit = unitOf(title);
            if (unit !== title) scope.push(unit);
            else {
                var n = title.nextElementSibling, k = 0;
                while (n && k < 6 && !n.matches('h1,h2,h3,h4,h5,.jj-sec-title,.homepage-group-title,.jh-root,.jj-about,footer')) {
                    scope.push(n); n = n.nextElementSibling; k++;
                }
            }
            var links = [];
            scope.forEach(function (sc) {
                if (sc.matches('a')) links.push(sc);
                else Array.prototype.push.apply(links, sc.querySelectorAll('a'));
            });
            links = links.filter(function (a) { return txt(a).length > 60 && !a.closest('.jh-root'); });
            if (!links.length) return;
            links.forEach(function (a) { a.classList.add('jj-linkcard'); });
            var parent = links[0].parentElement;
            if (links.length > 1 && links.every(function (a) { return a.parentElement === parent; }) &&
                !parent.querySelector('.jj-sec-title')) parent.classList.add('jj-linkgrid');
        });
    }

    // ─── Styly ────────────────────────────────────────────────────────────────

    function injectStyles() {
        if (document.getElementById('jh-style')) return;
        var s = document.createElement('style');
        s.id = 'jh-style';
        s.textContent = [
            'body.in-index{--jh-plum:#4C1536;--jh-plum2:#6a1e4b;--jh-gold:#DFC15E;--jh-gold-d:#c39a32;--jh-cream:#F7EAC4;--jh-mute:#6b5a61;--jh-line:#efe4eb;--jh-tint:#faf4f7}',
            '.jh-orig{display:none!important}',
            '.jh-root{margin:8px 0 0;font-family:inherit;color:var(--jh-plum);box-sizing:border-box}',
            '.jh-root *,.jh-root *::before,.jh-root *::after{box-sizing:border-box}',
            '.jh-root a{text-decoration:none}',

            /* navigace po kategoriích */
            '.jh-chips{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;margin:18px -2px 0;padding:4px 2px 10px}',
            '.jh-chips::-webkit-scrollbar{display:none}',
            '.jh-chips a{flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;padding:9px 15px;border:1.5px solid #e3d3dc;border-radius:30px;background:#fff;color:var(--jh-plum)!important;font-size:14px;font-weight:700;line-height:1;white-space:nowrap;transition:background .2s ease,color .2s ease,border-color .2s ease}',
            '.jh-chips a b{font-size:12px;font-weight:700;color:#8a6a14;background:var(--jh-cream);padding:3px 8px;border-radius:20px;transition:background .2s ease,color .2s ease}',
            '.jh-chips a:hover{background:var(--jh-plum);color:#fff!important;border-color:var(--jh-plum)}',
            '.jh-chips a:hover b{background:rgba(255,255,255,.18);color:#fff}',

            /* sekce */
            '.jh-sec{margin:44px 0 0;scroll-margin-top:96px}',
            '.jh-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin:0 0 16px}',
            '.jh-root .jh-title{margin:0;padding:0;border:0;background:none;text-transform:none;text-align:left;font-family:inherit;font-size:27px;font-weight:800;line-height:1.12;letter-spacing:-.01em;color:var(--jh-plum)}',
            '.jh-root .jh-sub{margin:6px 0 0;padding:0;font-size:14px;line-height:1.5;color:var(--jh-mute)}',
            '.jh-head-r{display:flex;align-items:center;gap:10px;flex-shrink:0}',
            '.jh-all{font-size:14px;font-weight:700;line-height:1;color:var(--jh-plum)!important;border:1.5px solid #e3d3dc;border-radius:30px;padding:10px 16px;background:#fff;white-space:nowrap;transition:background .2s ease,color .2s ease,border-color .2s ease}',
            '.jh-all:hover{background:var(--jh-plum);color:#fff!important;border-color:var(--jh-plum)}',
            '.jh-nav{display:flex;gap:8px}',
            '.jh-arrow{width:40px;height:40px;padding:0;border-radius:50%;border:1.5px solid #e3d3dc;background:#fff;color:var(--jh-plum);font-size:18px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s ease,color .2s ease}',
            '.jh-arrow:hover:not(:disabled){background:var(--jh-plum);color:#fff;border-color:var(--jh-plum)}',
            '.jh-arrow:disabled{opacity:.35;cursor:default}',

            /* mřížka + pás */
            '.jh-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(236px,1fr));gap:16px}',
            '.jh-track{display:flex;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;padding:6px 2px 16px;margin:0 -2px;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}',
            '.jh-track::-webkit-scrollbar{display:none}',
            '.jh-track .jh-card{flex:0 0 262px;scroll-snap-align:start}',
            '.jh-x{display:none!important}',
            '.jh-more{display:flex;justify-content:center;margin:20px 0 0}',
            '.jh-more button{font:inherit;font-size:15px;font-weight:700;color:var(--jh-plum);background:#fff;border:2px solid var(--jh-plum);border-radius:11px;padding:11px 24px;cursor:pointer;transition:background .2s ease,color .2s ease}',
            '.jh-more button:hover{background:var(--jh-plum);color:#fff}',

            /* karta */
            '.jh-card{display:flex;flex-direction:column;min-width:0;background:#fff;border:1px solid var(--jh-line);border-radius:18px;overflow:hidden;box-shadow:0 6px 18px rgba(76,21,54,.06);transition:transform .2s ease,box-shadow .2s ease}',
            '@media (pointer:fine){.jh-card:hover{transform:translateY(-4px);box-shadow:0 14px 28px rgba(76,21,54,.14)}.jh-card:hover .jh-img img{transform:scale(1.06)}}',
            '.jh-img{position:relative;display:block;aspect-ratio:4/3;overflow:hidden;background:linear-gradient(135deg,#fdf6fa,#f3e6ee)}',
            '.jh-img img{position:absolute;top:0;left:0;width:100%;height:100%;max-width:none;object-fit:cover;opacity:0;transition:opacity .35s ease,transform .5s ease}',
            '.jh-img img.is-in{opacity:1}',
            '.jh-badge{position:absolute;top:10px;left:10px;z-index:1;background:var(--jh-gold);color:var(--jh-plum);font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:4px 10px;border-radius:20px}',
            '.jh-body{display:flex;flex-direction:column;flex:1;padding:14px 16px 16px}',
            '.jh-name{margin:0 0 5px;font-size:16px;font-weight:800;line-height:1.25;min-height:2.5em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
            '.jh-name a{color:var(--jh-plum)!important}',
            '.jh-name a:hover{color:var(--jh-plum2)!important}',
            '.jh-tag{margin:0 0 10px;font-size:13px;line-height:1.45;color:var(--jh-mute);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
            '.jh-meta{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px}',
            '.jh-meta span{font-size:11.5px;line-height:1.2;color:var(--jh-plum);background:var(--jh-tint);border:1px solid #efe2ea;padding:3px 9px;border-radius:7px}',
            '.jh-rate{margin:0 0 10px;font-size:12px;color:#5b4b52}',
            '.jh-rate b{color:var(--jh-gold-d);letter-spacing:1px;font-weight:400;margin-right:5px}',
            '.jh-foot{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:12px;border-top:1px solid #f3e9ef}',
            '.jh-price{font-size:19px;font-weight:800;line-height:1;white-space:nowrap;color:var(--jh-plum)}',
            '.jh-buy{margin:0}',
            '.jh-buy form{margin:0;padding:0;display:block}',
            '.jh-buy .quantity,.jh-buy .p-quantity,.jh-buy input[type="number"]{display:none!important}',
            '.jh-buy button,.jh-buy .btn,.jh-buy a.btn,.jh-buy input[type="submit"]{display:inline-block;margin:0;font:inherit;font-size:13px;font-weight:700;line-height:1.3;text-transform:none;white-space:nowrap;color:#fff!important;background:var(--jh-plum)!important;border:0!important;border-radius:9px!important;padding:8px 13px!important;box-shadow:none!important;cursor:pointer;transition:background .2s ease}',
            '.jh-buy button:hover,.jh-buy .btn:hover,.jh-buy a.btn:hover{background:var(--jh-plum2)!important}',
            '.jh-go{display:inline-block;font-size:13px;font-weight:700;color:#fff!important;background:var(--jh-plum);border-radius:9px;padding:8px 13px;white-space:nowrap;transition:background .2s ease}',
            '.jh-go:hover{background:var(--jh-plum2)}',

            /* Jak objednat */
            '.jh-how{padding:28px 32px;background:linear-gradient(135deg,#fff,#fdf6fa);border:1px solid var(--jh-line);border-radius:20px;box-shadow:0 10px 30px rgba(76,21,54,.06)}',
            '.jh-steps{list-style:none;margin:18px 0 0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}',
            '.jh-steps li{display:flex;gap:14px;align-items:flex-start;margin:0;padding:0}',
            '.jh-steps li::before,.jh-steps li::marker{content:none}',
            '.jh-steps b{flex:0 0 38px;width:38px;height:38px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:var(--jh-cream);color:#8a6a14;font-size:16px;font-weight:800}',
            '.jh-steps strong{display:block;margin:0 0 3px;font-size:16px;font-weight:800;color:var(--jh-plum)}',
            '.jh-steps span{display:block;font-size:13.5px;line-height:1.5;color:var(--jh-mute)}',
            '.jh-cta{display:flex;flex-wrap:wrap;gap:12px;margin:22px 0 0}',
            '.jh-btn{display:inline-flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:#fff!important;background:var(--jh-plum);border:2px solid var(--jh-plum);border-radius:11px;padding:12px 22px;transition:background .2s ease,color .2s ease}',
            '.jh-btn:hover{background:var(--jh-plum2);border-color:var(--jh-plum2)}',
            '.jh-btn-2{background:#fff;color:var(--jh-plum)!important}',
            '.jh-btn-2:hover{background:var(--jh-plum);color:#fff!important;border-color:var(--jh-plum)}',

            /* benefity, o nás, recenze, články */
            '.jj-benefits{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:24px 0!important;padding:0!important}',
            '.jj-benefit{display:flex!important;align-items:center;gap:12px;width:auto!important;max-width:none!important;margin:0!important;padding:14px 16px!important;background:var(--jh-tint);border:1px solid #efe2ea;border-radius:14px;text-align:left!important}',
            '.jj-benefit>*{min-width:0}',
            '.jj-benefit,.jj-benefit *{overflow-wrap:break-word}',
            '.jj-bt{flex:1;min-width:0}',
            '.jj-benefit img{flex:0 0 42px;width:42px!important;height:42px!important;padding:10px;background:var(--jh-cream);border-radius:50%;object-fit:contain;margin:0!important}',
            '.jj-benefit h2,.jj-benefit h3,.jj-benefit h4,.jj-benefit strong{margin:0 0 2px!important;font-size:15px!important;font-weight:800!important;line-height:1.2!important;color:var(--jh-plum)!important}',
            '.jj-benefit p,.jj-benefit span{margin:0!important;font-size:12.5px;line-height:1.4;color:var(--jh-mute)}',
            '.jj-sec-title{margin:46px 0 16px!important;padding:0!important;border:0!important;background:none!important;font-size:27px!important;font-weight:800!important;line-height:1.12!important;letter-spacing:-.01em;text-transform:none!important;text-align:left!important;color:var(--jh-plum)!important}',
            '.jj-about{margin:46px 0 0;padding:28px 32px;background:linear-gradient(135deg,#fff,#fdf6fa);border:1px solid var(--jh-line);border-radius:20px;box-shadow:0 10px 30px rgba(76,21,54,.06);color:var(--jh-mute);font-size:15px;line-height:1.65}',
            '.jj-about .jj-sec-title{margin:0 0 12px!important;font-size:24px!important}',
            '.jj-about p{margin:0 0 12px;max-width:72ch}',
            '.jj-about a[href^="tel"]{color:var(--jh-plum);font-weight:700}',
            '.jj-linkgrid{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin:0!important}',
            'a.jj-linkcard{display:block;box-sizing:border-box;margin:0 0 14px;padding:18px 20px;background:#fff;border:1px solid var(--jh-line);border-radius:18px;box-shadow:0 6px 18px rgba(76,21,54,.06);color:var(--jh-mute)!important;font-size:14px;line-height:1.55;text-decoration:none!important;transition:transform .2s ease,box-shadow .2s ease}',
            '.jj-linkgrid a.jj-linkcard{margin:0}',
            '@media (pointer:fine){a.jj-linkcard:hover{transform:translateY(-4px);box-shadow:0 14px 28px rgba(76,21,54,.14)}}',

            '.jh-root a:focus-visible,.jh-root button:focus-visible,a.jj-linkcard:focus-visible{outline:3px solid var(--jh-gold);outline-offset:3px}',

            /* tablet + mobil */
            '@media (max-width:991px){.jj-benefits{grid-template-columns:repeat(2,minmax(0,1fr))}.jh-steps{grid-template-columns:1fr}}',
            '@media (max-width:767px){',
            '  .jh-sec{margin-top:34px}',
            '  .jh-root .jh-title,.jj-sec-title{font-size:22px!important}',
            '  .jh-root .jh-title{font-size:22px}',
            '  .jh-root .jh-sub{font-size:13px}',
            '  .jh-nav{display:none}',
            '  .jh-all{padding:8px 13px;font-size:13px}',
            '  .jh-head{align-items:flex-start}',
            '  .jh-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}',
            '  .jh-track{gap:12px}',
            '  .jh-track .jh-card{flex-basis:72vw;max-width:270px}',
            '  .jh-body{padding:10px 11px 12px}',
            '  .jh-grid .jh-name{font-size:14px}',
            '  .jh-grid .jh-tag{display:none}',
            '  .jh-grid .jh-price{font-size:16px}',
            '  .jh-grid .jh-foot{flex-direction:column;align-items:stretch;gap:8px}',
            '  .jh-grid .jh-buy button,.jh-grid .jh-buy .btn,.jh-grid .jh-go{display:block;width:100%;text-align:center}',
            '  .jh-how{padding:20px}',
            '  .jh-btn{width:100%}',
            '  .jj-benefits{gap:8px;margin:18px 0!important}',
            '  .jj-benefit{padding:11px 12px!important;gap:9px}',
            '  .jj-benefit img{flex-basis:34px;width:34px!important;height:34px!important;padding:8px}',
            '  .jj-about{padding:20px;margin-top:34px;font-size:14px}',
            '}',
            '@media (prefers-reduced-motion:reduce){.jh-track{scroll-behavior:auto}.jh-card,.jh-img img,a.jj-linkcard{transition:none}}'
        ].join('');
        document.head.appendChild(s);
    }

    // ─── Spuštění ─────────────────────────────────────────────────────────────

    var root = null;

    function render() {
        var groups = collect();
        var haveKarty = !!document.getElementById('jojo-karty');
        if (haveKarty) {
            groups = groups.filter(function (g) { return norm(txt(g.title)).indexOf('doporučujeme') !== 0; });
        }
        if (!groups.length) { console.warn('[jojo v3] nenalezeny žádné produktové skupiny'); return; }

        var firstUnit = groupUnit(groups[0].title);
        root = document.createElement('div');
        root.className = 'jh-root' + (firstUnit.closest('.container') ? '' : ' container');

        var html = '';
        if (groups.length > 1) {
            html += '<nav class="jh-chips" aria-label="Kategorie">' + groups.map(function (g, i) {
                var cat = catFor(txt(g.title));
                var label = (cat && cat.short) || txt(g.title).replace(/[\s….]+$/, '');
                return '<a href="#jh-s-' + i + '">' + esc(label) + ' <b>' + g.items.length + '</b></a>';
            }).join('') + '</nav>';
        }
        groups.forEach(function (g, i) { html += sectionHTML(g, i); });
        html += howHTML();
        root.innerHTML = html;

        firstUnit.insertAdjacentElement('beforebegin', root);

        // tlačítka košíku + fotky
        groups.forEach(function (g) {
            g.items.forEach(function (it) {
                var slot = document.getElementById('jh-buy-' + it.uid);
                if (slot) {
                    if (it.cart) slot.appendChild(it.cart);
                    else slot.innerHTML = '<a class="jh-go" href="' + esc(it.href) + '">Detail</a>';
                }
                wireImage(it);
            });
        });
        Array.prototype.forEach.call(root.querySelectorAll('.jh-sec-scroll'), wireScroll);
        Array.prototype.forEach.call(root.querySelectorAll('.jh-sec'), wireExpand);

        // plynulý skok na kategorii
        Array.prototype.forEach.call(root.querySelectorAll('.jh-chips a'), function (a) {
            a.addEventListener('click', function (e) {
                var t = root.querySelector(a.getAttribute('href'));
                if (!t) return;
                e.preventDefault();
                t.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });

        hideOriginals(groups);
        placeAfterBanner(root);

        window.__jojoHomeV3 = { groups: groups.length, products: groups.reduce(function (n, g) { return n + g.items.length; }, 0) };
        console.log('[jojo v3]', window.__jojoHomeV3);
    }

    function init() {
        injectStyles();
        try { render(); } catch (err) {
            console.error('[jojo v3] chyba, vracím původní vzhled', err);
            if (root && root.parentNode) root.parentNode.removeChild(root);
            Array.prototype.forEach.call(document.querySelectorAll('.jh-orig'), function (el) { el.classList.remove('jh-orig'); });
        }
        try { styleRest(); } catch (e) { console.warn('[jojo v3] styleRest', e); }

        // hero a banery se vkládají se zpožděním; šablona umí obsah přerenderovat
        var timer = null;
        var obs = new MutationObserver(function () {
            clearTimeout(timer);
            timer = setTimeout(function () {
                if (root) placeAfterBanner(root);
                try { styleRest(); } catch (e) {}
            }, 150);
        });
        obs.observe(document.body, { childList: true, subtree: true });
        setTimeout(function () { obs.disconnect(); }, 6000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
