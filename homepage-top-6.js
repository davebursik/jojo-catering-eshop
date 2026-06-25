(function () {
    'use strict';

    if (!document.body.classList.contains('in-index')) return;

    function init() {
        if (document.getElementById('jojo-hero')) return;
        var anchor = document.querySelector('.before-carousel')
                  || document.querySelector('.content-wrapper');
        if (!anchor) return;

        // ─── Fotky (reálné z eshopu) ──────────────────────────────────────────
        var IMG_BEDYNKA  = 'https://cdn.myshoptet.com/usr/eshop.jojocatering.cz/user/shop/big/50_partybedynka.png?ff=1&x=1024&y=768&q=85&ts=6931a172&sg=161563f2';
        var IMG_CHLEBICKY = 'https://cdn.myshoptet.com/usr/eshop.jojocatering.cz/user/shop/big/329_slane-kolacky-s-uz-lososem-1-1364x1024.jpg?ff=1&x=1024&y=768&q=85&ts=68ff39ba&sg=161563f2';
        var IMG_SLADKE   = 'https://cdn.myshoptet.com/usr/eshop.jojocatering.cz/user/shop/big/286_pana-cotta.png?ff=1&x=1024&y=768&q=85&ts=6931aef5&sg=161563f2';
        var IMG_BURGER   = 'https://cdn.myshoptet.com/usr/eshop.jojocatering.cz/user/shop/big/289-2_miniburger-4-e-shop.jpg?ff=1&x=1024&y=768&q=85&ts=6501a558&sg=161563f2';

        // ─── Styly ────────────────────────────────────────────────────────────
        var style = document.createElement('style');
        style.id = 'jojo-hero-style';
        style.textContent = [
            '.jojo-hero-wrap{margin:18px 0 8px}',
            '.jojo-hero{display:flex;gap:24px;background:linear-gradient(135deg,#ffffff,#fdf6fa);border:1px solid #efe4eb;border-radius:20px;padding:32px;box-shadow:0 10px 30px rgba(76,21,54,.06);font-family:inherit}',
            '.jojo-hero.jojo-pre{opacity:0;transform:translateY(16px)}',
            '.jojo-hero.jojo-in{opacity:1;transform:none;transition:opacity .6s ease,transform .6s ease}',
            '.jojo-hero-text{flex:1.05;min-width:0;display:flex;flex-direction:column;justify-content:center}',
            '.jojo-eb{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;color:#8a6a14;background:#F7EAC4;padding:5px 13px;border-radius:30px;font-weight:700;align-self:flex-start}',
            '.jojo-hl{font-weight:800;color:#4C1536;font-size:33px;line-height:1.1;letter-spacing:-.01em;margin:15px 0 11px}',
            '.jojo-hl em{font-style:normal;color:#c39a32;box-shadow:inset 0 -.5em 0 #f7eac4}',
            '.jojo-sub{color:#6b5a61;font-size:15px;line-height:1.6;margin:0 0 16px}',
            '.jojo-why{display:flex;gap:7px;flex-wrap:wrap;margin:0 0 18px;padding:0;list-style:none}',
            '.jojo-why li{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:#4C1536;background:#faf4f7;border:1px solid #efe2ea;padding:6px 11px;border-radius:8px}',
            '.jojo-why li::before{content:"\\2713";color:#1a7a40;font-weight:700}',
            '.jojo-rate{display:inline-flex;align-items:center;gap:8px;margin:0 0 18px;font-size:13px;color:#5b4b52}',
            '.jojo-rate .jojo-stars{color:#DFC15E;letter-spacing:1px;font-size:15px}',
            '.jojo-cta{display:flex;align-items:center;gap:16px;flex-wrap:wrap}',
            '.jojo-btn{position:relative;overflow:hidden;background:#4C1536;color:#fff!important;font-weight:700;border-radius:11px;padding:13px 24px;font-size:15px;text-decoration:none!important;display:inline-flex;align-items:center;gap:8px;cursor:pointer;border:none;transition:background .2s ease,transform .15s ease}',
            '.jojo-btn:hover{background:#6a1e4b;transform:translateY(-1px)}',
            '.jojo-btn::after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(120deg,transparent,rgba(255,255,255,.28),transparent);transform:skewX(-20deg);animation:jojoShine 4.8s ease-in-out infinite}',
            '@keyframes jojoShine{0%{left:-60%}45%,100%{left:135%}}',
            '.jojo-phone{display:inline-flex;align-items:center;gap:7px;color:#4C1536!important;font-size:13px;text-decoration:none!important}',
            '.jojo-phone b{font-weight:700}',
            '.jojo-mos{flex:1;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:9px;min-height:300px}',
            '.jojo-tile{border-radius:13px;background-size:cover;background-position:center;box-shadow:inset 0 0 0 1px rgba(0,0,0,.05);transition:transform .45s ease}',
            '@media (pointer:fine){.jojo-tile:hover{transform:scale(1.04)}}',
            '@media (max-width:767px){',
            '  .jojo-hero-wrap{margin-top:184px;margin-bottom:2px}',
            '  .jojo-hero{flex-direction:column;gap:18px;padding:20px;border-radius:16px}',
            '  .jojo-hl{font-size:24px;line-height:1.16}',
            '  .jojo-sub{font-size:13.5px;margin-bottom:14px}',
            '  .jojo-why{margin-bottom:16px}',
            '  .jojo-mos{grid-template-rows:92px 92px;min-height:0;gap:8px}',
            '  .jojo-cta{flex-direction:column;align-items:stretch;gap:12px}',
            '  .jojo-btn{width:100%;justify-content:center;padding:14px}',
            '  .jojo-phone{justify-content:center}',
            '  .jojo-rate{justify-content:center;margin-bottom:0;margin-top:2px}',
            '}',
        ].join('');
        document.head.appendChild(style);

        // ─── Hero ─────────────────────────────────────────────────────────────
        var hero = document.createElement('div');
        hero.id = 'jojo-hero';
        hero.className = 'jojo-hero-wrap';
        hero.innerHTML = [
            '<div class="container">',
            '  <div class="jojo-hero jojo-pre">',
            '    <div class="jojo-hero-text">',
            '      <span class="jojo-eb">📍 Rodinný catering · Ostrava a okolí</span>',
            '      <div class="jojo-hl">Postaráme se o jídlo,<br>vy si <em>užijte akci</em></div>',
            '      <div class="jojo-sub">Párty mísy, chlebíčky, sladké i teplé pokrmy. Čerstvé domácí rauty na míru — na svatby, oslavy i firemní akce.</div>',
            '      <ul class="jojo-why">',
            '        <li>Žádné polotovary</li>',
            '        <li>Vše čerstvé na míru</li>',
            '        <li>Doručíme až k vám</li>',
            '        <li>Hotovo od druhého dne</li>',
            '      </ul>',
            '      <div class="jojo-rate"><span class="jojo-stars">★★★★★</span>98 % spokojených zákazníků</div>',
            '      <div class="jojo-cta">',
            '        <a class="jojo-btn" id="jojo-hero-cta" href="#">Prohlédnout nabídku ↓</a>',
            '        <a class="jojo-phone" href="tel:+420776003155">📞 Poradíme: <b>Jana 776 003 155</b></a>',
            '      </div>',
            '    </div>',
            '    <div class="jojo-mos">',
            '      <div class="jojo-tile" style="background-image:url(\'' + IMG_BEDYNKA + '\')"></div>',
            '      <div class="jojo-tile" style="background-image:url(\'' + IMG_CHLEBICKY + '\')"></div>',
            '      <div class="jojo-tile" style="background-image:url(\'' + IMG_SLADKE + '\')"></div>',
            '      <div class="jojo-tile" style="background-image:url(\'' + IMG_BURGER + '\')"></div>',
            '    </div>',
            '  </div>',
            '</div>',
        ].join('');
        anchor.insertAdjacentElement('beforebegin', hero);

        // ─── Vstupní animace ──────────────────────────────────────────────────
        var card = hero.querySelector('.jojo-hero');
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                card.classList.remove('jojo-pre');
                card.classList.add('jojo-in');
            });
        });

        // ─── „Prohlédnout nabídku" → plynule na produkty ──────────────────────
        var cta = document.getElementById('jojo-hero-cta');
        if (cta) cta.addEventListener('click', function (e) {
            e.preventDefault();
            var target = document.querySelector('.homepage-group-title')
                      || document.querySelector('.products')
                      || anchor.nextElementSibling;
            if (!target) return;
            var y = target.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({ top: y, behavior: 'smooth' });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
