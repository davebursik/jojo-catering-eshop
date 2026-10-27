(function () {
    'use strict';

    if (!document.body.classList.contains('in-index')) return;

    // ═══════════════════════════════════════════════════════════════════════════
    //  PRODUKTOVÉ KARTY NA ÚVODNÍ STRÁNCE – posuvné pásy ve stejném stylu
    //
    //  1) „Co dál na stůl?" – ručně vybrané produkty (pole PRODUCTS níže).
    //     Vloží se hned POD baner párty bedýnky (party-bedynka-baner.js) a nahrazuje
    //     původní skupinu „Doporučujeme" ze šablony (skryje se).
    //
    //  2) Každá další skupina produktů z homepage (Párty bedýnky, Chlebíčky, Sladké,
    //     Teplé pokrmy, Nápoje …) se automaticky převede na stejný posuvný pás.
    //     Karty se čtou přímo z produktů na stránce, takže ceny, nové produkty
    //     a fotky se aktualizují samy z e-shopu – nic se nepíše ručně.
    //     Když se produkty ve skupině nepodaří přečíst, skupina zůstane původní.
    // ═══════════════════════════════════════════════════════════════════════════

    var CDN = 'https://cdn.myshoptet.com/usr/eshop.jojocatering.cz/user/shop/big/';

    // ─── Nastavení ────────────────────────────────────────────────────────────

    var HEAD = {
        eyebrow: '⭐ Doporučujeme',
        title: 'Co dál na stůl?',
        sub: 'Výběr dobrot, které se skvěle doplní s párty bedýnkou.'
    };

    var MORE = { text: 'Celá nabídka', href: '/nabidka/' };

    // true  = původní skupinu „Doporučujeme" ze šablony skrýt (nahrazuje ji pás výše)
    var HIDE_ORIGINAL_DOPORUCUJEME = true;

    // true  = ostatní skupiny produktů převést na posuvné pásy
    // false = nechat je původní
    var CONVERT_CATEGORIES = true;

    // Kolik produktů maximálně ukázat v pásu jedné kategorie (zbytek je v „Celá kategorie")
    var MAX_PER_CATEGORY = 12;

    // Odkazy na kategorie – záloha, kdyby je nešlo zjistit ze stránky
    var CATEGORY_LINKS = {
        'párty bedýnky, mísy, saláty': '/party-bedynky-misy-salaty/',
        'chlebíčky a pomazánky': '/chlebicky-a-pomazanky/',
        'sladké dobroty': '/sladke-dobroty/',
        'teplé pokrmy': '/teple-pokrmy/',
        'nápoje': '/napoje/'
    };

    // Ručně vybrané produkty pro pás „Co dál na stůl?". Ceny, gramáže a hodnocení jsou
    // psané ručně (z produktových stránek) – při změně na e-shopu je uprav tady.
    // Foto: v komentáři u produktu jsou další fotky z detailu, stačí vyměnit odkaz.
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
            href: '/pannacotta-mango/'
        }
    ];

    // ─── Pomocné ──────────────────────────────────────────────────────────────

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function txt(n) {
        return ((n && n.textContent) || '').replace(/\s+/g, ' ').trim();
    }

    function normKey(s) {
        return String(s || '').toLowerCase().replace(/[….]+/g, '').replace(/\s+/g, ' ').trim();
    }

    // Celá skupina produktů (nadpis + produkty): nejvyšší předek, který obsahuje
    // právě tento jeden nadpis. Vkládáme PŘED něj, ne dovnitř skupiny.
    function groupUnit(title) {
        var u = title;
        while (u.parentElement && u.parentElement !== document.body &&
               u.parentElement.querySelectorAll('.homepage-group-title').length === 1) {
            u = u.parentElement;
        }
        return u;
    }

    // Uzly, které patří ke skupině. Při ploché struktuře (nadpis + sourozenci) jsou to
    // sourozenci až do dalšího nadpisu.
    function groupNodes(title, unit) {
        if (unit !== title) return [unit];
        var nodes = [];
        var n = title.nextElementSibling;
        while (n && !n.matches('.homepage-group-title') &&
               !n.querySelector('.homepage-group-title') && !n.id) {
            nodes.push(n);
            n = n.nextElementSibling;
        }
        return nodes;
    }

    function hideGroup(title) {
        var unit = groupUnit(title);
        unit.classList.add('jojo-orig-hidden');
        if (unit === title) {
            groupNodes(title, unit).forEach(function (n) { n.classList.add('jojo-orig-hidden'); });
        }
    }

    // ─── Styly ────────────────────────────────────────────────────────────────

    function injectStyles() {
        if (document.getElementById('jojo-karty-style')) return;
        var style = document.createElement('style');
        style.id = 'jojo-karty-style';
        style.textContent = [
            '.jojo-orig-hidden{display:none!important}',
            '.jdk-wrap{margin:30px 0}',
            '.jdk-wrap.jdk-cat{margin:26px 0 8px}',
            '.jdk{font-family:inherit}',
            '.jdk-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:14px}',
            '.jdk-eb{display:inline-flex;font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;font-weight:700;color:#8a6a14;background:#F7EAC4;padding:5px 13px;border-radius:30px}',
            '.jdk-title{font-weight:800;color:#4C1536;font-size:27px;line-height:1.12;letter-spacing:-.01em;margin:11px 0 4px}',
            '.jdk-sub{color:#6b5a61;font-size:14px;line-height:1.5;margin:0}',
            '.jdk-side{display:flex;align-items:center;gap:16px;flex-shrink:0}',
            '.jdk-all{font-size:13px;font-weight:700;color:#4C1536!important;text-decoration:none!important;border-bottom:2px solid #DFC15E;padding-bottom:1px;white-space:nowrap;transition:border-color .2s ease}',
            '.jdk-all:hover{border-color:#4C1536}',
            '.jdk-nav{display:flex;gap:8px;flex-shrink:0}',
            '.jdk-arrow{width:42px;height:42px;padding:0;border-radius:50%;border:1.5px solid #e3d3dc;background:#fff;color:#4C1536;font-size:18px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s ease,color .2s ease,border-color .2s ease}',
            '.jdk-arrow:hover:not(:disabled){background:#4C1536;color:#fff;border-color:#4C1536}',
            '.jdk-arrow:disabled{opacity:.35;cursor:default}',

            /* kategorie: menší nadpis, bez odznáčku */
            '.jdk-compact .jdk-head{align-items:center}',
            '.jdk-compact .jdk-title{font-size:23px;margin:0}',

            /* posuvný pás */
            '.jdk-track{display:flex;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;padding:6px 2px 16px;margin:0 -2px;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}',
            '.jdk-track::-webkit-scrollbar{display:none}',

            /* karta */
            '.jdk-card{flex:0 0 262px;scroll-snap-align:start;display:flex;flex-direction:column;background:#fff;border:1px solid #efe4eb;border-radius:18px;overflow:hidden;text-decoration:none!important;color:inherit!important;box-shadow:0 6px 18px rgba(76,21,54,.06);transition:transform .2s ease,box-shadow .2s ease}',
            '@media (pointer:fine){.jdk-card:hover{transform:translateY(-4px);box-shadow:0 14px 28px rgba(76,21,54,.14)}.jdk-card:hover .jdk-img img{transform:scale(1.06)}}',
            '.jdk-img{position:relative;aspect-ratio:4/3;background:linear-gradient(135deg,#fdf6fa,#f3e6ee);overflow:hidden}',
            '.jdk-img img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;transition:transform .5s ease}',
            '.jdk-badge{position:absolute;top:10px;left:10px;z-index:1;background:#DFC15E;color:#4C1536;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:4px 10px;border-radius:20px}',
            '.jdk-body{display:flex;flex-direction:column;flex:1;padding:14px 16px 16px}',
            '.jdk-name{font-weight:800;color:#4C1536;font-size:16px;line-height:1.25;margin:0 0 5px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.5em}',
            '.jdk-tag{font-size:13px;line-height:1.45;color:#6b5a61;margin:0 0 10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.9em}',
            '.jdk-meta{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px;min-height:24px}',
            '.jdk-meta span{font-size:11.5px;color:#4C1536;background:#faf4f7;border:1px solid #efe2ea;padding:3px 9px;border-radius:7px}',
            '.jdk-rate{font-size:12px;color:#5b4b52;margin:0 0 10px}',
            '.jdk-rate b{color:#c39a32;letter-spacing:1px;font-weight:400;margin-right:4px}',
            '.jdk-foot{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:12px;border-top:1px solid #f3e9ef}',
            '.jdk-price{font-weight:800;color:#4C1536;font-size:19px;line-height:1;white-space:nowrap}',
            '.jdk-unit{font-size:12px;font-weight:600;color:#8c7a83;margin-left:3px}',
            '.jdk-go{font-size:13px;font-weight:700;color:#fff;background:#4C1536;border-radius:9px;padding:8px 13px;white-space:nowrap;transition:background .2s ease}',
            '.jdk-card:hover .jdk-go{background:#6a1e4b}',

            /* poslední karta „Celá nabídka / kategorie" */
            '.jdk-more{flex:0 0 200px;scroll-snap-align:start;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;border:2px dashed #c9a0bb;border-radius:18px;background:#faf5f8;color:#4C1536!important;font-weight:800;font-size:16px;text-decoration:none!important;padding:20px;transition:background .2s ease,border-color .2s ease}',
            '.jdk-more span{display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:#4C1536;color:#fff;font-size:20px}',
            '.jdk-more:hover{background:#f3e6ee;border-color:#4C1536}',

            /* ukazatel posunu */
            '.jdk-bar{height:4px;background:#efe4eb;border-radius:4px;overflow:hidden}',
            '.jdk-bar i{display:block;height:100%;width:30%;background:#4C1536;border-radius:4px}',

            '.jdk a:focus-visible,.jdk button:focus-visible{outline:3px solid #DFC15E;outline-offset:3px}',

            /* mobil */
            '@media (max-width:767px){',
            '  .jdk-wrap{margin:24px 0}',
            '  .jdk-wrap.jdk-cat{margin:20px 0 6px}',
            '  .jdk-title{font-size:22px}',
            '  .jdk-compact .jdk-title{font-size:19px}',
            '  .jdk-sub{font-size:13px}',
            '  .jdk-nav{display:none}',
            '  .jdk-track{gap:12px}',
            '  .jdk-card{flex-basis:72vw;max-width:270px}',
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

    function renderCard(p) {
        var meta = (p.meta || []).map(function (m) { return '<span>' + esc(m) + '</span>'; }).join('');
        var rate = p.rating
            ? '<div class="jdk-rate"><b>★★★★★</b>' + esc(p.rating.v) + ' (' + esc(p.rating.n) + ' hodnocení)</div>'
            : '';
        return [
            '<a class="jdk-card" href="' + esc(p.href) + '">',
            '  <div class="jdk-img">',
            p.badge ? '    <span class="jdk-badge">' + esc(p.badge) + '</span>' : '',
            p.img ? '    <img src="' + esc(p.img) + '" alt="' + esc(p.name) + '" loading="lazy" decoding="async" width="1024" height="768">' : '',
            '  </div>',
            '  <div class="jdk-body">',
            '    <div class="jdk-name">' + esc(p.name) + '</div>',
            '    <div class="jdk-tag">' + esc(p.tag || '') + '</div>',
            '    <div class="jdk-meta">' + meta + '</div>',
            rate,
            '    <div class="jdk-foot">',
            '      <div class="jdk-price">' + esc(p.price || '') + (p.unit ? '<span class="jdk-unit">' + esc(p.unit) + '</span>' : '') + '</div>',
            '      <span class="jdk-go">Detail →</span>',
            '    </div>',
            '  </div>',
            '</a>',
        ].join('');
    }

    // o: { eyebrow, title, sub, products, more:{text,href}, all:{text,href}, compact }
    function renderSection(o) {
        return [
            '<section class="jdk' + (o.compact ? ' jdk-compact' : '') + '" aria-label="' + esc(o.title) + '">',
            '  <div class="jdk-head">',
            '    <div>',
            o.eyebrow ? '      <span class="jdk-eb">' + esc(o.eyebrow) + '</span>' : '',
            '      <div class="jdk-title">' + esc(o.title) + '</div>',
            o.sub ? '      <p class="jdk-sub">' + esc(o.sub) + '</p>' : '',
            '    </div>',
            '    <div class="jdk-side">',
            o.all ? '      <a class="jdk-all" href="' + esc(o.all.href) + '">' + esc(o.all.text) + ' →</a>' : '',
            '      <div class="jdk-nav">',
            '        <button type="button" class="jdk-arrow jdk-prev" aria-label="Předchozí produkty">←</button>',
            '        <button type="button" class="jdk-arrow jdk-next" aria-label="Další produkty">→</button>',
            '      </div>',
            '    </div>',
            '  </div>',
            '  <div class="jdk-track">',
            o.products.map(renderCard).join(''),
            '    <a class="jdk-more" href="' + esc(o.more.href) + '"><span>→</span>' + esc(o.more.text) + '</a>',
            '  </div>',
            '  <div class="jdk-bar"><i></i></div>',
            '</section>',
        ].join('');
    }

    // ─── Ovládání posunu (šipky + ukazatel) ───────────────────────────────────

    function wire(root) {
        var track = root.querySelector('.jdk-track');
        var prev  = root.querySelector('.jdk-prev');
        var next  = root.querySelector('.jdk-next');
        var thumb = root.querySelector('.jdk-bar i');
        if (!track) return;

        function update() {
            var max = track.scrollWidth - track.clientWidth;
            var ratio = track.scrollWidth ? track.clientWidth / track.scrollWidth : 1;
            if (thumb) {
                thumb.style.width = Math.min(100, Math.max(8, ratio * 100)) + '%';
                thumb.style.marginLeft = (max > 0 ? (track.scrollLeft / track.scrollWidth) * 100 : 0) + '%';
            }
            if (prev) prev.disabled = track.scrollLeft <= 4;
            if (next) next.disabled = track.scrollLeft >= max - 4;
        }

        function step(dir) {
            track.scrollBy({ left: dir * Math.max(240, track.clientWidth * 0.85), behavior: 'smooth' });
        }

        if (prev) prev.addEventListener('click', function () { step(-1); });
        if (next) next.addEventListener('click', function () { step(1); });
        track.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        update();
        // obrázky se dotahují líně – po načtení přepočítat
        setTimeout(update, 600);
    }

    // Vloží hotovou sekci před/za kotvu; když kotva není uvnitř .container, přidá vlastní.
    function insertSection(anchorEl, pos, id, html, extraClass, catKey) {
        var wrap = document.createElement('div');
        if (id) wrap.id = id;
        wrap.className = 'jdk-wrap' + (extraClass ? ' ' + extraClass : '');
        if (catKey) wrap.setAttribute('data-jdk-cat', catKey);
        wrap.innerHTML = anchorEl.closest('.container') ? html : '<div class="container">' + html + '</div>';
        anchorEl.insertAdjacentElement(pos, wrap);
        wire(wrap);
        return wrap;
    }

    // ═══ 1) „Co dál na stůl?" – ručně vybrané karty ═══════════════════════════

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

    // Skryje původní skupinu „Doporučujeme" ze šablony (nadpis + její produkty).
    function hideOriginalDoporucujeme() {
        if (!HIDE_ORIGINAL_DOPORUCUJEME) return;
        var titles = document.querySelectorAll('.homepage-group-title');
        for (var i = 0; i < titles.length; i++) {
            if (normKey(txt(titles[i])).indexOf('doporučujeme') === 0) hideGroup(titles[i]);
        }
    }

    function placeFeatured(allowFallback) {
        if (document.getElementById('jojo-karty')) return true;
        var a = findFeaturedAnchor(allowFallback);
        if (!a) return false;
        insertSection(a.el, a.pos, 'jojo-karty', renderSection({
            eyebrow: HEAD.eyebrow, title: HEAD.title, sub: HEAD.sub,
            products: PRODUCTS, more: MORE
        }));
        hideOriginalDoporucujeme();
        // šablona / doplňky mohou skupiny přerenderovat – pro jistotu ještě jednou
        setTimeout(hideOriginalDoporucujeme, 1500);
        return true;
    }

    // ═══ 2) Ostatní skupiny → posuvné pásy (karty se čtou ze stránky) ═════════

    var EMOJI = /[\u2190-\u2BFF\uFE0F\u200D\u20E3]|[\uD83C-\uD83E][\uDC00-\uDFFF]/g;

    function fmtPrice(s) {
        var m = String(s || '').match(/(\d[\d\s\u00a0]*)(?:,\d+)?\s*Kč/);
        if (!m) return '';
        var digits = m[1].replace(/[\s\u00a0]+/g, '\u00a0').replace(/^\u00a0|\u00a0$/g, '');
        return digits ? digits + '\u00a0Kč' : '';
    }

    // „Chlebíčky - 13 ks", „Bohemia sekt 0,7 l", „… Objednávka min. 3 dny předem"
    // → čistý název + čipy (13 ks / 0,7 l / objednat min. 3 dny předem)
    function splitName(raw) {
        var name = raw, chips = [];
        var m = name.match(/\.?\s*Objednávka\s+min\.?\s*(\d+)\s*dn[ůyi]?\s+předem\.?\s*$/i);
        if (m) {
            chips.push('objednat min. ' + m[1] + ' dny předem');
            name = name.slice(0, m.index);
        }
        var q = name.match(/\s*[-–]?\s*(\d+(?:[.,]\d+)?\s*(?:ks|kg|g|l))\s*$/i);
        if (q && q.index > 0) {
            chips.unshift(q[1].replace(/\s+/g, ' '));
            name = name.slice(0, q.index);
        }
        name = name.replace(/[\s.,–-]+$/, '');
        name = name.charAt(0).toUpperCase() + name.slice(1);
        return { name: name, chips: chips };
    }

    function cleanDesc(d, name) {
        var raw = String(d || '');
        var cut = /(\.{3}|…)\s*$/.test(raw);
        d = raw.replace(EMOJI, ' ').replace(/\s+/g, ' ').trim();
        var nl = name.toLowerCase();
        if (d.toLowerCase().indexOf(nl) === 0) d = d.slice(nl.length);
        d = d.replace(/^[\s\-–—:.,!]+/, '').replace(/(\.{3}|…)\s*$/, '').trim();
        if (d.length > 100) {
            d = d.slice(0, 100).replace(/\s+\S*$/, '').replace(/[\s,.;:–-]+$/, '');
            cut = true;
        }
        if (d.length < 12) return '';
        return d + (cut ? '…' : '');
    }

    function pickSrc(img) {
        if (!img) return '';
        var set = img.getAttribute('data-srcset') || img.getAttribute('srcset');
        if (set) {
            var best = '', bw = 0;
            set.split(',').forEach(function (p) {
                var parts = p.trim().split(/\s+/);
                var w = parseFloat(parts[1]) || 1;
                if (parts[0] && w >= bw) { bw = w; best = parts[0]; }
            });
            if (best && !/^data:/.test(best)) return best;
        }
        var s = img.getAttribute('data-src') || img.getAttribute('data-original') || img.getAttribute('src') || '';
        return /^data:/.test(s) ? '' : s;
    }

    function scrapeProduct(el) {
        var link = el.querySelector('a.name, .name a, a[data-micro="url"]') || el.querySelector('a[href]');
        var href = link && link.getAttribute('href');
        if (!href) return null;

        var img = el.querySelector('.image img') || el.querySelector('img');
        var nameEl = el.querySelector('[data-micro="name"]') || el.querySelector('.name');
        var rawName = txt(nameEl) || (img && (img.getAttribute('alt') || '')) || '';
        rawName = rawName.replace(/\s+/g, ' ').trim();
        if (!rawName) return null;
        var parts = splitName(rawName);

        var priceEl = el.querySelector('.price-final strong, .price-final, [data-micro="price"], .prices strong');
        var price = fmtPrice(txt(priceEl)) || fmtPrice(txt(el));

        var descEl = el.querySelector('[data-micro="description"], .p-desc, .description');
        var flagEl = el.querySelector('.flags .flag, .flag');
        var badge = txt(flagEl);
        if (badge.length > 14) badge = '';

        var rating = null;
        var rc = el.querySelector('[data-micro-rating-count]');
        var rv = el.querySelector('[data-micro-rating-value]');
        if (rc && rv) {
            var n = parseInt(rc.getAttribute('data-micro-rating-count'), 10);
            var v = parseFloat(rv.getAttribute('data-micro-rating-value'));
            if (n >= 3 && v > 0) rating = { v: v.toFixed(1).replace('.', ','), n: n };
        }

        return {
            name: parts.name,
            tag: cleanDesc(txt(descEl), parts.name),
            meta: parts.chips,
            price: price, unit: '',
            badge: badge,
            rating: rating,
            img: pickSrc(img),
            href: href
        };
    }

    function collectProducts(nodes) {
        var els = [];
        nodes.forEach(function (n) {
            if (n.matches && n.matches('.product')) els.push(n);
            Array.prototype.push.apply(els, n.querySelectorAll('.product'));
        });
        var seen = {}, out = [];
        els.forEach(function (el) {
            if (el.closest('.slick-cloned, .swiper-slide-duplicate, .cloned')) return;
            var p = scrapeProduct(el);
            if (!p || seen[p.href]) return;
            seen[p.href] = true;
            out.push(p);
        });
        return out;
    }

    function categoryLink(title, key) {
        var a = title.querySelector('a[href]') || title.closest('a[href]');
        if (a) return a.getAttribute('href');
        if (CATEGORY_LINKS[key]) return CATEGORY_LINKS[key];
        var links = document.querySelectorAll('a[href]');
        for (var i = 0; i < links.length; i++) {
            if (normKey(txt(links[i])) === key) return links[i].getAttribute('href');
        }
        return '/nabidka/';
    }

    function convertCategories() {
        if (!CONVERT_CATEGORIES) return;
        var titles = document.querySelectorAll('.homepage-group-title');
        Array.prototype.forEach.call(titles, function (t) {
            var label = txt(t);
            if (!label) return;
            var key = normKey(label);
            if (key.indexOf('doporučujeme') === 0) return;      // řeší část 1)

            var unit = groupUnit(t);
            if (unit.classList.contains('jojo-orig-hidden')) return;   // už převedeno

            var products = collectProducts(groupNodes(t, unit));
            if (!products.length) return;                       // nečitelné → necháme původní

            var exists = false;
            Array.prototype.forEach.call(document.querySelectorAll('.jdk-cat[data-jdk-cat]'), function (w) {
                if (w.getAttribute('data-jdk-cat') === key) exists = true;
            });
            if (!exists) {
                var href = categoryLink(t, key);
                insertSection(unit, 'beforebegin', '', renderSection({
                    title: label,
                    products: products.slice(0, MAX_PER_CATEGORY),
                    more: { text: 'Celá kategorie', href: href },
                    all: { text: 'Celá kategorie', href: href },
                    compact: true
                }), 'jdk-cat', key);
            }
            hideGroup(t);
        });
    }

    // ─── Init ─────────────────────────────────────────────────────────────────

    function init() {
        injectStyles();

        // a) Co dál na stůl? – počkat na baner bedýnky, jinak záloha po 2,5 s
        if (!placeFeatured(false)) {
            var done = false;
            var obs = new MutationObserver(function () {
                if (!done && placeFeatured(false)) { done = true; obs.disconnect(); }
            });
            obs.observe(document.body, { childList: true, subtree: true });

            setTimeout(function () {
                if (done) return;
                obs.disconnect();
                if (placeFeatured(true)) { done = true; return; }
                var obs2 = new MutationObserver(function () {
                    if (placeFeatured(true)) obs2.disconnect();
                });
                obs2.observe(document.body, { childList: true, subtree: true });
                setTimeout(function () { obs2.disconnect(); }, 4000);
            }, 2500);
        }

        // b) kategorie – hned, a pro jistotu znovu po úplném načtení (doplňky přerenderují skupiny)
        convertCategories();
        window.addEventListener('load', function () {
            convertCategories();
            setTimeout(convertCategories, 1500);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
