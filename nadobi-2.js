(function () {
    'use strict';

    if (!document.body.classList.contains('in-kosik')) return;

    function init(fv) {
        // ZDARMA label pro 0 Kč položky
        fv.querySelectorAll('.fvDoplnek-produkt .price').forEach(function (p) {
            var t = p.textContent.trim();
            if (t === '0 Kč' || !t) { p.textContent = 'ZDARMA'; p.classList.add('jojo-free'); }
        });

        // Radio chování — jen jedna volba v kategorii
        fv.addEventListener('change', function (e) {
            var cb = e.target;
            if (!cb.classList.contains('fvDoplnek-variant-checkbox') || !cb.checked) return;
            var cat = cb.closest('.fvDoplnek-category');
            if (cat) cat.querySelectorAll('.fvDoplnek-variant-checkbox').forEach(function (o) {
                if (o !== cb && o.checked) { o.checked = false; o.dispatchEvent(new Event('change', { bubbles: true })); }
            });
            syncAttached(fv);
        });

        syncAttached(fv);

        // Validace — Pokračovat bez výběru nádobí
        var btn = document.getElementById('continue-order-button');
        if (btn) btn.addEventListener('click', function (e) {
            var cat = fv.querySelector('.fvDoplnek-category');
            if (!cat || cat.querySelector('.fvDoplnek-variant-checkbox:checked')) return;
            e.preventDefault();
            var err = fv.querySelector('.jojo-nadobi-err');
            if (!err) {
                err = document.createElement('p');
                err.className = 'jojo-nadobi-err';
                cat.appendChild(err);
            }
            err.textContent = '⚠ Prosím vyberte způsob nádobí před pokračováním.';
            fv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    function syncAttached(fv) {
        fv.querySelectorAll('.fvDoplnek-attached-products').forEach(function (ap) {
            var code = ap.dataset.triggerProductCode;
            var show = false;
            if (code) {
                var cb = fv.querySelector('.fvDoplnek-variant-checkbox[data-code="' + code + '"]');
                show = !!(cb && cb.checked);
            } else {
                fv.querySelectorAll('.fvDoplnek-variant-checkbox:checked').forEach(function (cb) {
                    if (/zapůjč|půjčen/i.test(((cb.closest('.fvDoplnek-produkt') || {}).textContent || ''))) show = true;
                });
            }
            ap.style.display = show ? 'block' : '';
            if (!show) ap.querySelectorAll('.fvDoplnek-variant-checkbox:checked').forEach(function (cb) {
                cb.checked = false; cb.dispatchEvent(new Event('change', { bubbles: true }));
            });
        });
    }

    var fv = document.querySelector('.fvDoplnek');
    if (fv) {
        init(fv);
    } else {
        var obs = new MutationObserver(function (m, o) {
            var el = document.querySelector('.fvDoplnek');
            if (el) { o.disconnect(); init(el); }
        });
        obs.observe(document.body, { childList: true, subtree: true });
        setTimeout(function () { obs.disconnect(); var el = document.querySelector('.fvDoplnek'); if (el) init(el); }, 4000);
    }
})();
