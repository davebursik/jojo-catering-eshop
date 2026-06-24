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

    // ─── Krok-1 dopravní volby ────────────────────────────────────────────────

    function setKuryrVisible(visible) {
        var wrapper = document.getElementById('shipping-29');
        if (!wrapper) return;
        wrapper.style.display = visible ? '' : 'none';
        if (visible) {
            // Auto-vybrat Jojo kurýr
            var radio = document.getElementById('shippingId-29');
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        } else {
            // Auto-vybrat osobní odběr
            var radioPickup = document.getElementById('shippingId-4');
            if (radioPickup && !radioPickup.checked) {
                radioPickup.checked = true;
                radioPickup.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    }

    // ─── Widget ───────────────────────────────────────────────────────────────

    function createWidget(container, opts) {
        opts = opts || {};

        container.innerHTML = [
            '<div style="font-family:inherit;position:relative;">',
            '  <div style="position:relative;">',
            '    <input type="text" id="jojo-addr-input"',
            '      placeholder="Zadejte ulici a číslo domu, např. Opavská 5"',
            '      autocomplete="off"',
            '      style="width:100%;box-sizing:border-box;padding:12px 150px 12px 14px;border:2px solid #ddd;border-radius:8px;font-size:15px;outline:none;transition:border .2s;" />',
            '    <button type="button" id="jojo-calc-btn"',
            '      style="position:absolute;right:4px;top:4px;bottom:4px;padding:0 18px;background:' + PRIMARY + ';color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600;white-space:nowrap;">',
            '      Zjistit cenu',
            '    </button>',
            '  </div>',
            '  <ul id="jojo-suggestions" style="list-style:none;padding:0;margin:0;border:1px solid #ddd;display:none;position:absolute;background:#fff;z-index:9999;width:100%;max-height:240px;overflow-y:auto;box-shadow:0 8px 24px rgba(0,0,0,.12);border-radius:8px;margin-top:4px;"></ul>',
            '  <div id="jojo-result" style="display:none;margin-top:10px;"></div>',
            '</div>',
        ].join('');

        var input       = document.getElementById('jojo-addr-input');
        var suggestions = document.getElementById('jojo-suggestions');
        var result      = document.getElementById('jojo-result');
        var calcBtn     = document.getElementById('jojo-calc-btn');
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
            var priceHtml;
            if (opts.isHomepage && km <= FREE_DELIVERY_MAX_KM) {
                priceHtml = 'Cena dopravy: <strong>' + zone.price + ' Kč</strong>'
                    + ' &nbsp;<span style="color:#1a7a40;font-weight:700;">· Při nákupu nad 1 000 Kč doprava zdarma!</span>';
            } else if (km <= FREE_DELIVERY_MAX_KM && getCartTotal() >= FREE_DELIVERY_THRESHOLD) {
                priceHtml = '<strong style="color:#1a7a40;">Doprava zdarma</strong>';
            } else {
                priceHtml = 'Cena dopravy: <strong>' + zone.price + ' Kč</strong>';
            }
            result.style.display = 'block';
            result.innerHTML = [
                '<div style="background:#f0faf4;border:1.5px solid #34c068;border-radius:10px;padding:14px 18px;display:flex;align-items:center;gap:14px;">',
                '  <span style="font-size:28px;line-height:1;">✅</span>',
                '  <div>',
                '    <div style="font-size:15px;font-weight:700;color:#1a7a40;">Doručíme k vám!</div>',
                '    <div style="font-size:14px;color:#333;margin-top:3px;">' + priceHtml + '</div>',
                '  </div>',
                '</div>',
            ].join('');
        }

        function showOutOfRange(km, o) {
            var btn = (o && o.switchRegion)
                ? '<button type="button" id="jojo-pickup-btn" style="margin-top:10px;padding:9px 18px;background:' + PRIMARY + ';color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600;">Zvolit osobní odběr v Jojo Parku</button>'
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
            var pickupBtn = document.getElementById('jojo-pickup-btn');
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

        // Homepage – automatická injekce po .benefits-banners-line
        if (document.body.classList.contains('in-index')) {
            var bannerLine = document.querySelector('.benefits-banners-line');
            if (bannerLine) {
                var hpWrapper = document.createElement('div');
                hpWrapper.style.cssText = 'background:#fff;border-radius:12px;box-shadow:0 2px 16px rgba(0,0,0,.08);padding:24px;margin:24px 0;';
                hpWrapper.innerHTML = '<div style="font-size:17px;font-weight:700;margin-bottom:14px;color:' + PRIMARY + ';">Zjistěte cenu doručení k vám</div>';
                var hpInner = document.createElement('div');
                hpWrapper.appendChild(hpInner);
                bannerLine.insertAdjacentElement('afterend', hpWrapper);
                createWidget(hpInner, { isHomepage: true });
            }
        }

        // Krok 1 – Doprava a platba
        if (document.body.classList.contains('in-krok-1')) {
            hideRegionDropdown();

            var deliveryBox = document.querySelector('.co-delivery-method');
            if (deliveryBox) {
                var wrapper = document.createElement('div');
                wrapper.className = 'box box-sm box-bg-default co-box';
                wrapper.style.cssText = 'margin-bottom:20px;padding:20px;';
                wrapper.innerHTML = '<div style="font-size:16px;font-weight:700;margin-bottom:12px;">Zadejte doručovací adresu</div>';
                var inner = document.createElement('div');
                wrapper.appendChild(inner);
                deliveryBox.insertAdjacentElement('beforebegin', wrapper);
                createWidget(inner, {
                    switchRegion: true,
                    onDelivery: function (canDeliver) {
                        setKuryrVisible(canDeliver);
                    },
                });
            }

            // Na základě session nastavit viditelnost Jojo kurýru hned při načtení
            var sess = loadSession();
            var hasValidDelivery = sess && sess.zone;
            setKuryrVisible(!!hasValidDelivery);
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
