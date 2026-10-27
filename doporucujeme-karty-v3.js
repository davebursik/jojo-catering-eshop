(function () {
    'use strict';

    if (!document.body.classList.contains('in-index')) return;

    // ═══════════════════════════════════════════════════════════════════════════
    //  DOPORUČUJEME – vizuální bannerové karty (přizpůsobené e-shopu & mobilu)
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
            img: CDN + '289-3_miniburger-1364x1024-pikto.jpg?ff=1&x=1024&y=768&q=85&ts=66a75e3a&sg=161563f2',
            href: '/mini-bacon-burger/'
        },
        {
            name: 'Slaný koláč se slaninou a švýcarským sýrem',
            tag: 'Čerstvě upečený, ke krájení pro celou společnost.',
            meta: ['ø 24 cm', '1 kg'],
            price: '850 Kč', unit: '',
            badge: 'Novinka',
            img: CDN + '324_slany-kolac-1.png?ff=1&x=1024&y=768&q=85&ts=6931909e&sg=161563f2',
            href: '/slany-kolac-se-slaninou-a-svycarskym-syrem/'
        },
        {
            name: 'Minicroissant s prosciuttem a parmazánem',
            tag: 'Máslový croissant, žervé, rukola a parmazán.',
            meta: [],
            price: '79 Kč', unit: '/ ks',
            badge: 'Novinka',
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
            img: CDN + '336_tortily2.jpg?ff=1&x=1024&y=768&q=85&ts=6a2ad95c&sg=161563f2',
            href: '/1-2-tortila-s-kurecim-masem--chedarem--zeleninou--domacim-dresingem/'
        },
        {
            name: 'Mrkvové chlebíčky s petrželkovou pomazánkou',
            tag: 'Lehká fit varianta s mrkvovým salátkem.',
            meta: ['13 ks'],
            price: '637 Kč', unit: '',
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
            '.jdk-wrap{margin:36px 0}',
            '.jdk{font-family:inherit}',
            '.jdk-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:18px}',
            '.jdk-eb{display:inline-flex;font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;font-weight:700;color:#8a6a14;background:#F7EAC4;padding:5px 13px;border-radius:30px}',
            '.jdk-title{font-weight:800;color:#4C1536;font-size:27px;line-height:1.12;letter-spacing:-.01em;margin:11px 0 4px}',
            '.jdk-sub{color:#6b5a61;font-size:14px;line-height:1.5;margin:0}',
            '.jdk-nav{display:flex;gap:8px;flex-shrink:0}',
            '.jdk-arrow{width:42px;height:42px;padding:0;border-radius:50%;border:1.5px solid #e3d3dc;background:#fff;color:#4C1536;font-size:18px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s ease,color .2s ease,border-color .2s ease}',
            '.jdk-arrow:hover:not(:disabled){background:#4C1536;color:#fff;border-color:#4C1536}',
            '.jdk-arrow:disabled{opacity:.35;cursor:default}',

            /* Posuvný pás – vylepšené pro plynulý scroll na mobilech i PC */
            '.jdk-track{display:flex;gap:20px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;padding:8px 4px 20px;margin:0 -4px;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}',
            '.jdk-track::-webkit-scrollbar{display:none}',

            /* Karta bannerového typu – vizuálně sladěná s e-shopem */
            '.jdk-card{flex:0 0 310px;scroll-snap-align:start;display:flex;flex-direction:column;background:#fff;border:1px solid #ebd8e4;border-radius:20px;overflow:hidden;text-decoration:none!important;color:inherit!important;box-shadow:0 8px 24px rgba(76,21,54,.07);transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}',
            '@media (pointer:fine){.jdk-card:hover{transform:translateY(-5px);box-shadow:0 16px 32px rgba(76,21,54,.14);border-color:#4C1536}.jdk-card:hover .jdk-img img{transform:scale(1.05)}}',
            
            /* Fotka produktového banneru */
            '.jdk-img{position:relative;aspect-ratio:16/10;background:linear-gradient(135deg,#fdf6fa,#f3e6ee);overflow:hidden}',
            '.jdk-img img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(.16,1,.3,1)}',
            '.jdk-badge{position:absolute;top:12px;left:12px;z-index:2;background:#DFC15E;color:#4C1536;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:5px 11px;border-radius:20px;box-shadow:0 4px 10px rgba(0,0,0,.15)}',

            /* Tělo karty */
            '.jdk-body{display:flex;flex-direction:column;flex:1;padding:18px 20px 20px}',
            '.jdk-name{font-weight:800;color:#4C1536;font-size:17px;line-height:1.25;margin:0 0 6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
            '.jdk-tag{font-size:13.5px;line-height:1.45;color:#6b5a61;margin:0 0 12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
            '.jdk-meta{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px}',
            '.jdk-meta span{font-size:11.5px;color:#4C1536;background:#faf4f7;border:1px solid #efe2ea;padding:3px 10px;border-radius:7px}',
            '.jdk-rate{font-size:12px;color:#5b4b52;margin:0 0 12px}',
            '.jdk-rate b{color:#c39a32;letter-spacing:1px;font-weight:400;margin-right:4px}',

            /* Patička karty s cenou a akčním tlačítkem */
            '.jdk-foot{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:14px;border-top:1px solid #f4e8f1}',
            '.jdk-price{font-weight:800;color:#4C1536;font-size:20px;line-height:1;white-space:nowrap}',
            '.jdk-unit{font-size:12px;font-weight:600;color:#8c7a83;margin-left:3px}',
            '.jdk-go{font-size:13.5px;font-weight:700;color:#fff;background:#4C1536;border-radius:10px;padding:9px 16px;white-space:nowrap;transition:background .2s ease}',
            '.jdk-card:hover .jdk-go{background:#6a1e4b}',

            /* Poslední karta „Celá nabídka" */
            '.jdk-more{flex:0 0 220px;scroll-snap-align:start;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;border:2px dashed #d1a8c2;border-radius:20px;background:#faf5f8;color:#4C1536!important;font-weight:800;font-size:16px;text-decoration:none!important;padding:24px;transition:background .2s ease,border-color .2s ease}',
            '.jdk-more span{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:50%;background:#4C1536;color:#fff;font-size:20px;box-shadow:0 6px 16px rgba(76,21,54,.2)}',
            '.jdk-more:hover{background:#f3e6ee;border-color:#4C1536}',

            /* Ukazatel posunu */
            '.jdk-bar{height:4px;background:#efe4eb;border-radius:4px;overflow:hidden;margin-top:4px}',
            '.jdk-bar i{display:block;height:100%;width:30%;background:#4C1536;border-radius:4px}',

            '.jdk a:focus-visible,.jdk button:focus-visible{outline:3px solid #DFC15E;outline-offset:3px}',

            /* Optimalizace pro mobilní zařízení (skrolované bannerové karty) */
            '@media (max-width:767px){',
            '  .jdk-wrap{margin:24px 0}',
            '  .jdk-head{align-items:flex-start;flex-direction:column;gap:12px}',
            '  .jdk-title{font-size:22px}',
            '  .jdk-sub{font-size:13px}',
            '  .jdk-nav{display:none}',
            '  .jdk-track{gap:14px;padding-bottom:16px}',
            '  .jdk-card{flex-basis:82vw;max-width:300px}',
            '  .jdk-more{flex-basis:160px}',
            '}',

            '@media (prefers-reduced-motion:reduce){',
            '  .jdk-track{scroll-behavior:auto}',
            '  .jdk-card,.jdk-img img{transition:none}',
            '}',
        ].join('');
        document.head.appendChild(style);
    }

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
