(function () {
    'use strict';

    if (!document.body.classList.contains('in-index')) return;

    function init() {
        if (document.getElementById('jojo-cat-nav')) return;

        var CDN = 'https://cdn.myshoptet.com/usr/eshop.jojocatering.cz/user/categories/thumb/';
        var cats = [
            { label: 'Párty bedýnky', sub: 'mísy, saláty…',  href: '/party-bedynky-misy-salaty/', img: CDN + 'partybedynka-rgb.jpg' },
            { label: 'Chlebíčky',     sub: 'a pomazánky',     href: '/chlebicky-a-pomazanky/',    img: CDN + 'kanapky_s_nivou_a_o__echy.jpg' },
            { label: 'Sladké dobroty',sub: '',                 href: '/sladke-dobroty/',           img: CDN + 'strouhan___kol_____-_d__lek_rgb1.jpg' },
            { label: 'Teplé pokrmy',  sub: '',                 href: '/teple-pokrmy/',             img: CDN + 'miniburger-4.jpg' },
            { label: 'Nápoje',        sub: '',                 href: '/napoje/',                   img: CDN + '252.jpg' },
        ];

        var style = document.createElement('style');
        style.id = 'jojo-cat-style';
        style.textContent = [
            '.jojo-cat-wrap{margin:0 0 20px}',
            '.jojo-cat-head{display:flex;align-items:baseline;justify-content:space-between;margin:0 0 12px}',
            '.jojo-cat-title{font-size:20px;font-weight:800;color:#4C1536;letter-spacing:-.01em}',
            '.jojo-cat-all{font-size:13px;color:#4C1536;text-decoration:none!important;font-weight:600;opacity:.6}',
            '.jojo-cat-all:hover{opacity:1}',
            '.jojo-cats{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}',
            '.jojo-ccard{display:block;text-decoration:none!important;border-radius:13px;overflow:hidden;background:#fff;border:1px solid #efe4ed;box-shadow:0 2px 8px rgba(76,21,54,.05);transition:transform .25s ease,box-shadow .25s ease}',
            '.jojo-ccard:hover{transform:translateY(-3px);box-shadow:0 8px 20px rgba(76,21,54,.13)}',
            '.jojo-cimg{height:96px;background-size:cover;background-position:center}',
            '.jojo-cimg-guide{height:96px;background:linear-gradient(135deg,#4C1536 0%,#8a2a5e 100%);display:flex;align-items:center;justify-content:center;font-size:34px}',
            '.jojo-cname{padding:8px 10px 3px;font-size:12.5px;font-weight:700;color:#3a2030;line-height:1.2}',
            '.jojo-csub{padding:0 10px 9px;font-size:11px;color:#a08895;line-height:1.3}',
            '.jojo-csub-empty{padding-bottom:9px}',
            '@media (max-width:767px){',
            '  .jojo-cat-wrap{margin:0 0 12px}',
            '  .jojo-cats{grid-template-columns:repeat(3,1fr);gap:8px}',
            '  .jojo-cimg,.jojo-cimg-guide{height:76px;font-size:28px}',
            '  .jojo-cat-title{font-size:17px}',
            '  .jojo-cname{font-size:11.5px;padding:6px 8px 2px}',
            '  .jojo-csub{font-size:10px;padding:0 8px 7px}',
            '  .jojo-csub-empty{padding-bottom:7px}',
            '}',
        ].join('');
        document.head.appendChild(style);

        var cards = cats.map(function (c) {
            var imgHtml = c.img
                ? '<div class="jojo-cimg" style="background-image:url(\'' + c.img + '\')"></div>'
                : '<div class="jojo-cimg-guide">📋</div>';
            var subHtml = c.sub
                ? '<div class="jojo-csub">' + c.sub + '</div>'
                : '<div class="jojo-csub-empty"></div>';
            return '<a class="jojo-ccard" href="' + c.href + '">' + imgHtml +
                '<div class="jojo-cname">' + c.label + '</div>' + subHtml + '</a>';
        }).join('');

        var wrap = document.createElement('div');
        wrap.id = 'jojo-cat-nav';
        wrap.className = 'jojo-cat-wrap';
        wrap.innerHTML =
            '<div class="container">' +
            '  <div class="jojo-cat-head">' +
            '    <span class="jojo-cat-title">Objednejte snadno</span>' +
            '    <a class="jojo-cat-all" href="/nabidka/">Celá nabídka →</a>' +
            '  </div>' +
            '  <div class="jojo-cats">' + cards + '</div>' +
            '</div>';

        // Za .before-carousel (carousel + benefits); fallback: před první skupinu produktů
        var beforeCarousel = document.querySelector('.before-carousel');
        if (beforeCarousel) {
            beforeCarousel.insertAdjacentElement('afterend', wrap);
        } else {
            var firstGroup = document.querySelector('.homepage-group-title');
            if (!firstGroup) return;
            var container = firstGroup.closest('.content-wrapper') || firstGroup.parentElement;
            if (!container) return;
            container.insertAdjacentElement('beforebegin', wrap);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
