(function () {
    'use strict';

    if (!document.body.classList.contains('in-kosik')) return;

    function applyDesign(fvEl) {
        // Injektuj custom radio-tečku do každého produktu
        fvEl.querySelectorAll('.fvDoplnek-produkt').forEach(function(prod) {
            if (prod.querySelector('.jojo-r')) return;
            var lbl = prod.querySelector('label');
            if (!lbl) return;
            var dot = document.createElement('span');
            dot.className = 'jojo-r';
            lbl.insertBefore(dot, lbl.firstChild);
        });

        // ZDARMA badge pro 0 Kč položky
        fvEl.querySelectorAll('.fvDoplnek-produkt .price').forEach(function(p) {
            var t = p.textContent.trim();
            if (t === '0 Kč' || t === 'ZDARMA' || !t) {
                p.textContent = 'ZDARMA';
                p.classList.add('jojo-free');
            }
        });

        syncAttached(fvEl);

        // Radio chování — jen jedna volba v kategorii
        fvEl.addEventListener('change', function(e) {
            var cb = e.target;
            if (!cb.classList.contains('fvDoplnek-variant-checkbox')) return;
            if (cb.checked) {
                var cat = cb.closest('.fvDoplnek-category');
                if (cat) {
                    cat.querySelectorAll('.fvDoplnek-variant-checkbox').forEach(function(other) {
                        if (other !== cb && other.checked) {
                            other.checked = false;
                            other.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    });
                }
            }
            syncAttached(fvEl);
            hideNadobiError(fvEl);
        });

        // Validace — Pokračovat bez zvoleného nádobí
        var continueBtn = document.getElementById('continue-order-button');
        if (continueBtn) {
            continueBtn.addEventListener('click', function(e) {
                var mainCat = fvEl.querySelector('.fvDoplnek-category');
                if (!mainCat) return;
                if (!mainCat.querySelector('.fvDoplnek-variant-checkbox:checked')) {
                    e.preventDefault();
                    showNadobiError(fvEl, mainCat);
                }
            });
        }
    }

    function syncAttached(fvEl) {
        fvEl.querySelectorAll('.fvDoplnek-attached-products').forEach(function(ap) {
            var code = ap.dataset.triggerProductCode;
            var show = false;
            if (code) {
                var triggerCb = fvEl.querySelector('.fvDoplnek-variant-checkbox[data-code="' + code + '"]');
                show = !!(triggerCb && triggerCb.checked);
            } else {
                // Fallback: hledej "zapůjč" nebo "půjčen" v textu zaškrtnutých položek
                fvEl.querySelectorAll('.fvDoplnek-variant-checkbox:checked').forEach(function(cb) {
                    var txt = ((cb.closest('.fvDoplnek-produkt') || {}).textContent || '');
                    if (/zapůjč|půjčen/i.test(txt)) show = true;
                });
            }
            ap.style.display = show ? 'block' : '';
            if (!show) {
                ap.querySelectorAll('.fvDoplnek-variant-checkbox:checked').forEach(function(cb) {
                    cb.checked = false;
                    cb.dispatchEvent(new Event('change', { bubbles: true }));
                });
            }
        });
    }

    function showNadobiError(fvEl, mainCat) {
        var err = fvEl.querySelector('.jojo-nadobi-err');
        if (!err) {
            err = document.createElement('div');
            err.className = 'jojo-nadobi-err';
            mainCat.appendChild(err);
        }
        err.textContent = '⚠ Prosím vyberte způsob nádobí před pokračováním.';
        err.style.display = 'block';
        fvEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function hideNadobiError(fvEl) {
        var err = fvEl.querySelector('.jojo-nadobi-err');
        if (err) err.style.display = 'none';
    }

    // Počkat na cartupsell plugin
    var fvEl = document.querySelector('.fvDoplnek');
    if (fvEl) {
        applyDesign(fvEl);
    } else {
        var obs = new MutationObserver(function(mutations, o) {
            var el = document.querySelector('.fvDoplnek');
            if (el) { o.disconnect(); applyDesign(el); }
        });
        obs.observe(document.body, { childList: true, subtree: true });
        setTimeout(function() {
            obs.disconnect();
            var el = document.querySelector('.fvDoplnek');
            if (el) applyDesign(el);
        }, 4000);
    }

})();
