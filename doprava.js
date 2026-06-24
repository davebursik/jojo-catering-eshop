(function () {
    'use strict';

    var MAPY_API_KEY = 'F5w5TlZz8C5HDhk2SSRklbiv242GQ4jH-sBiPOxuEBY';

    var DEPOT_LAT = 49.7903;
    var DEPOT_LON = 18.2523;

    // Zóny – label musí přesně odpovídat názvu regionu v Shoptetu (em dash –)
    // Cena = cena z ceníku pro horní hranici pásma
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

    var SESSION_KEY = 'jojo_delivery_address';

    function initStep2() {
        if (!document.body.classList.contains('in-krok-1')) return;

        var deliveryBox = document.querySelector('.co-delivery-method');
        if (!deliveryBox) return;

        var widgetHtml = [
            '<div class="box box-sm box-bg-default co-box" id="jojo-delivery-widget" style="margin-bottom:20px;">',
            '  <h4 class="order-icon order-delivery">Adresa doručení</h4>',
            '  <p style="margin:0 0 10px;font-size:14px;color:#666;">Zadejte adresu doručení – automaticky nastavíme správnou cenu dopravy.</p>',
            '  <div style="position:relative;">',
            '    <input type="text" id="jojo-addr-input" placeholder="Např. Hlavní 5, Ostrava" autocomplete="off" class="form-control" style="padding-right:130px;" />',
            '    <button type="button" id="jojo-calc-btn" class="btn btn-secondary" style="position:absolute;right:0;top:0;bottom:0;border-radius:0 4px 4px 0;padding:0 16px;">',
            '      Zjistit cenu',
            '    </button>',
            '  </div>',
            '  <ul id="jojo-suggestions" style="list-style:none;padding:0;margin:0;border:1px solid #ccc;display:none;position:absolute;background:#fff;z-index:9999;width:100%;max-height:220px;overflow-y:auto;box-shadow:0 4px 12px rgba(0,0,0,.15);border-radius:0 0 4px 4px;"></ul>',
            '  <div id="jojo-result" style="display:none;margin-top:10px;padding:10px 14px;border-radius:4px;font-size:14px;"></div>',
            '</div>',
        ].join('');

        deliveryBox.insertAdjacentHTML('beforebegin', widgetHtml);

        var input       = document.getElementById('jojo-addr-input');
        var suggestions = document.getElementById('jojo-suggestions');
        var result      = document.getElementById('jojo-result');
        var calcBtn     = document.getElementById('jojo-calc-btn');

        var selectedCoords  = null;
        var selectedAddress = null;
        var suggestTimer    = null;

        input.addEventListener('input', function () {
            selectedCoords = null;
            clearTimeout(suggestTimer);
            var q = this.value.trim();
            if (q.length < 3) { hideSuggestions(); return; }
            suggestTimer = setTimeout(function () { fetchSuggestions(q); }, 350);
        });

        function fetchSuggestions(q) {
            var url = 'https://api.mapy.cz/v1/suggest?query=' + encodeURIComponent(q) + '&lang=cs&limit=6&apikey=' + MAPY_API_KEY;
            fetch(url)
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
                        li.addEventListener('mouseenter', function () { li.style.background = '#f5f5f5'; });
                        li.addEventListener('mouseleave', function () { li.style.background = ''; });
                        li.addEventListener('mousedown', function (e) {
                            e.preventDefault();
                            input.value = text;
                            hideSuggestions();
                            if (item.position) {
                                selectedCoords = { lat: item.position.lat, lon: item.position.lon };
                            }
                            selectedAddress = parseAddress(item);
                            if (selectedCoords) calculateRoute(selectedCoords);
                        });
                        suggestions.appendChild(li);
                    });
                    suggestions.style.display = 'block';
                })
                .catch(function () { hideSuggestions(); });
        }

        function hideSuggestions() { suggestions.style.display = 'none'; }

        input.addEventListener('blur', function () { setTimeout(hideSuggestions, 200); });
        document.addEventListener('click', function (e) {
            var w = document.getElementById('jojo-delivery-widget');
            if (w && !w.contains(e.target)) hideSuggestions();
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
                    if (!item) { showResult('error', 'Adresu se nepodařilo najít. Zadejte ji přesněji.'); return; }
                    selectedCoords = { lat: item.position.lat, lon: item.position.lon };
                    selectedAddress = parseAddress(item);
                    calculateRoute(selectedCoords);
                })
                .catch(function () { showResult('error', 'Chyba při hledání adresy.'); });
        });

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
                    var distance = data.length;
                    if (!distance) {
                        showResult('error', 'Nepodařilo se vypočítat trasu. Zkuste zadat adresu přesněji.');
                        return;
                    }
                    var km = Math.round(distance / 1000);
                    applyZone(km);
                })
                .catch(function () {
                    showResult('error', 'Chyba při výpočtu trasy.');
                });
        }

        function applyZone(km) {
            var zone = null;
            for (var i = 0; i < ZONES.length; i++) {
                if (km <= ZONES[i].maxKm) { zone = ZONES[i]; break; }
            }

            if (!zone) {
                showResult('error', 'Vzdálenost ' + km + ' km je mimo naši doručovací oblast (max. 100 km). Kontaktujte nás.');
                return;
            }

            var select = document.getElementById('deliveryRegionId');
            var found  = false;
            if (select) {
                for (var j = 0; j < select.options.length; j++) {
                    if (select.options[j].text.trim() === zone.label) {
                        select.value = select.options[j].value;
                        select.dispatchEvent(new Event('change', { bubbles: true }));
                        found = true;
                        break;
                    }
                }
            }

            var priceText = 'Cena dopravy: <strong>' + zone.price + ' Kč</strong>';
            if (found) {
                showResult('ok', 'Vzdálenost: <strong>' + km + ' km</strong> – ' + priceText);
            } else {
                showResult('warn', 'Vzdálenost: ' + km + ' km – ' + priceText + ' – vyberte ručně region &quot;' + zone.label + '&quot;.');
            }

            if (selectedAddress) {
                sessionStorage.setItem(SESSION_KEY, JSON.stringify(selectedAddress));
            }
        }

        function showResult(type, msg) {
            var s = {
                ok:      'background:#d4edda;color:#155724;border:1px solid #c3e6cb;',
                error:   'background:#f8d7da;color:#721c24;border:1px solid #f5c6cb;',
                warn:    'background:#fff3cd;color:#856404;border:1px solid #ffc107;',
                loading: 'background:#e8f4fd;color:#0c5460;border:1px solid #bee5eb;',
            };
            result.style.cssText = (s[type] || '') + 'display:block;margin-top:10px;padding:10px 14px;border-radius:4px;font-size:14px;';
            result.innerHTML = msg;
        }

        function parseAddress(item) {
            var addr = { street: '', houseNumber: '', city: '', zip: '' };
            (item.regionalStructure || []).forEach(function (r) {
                if (r.type === 'regional.street')       addr.street      = r.name;
                if (r.type === 'regional.address')      addr.houseNumber = r.name;
                if (r.type === 'regional.municipality') addr.city        = r.name;
                if (r.type === 'regional.zip')          addr.zip         = r.name;
            });
            return addr;
        }
    }

    function initStep3() {
        if (!document.body.classList.contains('in-krok-2')) return;
        var saved = sessionStorage.getItem(SESSION_KEY);
        if (!saved) return;
        try {
            var addr = JSON.parse(saved);
            var fill = function (id, val) {
                var el = document.getElementById(id);
                if (el && !el.value && val) {
                    el.value = val;
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                }
            };
            fill('deliveryStreet',      addr.street);
            fill('deliveryHouseNumber', addr.houseNumber);
            fill('deliveryCity',        addr.city);
            fill('deliveryZip',         addr.zip);
            fill('billStreet',          addr.street);
            fill('billHouseNumber',     addr.houseNumber);
            fill('billCity',            addr.city);
        } catch (e) {}
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { initStep2(); initStep3(); });
    } else {
        initStep2();
        initStep3();
    }

})();
