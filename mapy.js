(function () {
    'use strict';

    var MAPY_API_KEY = 'F5w5TlZz8C5HDhk2SSRklbiv242GQ4jH-sBiPOxuEBY';

    var DEPOT_LAT = 49.7903;
    var DEPOT_LON = 18.2523;

    function initStep2() {
        if (!document.body.classList.contains('in-krok-1')) return;

        var deliveryBox = document.querySelector('.co-delivery-method');
        if (!deliveryBox) return;

        var widgetHtml = [
            '<div class="box box-sm box-bg-default co-box" id="jojo-delivery-widget" style="margin-bottom:20px;">',
            '  <h4 class="order-icon order-delivery">Adresa doručení</h4>',
            '  <div style="position:relative;">',
            '    <input type="text" id="jojo-addr-input" placeholder="Např. Opavská 5, Ostrava" autocomplete="off" class="form-control" style="padding-right:130px;" />',
            '    <button type="button" id="jojo-calc-btn" class="btn btn-secondary" style="position:absolute;right:0;top:0;bottom:0;border-radius:0 4px 4px 0;padding:0 16px;">Zjistit</button>',
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
        var selectedCoords = null;
        var suggestTimer   = null;

        input.addEventListener('input', function () {
            selectedCoords = null;
            clearTimeout(suggestTimer);
            var q = this.value.trim();
            if (q.length < 3) { hideSuggestions(); return; }
            suggestTimer = setTimeout(function () { fetchSuggestions(q); }, 350);
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

        input.addEventListener('blur', function () { setTimeout(hideSuggestions, 200); });

        calcBtn.addEventListener('click', function () {
            if (selectedCoords) { calculateRoute(selectedCoords); return; }
            var q = input.value.trim();
            if (!q) { showResult('warn', 'Zadejte adresu doručení.'); return; }
            showResult('loading', 'Hledám adresu…');
            fetch('https://api.mapy.cz/v1/geocode?query=' + encodeURIComponent(q) + '&lang=cs&limit=1&apikey=' + MAPY_API_KEY)
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    var item = data.items && data.items[0];
                    if (!item) { showResult('error', 'Adresu se nepodařilo najít. Zkuste ji zadat přesněji.'); return; }
                    selectedCoords = { lat: item.position.lat, lon: item.position.lon };
                    calculateRoute(selectedCoords);
                })
                .catch(function () { showResult('error', 'Chyba připojení. Zkuste to znovu.'); });
        });

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') calcBtn.click();
        });

        function calculateRoute(coords) {
            showResult('loading', 'Počítám vzdálenost od depa…');
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
                        showResult('error', 'Trasu se nepodařilo vypočítat.');
                        return;
                    }
                    var km = Math.round(data.length / 1000);
                    showResult('ok', 'Vzdálenost od depa: <strong>' + km + ' km</strong>');
                })
                .catch(function () { showResult('error', 'Chyba při výpočtu trasy.'); });
        }

        function showResult(type, msg) {
            var colors = {
                ok:      'background:#d4edda;color:#155724;border:1px solid #c3e6cb;',
                error:   'background:#f8d7da;color:#721c24;border:1px solid #f5c6cb;',
                warn:    'background:#fff3cd;color:#856404;border:1px solid #ffc107;',
                loading: 'background:#e8f4fd;color:#0c5460;border:1px solid #bee5eb;',
            };
            result.style.cssText = (colors[type] || '') + 'display:block;margin-top:10px;padding:10px 14px;border-radius:4px;font-size:14px;';
            result.innerHTML = msg;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStep2);
    } else {
        initStep2();
    }

})();
