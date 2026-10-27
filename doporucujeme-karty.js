(function () {
    'use strict';

    if (!document.body.classList.contains('in-index')) return;

    // ═══════════════════════════════════════════════════════════════════════════
    //  DOPORUČUJEME – posuvný pás produktových karet
    //  Vloží se hned POD baner párty bedýnky (party-bedynka-baner.js).
    //  Když baner na stránce není, vloží se doprostřed mezi skupiny produktů.
    //
    //  Pořadí karet = pořadí v poli PRODUCTS. Ceny, gramáže a hodnocení jsou
    //  psané ručně (vzato z produktových stránek) – při změně na e-shopu uprav tady.
    //  Foto: v komentáři u produktu jsou další fotky z detailu, stačí vyměnit odkaz.
    // ═══════════════════════════════════════════════════════════════════════════

    var CDN = 'https://cdn.myshoptet.com/usr/eshop.jojocatering.cz/user/shop/big/';

    var HEAD = {
        eyebrow: '⭐ Doporučujeme',
        title: 'Co dál na stůl?',
        sub: 'Výběr dobrot, které se skvěle doplní s párty bedýnkou.'
    };

    var MORE = { text: 'Celá nabídka', href: '/nabidka/' };

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

    // ─── Styly ────────────────────────────────────────────────────────────────

    function injectStyles() {
        if (document.getElementById('jojo-karty-style')) return;
        var style = document.createElement('style');
        style.id = 'jojo-karty-style';
        style.textContent = [
            '.jdk-wrap{margin:30px 0}',
            '.jdk{font-family:inherit}',
            '.jdk-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:14px}',
            '.jdk-eb{display:inline-flex;font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;font-weight:700;color:#8a6a14;background:#F7EAC4;padding:5px 13px;border-radius:30px}',
            '.jdk-title{font-weight:800;color:#4C1536;font-size:27px;line-height:1.12;letter-spacing:-.01em;margin:11px 0 4px}',
            '.jdk-sub{color:#6b5a61;font-size:14px;line-height:1.5;margin:0}',
            '.jdk-nav{display:flex;gap:8px;flex-shrink:0}',
            '.jdk-arrow{width:42px;height:42px;padding:0;border-radius:50%;border:1.5px solid #e3d3dc;background:#fff;color:#4C1536;font-size:18px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s ease,color .2s ease,border-color .2s ease}',
            '.jdk-arrow:hover:not(:disabled){background:#4C1536;color:#fff;border-color:#4C1536}',
            '.jdk-arrow:disabled{opacity:.35;cursor:default}',

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

            /* poslední karta „Celá nabídka" */
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
            '  .jdk-title{font-size:22px}',
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
            '    <img src="' + esc(p.img) + '" alt="' + esc(p.name) + '" loading="lazy" decoding="async" width="1024" height="768">',
            '  </div>',
            '  <div class="jdk-body">',
            '    <div class="jdk-name">' + esc(p.name) + '</div>',
            '    <div class="jdk-tag">' + esc(p.tag) + '</div>',
            '    <div class="jdk-meta">' + meta + '</div>',
            rate,
            '    <div class="jdk-foot">',
            '      <div class="jdk-price">' + esc(p.price) + (p.unit ? '<span class="jdk-unit">' + esc(p.unit) + '</span>' : '') + '</div>',
            '      <span class="jdk-go">Detail →</span>',
            '    </div>',
            '  </div>',
            '</a>',
        ].join('');
    }

    function renderSection() {
        return [
            '<section class="jdk" aria-label="' + esc(HEAD.title) + '">',
            '  <div class="jdk-head">',
            '    <div>',
            '      <span class="jdk-eb">' + esc(HEAD.eyebrow) + '</span>',
            '      <div class="jdk-title">' + esc(HEAD.title) + '</div>',
            '      <p class="jdk-sub">' + esc(HEAD.sub) + '</p>',
            '    </div>',
            '    <div class="jdk-nav">',
            '      <button type="button" class="jdk-arrow jdk-prev" aria-label="Předchozí produkty">←</button>',
            '      <button type="button" class="jdk-arrow jdk-next" aria-label="Další produkty">→</button>',
            '    </div>',
            '  </div>',
            '  <div class="jdk-track">',
            PRODUCTS.map(renderCard).join(''),
            '    <a class="jdk-more" href="' + esc(MORE.href) + '"><span>→</span>' + esc(MORE.text) + '</a>',
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

    // ─── Kam vložit ───────────────────────────────────────────────────────────
    // 1) hned pod baner párty bedýnky
    // 2) záloha: doprostřed mezi skupiny produktů / pod mřížku kategorií

    function findAnchor(allowFallback) {
        var party = document.getElementById('jojo-banner-party-bedynka');
        if (party) return { el: party, pos: 'afterend' };
        if (!allowFallback) return null;

        var titles = document.querySelectorAll('.homepage-group-title');
        if (titles.length >= 2) {
            return { el: titles[Math.floor(titles.length / 2)], pos: 'beforebegin' };
        }
        var cats = document.querySelector('.hp-categories');
        if (cats) return { el: cats, pos: 'afterend' };
        return null;
    }

    function place(allowFallback) {
        if (document.getElementById('jojo-karty')) return true;
        var a = findAnchor(allowFallback);
        if (!a) return false;

        var wrap = document.createElement('div');
        wrap.id = 'jojo-karty';
        wrap.className = 'jdk-wrap';
        var inner = renderSection();
        wrap.innerHTML = a.el.closest('.container') ? inner : '<div class="container">' + inner + '</div>';
        a.el.insertAdjacentElement(a.pos, wrap);
        wire(wrap);
        return true;
    }

    function init() {
        injectStyles();
        if (place(false)) return;

        // Baner párty bedýnky se může vložit o chvilku později – chvíli na něj počkat,
        // pak použít zálohu.
        var done = false;
        var obs = new MutationObserver(function () {
            if (!done && place(false)) { done = true; obs.disconnect(); }
        });
        obs.observe(document.body, { childList: true, subtree: true });

        setTimeout(function () {
            if (done) return;
            obs.disconnect();
            // záloha jen když baner opravdu není; pak ještě chvíli čekat na obsah homepage
            if (place(true)) { done = true; return; }
            var obs2 = new MutationObserver(function () {
                if (place(true)) obs2.disconnect();
            });
            obs2.observe(document.body, { childList: true, subtree: true });
            setTimeout(function () { obs2.disconnect(); }, 4000);
        }, 2500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
