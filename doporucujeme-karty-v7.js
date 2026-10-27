(function () {
    'use strict';

    if (!document.body.classList.contains('in-index')) return;

    // ═══════════════════════════════════════════════════════════════════════════
    //  DOPORUČUJEME – Moderní Gastro Banery (100% vyplněné rámečky)
    // ═══════════════════════════════════════════════════════════════════════════

    var CDN = 'https://cdn.myshoptet.com/usr/eshop.jojocatering.cz/user/shop/big/';

    var HEAD = {
        eyebrow: '⭐ Doporučujeme',
        title: 'Co dál na stůl?',
        sub: 'Výběr dobrot, které se skvěle doplní s párty bedýnkou.'
    };

    var MORE = { text: 'Celá nabídka', href: '/nabidka/' };

    var HIDE_ORIGINAL_DOPORUCUJEME = true;

    var PRODUCTS = [
        {
            name: 'Kuřecí rarášci s domácími dipy',
            tag: 'Křupavé kuřecí řízečky se dvěma dipy',
            meta: '1 kg',
            price: '790 Kč', unit: '',
            rating: '5,0',
            img: CDN + '23_kureci-rarasci.png?ff=1&x=1024&y=1024&q=85&ts=6931b352&sg=161563f2',
            href: '/kureci-rarasci/'
        },
        {
            name: 'Mini bacon burger',
            tag: 'Hovězí krk, slanina, čedar & majonéza',
            meta: 'od 5 ks',
            price: '165 Kč', unit: '/ ks',
            img: CDN + '289-3_miniburger-1364x1024-pikto.jpg?ff=1&x=1024&y=1024&q=85&ts=66a75e3a&sg=161563f2',
            href: '/mini-bacon-burger/'
        },
        {
            name: 'Slaný koláč se slaninou a sýrem',
            tag: 'Čerstvě upečený ke krájení',
            meta: 'ø 24 cm • 1 kg',
            price: '850 Kč', unit: '',
            badge: 'Novinka',
            img: CDN + '324_slany-kolac-1.png?ff=1&x=1024&y=1024&q=85&ts=6931909e&sg=161563f2',
            href: '/slany-kolac-se-slaninou-a-svycarskym-syrem/'
        },
        {
            name: 'Minicroissant s prosciuttem',
            tag: 'Máslový croissant, žervé a parmazán',
            meta: 'Čerstvý',
            price: '79 Kč', unit: '/ ks',
            badge: 'Novinka',
            img: CDN + '321_mini-croisanty.jpg?ff=1&x=1024&y=1024&q=85&ts=67ed9060&sg=161563f2',
            href: '/minicroissant-s-prosciuttem-a-parmazanem/'
        },
        {
            name: 'Masové taštičky',
            tag: 'Listové těsto, hovězí maso a slanina',
            meta: '24 ks',
            price: '936 Kč', unit: '',
            img: CDN + '271-1_masove-tasticky-1364x1024-pikto.jpg?ff=1&x=1024&y=1024&q=85&ts=66a75de9&sg=161563f2',
            href: '/masove-tasticky-24-ks/'
        },
        {
            name: '1/2 tortila s kuřecím masem',
            tag: 'Zelenina a domácí dresink',
            meta: 'cca 163 g',
            price: '85 Kč', unit: '/ ks',
            img: CDN + '336_tortily2.jpg?ff=1&x=1024&y=1024&q=85&ts=6a2ad95c&sg=161563f2',
            href: '/1-2-tortila-s-kurecim-masem--chedarem--zeleninou--domacim-dresingem/'
        },
        {
            name: 'Mrkvové chlebíčky',
            tag: 'Lehká fit varianta s pomazánkou',
            meta: '13 ks',
            price: '637 Kč', unit: '',
            img: CDN + '74-2_mrkvove-chlebicky-1364x1024-pikto.jpg?ff=1&x=1024&y=1024&q=85&ts=66a75d96&sg=161563f2',
            href: '/chlebicky-mrkvove-s-petrzelkovou-pomazankou/'
        },
        {
            name: 'Rodinná sekaná',
            tag: 'Podle rodinného receptu',
            meta: '1 kg',
            price: '790 Kč', unit: '',
            rating: '4,7',
            img: CDN + '56_sekana.png?ff=1&x=1024&y=1024&q=85&ts=69319839&sg=161563f2',
            href: '/sekana/'
        },
        {
            name: 'Panna Cotta mango',
            tag: 'Jemný lahodný dezert',
            meta: 'od 5 ks',
            price: '85 Kč', unit: '/ ks',
            badge: 'Novinka',
            img: CDN + '326_panna-cotta-1364x1024.jpg?ff=1&x=1024&y=1024&q=85&ts=68ff3761&sg=161563f2',
            href: '/pannacotta-mango/'
        }
    ];

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function injectStyles() {
        if (document.getElementById('jojo-karty-style')) return;
        var style = document.createElement('style');
        style.id = 'jojo-karty-style';
        style.textContent = [
            '.jojo-orig-hidden{display:none!important}',
            '.jdk-wrap{margin:40px 0}',
            '.jdk{font-family:inherit}',
            '.jdk-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:20px}',
            '.jdk-eb{display:inline-flex;font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;font-weight:700;color:#8a6a14;background:#F7EAC4;padding:5px 13px;border-radius:30px}',
            '.jdk-title{font-weight:800;color:#4C1536;font-size:28px;line-height:1.12;letter-spacing:-.01em;margin:10px 0 4px}',
            '.jdk-sub{color:#6b5a61;font-size:14.5px;line-height:1.4;margin:0}',
            '.jdk-nav{display:flex;gap:8px;flex-shrink:0}',
            '.jdk-arrow{width:44px;height:44px;padding:0;border-radius:50%;border:1.5px solid #e3d3dc;background:#fff;color:#4C1536;font-size:18px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s ease}',
            '.jdk-arrow:hover:not(:disabled){background:#4C1536;color:#fff;border-color:#4C1536}',
            '.jdk-arrow:disabled{opacity:.35;cursor:default}',

            /* Pás pro 3 karty vedle sebe */
            '.jdk-track{display:flex;gap:20px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;padding:6px 2px 20px;margin:0 -2px;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}',
            '.jdk-track::-webkit-scrollbar{display:none}',

            /* Základní karta baneru – absolutní pozicování pro 100% vyplnění */
            '.jdk-banner{flex:0 0 calc(33.333% - 14px);scroll-snap-align:start;position:relative;aspect-ratio:3/4;border-radius:24px;overflow:hidden;text-decoration:none!important;color:#fff!important;box-shadow:0 12px 32px rgba(76,21,54,.12);transition:transform .35s cubic-bezier(.16,1,.3,1),box-shadow .35s ease;display:block}',
            '@media (pointer:fine){.jdk-banner:hover{transform:translateY(-8px);box-shadow:0 20px 45px rgba(76,21,54,.28)}.jdk-banner:hover .jdk-bg{transform:scale(1.08)}.jdk-banner:hover .jdk-btn-go{background:#DFC15E;color:#4C1536;transform:scale(1.03)}}',

            /* Fotka – absolutně roztažená na celou plochu bez mezer */
            '.jdk-bg{position:absolute!important;top:0!important;left:0!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:center!important;display:block!important;max-width:none!important;max-height:none!important;transition:transform .8s cubic-bezier(.16,1,.3,1)}',
            
            /* Tmavý přechod přes celý rámeček */
            '.jdk-overlay{position:absolute;inset:0;background:linear-gradient(to top, rgba(26,6,18,0.95) 0%, rgba(26,6,18,0.65) 45%, rgba(0,0,0,0.15) 80%);display:flex;flex-direction:column;justify-content:space-between;padding:20px;box-sizing:border-box;z-index:2}',

            /* Horní lišta */
            '.jdk-top-bar{display:flex;justify-content:space-between;align-items:center;gap:8px}',
            '.jdk-badge{background:#DFC15E;color:#4C1536;font-size:11px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;padding:5px 12px;border-radius:20px;box-shadow:0 4px 12px rgba(0,0,0,.25)}',
            '.jdk-rating{background:rgba(255,255,255,0.22);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);color:#fff;font-size:12px;font-weight:700;padding:5px 11px;border-radius:20px;margin-left:auto;border:1px solid rgba(255,255,255,0.15)}',
            '.jdk-rating b{color:#FFD700;margin-right:4px}',

            /* Obsahová část */
            '.jdk-content{margin-top:auto}',
            '.jdk-name{font-weight:800;font-size:20px;line-height:1.2;margin:0 0 6px;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.4);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
            '.jdk-tag{font-size:13.5px;color:rgba(255,255,255,0.85);margin:0 0 10px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
            '.jdk-meta-tag{display:inline-block;font-size:11.5px;background:rgba(255,255,255,0.18);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);color:#fff;padding:4px 10px;border-radius:8px;margin-bottom:14px;font-weight:600;border:1px solid rgba(255,255,255,0.12)}',
            
            /* Akční lišta */
            '.jdk-action{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.2)}',
            '.jdk-price{font-weight:800;font-size:22px;color:#fff;line-height:1;text-shadow:0 2px 4px rgba(0,0,0,.3)}',
            '.jdk-unit{font-size:12px;font-weight:500;opacity:.85;margin-left:3px}',
            '.jdk-btn-go{font-size:13.5px;font-weight:800;color:#fff;background:#4C1536;padding:9px 16px;border-radius:12px;white-space:nowrap;transition:all .25s ease;box-shadow:0 4px 12px rgba(0,0,0,.3)}',

            /* Karta „Celá nabídka“ */
            '.jdk-more{flex:0 0 210px;scroll-snap-align:start;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;border:2px dashed #d1a8c2;border-radius:24px;background:#faf5f8;color:#4C1536!important;font-weight:800;font-size:16px;text-decoration:none!important;padding:24px;transition:background .2s ease,border-color .2s ease}',
            '.jdk-more span{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:50%;background:#4C1536;color:#fff;font-size:20px;box-shadow:0 6px 16px rgba(76,21,54,.2)}',
            '.jdk-more:hover{background:#f3e6ee;border-color:#4C1536}',

            /* Ukazatel posunu */
            '.jdk-bar{height:4px;background:#efe4eb;border-radius:4px;overflow:hidden;margin-top:6px}',
            '.jdk-bar i{display:block;height:100%;width:30%;background:#4C1536;border-radius:4px}',

            /* Responzivita */
            '@media (max-width:1024px){',
            '  .jdk-banner{flex:0 0 calc(50% - 10px);aspect-ratio:3/4}',
            '}',
            '@media (max-width:767px){',
            '  .jdk-wrap{margin:28px 0}',
            '  .jdk-head{align-items:flex-start;flex-direction:column;gap:10px}',
            '  .jdk-title{font-size:23px}',
            '  .jdk-nav{display:none}',
            '  .jdk-track{gap:14px;padding-bottom:16px}',
            '  .jdk-banner{flex-basis:80vw;max-width:300px;aspect-ratio:3/4.2}',
            '  .jdk-more{flex-basis:160px}',
            '}',

            '@media (prefers-reduced-motion:reduce){',
            '  .jdk-track{scroll-behavior:auto}',
            '  .jdk-banner,.jdk-bg{transition:none}',
            '}',
        ].join('');
        document.head.appendChild(style);
    }

    function renderBanner(p) {
        var rateHtml = p.rating ? '<div class="jdk-rating"><b>★</b>' + esc(p.rating) + '</div>' : '';
        var metaHtml = p.meta ? '<div class="jdk-meta-tag">' + esc(p.meta) + '</div>' : '';
        var badgeHtml = p.badge ? '<span class="jdk-badge">' + esc(p.badge) + '</span>' : '';

        return [
            '<a class="jdk-banner" href="' + esc(p.href) + '">',
            '  <img class="jdk-bg" src="' + esc(p.img) + '" alt="' + esc(p.name) + '" loading="lazy" decoding="async">',
            '  <div class="jdk-overlay">',
            '    <div class="jdk-top-bar">',
            badgeHtml,
            rateHtml,
            '    </div>',
            '    <div class="jdk-content">',
            '      <div class="jdk-name">' + esc(p.name) + '</div>',
            '      <div class="jdk-tag">' + esc(p.tag) + '</div>',
            metaHtml,
            '      <div class="jdk-action">',
            '        <div class="jdk-price">' + esc(p.price) + (p.unit ? '<span class="jdk-unit">' + esc(p.unit) + '</span>' : '') + '</div>',
            '        <span class="jdk-btn-go">Objednat →</span>',
            '      </div>',
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
            PRODUCTS.map(renderBanner).join(''),
            '    <a class="jdk-more" href="' + esc(MORE.href) + '"><span>→</span>' + esc(MORE.text) + '</a>',
            '  </div>',
            '  <div class="jdk-bar"><i></i></div>',
            '</section>',
        ].join('');
    }

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
            track.scrollBy({ left: dir * Math.max(280, track.clientWidth * 0.85), behavior: 'smooth' });
        }

        if (prev) prev.addEventListener('click', function () { step(-1); });
        if (next) next.addEventListener('click', function () { step(1); });
        track.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        update();
        setTimeout(update, 600);
    }

    function groupUnit(title) {
        var u = title;
        while (u.parentElement && u.parentElement !== document.body &&
               u.parentElement.querySelectorAll('.homepage-group-title').length === 1) {
            u = u.parentElement;
        }
        return u;
    }

    function findAnchor(allowFallback) {
        var party = document.getElementById('jojo-banner-party-bedynka');
        if (party) return { el: party, pos: 'afterend' };
        if (!allowFallback) return null;

        var titles = document.querySelectorAll('.homepage-group-title');
        if (titles.length >= 2) return { el: groupUnit(titles[0]), pos: 'beforebegin' };
        var cats = document.querySelector('.hp-categories');
        if (cats) return { el: cats, pos: 'afterend' };
        return null;
    }

    function hideOriginalGroup() {
        if (!HIDE_ORIGINAL_DOPORUCUJEME) return;
        var titles = document.querySelectorAll('.homepage-group-title');
        for (var i = 0; i < titles.length; i++) {
            var t = titles[i];
            if (t.textContent.trim().toLowerCase().indexOf('doporučujeme') !== 0) continue;
            var unit = groupUnit(t);
            unit.classList.add('jojo-orig-hidden');
            if (unit === t) {
                var n = t.nextElementSibling;
                while (n && !n.matches('.homepage-group-title') &&
                       !n.querySelector('.homepage-group-title') && !n.id) {
                    n.classList.add('jojo-orig-hidden');
                    n = n.nextElementSibling;
                }
            }
        }
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
        hideOriginalGroup();
        setTimeout(hideOriginalGroup, 1500);
        return true;
    }

    function init() {
        injectStyles();
        if (place(false)) return;

        var done = false;
        var obs = new MutationObserver(function () {
            if (!done && place(false)) { done = true; obs.disconnect(); }
        });
        obs.observe(document.body, { childList: true, subtree: true });

        setTimeout(function () {
            if (done) return;
            obs.disconnect();
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
