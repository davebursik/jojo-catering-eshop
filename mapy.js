(function () {
    'use strict';

    var MAPY_API_KEY = 'F5w5TlZz8C5HDhk2SSRklbiv242GQ4jH-sBiPOxuEBY';

    var DEPOT_LAT = 49.7903;
    var DEPOT_LON = 18.2523;

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

    function createWidget(container, opts) {
        opts = opts || {};

        container.innerHTML = [
            '<div id="jojo-delivery-widget" style="font-family:inherit;">',
            '  <div style="position:relative;">',
            '    <input type="text" id="jojo-addr-input" placeholder="Zadejte ulici a číslo domu" autocomplete="off"',
            '      style="width:100%;box-sizing:border-box;padding:10px 140px 10px 12px;border:1px solid #ccc;border-radius:4px;font-size:15px;" />',
            '    <button type="button" id="jojo-calc-btn"',
            '      style="position:absolute;right:0;top:0;bottom:0;padding:0 16px;background:#8b1a4a;color:#fff;border:none;border-radius:0 4px 4px 0;cursor:pointer;font-size:14px;white-space:nowrap;">',
            '      Zjistit cenu',
            '    </button>',
            '  </div>',
            '  <ul id="jojo-suggestions" style="list-style:none;padding:0;margin:0;border:1px solid #ccc;display:none;position:absolute;background:#fff;z-index:9999;width:100%;max-height:220px;overflow-y:auto;box-shadow:0 4px 12px rgba(0,0,0,.15);border-radius:0 0 4px 4px;"></ul>',
            '  <div id="jojo-result" style="display:none;margin-top:8px;padding:10px 14px;border-radius:4px;font-size:14px;line-height:1.5;"></div>',
            '</div>',
        ].join('');

        var input       = document.getElementById('jojo-addr-input');
        var suggestions = document.getElementById('jojo-suggestions');
        var result      = document.getElementById('jojo-result');
        var calcBtn     = document.getElementById('jojo-calc-btn');
        var selectedCoords = null;
        var suggestTimer   = null;

        var saved = loadSession();
        if (saved && saved.address) {
            input.value = saved.address;
            if (saved.km) showResult('ok', buildResultMsg(saved.km, saved.zone));
        }

        input.addEventListener('input', function () {
            selectedCoords = null;
            clearTimeout(suggestTimer);
            var q = this.value.trim();
            if (q.length < 3) { hideSuggestions(); return; }
            suggestTimer = setTimeout(function () { fetchSuggestions(q); }, 350);
        });

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') calcBtn.click();
        });

        input.addEventListener('blur', function () {
            setTimeout(hideSuggestions, 200);
        });

        calcBtn.addEventListener('click', function () {
            if (selectedCoords) { calculateRoute(selectedCoords); return; }
            var q = input.value.trim();
            if (!q) { showResult('warn', 'Zadejte prosím adresu doručení.'); return; }
            showResult('loading', 'Hledám adresu…');
            fetch('https://api.mapy.cz/v1/geocode?query=' + encodeURIComponent(q) + '&lang=cs&limit=1&apikey=' + MAPY_API_KEY)
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    var item = data.items && data.items[0];
                    if (!item) { showResult('error', 'Adresu se nepodařilo najít. Zkuste zadat přesněji.'); return; }
                    selectedCoords = { lat: item.position.lat, lon: item.position.lon };
                    calculateRoute(selectedCoords);
                })
                .catch(function () { showResult('error', 'Chyba připojení. Zkuste to znovu.'); });
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
                        li.textContent = text;
                        li.style.cssText = 'padding:9px 14px;cursor:pointer;border-bottom:1px solid #f0f0f0;font-size:14px;';
                        li.addEventListener('mouseenter', function () { this.style.background = '#f5f5f5'; });
                        li.addEventListener('mouseleave', function () { this.style.background = ''; });
                        li.addEventListener('mousedown', function (e) {
                            e.preventDefault();
                            input.value = text;
                            hideSuggestions();
                            if (item.position) {
                                selectedCoords = { lat: item.position.lat, lon: item.position.lon };
                                calculateRoute(selectedCoords);
                            }
                        });
                        suggestions.appendChild(li);
                    });
                    suggestions.style.display = 'block';
                })
                .catch(function () { hideSuggestions(); });
        }

        function hideSuggestions() { suggestions.style.display = 'none'; }

        function calculateRoute(coords) {
            showResult('loading', 'Počítám vzdálenost…');
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
                    if (!data.length) {
                        showResult('error', 'Trasu se nepodařilo vypočítat. Zkuste adresu zadat přesněji.');
                        return;
                    }
                    var km = Math.round(data.length / 1000);
                    var zone = getZone(km);

                    saveSession({ address: input.value, km: km, zone: zone });

                    if (!zone) {
                        showResult('error', 'Bohužel do vaší oblasti (' + km + ' km) nedoručujeme. Maximální vzdálenost je 100 km.');
                        if (opts.switchRegion) clearRegion();
                        return;
                    }

                    showResult('ok', buildResultMsg(km, zone));
                    if (opts.switchRegion) switchRegion(zone.label);
                })
                .catch(function () { showResult('error', 'Chyba při výpočtu trasy. Zkuste to znovu.'); });
        }

        function showResult(type, msg) {
            var styles = {
                ok:      'background:#d4edda;color:#155724;border:1px solid #c3e6cb;',
                error:   'background:#f8d7da;color:#721c24;border:1px solid #f5c6cb;',
                warn:    'background:#fff3cd;color:#856404;border:1px solid #ffc107;',
                loading: 'background:#e8f4fd;color:#0c5460;border:1px solid #bee5eb;',
            };
            result.style.cssText = (styles[type] || '') + 'display:block;margin-top:8px;padding:10px 14px;border-radius:4px;font-size:14px;line-height:1.5;';
            result.innerHTML = msg;
        }
    }

    function getZone(km) {
        for (var i = 0; i < ZONES.length; i++) {
            if (km <= ZONES[i].maxKm) return ZONES[i];
        }
        return null;
    }

    function buildResultMsg(km, zone) {
        return 'Vzdálenost: <strong>' + km + ' km</strong> &nbsp;|&nbsp; Doprava: <strong>' + zone.price + ' Kč</strong>';
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

    function clearRegion() {
        var select = document.getElementById('deliveryRegionId');
        if (select) { select.value = ''; select.dispatchEvent(new Event('change', { bubbles: true })); }
    }

    function saveSession(data) {
        try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch (e) {}
    }

    function loadSession() {
        try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch (e) { return null; }
    }

    function hideRegionDropdown() {
        var style = document.createElement('style');
        style.textContent = '.co-delivery-region { display: none !important; }';
        document.head.appendChild(style);
    }

    function init() {
        // Widget kdekoliv na webu
        var placeholder = document.getElementById('jojo-doprava-kalkulacka');
        if (placeholder) {
            createWidget(placeholder, { switchRegion: false });
        }

        // Košík – widget + přepínání regionu
        if (document.body.classList.contains('in-krok-1')) {
            hideRegionDropdown();
            var deliveryBox = document.querySelector('.co-delivery-method');
            if (deliveryBox) {
                var wrapper = document.createElement('div');
                wrapper.className = 'box box-sm box-bg-default co-box';
                wrapper.style.marginBottom = '20px';
                wrapper.innerHTML = '<h4 class="order-icon order-delivery" style="margin-bottom:10px;">Adresa doručení</h4>';
                var inner = document.createElement('div');
                wrapper.appendChild(inner);
                deliveryBox.insertAdjacentElement('beforebegin', wrapper);
                createWidget(inner, { switchRegion: true });
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
