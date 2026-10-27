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
    //  alt:   malý box s druhou variantou (null = bez něj)
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
            eyebrow: '🎉 Párty bedýnka',
            title: 'Hotová hostina <em>v jedné bedýnce</em>',
            text: 'Delikatesní šunky, pršut, fuet, čabajka a tři druhy sýrů, k tomu čerstvá zelenina, ovoce a náš domácí dresink. Stačí otevřít a podávat.',
            chips: ['Firemní porady', 'Oslavy a narozeniny', 'Večírky', 'Rodinné akce'],
            img: 'https://cdn.myshoptet.com/usr/eshop.jojocatering.cz/user/shop/big/50_partybedynka.png?ff=1&x=1024&y=768&q=85&ts=6931a172&sg=161563f2',
            imgAlt: 'Párty bedýnka plná šunek, sýrů, zeleniny a ovoce',
            price: '1 690 Kč',
            weight: '3,1 kg pohoštění',
            rating: '5,0 · 12 hodnocení zákazníků',
            cta: { text: 'Objednat párty bedýnku', href: '/party-bedynka/' },
            alt: {
                label: 'Chcete něco extra? Párty bedýnka PREMIUM',
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
            '.jpb-wrap{margin:34px 0}',
            '.jpb{position:relative;display:grid;grid-template-columns:1.05fr 1fr;background:linear-gradient(135deg,#4C1536 0%,#5e1b44 62%,#3a0f29 100%);border-radius:22px;overflow:hidden;box-shadow:0 14px 36px rgba(76,21,54,.22);font-family:inherit;color:#fff}',
            '.jpb.jpb-pre{opacity:0;transform:translateY(18px)}',
            '.jpb.jpb-in{opacity:1;transform:none;transition:opacity .7s ease,transform .7s ease}',
            '.jpb-flip .jpb-photo{order:-1}',

            /* text */
            '.jpb-text{padding:38px 36px;display:flex;flex-direction:column;justify-content:center;min-width:0}',
            '.jpb-eb{align-self:flex-start;display:inline-flex;align-items:center;gap:6px;font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;font-weight:700;color:#4C1536;background:#DFC15E;padding:5px 13px;border-radius:30px}',
            '.jpb-hl{font-weight:800;font-size:34px;line-height:1.1;letter-spacing:-.01em;margin:16px 0 12px;color:#fff}',
            '.jpb-hl em{font-style:normal;color:#DFC15E;box-shadow:inset 0 -.45em 0 rgba(223,193,94,.22)}',
            '.jpb-sub{font-size:15px;line-height:1.6;color:rgba(255,255,255,.84);margin:0 0 16px}',
            '.jpb-chips{display:flex;flex-wrap:wrap;gap:7px;list-style:none;margin:0 0 16px;padding:0}',
            '.jpb-chips li{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:#fff;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.18);padding:6px 11px;border-radius:8px;margin:0}',
            '.jpb-chips li::before{content:"\\2713";color:#DFC15E;font-weight:700}',
            '.jpb-rate{display:flex;align-items:center;gap:8px;margin:0 0 20px;font-size:13px;color:rgba(255,255,255,.8)}',
            '.jpb-stars{color:#DFC15E;letter-spacing:1px;font-size:15px}',
            '.jpb-cta{display:flex;align-items:center;gap:16px;flex-wrap:wrap}',
            '.jpb-btn{position:relative;overflow:hidden;background:#DFC15E;color:#4C1536!important;font-weight:800;border-radius:11px;padding:14px 26px;font-size:15px;text-decoration:none!important;display:inline-flex;align-items:center;gap:8px;transition:background .2s ease,transform .15s ease}',
            '.jpb-btn:hover{background:#ebd078;transform:translateY(-1px)}',
            '.jpb-btn::after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(120deg,transparent,rgba(255,255,255,.55),transparent);transform:skewX(-20deg);animation:jpbShine 4.8s ease-in-out infinite}',
            '@keyframes jpbShine{0%{left:-60%}45%,100%{left:135%}}',

            /* box s druhou variantou */
            '.jpb-alt{margin-top:20px;display:flex;align-items:center;gap:12px;padding:10px 14px 10px 10px;border-radius:14px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);color:#fff!important;text-decoration:none!important;transition:background .2s ease,border-color .2s ease}',
            '.jpb-alt:hover{background:rgba(255,255,255,.14);border-color:rgba(223,193,94,.6)}',
            '.jpb-alt img{width:60px;height:60px;border-radius:10px;object-fit:cover;flex-shrink:0;background:#f3e6ee}',
            '.jpb-alt-t{flex:1;min-width:0;font-size:12.5px;line-height:1.35;color:rgba(255,255,255,.78)}',
            '.jpb-alt-t b{display:block;color:#fff;font-size:14px;margin-bottom:2px}',
            '.jpb-alt-p{font-weight:800;color:#DFC15E;white-space:nowrap;font-size:15px}',

            /* fotka */
            '.jpb-photo{position:relative;display:block;min-height:420px;background:linear-gradient(135deg,#fdf6fa,#f3e6ee);overflow:hidden}',
            '.jpb-photo img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;transition:transform .6s ease}',
            '@media (pointer:fine){.jpb:hover .jpb-photo img{transform:scale(1.04)}}',
            '.jpb-photo::before{content:"";position:absolute;top:0;bottom:0;left:0;width:70px;background:linear-gradient(90deg,#4C1536,rgba(76,21,54,0));z-index:1;pointer-events:none}',
            '.jpb-flip .jpb-photo::before{left:auto;right:0;background:linear-gradient(270deg,#4C1536,rgba(76,21,54,0))}',
            '.jpb-badge{position:absolute;left:20px;bottom:20px;z-index:2;background:#fff;color:#4C1536;border-radius:14px;padding:10px 16px;box-shadow:0 8px 22px rgba(0,0,0,.22);line-height:1.15}',
            '.jpb-flip .jpb-badge{left:auto;right:20px}',
            '.jpb-badge b{display:block;font-size:24px;font-weight:800}',
            '.jpb-badge span{font-size:12px;color:#6b5a61}',

            '.jpb a:focus-visible{outline:3px solid #DFC15E;outline-offset:3px}',

            /* mobil */
            '@media (max-width:767px){',
            '  .jpb-wrap{margin:26px 0}',
            '  .jpb{grid-template-columns:1fr;border-radius:18px}',
            '  .jpb-photo,.jpb-flip .jpb-photo{order:-1;min-height:0;height:230px}',
            '  .jpb-photo::before{display:none}',
            '  .jpb-badge,.jpb-flip .jpb-badge{left:14px;right:auto;bottom:14px;padding:8px 13px}',
            '  .jpb-badge b{font-size:20px}',
            '  .jpb-text{padding:22px 20px 24px}',
            '  .jpb-hl{font-size:25px;margin:14px 0 10px}',
            '  .jpb-sub{font-size:14px}',
            '  .jpb-rate{margin-bottom:18px}',
            '  .jpb-cta{flex-direction:column;align-items:stretch}',
            '  .jpb-btn{width:100%;justify-content:center;padding:15px}',
            '  .jpb-alt{margin-top:16px}',
            '  .jpb-alt img{width:52px;height:52px}',
            '  .jpb-alt-t{font-size:12px}',
            '  .jpb-alt-t b{font-size:13px}',
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

        var alt = '';
        if (b.alt) {
            alt = [
                '<a class="jpb-alt" href="' + esc(b.alt.href) + '">',
                '  <img src="' + esc(b.alt.img) + '" alt="" loading="lazy" decoding="async" width="60" height="60">',
                '  <span class="jpb-alt-t"><b>' + esc(b.alt.label) + '</b>' + esc(b.alt.text) + '</span>',
                '  <span class="jpb-alt-p">' + esc(b.alt.price) + '</span>',
                '</a>',
            ].join('');
        }

        return [
            '<div class="jpb jpb-pre' + (b.flip ? ' jpb-flip' : '') + '">',
            '  <div class="jpb-text">',
            '    <span class="jpb-eb">' + esc(b.eyebrow) + '</span>',
            '    <div class="jpb-hl">' + b.title + '</div>',
            '    <div class="jpb-sub">' + esc(b.text) + '</div>',
            chips ? '    <ul class="jpb-chips">' + chips + '</ul>' : '',
            b.rating ? '    <div class="jpb-rate"><span class="jpb-stars">★★★★★</span>' + esc(b.rating) + '</div>' : '',
            '    <div class="jpb-cta">',
            '      <a class="jpb-btn" href="' + esc(b.cta.href) + '">' + esc(b.cta.text) + ' →</a>',
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
