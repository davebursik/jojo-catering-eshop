(function () {
    'use strict';

    if (!document.body.classList.contains('in-index')) return;

    // ═══════════════════════════════════════════════════════════════════════════
    //  SJEDNOCENÍ HOMEPAGE – stejný design jako hero + karty „Doporučujeme"
    //  Přebarví a přeskládá zbytek úvodní stránky ze šablony:
    //    • produktové skupiny (nadpisy, mřížka, karty, tlačítko Do košíku)
    //    • pruh benefitů (doprava zdarma, poradíme, …)
    //    • text „Proč právě Jojo Catering?"
    //    • poslední hodnocení + nové články
    //    • bannery a karusel
    //  Skript nic nenahrazuje, jen přidává třídy a CSS. Funkce košíku zůstává
    //  původní (Shoptet ajax), takže nic nerozbije.
    //
    //  Načítat AŽ PO ostatních skriptech (doporucujeme-karty, homepage-top, …).
    // ═══════════════════════════════════════════════════════════════════════════

    // Kolik produktů ukázat ve skupině, zbytek se rozbalí tlačítkem. 0 = vše.
    var MAX_PER_GROUP = 8;

    // Krátký popis produktu na kartě. Vypnuto: popis opakuje název a zdržuje.
    var SHOW_DESC = false;

    // Odkaz „Celá kategorie" vedle nadpisu skupiny (klíč = začátek nadpisu, malými).
    var CATEGORY_LINKS = {
        'párty bedýnky': '/party-bedynky-misy-salaty/',
        'chlebíčky':     '/chlebicky-a-pomazanky/',
        'sladké':        '/sladke-dobroty/',
        'teplé':         '/teple-pokrmy/',
        'nápoje':        '/napoje/'
    };

    // ─── Styly ────────────────────────────────────────────────────────────────

    function injectStyles() {
        if (document.getElementById('jj-unify-style')) return;
        var s = document.createElement('style');
        s.id = 'jj-unify-style';
        s.textContent = [
            'body.in-index{--jj-plum:#4C1536;--jj-plum2:#6a1e4b;--jj-gold:#DFC15E;--jj-gold-d:#c39a32;--jj-cream:#F7EAC4;--jj-mute:#6b5a61;--jj-line:#efe4eb;--jj-tint:#faf4f7}',

            /* ── Nadpisy sekcí ── */
            'body.in-index .homepage-group-title,body.in-index .jj-sec-title{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin:46px 0 16px!important;padding:0!important;border:0!important;background:none!important;font-size:27px!important;font-weight:800!important;line-height:1.12!important;letter-spacing:-.01em;text-transform:none!important;text-align:left!important;color:var(--jj-plum)!important}',
            'body.in-index .homepage-group-title a:not(.jj-all),body.in-index .jj-sec-title a:not(.jj-all){color:inherit!important;text-decoration:none!important}',
            'body.in-index a.jj-all{flex-shrink:0;font-size:14px;font-weight:700;line-height:1;color:var(--jj-plum)!important;text-decoration:none!important;border:1.5px solid #e3d3dc;border-radius:30px;padding:10px 16px;background:#fff;transition:background .2s ease,color .2s ease,border-color .2s ease}',
            'body.in-index a.jj-all:hover{background:var(--jj-plum);color:#fff!important;border-color:var(--jj-plum)}',

            /* ── Mřížka produktů ── */
            'body.in-index .products-block{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(228px,1fr));gap:16px;margin:0!important;padding:0!important;max-width:none!important}',
            'body.in-index .products-block>.product{width:auto!important;max-width:none!important;min-width:0;margin:0!important;padding:0!important;float:none!important;flex:none!important;border:0!important;background:none!important;box-shadow:none!important}',
            'body.in-index .products-block>.product.jj-hid{display:none!important}',

            /* ── Karta produktu ── */
            'body.in-index .products-block .product>.p{position:relative;display:flex;flex-direction:column;height:100%;background:#fff;border:1px solid var(--jj-line);border-radius:18px;overflow:hidden;box-shadow:0 6px 18px rgba(76,21,54,.06);transition:transform .2s ease,box-shadow .2s ease}',
            '@media (pointer:fine){body.in-index .products-block .product>.p:hover{transform:translateY(-4px);box-shadow:0 14px 28px rgba(76,21,54,.14)}body.in-index .products-block .product>.p:hover .image img{transform:scale(1.06)}}',
            'body.in-index .products-block .product .p .image{position:relative;display:block;aspect-ratio:4/3;margin:0!important;padding:0!important;overflow:hidden;background:linear-gradient(135deg,#fdf6fa,#f3e6ee)}',
            'body.in-index .products-block .product .p .image img{position:absolute;top:0;left:0;width:100%;height:100%;max-width:none;object-fit:cover;transition:transform .5s ease}',
            'body.in-index .products-block .product .p-in{display:flex;flex-direction:column;flex:1;min-width:0;padding:14px 16px 16px!important}',
            'body.in-index .products-block .product .p-in-in{flex:1;display:flex;flex-direction:column;min-width:0}',
            'body.in-index .products-block .product .name{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.5em;margin:0 0 8px!important;font-size:16px!important;font-weight:800!important;line-height:1.25!important;color:var(--jj-plum)!important;text-decoration:none!important}',
            'body.in-index .products-block .product .p-code,body.in-index .products-block .product .availability{display:none!important}',
            SHOW_DESC
                ? 'body.in-index .products-block .product .p-desc,body.in-index .products-block .product .description{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:13px;line-height:1.45;color:var(--jj-mute);margin:0 0 10px}'
                : 'body.in-index .products-block .product .p-desc,body.in-index .products-block .product .description{display:none!important}',

            /* hodnocení */
            'body.in-index .products-block .product .ratings-wrapper,body.in-index .products-block .product .stars-wrapper{margin:0 0 8px!important}',
            'body.in-index .products-block .product .stars .star-on,body.in-index .products-block .product .star.star-on{color:var(--jj-gold-d)!important;fill:var(--jj-gold-d)!important}',

            /* štítky (Novinka, Akce…) */
            'body.in-index .products-block .product .flags{position:absolute!important;top:10px;left:10px;z-index:2;display:flex;flex-direction:column;align-items:flex-start;gap:5px;margin:0!important}',
            'body.in-index .products-block .product .flag{background:var(--jj-gold)!important;color:var(--jj-plum)!important;font-size:11px!important;font-weight:800!important;letter-spacing:.04em;text-transform:uppercase;line-height:1.2!important;padding:4px 10px!important;border-radius:20px!important;border:0!important;box-shadow:none!important}',

            /* cena + tlačítko */
            'body.in-index .products-block .product .p-bottom{display:flex!important;align-items:center;justify-content:space-between;gap:10px;margin-top:auto!important;padding:12px 0 0!important;border-top:1px solid #f3e9ef!important}',
            'body.in-index .products-block .product .p-bottom .offers,body.in-index .products-block .product .p-bottom .offer{display:contents}',
            'body.in-index .products-block .product .prices{margin:0!important;display:block}',
            'body.in-index .products-block .product .price-final,body.in-index .products-block .product .price-final strong{font-size:19px!important;font-weight:800!important;line-height:1!important;color:var(--jj-plum)!important;white-space:nowrap}',
            'body.in-index .products-block .product .price-standard{font-size:12px!important;color:#8c7a83!important}',
            'body.in-index .products-block .product .pr-action,body.in-index .products-block .product .add-to-cart{margin:0!important;display:block}',
            'body.in-index .products-block .product .add-to-cart .quantity{display:none!important}',
            'body.in-index .products-block .product .add-to-cart-button,body.in-index .products-block .product .pr-action .btn{background:var(--jj-plum)!important;color:#fff!important;border:0!important;border-radius:9px!important;padding:8px 13px!important;font-size:13px!important;font-weight:700!important;line-height:1.3!important;white-space:nowrap;box-shadow:none!important;text-transform:none!important;transition:background .2s ease}',
            'body.in-index .products-block .product .add-to-cart-button:hover,body.in-index .products-block .product .pr-action .btn:hover{background:var(--jj-plum2)!important}',

            /* tlačítko „Zobrazit všech N" */
            'body.in-index .jj-more{display:flex;justify-content:center;margin:20px 0 0}',
            'body.in-index .jj-more button{font:inherit;font-size:15px;font-weight:700;color:var(--jj-plum);background:#fff;border:2px solid var(--jj-plum);border-radius:11px;padding:11px 24px;cursor:pointer;transition:background .2s ease,color .2s ease}',
            'body.in-index .jj-more button:hover{background:var(--jj-plum);color:#fff}',

            /* ── Pruh benefitů ── */
            'body.in-index .jj-benefits{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:24px 0!important;padding:0!important}',
            'body.in-index .jj-benefit{display:flex!important;align-items:center;gap:12px;width:auto!important;max-width:none!important;margin:0!important;padding:14px 16px!important;background:var(--jj-tint);border:1px solid #efe2ea;border-radius:14px;text-align:left!important}',
            'body.in-index .jj-benefit img{flex:0 0 42px;width:42px!important;height:42px!important;padding:10px;background:var(--jj-cream);border-radius:50%;object-fit:contain;margin:0!important}',
            'body.in-index .jj-benefit h2,body.in-index .jj-benefit h3,body.in-index .jj-benefit h4,body.in-index .jj-benefit strong{margin:0 0 2px!important;font-size:15px!important;font-weight:800!important;line-height:1.2!important;color:var(--jj-plum)!important}',
            'body.in-index .jj-benefit p,body.in-index .jj-benefit span{margin:0!important;font-size:12.5px;line-height:1.4;color:var(--jj-mute)}',

            /* ── Text „Proč právě Jojo Catering?" ── */
            'body.in-index .jj-about{margin:46px 0 0;padding:28px 32px;background:linear-gradient(135deg,#fff,#fdf6fa);border:1px solid var(--jj-line);border-radius:20px;box-shadow:0 10px 30px rgba(76,21,54,.06);color:var(--jj-mute);font-size:15px;line-height:1.65}',
            'body.in-index .jj-about .jj-sec-title{margin:0 0 12px!important;font-size:24px!important}',
            'body.in-index .jj-about p{margin:0 0 12px;max-width:72ch}',
            'body.in-index .jj-about a[href^="tel"]{color:var(--jj-plum);font-weight:700}',

            /* ── Recenze a články ── */
            'body.in-index .jj-linkgrid{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin:0!important}',
            'body.in-index a.jj-linkcard{display:block;box-sizing:border-box;margin:0 0 14px;padding:18px 20px;background:#fff;border:1px solid var(--jj-line);border-radius:18px;box-shadow:0 6px 18px rgba(76,21,54,.06);color:var(--jj-mute)!important;font-size:14px;line-height:1.55;text-decoration:none!important;transition:transform .2s ease,box-shadow .2s ease}',
            'body.in-index .jj-linkgrid a.jj-linkcard{margin:0}',
            '@media (pointer:fine){body.in-index a.jj-linkcard:hover{transform:translateY(-4px);box-shadow:0 14px 28px rgba(76,21,54,.14)}}',

            /* ── Bannery a karusel ── */
            'body.in-index .carousel,body.in-index .carousel-inner{border-radius:18px;overflow:hidden}',
            'body.in-index .banners-row a,body.in-index .banner a{display:block;border-radius:18px;overflow:hidden;box-shadow:0 6px 18px rgba(76,21,54,.06);transition:transform .2s ease,box-shadow .2s ease}',
            'body.in-index .banners-row img,body.in-index .banner img{display:block;width:100%;height:auto}',
            '@media (pointer:fine){body.in-index .banners-row a:hover,body.in-index .banner a:hover{transform:translateY(-3px);box-shadow:0 14px 28px rgba(76,21,54,.14)}}',

            'body.in-index .jj-more button:focus-visible,body.in-index a.jj-all:focus-visible,body.in-index a.jj-linkcard:focus-visible,body.in-index .products-block .product a:focus-visible{outline:3px solid var(--jj-gold);outline-offset:3px}',

            /* ── Mobil ── */
            '@media (max-width:991px){body.in-index .jj-benefits{grid-template-columns:repeat(2,minmax(0,1fr))}}',
            '@media (max-width:767px){',
            '  body.in-index .homepage-group-title,body.in-index .jj-sec-title{font-size:22px!important;margin:34px 0 12px!important}',
            '  body.in-index a.jj-all{padding:8px 13px;font-size:13px}',
            '  body.in-index .products-block{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}',
            '  body.in-index .products-block .product .p-in{padding:10px 11px 12px!important}',
            '  body.in-index .products-block .product .name{font-size:14px!important}',
            '  body.in-index .products-block .product .price-final,body.in-index .products-block .product .price-final strong{font-size:16px!important}',
            '  body.in-index .products-block .product .p-bottom{flex-direction:column;align-items:stretch;gap:8px}',
            '  body.in-index .products-block .product .add-to-cart-button,body.in-index .products-block .product .pr-action .btn{width:100%;text-align:center}',
            '  body.in-index .jj-benefits{gap:8px;margin:18px 0!important}',
            '  body.in-index .jj-benefit{padding:11px 12px!important;gap:9px}',
            '  body.in-index .jj-benefit img{flex-basis:34px;width:34px!important;height:34px!important;padding:8px}',
            '  body.in-index .jj-benefit h2,body.in-index .jj-benefit h3,body.in-index .jj-benefit h4,body.in-index .jj-benefit strong{font-size:13px!important}',
            '  body.in-index .jj-benefit p,body.in-index .jj-benefit span{font-size:11.5px}',
            '  body.in-index .jj-about{padding:20px;margin-top:34px;font-size:14px}',
            '  body.in-index .jj-about .jj-sec-title{font-size:20px!important}',
            '}',
            '@media (prefers-reduced-motion:reduce){',
            '  body.in-index .products-block .product>.p,body.in-index .products-block .product .image img,body.in-index a.jj-linkcard,body.in-index .banners-row a,body.in-index .banner a{transition:none}',
            '}'
        ].join('');
        document.head.appendChild(s);
    }

    // ─── Pomocné ──────────────────────────────────────────────────────────────

    var root = function () { return document.getElementById('content') || document.body; };

    function norm(s) { return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase(); }

    function isLayoutBox(el) {
        return el.matches('.container,.content-wrapper,.content-wrapper-in,#content,body');
    }

    // Nejvyšší předek, který obsahuje jen tento jeden nadpis sekce.
    function sectionUnit(title) {
        var u = title;
        while (u.parentElement && u.parentElement !== root() && !isLayoutBox(u.parentElement) &&
               u.parentElement.querySelectorAll('.homepage-group-title,.jj-sec-title').length <= 1) {
            u = u.parentElement;
        }
        return u;
    }

    // ─── Produktové skupiny ───────────────────────────────────────────────────

    function findGrid(title) {
        var unit = sectionUnit(title);
        var grid = unit.querySelector('.products-block');
        if (grid) return grid;
        var n = title.nextElementSibling;
        while (n && !n.matches('.homepage-group-title')) {
            if (n.matches('.products-block')) return n;
            var g = n.querySelector && n.querySelector('.products-block');
            if (g) return g;
            n = n.nextElementSibling;
        }
        return null;
    }

    function categoryHref(text) {
        var t = norm(text);
        for (var k in CATEGORY_LINKS) {
            if (t.indexOf(k) === 0) return CATEGORY_LINKS[k];
        }
        return null;
    }

    function processGroups() {
        var titles = document.querySelectorAll('.homepage-group-title');
        Array.prototype.forEach.call(titles, function (t) {
            if (t.getAttribute('data-jj') === '1') return;
            // původní „Doporučujeme" nahrazuje pás karet, ten řeší jiný skript
            if (norm(t.textContent).indexOf('doporučujeme') === 0) return;
            t.setAttribute('data-jj', '1');

            var label = t.textContent;
            var href = categoryHref(label);
            if (href && t.tagName !== 'A') {
                var a = document.createElement('a');
                a.className = 'jj-all';
                a.href = href;
                a.textContent = 'Celá kategorie';
                a.setAttribute('aria-label', 'Celá kategorie: ' + label.trim());
                t.appendChild(a);
            }

            var grid = findGrid(t);
            if (!grid || grid.getAttribute('data-jj') === '1') return;
            grid.setAttribute('data-jj', '1');

            if (MAX_PER_GROUP > 0) {
                var items = Array.prototype.filter.call(grid.children, function (c) {
                    return c.classList.contains('product');
                });
                if (items.length > MAX_PER_GROUP + 1) {
                    items.slice(MAX_PER_GROUP).forEach(function (c) { c.classList.add('jj-hid'); });
                    var wrap = document.createElement('div');
                    wrap.className = 'jj-more';
                    var btn = document.createElement('button');
                    btn.type = 'button';
                    btn.setAttribute('aria-expanded', 'false');
                    btn.textContent = 'Zobrazit všech ' + items.length + ' produktů';
                    btn.addEventListener('click', function () {
                        items.forEach(function (c) { c.classList.remove('jj-hid'); });
                        wrap.parentNode.removeChild(wrap);
                    });
                    wrap.appendChild(btn);
                    grid.insertAdjacentElement('afterend', wrap);
                }
            }
        });

        // obrázky pod záhybem načítat líně
        Array.prototype.forEach.call(
            document.querySelectorAll('body.in-index .products-block img:not([loading])'),
            function (img) { img.loading = 'lazy'; img.decoding = 'async'; }
        );
    }

    // ─── Pruh benefitů (rozpoznání podle ikon .svg) ───────────────────────────

    function processBenefits() {
        var imgs = document.querySelectorAll(
            'img[src*="/adamin/img/"],img[src$="award.svg"],img[src$="clock.svg"],img[src*="award.svg"],img[src*="clock.svg"]'
        );
        Array.prototype.forEach.call(imgs, function (img) {
            if (img.closest('.jj-benefit')) return;
            var item = img;
            while (item.parentElement && item.parentElement !== root() && !isLayoutBox(item.parentElement) &&
                   item.parentElement.querySelectorAll('img[src$=".svg"]').length === 1) {
                item = item.parentElement;
            }
            if (!item.parentElement) return;
            item.classList.add('jj-benefit');
            item.parentElement.classList.add('jj-benefits');
        });
    }

    // ─── Texty a sekce podle nadpisu ──────────────────────────────────────────

    function findHeadingByText(match, skipH1) {
        var els = root().querySelectorAll('h1,h2,h3,h4,h5,h6,div,p,span,strong');
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            if (el.children.length > 0 && !/^H[1-6]$/.test(el.tagName)) continue;
            if (skipH1 && el.tagName === 'H1') continue;
            var t = norm(el.textContent);
            if (t.length < 60 && match(t)) return el;
        }
        return null;
    }

    function processSections() {
        // 1) označit nadpisy
        var about   = findHeadingByText(function (t) { return t.indexOf('proč právě jojo') === 0; }, true);
        var reviews = findHeadingByText(function (t) { return t === 'poslední hodnocení'; }, false);
        var blog    = findHeadingByText(function (t) { return t === 'nové články'; }, false);

        [about, reviews, blog].forEach(function (el) {
            if (el && !el.classList.contains('jj-sec-title')) el.classList.add('jj-sec-title');
        });

        // 2) „Proč právě Jojo Catering?" → karta
        if (about && !about.closest('.jj-about')) {
            var box = about;
            for (var i = 0; i < 4; i++) {
                var p = box.parentElement;
                if (!p || p === root() || isLayoutBox(p) || p.textContent.length > 1600) break;
                box = p;
            }
            if (box === about && about.parentElement && !isLayoutBox(about.parentElement)) box = about.parentElement;
            box.classList.add('jj-about');
        }

        // 3) recenze a články → karty ve sloupcích
        [reviews, blog].forEach(function (title) {
            if (!title) return;
            var unit = sectionUnit(title);
            var links = Array.prototype.filter.call(unit.querySelectorAll('a'), function (a) {
                return !a.closest('.products-block') && a.textContent.trim().length > 60;
            });
            if (!links.length) return;
            links.forEach(function (a) { a.classList.add('jj-linkcard'); });
            var parent = links[0].parentElement;
            var same = links.every(function (a) { return a.parentElement === parent; });
            if (same && links.length > 1 && !parent.querySelector('.jj-sec-title')) {
                parent.classList.add('jj-linkgrid');
            }
        });
    }

    // ─── Spuštění ─────────────────────────────────────────────────────────────

    function apply() {
        processGroups();
        processBenefits();
        processSections();
    }

    function init() {
        injectStyles();
        apply();

        // Ostatní skripty (hero, karty, banery) vkládají obsah se zpožděním
        // a šablona umí skupiny přerenderovat – po dobu pár vteřin sledovat DOM.
        var timer = null;
        var obs = new MutationObserver(function () {
            clearTimeout(timer);
            timer = setTimeout(apply, 150);
        });
        obs.observe(document.body, { childList: true, subtree: true });
        setTimeout(function () { obs.disconnect(); }, 8000);
        window.addEventListener('load', apply);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
