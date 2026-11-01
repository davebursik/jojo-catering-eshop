(function () {
    'use strict';

    if (!document.body.classList.contains('in-index')) return;

    // ═══════════════════════════════════════════════════════════════════════════
    //  KARTY NA ÚVODNÍ STRÁNCE
    //
    //  1) „Doporučujeme" – ručně vybraný pás karet (blok FEATURED níže). Vloží se
    //     hned POD baner párty bedýnky (party-bedynka-baner.js) a nahradí původní
    //     skupinu „Doporučujeme" ze šablony.
    //
    //  2) Ostatní skupiny/kategorie na homepage – skript si PŘEČTE produkty, které
    //     Shoptet vykreslil (název, foto, cena, hodnocení, štítky, popis) a postaví
    //     z nich stejné karty. Co přidáš do kategorie, se objeví samo.
    //     Pozor: kolik produktů skupina ukáže, určuje nastavení skupiny na úvodní
    //     stránce v administraci Shoptetu (počet produktů ve skupině).
    //     Když skript skupinu nedokáže přečíst, nechá ji beze změny (a napíše
    //     varování do konzole).
    // ═══════════════════════════════════════════════════════════════════════════

    // true = posuvné karty i pro ostatní skupiny/kategorie; false = jen „Doporučujeme"
    var CATEGORY_STRIPS = true;
    // názvy skupin, které se mají nechat v původní podobě (malá/velká písmena nehrají roli)
    var SKIP_GROUPS = [];

    var CDN = 'https://cdn.myshoptet.com/usr/eshop.jojocatering.cz/user/shop/big/';

    var HEAD = {
        eyebrow: '⭐ Doporučujeme',
        title: 'Co dál na stůl?',
        sub: 'Výběr dobrot, které se skvěle doplní s párty bedýnkou.'
    };

    var MORE = { text: 'Celá nabídka', href: '/nabidka/' };

    // true = původní skupinu „Doporučujeme" ze šablony skrýt (nahrazuje ji tento pás)
    // false = nechat obojí na stránce
    var HIDE_ORIGINAL_DOPORUCUJEME = true;

    var PRODUCTS = [
        {
            name: 'Kuřecí rarášci s domácími dipy',
            tag: 'Křupavé kuřecí řízečky se dvěma domácími dipy.',
            meta: ['1 kg'],
            price: '790 Kč', unit: '',
            rating: { v: '5,0', n: 7 },
            img: CDN + '23_kureci-rarasci.png?ff=1&x=1024&y=768&q=85&ts=6931b352&sg=161563f2',
            href: '/kureci-rarasci/'
        },
        {
            name: 'Mini bacon burger',
            tag: 'Hovězí krk, slanina, čedar a medovo-hořčičná majonéza.',
            meta: ['od 5 ks', 'objednat 3 dny předem'],
            price: '165 Kč', unit: '/ ks',
            // další fotky: 289-1_miniburger-a-ruka-e-shop.jpg, 289-2_miniburger-4-e-shop.jpg
            img: CDN + '289-3_miniburger-1364x1024-pikto.jpg?ff=1&x=1024&y=768&q=85&ts=66a75e3a&sg=161563f2',
            cart: false,
            href: '/mini-bacon-burger/'
        },
        {
            name: 'Slaný koláč se slaninou a švýcarským sýrem',
            tag: 'Čerstvě upečený, ke krájení pro celou společnost.',
            meta: ['ø 24 cm', '1 kg'],
            price: '850 Kč', unit: '',
            badge: 'Novinka',
            // další foto: 324-1_slany-kolac-2.png
            img: CDN + '324_slany-kolac-1.png?ff=1&x=1024&y=768&q=85&ts=6931909e&sg=161563f2',
            href: '/slany-kolac-se-slaninou-a-svycarskym-syrem/'
        },
        {
            name: 'Minicroissant s prosciuttem a parmazánem',
            tag: 'Máslový croissant, žervé, rukola a parmazán.',
            meta: [],
            price: '79 Kč', unit: '/ ks',
            badge: 'Novinka',
            // další foto: 321-1_db-06894.jpg
            img: CDN + '321_mini-croisanty.jpg?ff=1&x=1024&y=768&q=85&ts=67ed9060&sg=161563f2',
            href: '/minicroissant-s-prosciuttem-a-parmazanem/'
        },
        {
            name: 'Masové taštičky',
            tag: 'Listové těsto, hovězí maso a slanina, sypané sezamem.',
            meta: ['24 ks'],
            price: '936 Kč', unit: '',
            img: CDN + '271-1_masove-tasticky-1364x1024-pikto.jpg?ff=1&x=1024&y=768&q=85&ts=66a75de9&sg=161563f2',
            href: '/masove-tasticky-24-ks/'
        },
        {
            name: '1/2 tortila s kuřecím masem a čedarem',
            tag: 'Zelenina a domácí dresink, ideální na hromadné akce.',
            meta: ['cca 163 g'],
            price: '85 Kč', unit: '/ ks',
            // další foto: 336-1_tortila1.jpg
            img: CDN + '336_tortily2.jpg?ff=1&x=1024&y=768&q=85&ts=6a2ad95c&sg=161563f2',
            href: '/1-2-tortila-s-kurecim-masem--chedarem--zeleninou--domacim-dresingem/'
        },
        {
            name: 'Mrkvové chlebíčky s petrželkovou pomazánkou',
            tag: 'Lehká fit varianta s mrkvovým salátkem.',
            meta: ['13 ks'],
            price: '637 Kč', unit: '',
            // další foto: 74-1_mrkvove-2.jpg
            img: CDN + '74-2_mrkvove-chlebicky-1364x1024-pikto.jpg?ff=1&x=1024&y=768&q=85&ts=66a75d96&sg=161563f2',
            href: '/chlebicky-mrkvove-s-petrzelkovou-pomazankou/'
        },
        {
            name: 'Sekaná',
            tag: 'Podle rodinného receptu, po které se na oslavě zapráší.',
            meta: ['1 kg'],
            price: '790 Kč', unit: '',
            rating: { v: '4,7', n: 3 },
            img: CDN + '56_sekana.png?ff=1&x=1024&y=768&q=85&ts=69319839&sg=161563f2',
            href: '/sekana/'
        },
        {
            name: 'Panna Cotta mango',
            tag: 'Jemný dezert s mangem.',
            meta: ['od 5 ks'],
            price: '85 Kč', unit: '/ ks',
            badge: 'Novinka',
            img: CDN + '326_panna-cotta-1364x1024.jpg?ff=1&x=1024&y=768&q=85&ts=68ff3761&sg=161563f2',
            cart: false,
            href: '/pannacotta-mango/'
        }
    ];

    // ─── Pomocné ──────────────────────────────────────────────────────────────

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function clean(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }

    function norm(s) { return clean(s).toLowerCase(); }

    function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

    function plural(n) { return n + (n === 1 ? ' produkt' : (n >= 2 && n <= 4 ? ' produkty' : ' produktů')); }

    var EMOJI = /[\u{1F000}-\u{1FAFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}]/gu;

    // Celá skupina produktů (nadpis + produkty): nejvyšší předek, který obsahuje
    // právě tento jeden nadpis.
    function groupUnit(title) {
        var u = title;
        while (u.parentElement && u.parentElement !== document.body &&
               u.parentElement.querySelectorAll('.homepage-group-title').length === 1) {
            u = u.parentElement;
        }
        return u;
    }

    // Prvky, které patří ke skupině: celá jednotka, nebo (plochá struktura) sourozenci
    // nadpisu až do dalšího nadpisu.
    function groupMembers(title, unit) {
        if (unit !== title) return [unit];
        var out = [title], n = title.nextElementSibling;
        while (n && !n.matches('.homepage-group-title') &&
               !n.querySelector('.homepage-group-title') && !n.classList.contains('jdk-wrap')) {
            out.push(n);
            n = n.nextElementSibling;
        }
        return out;
    }

    function hideGroup(members) {
        members.forEach(function (m) { m.classList.add('jojo-orig-hidden'); });
    }

    // ─── Styly ────────────────────────────────────────────────────────────────

    function injectStyles() {
        if (document.getElementById('jojo-karty-style')) return;
        var style = document.createElement('style');
        style.id = 'jojo-karty-style';
        style.textContent = [
            '.jojo-orig-hidden{display:none!important}',
            '.jdk-wrap{margin:30px 0}',
            '.jdk{font-family:inherit}',
            '.jdk-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px 16px;margin-bottom:14px;flex-wrap:wrap}',
            '.jdk-eb{display:inline-flex;font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;font-weight:700;color:#8a6a14;background:#F7EAC4;padding:5px 13px;border-radius:30px;margin-bottom:11px}',
            '.jdk-title{font-weight:800;color:#4C1536;font-size:27px;line-height:1.12;letter-spacing:-.01em;margin:0 0 4px}',
            '.jdk-sub{color:#6b5a61;font-size:14px;line-height:1.5;margin:0}',
            '.jdk-head-r{display:flex;align-items:center;gap:10px;flex-shrink:0}',
            '.jdk-nav{display:flex;gap:8px}',
            '.jdk-arrow{width:42px;height:42px;padding:0;border-radius:50%;border:1.5px solid #e3d3dc;background:#fff;color:#4C1536;font-size:18px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s ease,color .2s ease,border-color .2s ease}',
            '.jdk-arrow:hover:not(:disabled){background:#4C1536;color:#fff;border-color:#4C1536}',
            '.jdk-arrow:disabled{opacity:.35;cursor:default}',
            '.jdk-all{font-size:13px;font-weight:700;color:#4C1536!important;border:1.5px solid #e3d3dc;background:#fff;border-radius:22px;padding:10px 16px;white-space:nowrap;text-decoration:none!important;transition:background .2s ease,color .2s ease,border-color .2s ease}',
            '.jdk-all:hover{background:#4C1536;color:#fff!important;border-color:#4C1536}',

            /* posuvný pás */
            '.jdk-track{display:flex;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;padding:6px 2px 16px;margin:0 -2px;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}',
            '.jdk-track::-webkit-scrollbar{display:none}',

            /* karta */
            '.jdk-card{flex:0 0 268px;scroll-snap-align:start;display:flex;flex-direction:column;background:#fff;border:1px solid #efe4eb;border-radius:18px;overflow:hidden;box-shadow:0 6px 18px rgba(76,21,54,.06);transition:transform .2s ease,box-shadow .2s ease}',
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

            /* poslední karta „Celá nabídka / kategorie" */
            '.jdk-more{flex:0 0 200px;scroll-snap-align:start;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;border:2px dashed #c9a0bb;border-radius:18px;background:#faf5f8;color:#4C1536!important;font-weight:800;font-size:16px;text-decoration:none!important;padding:20px;transition:background .2s ease,border-color .2s ease}',
            '.jdk-more span{display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:#4C1536;color:#fff;font-size:20px}',
            '.jdk-more:hover{background:#f3e6ee;border-color:#4C1536}',

            /* ukazatel posunu */
            '.jdk-bar{height:4px;background:#efe4eb;border-radius:4px;overflow:hidden}',
            '.jdk-bar i{display:block;height:100%;width:30%;background:#4C1536;border-radius:4px}',

            '.jdk a:focus-visible,.jdk button:focus-visible{outline:3px solid #DFC15E;outline-offset:3px}',

            '.jdk-stage{position:relative}',
            '.jdk-edge{display:none}',

            /* mobil */
            '@media (max-width:767px){',
            '  .jdk-edge{display:flex;position:absolute;z-index:3;top:calc(min(74vw,290px) * .375 - 12px);width:36px;height:36px;padding:0;border:0;border-radius:50%;background:rgba(255,255,255,.94);color:#4C1536;font-size:17px;line-height:1;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,.28);cursor:pointer;transition:opacity .2s ease}',
            '  .jdk-edge-prev{left:4px}',
            '  .jdk-edge-next{right:4px}',
            '  .jdk-edge:disabled{opacity:0;pointer-events:none}',
            '  .jdk-wrap{margin:24px 0}',
            '  .jdk-title{font-size:22px}',
            '  .jdk-sub{font-size:13px}',
            '  .jdk-nav{display:none}',
            '  .jdk-all{padding:8px 13px;font-size:12.5px}',
            '  .jdk-track{gap:12px}',
            '  .jdk-card{flex-basis:74vw;max-width:290px}',
            '  .jdk-more{flex-basis:150px}',
            '}',
            '@media (prefers-reduced-motion:reduce){',
            '  .jdk-track{scroll-behavior:auto}',
            '  .jdk-card,.jdk-img img{transition:none}',
            '}',
        ].join('');
        document.head.appendChild(style);
    }

    // ─── HTML ─────────────────────────────────────────────────────────────────

    // Najde ORIGINÁLNÍ tlačítko „Do košíku" ze šablony (karta zůstává na stránce skrytá).
    // Klik na naše tlačítko pak stiskne to původní – košík, tokeny i hlášky řeší Shoptet.
    function pathOf(h) {
        try { return new URL(h, location.href).pathname.replace(/\/+$/, ''); } catch (e) { return String(h || ''); }
    }

    function originalAddButton(href) {
        var want = pathOf(href);
        var cards = document.querySelectorAll('.product, [data-micro="product"], [data-testid="productCard"]');
        for (var i = 0; i < cards.length; i++) {
            var c = cards[i];
            if (c.closest('.jdk-wrap')) continue;
            var links = c.querySelectorAll('a[href]'), match = false;
            for (var j = 0; j < links.length; j++) {
                if (pathOf(links[j].getAttribute('href')) === want) { match = true; break; }
            }
            if (!match) continue;
            var btn = c.querySelector('.add-to-cart-button, form.pr-action button[type="submit"], button.btn-cart');
            if (btn) return btn;
        }
        return null;
    }

    function renderCard(p) {
        var chips = (p.chips || p.meta || []).map(function (m) { return '<span>' + esc(m) + '</span>'; }).join('');
        var badges = p.badges || (p.badge ? [p.badge] : []);
        var badgeHtml = badges.length
            ? '<span class="jdk-badges">' + badges.map(function (b) {
                return '<span class="jdk-badge' + (/%|akce|sleva/i.test(b) ? ' jdk-sale' : '') + '">' + esc(b) + '</span>';
            }).join('') + '</span>'
            : '';
        var rate = p.rating
            ? '<div class="jdk-rate"><b>★★★★★</b>' + esc(p.rating.v) + (p.rating.n ? ' (' + esc(p.rating.n) + ' hodnocení)' : '') + '</div>'
            : '';
        var priceHtml = p.price
            ? (p.old ? '<span class="jdk-old">' + esc(p.old) + '</span>' : '') + esc(p.price) + (p.unit ? '<span class="jdk-unit">' + esc(p.unit) + '</span>' : '')
            : '';
        // „Do košíku" jen když to jde rovnou (originál má tlačítko, žádné varianty, žádné minimum kusů)
        var canCart = p.cart !== false && !p.needsDetail && !!originalAddButton(p.href);
        var action = canCart
            ? '<button type="button" class="jdk-add" data-href="' + esc(p.href) + '">Do košíku</button>'
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

    // opts: { eyebrow, title, sub, products[], moreText, moreHref, allHref }
    function renderStrip(opts) {
        return [
            '<section class="jdk" aria-label="' + esc(opts.title) + '">',
            '  <div class="jdk-head">',
            '    <div>',
            opts.eyebrow ? '      <span class="jdk-eb">' + esc(opts.eyebrow) + '</span>' : '',
            '      <div class="jdk-title" role="heading" aria-level="2">' + esc(opts.title) + '</div>',
            opts.sub ? '      <p class="jdk-sub">' + esc(opts.sub) + '</p>' : '',
            '    </div>',
            '    <div class="jdk-head-r">',
            '      <div class="jdk-nav">',
            '        <button type="button" class="jdk-arrow jdk-prev" aria-label="Předchozí produkty">←</button>',
            '        <button type="button" class="jdk-arrow jdk-next" aria-label="Další produkty">→</button>',
            '      </div>',
            opts.allHref ? '      <a class="jdk-all" href="' + esc(opts.allHref) + '">Zobrazit vše →</a>' : '',
            '    </div>',
            '  </div>',
            '  <div class="jdk-stage">',
            '    <button type="button" class="jdk-edge jdk-edge-prev jdk-prev" aria-label="Předchozí produkty">←</button>',
            '    <button type="button" class="jdk-edge jdk-edge-next jdk-next" aria-label="Další produkty">→</button>',
            '    <div class="jdk-track">',
            opts.products.map(renderCard).join(''),
            opts.moreHref ? '    <a class="jdk-more" href="' + esc(opts.moreHref) + '"><span>→</span>' + esc(opts.moreText) + '</a>' : '',
            '    </div>',
            '  </div>',
            '  <div class="jdk-bar"><i></i></div>',
            '</section>',
        ].join('');
    }

    // ─── Ovládání posunu (šipky + ukazatel) ───────────────────────────────────

    function wire(root) {
        var track = root.querySelector('.jdk-track');
        var prevs = root.querySelectorAll('.jdk-prev');
        var nexts = root.querySelectorAll('.jdk-next');
        var thumb = root.querySelector('.jdk-bar i');
        if (!track) return;

        function update() {
            var max = track.scrollWidth - track.clientWidth;
            var ratio = track.scrollWidth ? track.clientWidth / track.scrollWidth : 1;
            if (thumb) {
                thumb.style.width = Math.min(100, Math.max(8, ratio * 100)) + '%';
                thumb.style.marginLeft = (max > 0 ? (track.scrollLeft / track.scrollWidth) * 100 : 0) + '%';
            }
            Array.prototype.forEach.call(prevs, function (b) { b.disabled = track.scrollLeft <= 4; });
            Array.prototype.forEach.call(nexts, function (b) { b.disabled = track.scrollLeft >= max - 4; });
        }

        function step(dir) {
            track.scrollBy({ left: dir * Math.max(240, track.clientWidth * 0.85), behavior: 'smooth' });
        }

        // „Do košíku": stiskne původní tlačítko ze šablony; když ho nenajde, otevře detail
        root.addEventListener('click', function (e) {
            var btn = e.target.closest ? e.target.closest('.jdk-add') : null;
            if (!btn || btn.disabled) return;
            e.preventDefault();
            var href = btn.getAttribute('data-href');
            var orig = originalAddButton(href);
            if (!orig) { window.location.href = href; return; }
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
        });

        Array.prototype.forEach.call(prevs, function (b) { b.addEventListener('click', function () { step(-1); }); });
        Array.prototype.forEach.call(nexts, function (b) { b.addEventListener('click', function () { step(1); }); });
        track.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        update();
        setTimeout(update, 600); // obrázky se dotahují líně
    }

    function insertStrip(anchor, pos, id, html) {
        var wrap = document.createElement('div');
        wrap.id = id;
        wrap.className = 'jdk-wrap';
        wrap.innerHTML = anchor.closest('.container') ? html : '<div class="container">' + html + '</div>';
        anchor.insertAdjacentElement(pos, wrap);
        wire(wrap);
        return wrap;
    }

    // ═══ 1) DOPORUČUJEME (ruční výběr) ════════════════════════════════════════

    function findFeaturedAnchor(allowFallback) {
        var party = document.getElementById('jojo-banner-party-bedynka');
        if (party) return { el: party, pos: 'afterend' };
        if (!allowFallback) return null;

        var titles = document.querySelectorAll('.homepage-group-title');
        if (titles.length >= 2) return { el: groupUnit(titles[0]), pos: 'beforebegin' };
        var cats = document.querySelector('.hp-categories');
        if (cats) return { el: cats, pos: 'afterend' };
        return null;
    }

    function hideOriginalDoporucujeme() {
        if (!HIDE_ORIGINAL_DOPORUCUJEME) return;
        var titles = document.querySelectorAll('.homepage-group-title');
        for (var i = 0; i < titles.length; i++) {
            if (norm(titles[i].textContent).indexOf('doporučujeme') !== 0) continue;
            hideGroup(groupMembers(titles[i], groupUnit(titles[i])));
        }
    }

    function placeFeatured(allowFallback) {
        if (document.getElementById('jojo-karty')) return true;
        var a = findFeaturedAnchor(allowFallback);
        if (!a) return false;

        insertStrip(a.el, a.pos, 'jojo-karty', renderStrip({
            eyebrow: HEAD.eyebrow, title: HEAD.title, sub: HEAD.sub,
            products: PRODUCTS, moreText: MORE.text, moreHref: MORE.href
        }));
        hideOriginalDoporucujeme();
        setTimeout(hideOriginalDoporucujeme, 1500); // šablona/doplňky mohou skupiny přerenderovat
        return true;
    }

    // ═══ 2) OSTATNÍ SKUPINY – karty z toho, co vykreslil Shoptet ══════════════

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

    function productElements(members) {
        var found = [];
        members.forEach(function (m) {
            var list = m.matches('.product, [data-micro="product"], [data-testid="productCard"]')
                ? [m]
                : Array.prototype.slice.call(m.querySelectorAll('.product, [data-micro="product"], [data-testid="productCard"]'));
            list.forEach(function (el) { if (found.indexOf(el) === -1) found.push(el); });
        });
        // jen nejvnější karty, bez klonů z posuvníků
        return found.filter(function (el) {
            var parentCard = el.parentElement && el.parentElement.closest('.product, [data-micro="product"], [data-testid="productCard"]');
            return !parentCard && !el.closest('.slick-cloned, .swiper-slide-duplicate');
        });
    }

    // Odkaz na kategorii podle shody názvu s položkou v menu
    function categoryHref(title, titleEl) {
        var inTitle = titleEl.querySelector('a[href]');
        if (inTitle && inTitle.getAttribute('href').charAt(0) !== '#') return inTitle.getAttribute('href');
        var t = norm(title);
        var links = document.querySelectorAll('a[href]');
        for (var i = 0; i < links.length; i++) {
            var a = links[i], h = a.getAttribute('href') || '';
            if (!h || h.charAt(0) === '#' || /^javascript:/i.test(h) || a.closest('.jdk-wrap, .jojo-orig-hidden')) continue;
            if (norm(a.textContent) === t) return h;
        }
        return '';
    }

    function processCategories() {
        var titles = document.querySelectorAll('.homepage-group-title');
        var skip = SKIP_GROUPS.map(norm);
        var count = 0;

        for (var i = 0; i < titles.length; i++) {
            var tEl = titles[i];
            if (tEl.getAttribute('data-jojo-done')) continue;
            var title = clean(tEl.textContent);
            var key = norm(title);
            if (!key || key.indexOf('doporučujeme') === 0 || skip.indexOf(key) !== -1) continue;

            var unit = groupUnit(tEl);
            var members = groupMembers(tEl, unit);
            var els = productElements(members);
            var products = [], seen = {}, ok = els.length > 0;

            for (var j = 0; j < els.length && ok; j++) {
                var p = scrapeProduct(els[j]);
                if (!p) { ok = false; break; }
                if (seen[p.href]) continue;
                seen[p.href] = 1;
                products.push(p);
            }

            if (!ok || !products.length) {
                if (window.console && console.warn) console.warn('[jojo-karty] Skupinu „' + title + '" se nepodařilo přečíst – ponechána původní podoba.');
                tEl.setAttribute('data-jojo-done', 'skip');
                continue;
            }

            var href = categoryHref(title, tEl);
            insertStrip(unit, 'beforebegin', 'jojo-kat-' + (++count), renderStrip({
                title: title, sub: plural(products.length), products: products,
                allHref: href, moreHref: href, moreText: 'Celá kategorie'
            }));
            hideGroup(members);
            tEl.setAttribute('data-jojo-done', '1');
        }
        return titles.length > 0;
    }

    // ─── Init ─────────────────────────────────────────────────────────────────

    function init() {
        injectStyles();

        // 1) Doporučujeme – hned pod baner párty bedýnky; když baner chybí, záloha po 2,5 s
        if (!placeFeatured(false)) {
            var done = false;
            var obs = new MutationObserver(function () {
                if (!done && placeFeatured(false)) { done = true; obs.disconnect(); }
            });
            obs.observe(document.body, { childList: true, subtree: true });
            setTimeout(function () {
                if (done) return;
                obs.disconnect();
                if (placeFeatured(true)) return;
                var obs2 = new MutationObserver(function () { if (placeFeatured(true)) obs2.disconnect(); });
                obs2.observe(document.body, { childList: true, subtree: true });
                setTimeout(function () { obs2.disconnect(); }, 4000);
            }, 2500);
        }

        // 2) Ostatní skupiny
        if (CATEGORY_STRIPS && !processCategories()) {
            var obs3 = new MutationObserver(function () { if (processCategories()) obs3.disconnect(); });
            obs3.observe(document.body, { childList: true, subtree: true });
            setTimeout(function () { obs3.disconnect(); }, 6000);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
