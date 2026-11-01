(function () {
    'use strict';

    if (!document.body.classList.contains('in-index')) return;

    // ═══════════════════════════════════════════════════════════════════════════
    //  PÁRTY BEDÝNKA – hlavní baner úvodní stránky (pod úvodními bloky, nad výpisem produktů)
    //
    //  slot:  0         → před první skupinu produktů (nahoře, hned pod úvodními bloky)
    //         'middle'  → doprostřed mezi skupiny produktů
    //         číslo     → před N-tou skupinu (1 = před druhou, 2 = před třetí…)
    //  flip:  true      → fotka vlevo, text vpravo
    //  maxWidth: 'hero' = stejná šířka jako hero nahoře (výchozí); číslo = šířka v px; 0 = celá šířka
    //  alt:   malý box s druhou variantou (null = bez něj)
    //  cta.cart: true = tlačítko přidá produkt rovnou do košíku (stiskne původní tlačítko ze šablony)
    //
    //  Baner na jiný produkt: zkopíruj tento soubor pod novým názvem a změň jen
    //  blok níže (id, texty, fotku, odkazy). Zbytek (styly, vložení) zůstává.
    //  Ceny, hmotnosti a hodnocení jsou psané ručně – při změně je uprav tady.
    // ═══════════════════════════════════════════════════════════════════════════
    var BANNERS = [
        {
            id: 'party-bedynka',
            slot: 0,
            flip: false,
            maxWidth: 'hero', // 'hero' = stejně široký jako úvodní hero; číslo = px; 0 = celá šířka
            eyebrow: '🎉 Párty bedýnka',
            title: 'Hotová hostina <em>v jedné bedýnce</em>',
            text: 'Šunky, pršut, fuet, čabajka, tři druhy sýrů, čerstvá zelenina, ovoce a domácí dresink. Stačí otevřít a podávat.',
            chips: ['Firemní porady', 'Oslavy a narozeniny', 'Večírky', 'Rodinné akce'],
            img: 'https://cdn.myshoptet.com/usr/eshop.jojocatering.cz/user/shop/big/50_partybedynka.png?ff=1&x=1024&y=768&q=85&ts=6931a172&sg=161563f2',
            imgAlt: 'Párty bedýnka plná šunek, sýrů, zeleniny a ovoce',
            price: '1 690 Kč',
            weight: '3,1 kg pohoštění',
            rating: '5,0 · 12 hodnocení zákazníků',
            cta: { text: 'Objednat párty bedýnku', href: '/party-bedynka/', cart: true }, // cart: true = přidá rovnou do košíku
            alt: {
                label: 'Párty bedýnka PREMIUM',
                text: 'Výběrové šunky a gurmánské delikatesy · 3,2 kg',
                price: '2 550 Kč',
                href: '/party-bedynka-premium/',
                img: 'https://cdn.myshoptet.com/usr/eshop.jojocatering.cz/user/shop/big/274-2_partybedynka-premium-1364x1024-pikto.jpg?ff=1&x=1024&y=768&q=85&ts=66a75ec2&sg=161563f2'
            }
        }
    ];

    // ─── Pomocné ──────────────────────────────────────────────────────────────

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ─── Styly (jednou pro všechny bannery) ───────────────────────────────────

    function injectStyles() {
        if (document.getElementById('jojo-banners-style')) return;
        var style = document.createElement('style');
        style.id = 'jojo-banners-style';
        style.textContent = [
            '.jpb-wrap{margin:30px 0}',
            '.jpb{position:relative;display:grid;grid-template-columns:1.1fr 1fr;margin:0 auto;background:linear-gradient(135deg,#4C1536 0%,#5e1b44 62%,#3a0f29 100%);border-radius:20px;overflow:hidden;box-shadow:0 12px 30px rgba(76,21,54,.2);font-family:inherit;color:#fff}',
            '.jpb.jpb-pre{opacity:0;transform:translateY(18px)}',
            '.jpb.jpb-in{opacity:1;transform:none;transition:opacity .7s ease,transform .7s ease}',
            '.jpb-flip .jpb-photo{order:-1}',

            /* text */
            '.jpb-text{padding:26px 32px;display:flex;flex-direction:column;justify-content:center;min-width:0}',
            '.jpb-eb{align-self:flex-start;display:inline-flex;align-items:center;gap:6px;font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;font-weight:700;color:#4C1536;background:#DFC15E;padding:4px 12px;border-radius:30px}',
            '.jpb-hl{font-weight:800;font-size:30px;line-height:1.1;letter-spacing:-.01em;margin:12px 0 9px;color:#fff}',
            '.jpb-hl em{font-style:normal;color:#DFC15E;box-shadow:inset 0 -.45em 0 rgba(223,193,94,.22)}',
            '.jpb-sub{font-size:14.5px;line-height:1.55;color:rgba(255,255,255,.84);margin:0 0 13px}',
            '.jpb-chips{display:flex;flex-wrap:wrap;gap:6px;list-style:none;margin:0 0 15px;padding:0}',
            '.jpb-chips li{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:#fff;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.18);padding:4px 9px;border-radius:8px;margin:0}',
            '.jpb-chips li::before{content:"\\2713";color:#DFC15E;font-weight:700}',
            '.jpb-cta{display:flex;align-items:center;gap:10px 18px;flex-wrap:wrap}',
            '.jpb-rate{display:flex;align-items:center;gap:7px;font-size:12.5px;color:rgba(255,255,255,.8)}',
            '.jpb-stars{color:#DFC15E;letter-spacing:1px;font-size:14px}',
            '.jpb-btn{position:relative;overflow:hidden;background:#DFC15E;color:#4C1536!important;font-weight:800;border-radius:11px;padding:12px 22px;font-size:14.5px;text-decoration:none!important;display:inline-flex;align-items:center;gap:8px;transition:background .2s ease,transform .15s ease}',
            '.jpb-btn:hover{background:#ebd078;transform:translateY(-1px)}',
            '.jpb-btn.jpb-ok{background:#d9f2e3;color:#1a7a40!important;pointer-events:none}',
            '.jpb-btn.jpb-ok::after{display:none}',
            '.jpb-btn::after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(120deg,transparent,rgba(255,255,255,.55),transparent);transform:skewX(-20deg);animation:jpbShine 4.8s ease-in-out infinite}',
            '@keyframes jpbShine{0%{left:-60%}45%,100%{left:135%}}',

            /* box s druhou variantou */
            '.jpb-alt{margin-top:14px;display:flex;align-items:center;gap:10px;padding:7px 12px 7px 7px;border-radius:12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);color:#fff!important;text-decoration:none!important;transition:background .2s ease,border-color .2s ease}',
            '.jpb-alt:hover{background:rgba(255,255,255,.14);border-color:rgba(223,193,94,.6)}',
            '.jpb-alt img{width:44px;height:44px;border-radius:8px;object-fit:cover;flex-shrink:0;background:#f3e6ee}',
            '.jpb-alt-t{flex:1;min-width:0;line-height:1.3}',
            '.jpb-alt-t b{display:block;color:#fff;font-size:13.5px}',
            '.jpb-alt-d{display:block;font-size:12px;color:rgba(255,255,255,.75)}',
            '.jpb-alt-p{font-weight:800;color:#DFC15E;white-space:nowrap;font-size:14.5px}',

            /* fotka */
            '.jpb-photo{position:relative;display:block;min-height:320px;background:linear-gradient(135deg,#fdf6fa,#f3e6ee);overflow:hidden}',
            '.jpb-photo img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;transition:transform .6s ease}',
            '@media (pointer:fine){.jpb:hover .jpb-photo img{transform:scale(1.04)}}',
            '.jpb-photo::before{content:"";position:absolute;top:0;bottom:0;left:0;width:60px;background:linear-gradient(90deg,#4C1536,rgba(76,21,54,0));z-index:1;pointer-events:none}',
            '.jpb-flip .jpb-photo::before{left:auto;right:0;background:linear-gradient(270deg,#4C1536,rgba(76,21,54,0))}',
            '.jpb-badge{position:absolute;left:16px;bottom:16px;z-index:2;background:#fff;color:#4C1536;border-radius:12px;padding:8px 14px;box-shadow:0 8px 22px rgba(0,0,0,.22);line-height:1.15}',
            '.jpb-flip .jpb-badge{left:auto;right:16px}',
            '.jpb-badge b{display:block;font-size:22px;font-weight:800}',
            '.jpb-badge span{font-size:11.5px;color:#6b5a61}',

            '.jpb a:focus-visible{outline:3px solid #DFC15E;outline-offset:3px}',

            /* mobil – nižší a úspornější */
            '@media (max-width:767px){',
            '  .jpb-wrap{margin:22px 0}',
            '  .jpb{grid-template-columns:1fr;max-width:none!important;border-radius:16px}',
            '  .jpb-photo,.jpb-flip .jpb-photo{order:-1;min-height:0;height:165px}',
            '  .jpb-photo::before{display:none}',
            '  .jpb-badge,.jpb-flip .jpb-badge{left:12px;right:auto;bottom:12px;padding:6px 11px;border-radius:10px}',
            '  .jpb-badge b{font-size:18px}',
            '  .jpb-badge span{font-size:11px}',
            '  .jpb-text{padding:15px 16px 17px}',
            '  .jpb-eb{font-size:10.5px;padding:3px 10px}',
            '  .jpb-hl{font-size:22px;margin:9px 0 7px}',
            '  .jpb-sub{font-size:13.5px;line-height:1.45;margin:0 0 12px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}',
            '  .jpb-chips{display:none}',
            '  .jpb-cta{flex-direction:column;align-items:stretch;gap:9px}',
            '  .jpb-btn{width:100%;justify-content:center;padding:12px;font-size:14.5px}',
            '  .jpb-rate{justify-content:center;font-size:12px}',
            '  .jpb-alt{margin-top:11px;padding:8px 12px}',
            '  .jpb-alt img,.jpb-alt-d{display:none}',
            '}',
            '@media (prefers-reduced-motion:reduce){',
            '  .jpb.jpb-pre{opacity:1;transform:none}',
            '  .jpb-btn::after{animation:none}',
            '  .jpb-photo img{transition:none}',
            '}',
        ].join('');
        document.head.appendChild(style);
    }

    // ─── HTML jednoho banneru ─────────────────────────────────────────────────

    function renderBanner(b) {
        var chips = (b.chips || []).map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('');
        var mw = parseInt(b.maxWidth, 10);
        var style = mw > 0 ? ' style="max-width:' + mw + 'px"' : ' style="max-width:none"';
        // maxWidth: 'hero' se dopočítá po vložení (syncWidth)

        var alt = '';
        if (b.alt) {
            alt = [
                '<a class="jpb-alt" href="' + esc(b.alt.href) + '">',
                '  <img src="' + esc(b.alt.img) + '" alt="" loading="lazy" decoding="async" width="44" height="44">',
                '  <span class="jpb-alt-t"><b>' + esc(b.alt.label) + '</b><span class="jpb-alt-d">' + esc(b.alt.text) + '</span></span>',
                '  <span class="jpb-alt-p">' + esc(b.alt.price) + '</span>',
                '</a>',
            ].join('');
        }

        return [
            '<div class="jpb jpb-pre' + (b.flip ? ' jpb-flip' : '') + '"' + style + '>',
            '  <div class="jpb-text">',
            '    <span class="jpb-eb">' + esc(b.eyebrow) + '</span>',
            '    <div class="jpb-hl">' + b.title + '</div>',
            '    <div class="jpb-sub">' + esc(b.text) + '</div>',
            chips ? '    <ul class="jpb-chips">' + chips + '</ul>' : '',
            '    <div class="jpb-cta">',
            '      <a class="jpb-btn" href="' + esc(b.cta.href) + '"' + (b.cta.cart ? ' data-cart="1"' : '') + '>' + esc(b.cta.text) + ' →</a>',
            b.rating ? '      <div class="jpb-rate"><span class="jpb-stars">★★★★★</span>' + esc(b.rating) + '</div>' : '',
            '    </div>',
            alt,
            '  </div>',
            '  <a class="jpb-photo" href="' + esc(b.cta.href) + '" aria-label="' + esc(b.cta.text) + '">',
            '    <img src="' + esc(b.img) + '" alt="' + esc(b.imgAlt || '') + '" loading="lazy" decoding="async" width="1024" height="768">',
            b.price ? '    <span class="jpb-badge"><b>' + esc(b.price) + '</b><span>' + esc(b.weight || '') + '</span></span>' : '',
            '  </a>',
            '</div>',
        ].join('');
    }

    // ─── Kam vložit ───────────────────────────────────────────────────────────
    // Mezi skupiny produktů na homepage (nadpisy .homepage-group-title).
    // Záloha: pod mřížku kategorií (.hp-categories).

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

    function findAnchor(slot) {
        var titles = document.querySelectorAll('.homepage-group-title');
        if (titles.length >= 2) {
            var idx = (slot === 'middle')
                ? Math.floor(titles.length / 2)
                : Math.max(0, Math.min(slot, titles.length - 1));
            return { el: groupUnit(titles[idx]), pos: 'beforebegin' };
        }
        var cats = document.querySelector('.hp-categories');
        if (cats) return { el: cats, pos: 'afterend' };
        return null;
    }

    // maxWidth: 'hero' → banner je stejně široký jako karta hero nahoře (na telefonu CSS
    // šířku ruší). Přepočítá se při změně velikosti okna.
    function syncWidth(wrap, b) {
        if (b.maxWidth !== 'hero') return;
        var card = wrap.querySelector('.jpb');
        function apply() {
            var ref = document.querySelector('#jojo-hero .jojo-hero');
            var w = ref ? Math.round(ref.getBoundingClientRect().width) : 0;
            card.style.maxWidth = w > 0 ? w + 'px' : 'none';
        }
        apply();
        window.addEventListener('load', apply);
        var t;
        window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(apply, 150); });
    }

    // Najde ORIGINÁLNÍ tlačítko „Do košíku" ze šablony (karta produktu zůstává na stránce,
    // i když je skrytá). Klik na naše tlačítko stiskne to původní – košík řeší Shoptet.
    function pathOf(h) {
        try { return new URL(h, location.href).pathname.replace(/\/+$/, ''); } catch (e) { return String(h || ''); }
    }

    function originalAddButton(href) {
        var want = pathOf(href);
        var cards = document.querySelectorAll('.product, [data-micro="product"], [data-testid="productCard"]');
        for (var i = 0; i < cards.length; i++) {
            var c = cards[i];
            if (c.closest('.jpb-wrap, .jdk-wrap')) continue;
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

    function wireCart(wrap) {
        wrap.addEventListener('click', function (e) {
            var btn = e.target.closest ? e.target.closest('.jpb-btn[data-cart]') : null;
            if (!btn) return;
            var orig = originalAddButton(btn.getAttribute('href'));
            if (!orig) return;                  // původní tlačítko nenalezeno → projde odkaz na detail
            e.preventDefault();
            if (btn.classList.contains('jpb-ok')) return;
            var label = btn.textContent;
            btn.classList.add('jpb-ok');
            btn.textContent = 'Přidáno do košíku ✓';
            orig.click();
            setTimeout(function () {
                btn.classList.remove('jpb-ok');
                btn.textContent = label;
            }, 1800);
        });
    }

    function reveal(el) {
        var card = el.querySelector('.jpb');
        if (!card) return;
        function show() { card.classList.remove('jpb-pre'); card.classList.add('jpb-in'); }
        if (typeof window.IntersectionObserver === 'function') {
            var io = new IntersectionObserver(function (entries) {
                if (entries[0].isIntersecting) { show(); io.disconnect(); }
            }, { threshold: 0.12 });
            io.observe(card);
        } else {
            show();
        }
    }

    // Vloží všechny bannery, které ještě nejsou na stránce. Vrací true, když je vše hotovo.
    function placeAll() {
        var done = true;
        BANNERS.forEach(function (b) {
            var domId = 'jojo-banner-' + b.id;
            if (document.getElementById(domId)) return;

            var a = findAnchor(b.slot);
            if (!a) { done = false; return; }

            var wrap = document.createElement('div');
            wrap.id = domId;
            wrap.className = 'jpb-wrap';

            // Pokud místo vložení není uvnitř .container, přidej vlastní
            var inner = renderBanner(b);
            wrap.innerHTML = a.el.closest('.container') ? inner : '<div class="container">' + inner + '</div>';

            a.el.insertAdjacentElement(a.pos, wrap);
            syncWidth(wrap, b);
            wireCart(wrap);
            reveal(wrap);
        });
        return done;
    }

    function init() {
        injectStyles();
        if (placeAll()) return;

        // Obsah homepage se může dorenderovat později — chvíli počkat
        var obs = new MutationObserver(function () {
            if (placeAll()) obs.disconnect();
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
