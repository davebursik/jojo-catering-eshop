(function () {
    'use strict';

    var MAPY_API_KEY = 'F5w5TlZz8C5HDhk2SSRklbiv242GQ4jH-sBiPOxuEBY';
    var DEPOT_LAT = 49.80028;
    var DEPOT_LON = 18.23062;

    var ZONES = [
        { maxKm: 15,  label: 'Jojo rozvoz – do 15 km',  price: 150 },
        { maxKm: 20,  label: 'Jojo rozvoz – do 20 km',  price: 220 },
        { maxKm: 25,  label: 'Jojo rozvoz – do 25 km',  price: 280 },
        { maxKm: 30,  label: 'Jojo rozvoz – do 30 km',  price: 350 },
        { maxKm: 40,  label: 'Jojo rozvoz – do 40 km',  price: 400 },
        { maxKm: 50,  label: 'Jojo rozvoz – do 50 km',  price: 450 },
        { maxKm: 60,  label: 'Jojo rozvoz – do 60 km',  price: 550 },
        { maxKm: 70,  label: 'Jojo rozvoz – do 70 km',  price: 650 },
        { maxKm: 80,  label: 'Jojo rozvoz – do 80 km',  price: 760 },
        { maxKm: 90,  label: 'Jojo rozvoz – do 90 km',  price: 880 },
        { maxKm: 100, label: 'Jojo rozvoz – do 100 km', price: 1000 },
    ];

    var SESSION_KEY = 'jojo_delivery';
    var PRIMARY    = '#4C1536';
    var FREE_DELIVERY_THRESHOLD = 1000; // Kč — doprava zdarma v zóně do 15 km
    var FREE_DELIVERY_MAX_KM    = 15;

    // ─── Krok-1: možnost „Jojo kurýr" ─────────────────────────────────────────
    // Vše je v jedné sekci „Zvolte způsob dopravy": adresní pole (pod nadpisem)
    // + náš vždy viditelný box „Jojo kurýr" (nad seznamem dopravy). Shoptet
    // vyrenderuje skutečnou možnost #shipping-29 až po zadání adresy.

    function scrollToKrok1Widget() {
        var w = document.getElementById('jojo-krok1-widget');
        if (!w) return;
        var input = w.querySelector('input[type="text"]');
        if (input) input.focus();
    }

    // Vloží náš informační box těsně NAD seznam dopravy (jen jednou)
    function injectKuryrNotice(beforeEl) {
        if (document.getElementById('jojo-kuryr-notice')) return;
        var n = document.createElement('div');
        n.id = 'jojo-kuryr-notice';
        n.style.cssText = 'border-radius:10px;padding:14px 16px;margin:0 0 12px;cursor:pointer;transition:background .15s,border-color .15s;';
        n.addEventListener('click', scrollToKrok1Widget);
        beforeEl.insertAdjacentElement('beforebegin', n);
    }

    // Zobrazí náš box a skryje případnou skutečnou (teď neplatnou) možnost kurýra.
    // Idempotentní — bezpečné z MutationObserveru (nezacyklí se).
    function showKuryrNotice(state) {
        var n = document.getElementById('jojo-kuryr-notice');
        if (!n) return;

        // Skrýt skutečnou možnost kurýra, pokud ji Shoptet vyrenderoval z dřívějška
        var real = document.getElementById('shipping-29');
        if (real && real.style.display !== 'none') real.style.display = 'none';
        var kuryrRadio = document.getElementById('shippingId-29');
        if (kuryrRadio && kuryrRadio.checked) {
            var pickup = document.getElementById('shippingId-4');
            if (pickup) { pickup.checked = true; pickup.dispatchEvent(new Event('change', { bubbles: true })); }
        }

        if (n.dataset.state === state && n.style.display === 'block') return; // už nastaveno
        n.dataset.state = state;
        n.style.display = 'block';

        if (state === 'outofrange') {
            n.style.border = '2px dashed #e0a3a3';
            n.style.background = '#fff5f5';
            n.innerHTML = [
                '<div style="display:flex;align-items:center;gap:12px;">',
                '  <span style="font-size:24px;line-height:1;">❌</span>',
                '  <div style="flex:1;">',
                '    <div style="font-weight:700;color:#c62828;font-size:14px;">Jojo kurýr — mimo dosah</div>',
                '    <div style="font-size:13px;color:#666;margin-top:2px;">Zadaná adresa je dál než 100 km. Zvolte prosím osobní odběr, nebo zadejte jinou adresu výše.</div>',
                '  </div>',
                '</div>',
            ].join('');
        } else {
            n.style.border = '2px dashed #c9a0bb';
            n.style.background = '#faf5f8';
            n.innerHTML = [
                '<div style="display:flex;align-items:center;gap:12px;">',
                '  <span style="font-size:26px;line-height:1;">🚗</span>',
                '  <div style="flex:1;">',
                '    <div style="font-weight:700;color:' + PRIMARY + ';font-size:14px;">Jojo kurýr — doručení až k vám domů</div>',
                '    <div style="font-size:13px;color:#666;margin-top:2px;">Pro doručení <strong>zadejte adresu výše ☝</strong> — spočítáme cenu a možnost se aktivuje.</div>',
                '  </div>',
                '  <span style="flex-shrink:0;font-size:13px;color:#fff;background:' + PRIMARY + ';padding:7px 14px;border-radius:20px;white-space:nowrap;font-weight:600;">Zadat adresu</span>',
                '</div>',
            ].join('');
        }
    }

    // Adresa je platná → schovat náš box a vybrat skutečnou možnost kurýra.
    // Idempotentní.
    function activateKuryr() {
        var n = document.getElementById('jojo-kuryr-notice');
        if (n && n.style.display !== 'none') { n.style.display = 'none'; n.dataset.state = ''; }

        var radio = document.getElementById('shippingId-29');
        if (!radio) {
            // Shoptet teprve renderuje (AJAX po přepnutí regionu) — počkat
            var obs = new MutationObserver(function (m, o) {
                if (document.getElementById('shippingId-29')) { o.disconnect(); activateKuryr(); }
            });
            obs.observe(document.body, { childList: true, subtree: true });
            setTimeout(function () { obs.disconnect(); }, 6000);
            return;
        }
        var w = document.getElementById('shipping-29');
        if (w && (w.style.display === 'none' || w.style.opacity)) {
            w.style.display = 'block'; w.style.opacity = ''; w.style.pointerEvents = '';
        }
        if (!radio.checked) { radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true })); }
    }

    // ─── Widget ───────────────────────────────────────────────────────────────

    var _widgetCounter = 0;

    function createWidget(container, opts) {
        opts = opts || {};
        var uid = 'jojo-w' + (++_widgetCounter);

        var btnLabel = opts.isHomepage ? 'Zjistit' : 'Zjistit cenu';
        container.innerHTML = [
            '<div style="font-family:inherit;position:relative;">',
            '  <div style="position:relative;">',
            '    <span style="position:absolute;left:13px;top:50%;transform:translateY(-50%);font-size:15px;pointer-events:none;line-height:1;">📍</span>',
            '    <input type="text" id="' + uid + '-input"',
            '      placeholder="Ulice a číslo, např. Opavská 5, Ostrava"',
            '      autocomplete="off"',
            '      style="width:100%;box-sizing:border-box;padding:11px 90px 11px 38px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:14px;outline:none;transition:border-color .2s;background:#fafafa;" />',
            '    <button type="button" id="' + uid + '-btn"',
            '      style="position:absolute;right:4px;top:4px;bottom:4px;padding:0 16px;background:' + PRIMARY + ';color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:700;white-space:nowrap;letter-spacing:.01em;">',
            '      ' + btnLabel,
            '    </button>',
            '  </div>',
            '  <ul id="' + uid + '-sugg" style="list-style:none;padding:0;margin:0;border:1px solid #e8e8e8;display:none;position:absolute;background:#fff;z-index:9999;width:100%;max-height:240px;overflow-y:auto;box-shadow:0 8px 24px rgba(0,0,0,.10);border-radius:8px;margin-top:4px;"></ul>',
            '  <div id="' + uid + '-result" style="display:none;margin-top:10px;"></div>',
            '</div>',
        ].join('');

        var input       = document.getElementById(uid + '-input');
        var suggestions = document.getElementById(uid + '-sugg');
        var result      = document.getElementById(uid + '-result');
        var calcBtn     = document.getElementById(uid + '-btn');
        var selectedCoords    = null;
        var currentComponents = null;
        var suggestTimer      = null;

        // Předvyplnit z sessionStorage
        var saved = loadSession();
        if (saved && saved.address) {
            input.value = saved.address;
            if (saved.km !== undefined) {
                if (saved.zone) {
                    showOk(saved.km, saved.zone);
                    if (opts.switchRegion) switchRegion(saved.zone.label);
                    if (opts.onDelivery) opts.onDelivery(true);
                } else {
                    showOutOfRange(saved.km, opts);
                    if (opts.onDelivery) opts.onDelivery(false);
                }
            }
        }

        input.addEventListener('focus', function () { this.style.borderColor = PRIMARY; });
        input.addEventListener('blur', function () {
            this.style.borderColor = '#ddd';
            setTimeout(hideSuggestions, 200);
        });

        input.addEventListener('input', function () {
            selectedCoords    = null;
            currentComponents = null;
            clearTimeout(suggestTimer);
            var q = this.value.trim();
            if (q.length < 3) { hideSuggestions(); return; }
            suggestTimer = setTimeout(function () { fetchSuggestions(q); }, 350);
        });

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); calcBtn.click(); }
        });

        calcBtn.addEventListener('click', function () {
            if (selectedCoords) { calculateRoute(selectedCoords); return; }
            var q = input.value.trim();
            if (!q) { showWarn('Zadejte prosím adresu doručení.'); return; }
            showLoading('Hledám adresu…');
            fetch('https://api.mapy.cz/v1/geocode?query=' + encodeURIComponent(q) + '&lang=cs&limit=1&apikey=' + MAPY_API_KEY)
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    var item = data.items && data.items[0];
                    if (!item) { showWarn('Adresu se nepodařilo najít. Zkuste zadat přesněji, např. „Opavská 5, Ostrava".'); return; }
                    selectedCoords    = { lat: item.position.lat, lon: item.position.lon };
                    currentComponents = parseAddressComponents(item);
                    calculateRoute(selectedCoords);
                })
                .catch(function () { showError('Chyba připojení. Zkuste to znovu.'); });
        });

        function fetchSuggestions(q) {
            fetch('https://api.mapy.cz/v1/suggest?query=' + encodeURIComponent(q) + '&lang=cs&limit=6&type=regional.address&apikey=' + MAPY_API_KEY)
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    var items = data.items || [];
                    suggestions.innerHTML = '';
                    if (!items.length) { hideSuggestions(); return; }
                    items.forEach(function (item) {
                        var text = item.name || '';
                        if (item.location) text += ', ' + item.location;
                        var li = document.createElement('li');
                        li.style.cssText = 'padding:11px 16px;cursor:pointer;border-bottom:1px solid #f0f0f0;font-size:14px;display:flex;align-items:center;gap:10px;';
                        li.innerHTML = '<span style="color:#999;font-size:18px;">📍</span><span>' + escHtml(text) + '</span>';
                        li.addEventListener('mouseenter', function () { this.style.background = '#f8f8f8'; });
                        li.addEventListener('mouseleave', function () { this.style.background = ''; });
                        li.addEventListener('mousedown', function (e) {
                            e.preventDefault();
                            input.value = text;
                            hideSuggestions();
                            if (!item.position) return;
                            selectedCoords = { lat: item.position.lat, lon: item.position.lon };
                            // Suggest API nevrací PSČ — dohledáme přes geocode
                            fetch('https://api.mapy.cz/v1/geocode?query=' + encodeURIComponent(text) + '&lang=cs&limit=1&apikey=' + MAPY_API_KEY)
                                .then(function (r) { return r.json(); })
                                .then(function (gd) {
                                    var gi = gd.items && gd.items[0];
                                    currentComponents = gi ? parseAddressComponents(gi) : parseAddressComponents(item);
                                })
                                .catch(function () { currentComponents = parseAddressComponents(item); })
                                .then(function () { calculateRoute(selectedCoords); });
                        });
                        suggestions.appendChild(li);
                    });
                    suggestions.style.display = 'block';
                })
                .catch(function () { hideSuggestions(); });
        }

        function hideSuggestions() { suggestions.style.display = 'none'; }

        document.addEventListener('click', function (e) {
            if (!container.contains(e.target)) hideSuggestions();
        });

        function calculateRoute(coords) {
            showLoading('Zjišťuji cenu dopravy…');
            var url = [
                'https://api.mapy.cz/v1/routing/route',
                '?start=' + DEPOT_LON + ',' + DEPOT_LAT,
                '&end=' + coords.lon + ',' + coords.lat,
                '&routeType=car_fast&lang=cs',
                '&apikey=' + MAPY_API_KEY,
            ].join('');
            fetch(url)
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    if (!data.length) { showError('Trasu se nepodařilo vypočítat. Zkuste adresu zadat přesněji.'); return; }
                    var km   = Math.round(data.length / 1000);
                    var zone = getZone(km);
                    saveSession({
                        address:    input.value,
                        km:         km,
                        zone:       zone || null,
                        components: currentComponents || null,
                    });
                    if (!zone) {
                        showOutOfRange(km, opts);
                        if (opts.onDelivery) opts.onDelivery(false);
                    } else {
                        showOk(km, zone);
                        if (opts.switchRegion) switchRegion(zone.label);
                        if (opts.onDelivery) opts.onDelivery(true);
                    }
                })
                .catch(function () { showError('Chyba při výpočtu trasy. Zkuste to znovu.'); });
        }

        function showOk(km, zone) {
            var cartTotal = getCartTotal();
            var isFree15  = km <= FREE_DELIVERY_MAX_KM && cartTotal >= FREE_DELIVERY_THRESHOLD;
            var showProgress = opts.switchRegion && km <= FREE_DELIVERY_MAX_KM && cartTotal > 0 && cartTotal < FREE_DELIVERY_THRESHOLD;

            var priceHtml;
            if (opts.isHomepage) {
                // Na homepage/topbaru nezobrazujeme cenu — jen hint pro 15km zónu
                priceHtml = km <= FREE_DELIVERY_MAX_KM
                    ? '<span style="color:#1a7a40;font-weight:600;">Při objednávce nad 1 000 Kč doprava zdarma!</span>'
                    : '';
            } else if (isFree15) {
                priceHtml = '<strong style="color:#1a7a40;">Doprava zdarma</strong>';
            } else {
                priceHtml = 'Cena dopravy: <strong>' + zone.price + ' Kč</strong>';
            }

            var progressHtml = '';
            if (showProgress) {
                var missing  = FREE_DELIVERY_THRESHOLD - cartTotal;
                var pct      = Math.min(100, Math.round(cartTotal / FREE_DELIVERY_THRESHOLD * 100));
                progressHtml = [
                    '<div style="margin-top:10px;background:#e8f5e9;border-radius:8px;padding:10px 14px;">',
                    '  <div style="font-size:13px;color:#1a7a40;margin-bottom:7px;">',
                    '    🎁 Chybí vám <strong>' + missing + ' Kč</strong> do dopravy zdarma!',
                    '  </div>',
                    '  <div style="background:#c8e6c9;border-radius:4px;height:8px;overflow:hidden;">',
                    '    <div style="background:#34c068;height:8px;border-radius:4px;width:' + pct + '%;"></div>',
                    '  </div>',
                    '  <div style="font-size:11px;color:#555;margin-top:5px;text-align:right;">' + cartTotal + ' Kč / 1 000 Kč</div>',
                    '</div>',
                ].join('');
            }

            result.style.display = 'block';
            result.innerHTML = [
                '<div style="background:#f0faf4;border:1.5px solid #34c068;border-radius:10px;padding:14px 18px;display:flex;align-items:center;gap:14px;">',
                '  <span style="font-size:28px;line-height:1;">✅</span>',
                '  <div style="flex:1;">',
                '    <div style="font-size:15px;font-weight:700;color:#1a7a40;">Doručíme k vám!</div>',
                '    <div style="font-size:14px;color:#333;margin-top:3px;">' + priceHtml + '</div>',
                progressHtml,
                '  </div>',
                '</div>',
            ].join('');
        }

        function showOutOfRange(km, o) {
            var pickupBtnId = uid + '-pickup';
            var btn = (o && o.switchRegion)
                ? '<button type="button" id="' + pickupBtnId + '" style="margin-top:10px;padding:9px 18px;background:' + PRIMARY + ';color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600;">Zvolit osobní odběr v Jojo Parku</button>'
                : '';
            result.style.display = 'block';
            result.innerHTML = [
                '<div style="background:#fff5f5;border:1.5px solid #e53935;border-radius:10px;padding:14px 18px;display:flex;align-items:flex-start;gap:14px;">',
                '  <span style="font-size:28px;line-height:1;">❌</span>',
                '  <div>',
                '    <div style="font-size:15px;font-weight:700;color:#c62828;">Bohužel nedoručujeme</div>',
                '    <div style="font-size:14px;color:#555;margin-top:3px;">Adresa je <strong>' + km + ' km</strong> od naší kuchyně. Doručujeme max. 100 km.</div>',
                btn,
                '  </div>',
                '</div>',
            ].join('');
            var pickupBtn = document.getElementById(pickupBtnId);
            if (pickupBtn) {
                pickupBtn.addEventListener('click', function () {
                    selectPersonalPickup();
                    this.textContent = '✓ Osobní odběr zvolen';
                    this.style.background = '#34c068';
                    this.disabled = true;
                });
            }
        }

        function showLoading(msg) {
            result.style.display = 'block';
            result.innerHTML = '<div style="padding:12px 16px;color:#555;font-size:14px;">⏳ ' + msg + '</div>';
        }

        function showWarn(msg) {
            result.style.display = 'block';
            result.innerHTML = '<div style="background:#fff8e1;border:1.5px solid #ffc107;border-radius:8px;padding:12px 16px;font-size:14px;color:#856404;">⚠️ ' + msg + '</div>';
        }

        function showError(msg) {
            result.style.display = 'block';
            result.innerHTML = '<div style="background:#fff5f5;border:1.5px solid #e53935;border-radius:8px;padding:12px 16px;font-size:14px;color:#c62828;">❌ ' + msg + '</div>';
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    function parseAddressComponents(item) {
        var rs = item.regionalStructure || [];
        function find(type) {
            for (var i = 0; i < rs.length; i++) {
                if (rs[i].type === type) return rs[i].name || '';
            }
            return '';
        }
        return {
            street:      find('regional.street'),
            houseNumber: find('regional.address'),
            city:        find('regional.municipality'),
            zip:         item.zip || find('regional.zip'), // PSČ je přímo na item.zip
        };
    }

    function getZone(km) {
        for (var i = 0; i < ZONES.length; i++) {
            if (km <= ZONES[i].maxKm) return ZONES[i];
        }
        return null;
    }

    function switchRegion(label) {
        var select = document.getElementById('deliveryRegionId');
        if (!select) return;
        for (var i = 0; i < select.options.length; i++) {
            if (select.options[i].text.trim() === label) {
                select.value = select.options[i].value;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                return;
            }
        }
    }

    function selectPersonalPickup() {
        var radio = document.querySelector('input[name="shippingId"][data-code="personal-collection"]');
        if (radio) {
            radio.checked = true;
            radio.dispatchEvent(new Event('change', { bubbles: true }));
            radio.dispatchEvent(new Event('click', { bubbles: true }));
        }
    }

    function hideRegionDropdown() {
        var el = document.getElementById('deliveryRegionId');
        if (el) {
            var wrapper = el.closest('.col-sm-6');
            if (wrapper) wrapper.style.display = 'none';
        }
    }

    function fillField(selector, value) {
        if (!value) return;
        var el = document.querySelector(selector);
        if (!el) return;
        el.value = value;
        el.dispatchEvent(new Event('input',  { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Najde hodnotu option v selectu podle textu a nastaví select + hidden input
    function setSelectByLabel(selectId, hiddenId, label) {
        var sel = document.getElementById(selectId);
        if (!sel || !label) return;
        for (var i = 0; i < sel.options.length; i++) {
            if (sel.options[i].text.trim() === label) {
                var val = sel.options[i].value;
                sel.value = val;
                if (hiddenId) {
                    var hidden = document.getElementById(hiddenId);
                    if (hidden) hidden.value = val;
                }
                return val;
            }
        }
        return null;
    }

    function saveSession(data) {
        try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch (e) {}
    }

    function loadSession() {
        try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch (e) { return null; }
    }

    function getCartTotal() {
        var el = document.querySelector('[data-testid="recapItemTotalPrice"]');
        if (!el) return 0;
        var text = el.textContent.replace(/\s/g, '').replace(/[^\d]/g, '');
        return parseInt(text, 10) || 0;
    }

    function escHtml(str) {
        return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    // ─── Krok 2 – Informace o vás ─────────────────────────────────────────────

    function initKrok2() {
        if (!document.body.classList.contains('in-krok-2')) return;

        var sess = loadSession();
        var comp = (sess && sess.components) ? sess.components : {};
        var zone = (sess && sess.zone) ? sess.zone : null;

        // 1. Předvyplnit fakturační adresu ze session
        //    Shoptet bez zaškrtnutého #another-shipping použije billing adresu = doručovací → žádná extra pole nepotřebujeme
        fillField('#billStreet',      comp.street);
        fillField('#billHouseNumber', comp.houseNumber);
        fillField('#billCity',        comp.city);
        fillField('#billZip',         comp.zip);
        if (zone) setSelectByLabel('billRegionId', 'billRegionIdInput', zone.label);

        // Pokud PSČ v session chybí (stará data), dohledej přes geocode
        if (!comp.zip && sess && sess.address) {
            fetch('https://api.mapy.cz/v1/geocode?query=' + encodeURIComponent(sess.address) + '&lang=cs&limit=1&apikey=' + MAPY_API_KEY)
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    var item = data.items && data.items[0];
                    if (item && item.zip) {
                        fillField('#billZip', item.zip);
                        sess.components = sess.components || {};
                        sess.components.zip = item.zip;
                        saveSession(sess);
                    }
                })
                .catch(function () {});
        }

        // 2. Skrýt "Doručit na jinou adresu" — necháme NEzaškrtnuté (billing = delivery)
        var anotherCb = document.getElementById('another-shipping');
        if (anotherCb) {
            var anotherRow = anotherCb.closest('.form-group');
            if (anotherRow) anotherRow.style.display = 'none';
        }

        // 3. Banner s doručovací adresou
        if (sess && sess.address) {
            var priceText = zone ? (zone.price + ' Kč') : '';
            var banner = document.createElement('div');
            banner.style.cssText = 'background:#f0faf4;border:1.5px solid #34c068;border-radius:10px;padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;gap:12px;';
            banner.innerHTML = [
                '<div style="display:flex;align-items:center;gap:12px;">',
                '  <span style="font-size:22px;">✅</span>',
                '  <div>',
                '    <div style="font-size:12px;color:#555;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Doručovací adresa</div>',
                '    <div style="font-size:15px;font-weight:700;color:#1a7a40;margin-top:2px;">' + escHtml(sess.address) + '</div>',
                priceText ? '<div style="font-size:13px;color:#555;margin-top:1px;">Cena dopravy: ' + priceText + '</div>' : '',
                '  </div>',
                '</div>',
                '<a href="/objednavka/krok-1/" style="font-size:13px;color:#555;text-decoration:none;white-space:nowrap;border:1px solid #ccc;border-radius:6px;padding:6px 12px;">← Změnit</a>',
            ].join('');

            var billingSection = document.querySelector('.co-billing-address');
            if (billingSection) billingSection.insertAdjacentElement('beforebegin', banner);
        }
    }

    // ─── Init ─────────────────────────────────────────────────────────────────

    function init() {
        // Widget kdekoliv na webu přes placeholder
        var placeholder = document.getElementById('jojo-doprava-kalkulacka');
        if (placeholder) {
            createWidget(placeholder, { switchRegion: false });
        }

        // Topbar widget — eager init (dorucime.js ho vytvoří před DOMContentLoaded)
        var topbarSlot = document.getElementById('jojo-topbar-widget');
        if (topbarSlot) {
            createWidget(topbarSlot, { isHomepage: true });
        }
        // Fallback pro případ opačného pořadí načtení scriptů
        document.addEventListener('jojo:panel-open', function () {
            var slot = document.getElementById('jojo-topbar-widget');
            if (slot && !slot._jojoInit) {
                slot._jojoInit = true;
                createWidget(slot, { isHomepage: true });
            }
        });

        // Homepage – automatická injekce za .hp-categories
        if (document.body.classList.contains('in-index')) {
            var hpAnchor = document.querySelector('.hp-categories')
                        || document.querySelector('.benefits-banners-line');
            if (hpAnchor) {
                var hpSection = document.createElement('div');
                hpSection.style.cssText = 'background:#faf5f7;border-top:1px solid #ede0e6;border-bottom:1px solid #ede0e6;padding:28px 0 24px;margin:0;';
                var hpContainer = document.createElement('div');
                hpContainer.className = 'container';
                hpContainer.innerHTML = [
                    '<div style="font-size:20px;font-weight:800;color:' + PRIMARY + ';margin-bottom:4px;">Doručujeme i k vám?</div>',
                    '<div style="font-size:14px;color:#777;margin-bottom:16px;">Zadejte adresu a okamžitě zjistíte cenu doručení.</div>',
                ].join('');
                var hpInner = document.createElement('div');
                hpContainer.appendChild(hpInner);
                hpSection.appendChild(hpContainer);
                hpAnchor.insertAdjacentElement('afterend', hpSection);
                createWidget(hpInner, { isHomepage: true });
            }
        }

        // Krok 1 – Doprava a platba
        if (document.body.classList.contains('in-krok-1')) {
            hideRegionDropdown();

            var sess = loadSession();
            var kuryrState = (sess && sess.zone)              ? 'active'
                           : (sess && sess.km !== undefined)  ? 'outofrange'
                           : 'noaddress';

            function applyKuryrState() {
                if (kuryrState === 'active') activateKuryr();
                else showKuryrNotice(kuryrState);
            }

            // Vše do jedné sekce „Zvolte způsob dopravy": adresa pod nadpis,
            // box kurýra nad seznam dopravy. Re-injektuje se, kdyby Shoptet
            // sekci přerenderoval (AJAX).
            function ensureKrok1UI() {
                var box = document.querySelector('.co-delivery-method');
                if (!box) return;
                var heading = box.querySelector('h4.order-delivery') || box.querySelector('h4');
                var list    = box.querySelector('#order-shipping-methods');

                // Adresní pole pod nadpisem
                if (!document.getElementById('jojo-krok1-widget') && heading) {
                    var widget = document.createElement('div');
                    widget.id = 'jojo-krok1-widget';
                    widget.style.cssText = 'margin:14px 0 16px;';
                    widget.innerHTML = '<div style="font-size:14px;font-weight:700;color:#333;margin-bottom:3px;">📍 Doručení Jojo kurýrem až k vám domů</div><div style="font-size:13px;color:#777;margin-bottom:10px;">Zadejte adresu — spočítáme cenu a níže se aktivuje možnost doručení.</div>';
                    var inner = document.createElement('div');
                    widget.appendChild(inner);
                    heading.insertAdjacentElement('afterend', widget);
                    createWidget(inner, {
                        switchRegion: true,
                        onDelivery: function (canDeliver) {
                            kuryrState = canDeliver ? 'active' : 'outofrange';
                            applyKuryrState();
                        },
                    });
                }

                // Box „Jojo kurýr" těsně nad seznamem dopravy
                if (!document.getElementById('jojo-kuryr-notice') && list) {
                    injectKuryrNotice(list);
                }

                applyKuryrState();
            }

            ensureKrok1UI();

            var box0   = document.querySelector('.co-delivery-method');
            var parent = box0 ? (box0.parentNode || document.body) : document.body;
            var krok1Obs = new MutationObserver(function () { ensureKrok1UI(); });
            krok1Obs.observe(parent, { childList: true, subtree: true });
            setTimeout(function () { krok1Obs.disconnect(); }, 12000);
        }

        // Krok 2 – Informace o vás
        initKrok2();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
