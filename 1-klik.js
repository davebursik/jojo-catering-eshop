(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════════
    //  JOJO CATERING – CATERING NA 1 KLIK  v1
    //
    //  Host zadá druh akce, počet hostů a rozpočet. Skript z aktuální nabídky
    //  e-shopu (ceny a dostupnost čte živě z kategorií) navrhne sestavu, kterou
    //  si host může upravit, a jedním kliknutím ji celou přidá do košíku.
    //
    //  POUŽITÍ:
    //   1) V administraci Shoptetu vytvořte stránku (např. adresa
    //      /catering-na-1-klik/) a do jejího zdrojového kódu vložte:
    //          <div id="jojo-konfigurator"></div>
    //      (Pokud adresa stránky začíná /catering-na-1-klik, skript se
    //       vloží sám i bez toho.)
    //   2) Do zápatí přidejte:  <script src=".../catering-na-1-klik.js" defer></script>
    //
    //  DŮLEŽITÉ – UPRAVTE SI TABULKU „NABIDKA" níže:
    //   • feeds = pro kolik hostů vystačí 1 kus (odhad, ověřte podle sebe!)
    //   • pcs   = u chlebíčků/kanapek počet kusů v balení
    //   • veg   = vegetariánské (true jen když si jste jistí)
    //   • pri   = oblíbenost 1–10 (čím vyšší, tím dřív se do návrhu dostane)
    //  Produkt, který v tabulce není, se do návrhu nedostane (ale v e-shopu zůstane).
    // ═══════════════════════════════════════════════════════════════════════════

    var host = document.getElementById('jojo-konfigurator');
    if (!host && /^\/catering-na-1-klik/.test(location.pathname)) {
        var main = document.querySelector('#content .content-inner') || document.getElementById('content') || document.body;
        host = document.createElement('div');
        host.id = 'jojo-konfigurator';
        main.appendChild(host);
    }
    if (!host) return;
    if (window.__jojoKonfV1) return;

    var CFG = {
        cartUrl: '/kosik/',
        addUrl: '/action/Cart/addCartItem/',
        phone: '+420 776 003 155',
        phoneHref: 'tel:+420776003155',
        freeDeliveryFrom: 1000,
        maxGuests: 200,
        categoryUrls: [
            '/party-bedynky-misy-salaty/',
            '/chlebicky-a-pomazanky/',
            '/sladke-dobroty/',
            '/teple-pokrmy/',
            '/napoje/'
        ],
        debug: /[?&]jojodebug=1/.test(location.search)
    };

    // ─── Druhy akcí ───────────────────────────────────────────────────────────
    // pp   = doporučený rozpočet na osobu
    // pcs  = kolik kusů chlebíčků/kanapek počítat na hosta při plném pokrytí
    // shares = jak velký podíl hostů má daná kategorie pokrýt (1 = všechny)

    var EVENTS = {
        firemni: { label: 'Firemní akce', hint: 'porada, školení, firemní oslava', pp: 250, pcs: 5,
            shares: { bedynka: 0.25, chlebicky: 0.55, maso: 0.2, salat: 0.25, hlavni: 0.5, sladke: 0.7, napoje: 1 },
            defaults: { sladke: true, hlavni: false, napoje: false } },
        oslava: { label: 'Oslava', hint: 'narozeniny, křtiny, rodinná sešlost', pp: 300, pcs: 6,
            shares: { bedynka: 0.4, chlebicky: 0.3, maso: 0.3, salat: 0.4, hlavni: 0.5, sladke: 1, napoje: 1 },
            defaults: { sladke: true, hlavni: false, napoje: false } },
        svatba: { label: 'Svatba / slavnost', hint: 'hostina, výročí, raut', pp: 420, pcs: 5,
            shares: { bedynka: 0.35, chlebicky: 0.35, maso: 0.3, salat: 0.4, hlavni: 0.5, sladke: 1, napoje: 1 },
            defaults: { sladke: true, hlavni: false, napoje: true } },
        party: { label: 'Přátelské posezení', hint: 'párty, zápas, zahrádka', pp: 280, pcs: 6,
            shares: { bedynka: 0.5, chlebicky: 0.2, maso: 0.5, salat: 0.4, hlavni: 0.5, sladke: 0.6, napoje: 1 },
            defaults: { sladke: true, hlavni: true, napoje: false } }
    };

    var KINDS = {
        bedynka:   { label: 'Párty bedýnky',           max: 2, order: 1 },
        chlebicky: { label: 'Chlebíčky a kanapky',     max: 4, order: 2 },
        maso:      { label: 'Masové pochoutky',        max: 3, order: 3 },
        hlavni:    { label: 'Teplé a hlavní jídla',    max: 2, order: 4 },
        salat:     { label: 'Saláty a pomazánky',      max: 2, order: 5 },
        sladke:    { label: 'Sladké',                  max: 3, order: 6 },
        napoje:    { label: 'Nápoje',                  max: 2, order: 7 }
    };
    var DROP_ORDER = ['napoje', 'hlavni', 'salat', 'maso', 'bedynka', 'sladke'];

    // ─── NABÍDKA: odhady porcí (UPRAVTE) ──────────────────────────────────────
    // re = výraz, kterým se produkt najde podle názvu (malá písmena, bez diakritiky)

    var NABIDKA = [
        // párty bedýnky
        { re: /^party bedynka\s*$/,                    kind: 'bedynka', feeds: 8,  pri: 10 },
        { re: /^party bedynka premium/,                kind: 'bedynka', feeds: 12, pri: 7 },
        // masové pochoutky
        { re: /kureci rarasci/,                        kind: 'maso', feeds: 6,  pri: 9 },
        { re: /masove tasticky/,                       kind: 'maso', feeds: 8,  pri: 8 },
        { re: /hovezi masove kulicky/,                 kind: 'maso', feeds: 10, pri: 8 },
        { re: /^sekana/,                               kind: 'maso', feeds: 8,  pri: 7 },
        { re: /plnene bramborove kroketky/,            kind: 'maso', feeds: 8,  pri: 6 },
        // teplé a hlavní
        { re: /mini bacon burger/,                     kind: 'hlavni', feeds: 1, pri: 8 },
        { re: /^1\/2 tortila/,                         kind: 'hlavni', feeds: 1, pri: 7 },
        { re: /grilovane kureci palicky/,              kind: 'hlavni', feeds: 6, pri: 7, note: 'objednat min. 3 dny předem' },
        { re: /hovezi gulasek/,                        kind: 'hlavni', feeds: 1, pri: 5, note: 'objednat min. 3 dny předem' },
        // saláty a pomazánky
        { re: /salat mozzarella/,                      kind: 'salat', feeds: 10, pri: 9, veg: true },
        { re: /bramborovy salat/,                      kind: 'salat', feeds: 8,  pri: 8, veg: true },
        { re: /zeleninova miska/,                      kind: 'salat', feeds: 10, pri: 7, veg: true },
        { re: /vajickovy salat/,                       kind: 'salat', feeds: 10, pri: 6, veg: true },
        { re: /quacamole|guacamole/,                   kind: 'salat', feeds: 10, pri: 6, veg: true },
        { re: /repny h?umus|repny hummus/,             kind: 'salat', feeds: 10, pri: 5, veg: true },
        // chlebíčky, kanapky, koláče (pcs = počet kusů v balení)
        { re: /kanapky s avokadovou pomazankou a prosciuttem/, kind: 'chlebicky', pcs: 24, pri: 9 },
        { re: /kanapky s avokadovou pomazankou a uzenym lososem/, kind: 'chlebicky', pcs: 20, pri: 8 },
        { re: /kanapky s trenou nivou/,                kind: 'chlebicky', pcs: 24, pri: 8, veg: true },
        { re: /hermelinove kanapky/,                   kind: 'chlebicky', pcs: 20, pri: 7, veg: true },
        { re: /kanapky s domaci pastikou/,             kind: 'chlebicky', pcs: 20, pri: 6 },
        { re: /kanapky s sunkovou penou a jahodou/,    kind: 'chlebicky', pcs: 20, pri: 6 },
        { re: /chlebicky sunkove/,                     kind: 'chlebicky', pcs: 10, pri: 8 },
        { re: /chlebicky mrkvove/,                     kind: 'chlebicky', pcs: 13, pri: 6, veg: true },
        { re: /syrovy chlebicek/,                      kind: 'chlebicky', pcs: 10, pri: 6, veg: true },
        { re: /chlebicky s uherakovou penou/,          kind: 'chlebicky', pcs: 10, pri: 6 },
        { re: /chlebicky s uherakem/,                  kind: 'chlebicky', pcs: 10, pri: 6 },
        { re: /slane kolacky s pomazankou z uzeneho lososa/, kind: 'chlebicky', pcs: 10, pri: 6 },
        { re: /minicroissant/,                         kind: 'chlebicky', pcs: 2,  pri: 7 },
        { re: /oblozeny croissant/,                    kind: 'chlebicky', pcs: 2,  pri: 5 },
        { re: /cibulovo.?syrovy quiche/,               kind: 'chlebicky', pcs: 10, pri: 5, veg: true },
        { re: /slany kolac se slaninou/,               kind: 'chlebicky', pcs: 10, pri: 5 },
        // sladké (feeds 1 = jedna porce na hosta)
        { re: /panna cotta mango|pannacotta mango/,    kind: 'sladke', feeds: 1,  pri: 9, veg: true },
        { re: /panna cotta s lesnim ovocem/,           kind: 'sladke', feeds: 1,  pri: 9, veg: true },
        { re: /tiramisu/,                              kind: 'sladke', feeds: 1,  pri: 9, veg: true },
        { re: /jablecny strudl/,                       kind: 'sladke', feeds: 1,  pri: 6, veg: true },
        { re: /bublanina/,                             kind: 'sladke', feeds: 1,  pri: 7, veg: true },
        { re: /mechove muffiny/,                       kind: 'sladke', feeds: 1,  pri: 6, veg: true },
        { re: /^mechacek/,                             kind: 'sladke', feeds: 1,  pri: 6, veg: true },
        { re: /minibabovky/,                           kind: 'sladke', feeds: 1,  pri: 5, veg: true },
        { re: /strouhany kolac/,                       kind: 'sladke', feeds: 12, pri: 7, veg: true },
        { re: /kavova buchta/,                         kind: 'sladke', feeds: 12, pri: 6, veg: true },
        { re: /dvoubarevna babovka/,                   kind: 'sladke', feeds: 12, pri: 6, veg: true },
        { re: /kulicky medovoorískove|kulicky medovoorisk/, kind: 'sladke', feeds: 10, pri: 6, veg: true },
        { re: /kulicky kokosove/,                      kind: 'sladke', feeds: 10, pri: 6, veg: true },
        { re: /linecke cukrovi/,                       kind: 'sladke', feeds: 10, pri: 5, veg: true },
        { re: /bezlepkova rolada/,                     kind: 'sladke', feeds: 10, pri: 4, veg: true, note: 'bez lepku' },
        { re: /ovocna misa/,                           kind: 'sladke', feeds: 10, pri: 7, veg: true },
        // nápoje (alkohol 18+)
        { re: /bohemia sekt/,                          kind: 'napoje', feeds: 6, pri: 9, note: '18+' },
        { re: /vino .*bile/,                           kind: 'napoje', feeds: 5, pri: 7, note: '18+' },
        { re: /vino .*cervene/,                        kind: 'napoje', feeds: 5, pri: 7, note: '18+' }
    ];

    // ─── Pomocné ──────────────────────────────────────────────────────────────

    function esc(s) {
        return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function txt(el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; }
    function nrm(s) { return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim(); }
    function abs(u) { try { return new URL(u, location.href).href; } catch (e) { return ''; } }
    function pathOf(u) { try { return new URL(u, location.href).pathname; } catch (e) { return u; } }
    function kc(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') + '\u00a0Kč'; }
    function clamp(n, a, b) { return Math.min(b, Math.max(a, n)); }
    function log() { if (CFG.debug) console.log.apply(console, ['[jojo catering]'].concat([].slice.call(arguments))); }

    // ─── Načtení živé nabídky z kategorií ─────────────────────────────────────

    function pickImage(p) {
        var imgs = p.querySelectorAll('img');
        function ok(u) { return u && !/^data:/i.test(u) && !/placeholder|blank|loader|spacer|pixel/i.test(u); }
        for (var i = 0; i < imgs.length; i++) {
            var im = imgs[i];
            if (im.closest('.flags,.ratings-wrapper,.stars-wrapper')) continue;
            var c = [im.getAttribute('data-src'), im.getAttribute('data-lazy'), im.getAttribute('data-original'),
                (im.getAttribute('data-srcset') || '').split(/\s+/)[0], (im.getAttribute('srcset') || '').split(/\s+/)[0], im.getAttribute('src')];
            for (var j = 0; j < c.length; j++) if (ok(c[j])) return abs(c[j]);
        }
        return '';
    }

    function parsePrice(p) {
        var sels = ['.price-final', '[data-micro="price"]', '.prices'];
        var re = /(\d[\d ]*(?:,\d+)?)\s*(?:Kč|CZK)/i;
        function num(m) { return parseFloat(m[1].replace(/\s/g, '').replace(',', '.')); }
        for (var i = 0; i < sels.length; i++) {
            var el = p.querySelector(sels[i]);
            if (!el) continue;
            var m = el.textContent.replace(/\u00a0/g, ' ').match(re);
            if (m) return num(m);
        }
        var m2 = p.textContent.replace(/\u00a0/g, ' ').match(re);
        return m2 ? num(m2) : 0;
    }

    function parseListing(doc) {
        var out = [];
        Array.prototype.forEach.call(doc.querySelectorAll('.product'), function (p) {
            if (p.closest('.slick-cloned')) return;
            var a = p.querySelector('a.name[href]') || p.querySelector('a[data-micro="url"][href]') || p.querySelector('a[href]');
            if (!a) return;
            var nameEl = p.querySelector('[data-micro="name"]') || p.querySelector('.name') || a;
            var name = txt(nameEl);
            var price = parsePrice(p);
            if (!name || !price) return;
            var form = p.querySelector('form.pr-action') || p.querySelector('form[action*="addCartItem"]');
            var all = txt(p);
            out.push({
                name: name, href: abs(a.getAttribute('href')), path: pathOf(a.getAttribute('href')),
                price: price, img: pickImage(p), form: form,
                variants: !!(form && form.querySelector('select')) || /zvolit variantu/i.test(all),
                soldOut: /vyprodáno|momentálně nedostupn|není skladem|nedostupn/i.test(all) && !form
            });
        });
        return out;
    }

    function fetchDoc(url) {
        return fetch(url, { credentials: 'same-origin' })
            .then(function (r) { return r.ok ? r.text() : Promise.reject(new Error('HTTP ' + r.status)); })
            .then(function (h) { return new DOMParser().parseFromString(h, 'text/html'); });
    }

    function loadCategory(path) {
        return fetchDoc(path).then(function (doc) {
            var items = parseListing(doc);
            var pages = {};
            Array.prototype.forEach.call(doc.querySelectorAll('a[href*="/strana-"]'), function (a) {
                var m = (a.getAttribute('href') || '').match(/\/strana-(\d+)\/?/);
                if (m) pages[m[1]] = abs(a.getAttribute('href'));
            });
            var rest = Object.keys(pages).slice(0, 5).map(function (k) {
                return fetchDoc(pages[k]).then(parseListing).catch(function () { return []; });
            });
            return Promise.all(rest).then(function (lists) {
                lists.forEach(function (l) { items = items.concat(l); });
                return items;
            });
        }).catch(function (e) { log('kategorie selhala', path, e); return []; });
    }

    var CATALOG = [];

    function loadCatalog() {
        return Promise.all(CFG.categoryUrls.map(loadCategory)).then(function (lists) {
            var seen = {}, out = [];
            lists.forEach(function (l) {
                l.forEach(function (p) {
                    if (seen[p.path] || p.soldOut || p.variants) return;
                    var n = nrm(p.name);
                    for (var i = 0; i < NABIDKA.length; i++) {
                        if (NABIDKA[i].re.test(n)) {
                            seen[p.path] = 1;
                            var d = NABIDKA[i];
                            out.push({
                                id: out.length + 1, name: cleanName(p.name), href: p.href, path: p.path, price: p.price, img: p.img, form: p.form,
                                kind: d.kind, feeds: d.feeds, pcs: d.pcs, pri: d.pri, veg: !!d.veg, note: d.note || ''
                            });
                            return;
                        }
                    }
                });
            });
            CATALOG = out;
            log('katalog', out.length, 'z', Object.keys(seen).length);
            return out;
        });
    }

    function cleanName(n) {
        return n.replace(/\.?\s*Objednávka\s+min\.?\s*\d+\s*dn\w*\s+předem\.?/i, '').replace(/[.\s]+$/, '');
    }

    // ─── Sestavení návrhu ─────────────────────────────────────────────────────

    function feedsOf(it, ev) { return it.pcs ? it.pcs / EVENTS[ev].pcs : it.feeds; }
    function unitsFor(cov, feeds) { return Math.max(1, Math.ceil(cov / feeds - 0.25)); }
    function jit(seed, id) {
        if (!seed) return 0;
        var x = Math.sin(seed * 997 + id * 131) * 10000;
        return (x - Math.floor(x)) * 3;
    }

    function buildPlan(o) {
        var ev = EVENTS[o.event];
        var shares = {};
        Object.keys(KINDS).forEach(function (k) { shares[k] = ev.shares[k] || 0; });
        if (!o.sladke) shares.sladke = 0;
        if (!o.hlavni) shares.hlavni = 0;
        if (!o.napoje) shares.napoje = 0;

        // sady podle filtru (vegetariánské, ...)
        var pools = {};
        Object.keys(KINDS).forEach(function (k) {
            pools[k] = CATALOG.filter(function (it) { return it.kind === k && (!o.veg || it.veg); });
        });

        // podíl, který by nesla vyřazená hlavní kategorie, přidělit ostatním hlavním
        var mainKinds = ['bedynka', 'chlebicky', 'maso', 'hlavni'];
        var missing = 0, live = 0;
        mainKinds.forEach(function (k) {
            if (shares[k] > 0 && !pools[k].length) { missing += shares[k]; shares[k] = 0; }
            else if (shares[k] > 0) live += shares[k];
        });
        if (missing > 0 && live > 0) {
            mainKinds.forEach(function (k) { if (shares[k] > 0) shares[k] += missing * shares[k] / live; });
        }
        if (missing > 0 && pools.salat.length) shares.salat = Math.min(1, shares.salat + missing * 0.4);

        var active = {};
        Object.keys(KINDS).forEach(function (k) {
            if (shares[k] > 0 && pools[k].length) {
                var K = o.n * shares[k];
                var pool = pools[k].filter(function (it) { return feedsOf(it, o.event) <= K * 1.6; });
                if (!pool.length) {
                    pool = [pools[k].slice().sort(function (a, b) { return feedsOf(a, o.event) - feedsOf(b, o.event); })[0]];
                    if (feedsOf(pool[0], o.event) > K * 3.2) return;     // k této kategorii je hostů příliš málo
                }
                active[k] = { K: K, pool: pool, m: Math.min(KINDS[k].max, pool.length), cheap: false };
            }
        });

        var g = 1;

        function ordered(st) {
            var arr = st.pool.slice();
            if (st.cheap) {
                arr.sort(function (a, b) { return a.price / feedsOf(a, o.event) - b.price / feedsOf(b, o.event); });
            } else {
                arr.sort(function (a, b) { return (b.pri + jit(o.seed, b.id)) - (a.pri + jit(o.seed, a.id)); });
            }
            return arr;
        }
        function linesOf(k, m, cheap, gg) {
            var st = active[k];
            var items = ordered({ pool: st.pool, cheap: cheap }).slice(0, m);
            var per = st.K * gg / items.length;
            return items.map(function (it) { return { item: it, kind: k, qty: unitsFor(per, feedsOf(it, o.event)) }; });
        }
        function costOf(lines) { return lines.reduce(function (s, l) { return s + l.qty * l.item.price; }, 0); }
        function kindCost(k, m, cheap) { return costOf(linesOf(k, m, cheap, g)); }
        function totalCost() { return Object.keys(active).reduce(function (s, k) { return s + kindCost(k, active[k].m, active[k].cheap); }, 0); }

        var B = o.budget, dropped = [], guard = 0;

        // 1) snížit pestrost tam, kde to ušetří nejvíc
        while (totalCost() > B && guard++ < 60) {
            var best = null, save = 0;
            Object.keys(active).forEach(function (k) {
                if (active[k].m > 1) {
                    var s = kindCost(k, active[k].m, active[k].cheap) - kindCost(k, active[k].m - 1, active[k].cheap);
                    if (s > save) { save = s; best = k; }
                }
            });
            if (!best) break;
            active[best].m--;
        }
        // 2) nejlevnější položky
        guard = 0;
        while (totalCost() > B && guard++ < 20) {
            var b2 = null, s2 = 0;
            Object.keys(active).forEach(function (k) {
                if (!active[k].cheap) {
                    var s = kindCost(k, active[k].m, false) - kindCost(k, active[k].m, true);
                    if (s > s2) { s2 = s; b2 = k; }
                }
            });
            if (!b2) break;
            active[b2].cheap = true;
        }
        // 3) vynechat kategorie
        for (var d = 0; d < DROP_ORDER.length && totalCost() > B; d++) {
            var k = DROP_ORDER[d];
            if (active[k] && Object.keys(active).length > 1) { delete active[k]; dropped.push(k); }
        }
        var shortfall = totalCost() > B;

        // 4) zbyde-li rozpočet, navýšit porce
        if (!shortfall) {
            for (var gg = 1.1; gg <= 1.5001; gg += 0.1) {
                var prev = g; g = gg;
                if (totalCost() > B) { g = prev; break; }
            }
        }

        var lines = [];
        Object.keys(active).sort(function (a, b) { return KINDS[a].order - KINDS[b].order; }).forEach(function (k) {
            lines = lines.concat(linesOf(k, active[k].m, active[k].cheap, g));
        });
        return { lines: lines, cost: costOf(lines), shortfall: shortfall, dropped: dropped, generosity: g };
    }

    // ─── Stav a vykreslení ────────────────────────────────────────────────────

    var S = {
        event: 'oslava', n: 20, budget: 6000, budgetTouched: false,
        sladke: true, hlavni: false, napoje: false, veg: false,
        seed: 0, lines: [], plan: null, busy: false, report: null
    };

    function recommended() { return Math.round(S.n * EVENTS[S.event].pp / 100) * 100; }

    function setEventDefaults() {
        var d = EVENTS[S.event].defaults;
        S.sladke = d.sladke; S.hlavni = d.hlavni; S.napoje = d.napoje;
    }

    function total() { return S.lines.reduce(function (s, l) { return s + l.qty * l.item.price; }, 0); }

    function root() { return host.querySelector('.jk-root'); }

    function shell() {
        var ev = Object.keys(EVENTS).map(function (k) {
            return '<label class="jk-chip"><input type="radio" name="jk-event" value="' + k + '"' + (k === S.event ? ' checked' : '') + '>' +
                '<span><b>' + esc(EVENTS[k].label) + '</b><small>' + esc(EVENTS[k].hint) + '</small></span></label>';
        }).join('');
        function tog(id, label, on) {
            return '<label class="jk-tog"><input type="checkbox" id="jk-' + id + '"' + (on ? ' checked' : '') + '><span>' + esc(label) + '</span></label>';
        }
        host.innerHTML = [
            '<div class="jk-root">',
            '  <div class="jk-intro"><h2 class="jk-h">Catering na 1 klik</h2>',
            '  <p class="jk-p">Řekněte nám, co plánujete. Podle počtu hostů a rozpočtu poskládáme sestavu z naší aktuální nabídky. Upravíte ji, jedním kliknutím ji dáte do košíku a v košíku už jen vyberete termín a čas doručení.</p></div>',
            '  <div class="jk-grid">',
            '    <div class="jk-form">',
            '      <fieldset class="jk-card"><legend><i>1</i>Druh akce</legend><div class="jk-chips">' + ev + '</div></fieldset>',
            '      <fieldset class="jk-card"><legend><i>2</i>Počet hostů</legend>',
            '        <div class="jk-row"><button type="button" class="jk-step" data-act="n-" aria-label="Méně hostů">−</button>',
            '        <input class="jk-num" id="jk-n" type="number" inputmode="numeric" min="5" max="' + CFG.maxGuests + '" value="' + S.n + '" aria-label="Počet hostů">',
            '        <button type="button" class="jk-step" data-act="n+" aria-label="Více hostů">+</button><span class="jk-unit">hostů</span></div>',
            '        <input class="jk-range" id="jk-nr" type="range" min="5" max="100" step="1" value="' + clamp(S.n, 5, 100) + '" aria-label="Počet hostů – posuvník">',
            '        <p class="jk-note" id="jk-bignote" hidden>Pro větší akce vám rádi připravíme nabídku na míru. Zavolejte nám na <a href="' + CFG.phoneHref + '">' + CFG.phone + '</a>.</p>',
            '      </fieldset>',
            '      <fieldset class="jk-card"><legend><i>3</i>Rozpočet</legend>',
            '        <div class="jk-row"><input class="jk-num jk-num-b" id="jk-b" type="number" inputmode="numeric" min="500" step="100" value="' + S.budget + '" aria-label="Rozpočet v korunách"><span class="jk-unit">Kč celkem</span></div>',
            '        <input class="jk-range" id="jk-br" type="range" min="1000" max="60000" step="500" value="' + clamp(S.budget, 1000, 60000) + '" aria-label="Rozpočet – posuvník">',
            '        <p class="jk-note" id="jk-bhint"></p>',
            '      </fieldset>',
            '      <fieldset class="jk-card"><legend><i>4</i>Co nesmí chybět</legend><div class="jk-togs">',
            tog('sladke', 'Sladké', S.sladke), tog('hlavni', 'Teplé a hlavní jídla', S.hlavni), tog('napoje', 'Nápoje (sekt, víno)', S.napoje), tog('veg', 'Bez masa', S.veg),
            '      </div></fieldset>',
            '    </div>',
            '    <section class="jk-res" aria-live="polite" aria-label="Váš návrh"><div id="jk-out"><div class="jk-load"><span class="jk-spin" aria-hidden="true"></span>Načítám aktuální nabídku a ceny…</div></div></section>',
            '  </div>',
            '  <div class="jk-bar" id="jk-bar" hidden><div><small>Celkem</small><b id="jk-bar-t"></b></div><button type="button" class="jk-btn" data-act="add">Přidat vše do košíku</button></div>',
            '</div>'
        ].join('');
    }

    function budgetHint() {
        var pp = S.budget / S.n;
        var rec = EVENTS[S.event].pp;
        var lab = pp < rec * 0.7 ? 'úsporná sestava' : pp < rec * 1.25 ? 'standardní sestava' : 'štědrá sestava';
        var el = host.querySelector('#jk-bhint');
        if (el) el.innerHTML = '<b>' + kc(pp) + ' na osobu</b> · ' + lab + ' · doporučujeme asi ' + kc(rec) + ' na osobu';
    }

    function lineHTML(l, i) {
        var it = l.item;
        var thumb = it.img ? '<img src="' + esc(it.img) + '" alt="" loading="lazy" width="56" height="56">' : '<span>' + esc(it.name.charAt(0)) + '</span>';
        var cov = it.pcs ? 'cca ' + Math.round(it.pcs * l.qty) + ' ks' : (feedsOf(it, S.event) >= 2 ? 'pro cca ' + Math.round(feedsOf(it, S.event) * l.qty) + ' hostů' : '');
        return [
            '<li class="jk-line" data-i="' + i + '">',
            '  <a class="jk-th" href="' + esc(it.href) + '" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">' + thumb + '</a>',
            '  <div class="jk-lt"><a href="' + esc(it.href) + '" target="_blank" rel="noopener">' + esc(it.name) + '</a>',
            '    <small>' + esc([kc(it.price) + ' / ks', cov, it.note].filter(Boolean).join(' · ')) + '</small></div>',
            '  <div class="jk-q"><button type="button" class="jk-qb" data-act="q-" data-i="' + i + '" aria-label="Ubrat kus: ' + esc(it.name) + '">−</button>',
            '    <output aria-label="Množství">' + l.qty + '</output>',
            '    <button type="button" class="jk-qb" data-act="q+" data-i="' + i + '" aria-label="Přidat kus: ' + esc(it.name) + '">+</button></div>',
            '  <div class="jk-lp">' + kc(l.qty * it.price) + '</div>',
            '  <button type="button" class="jk-x" data-act="rm" data-i="' + i + '" aria-label="Odebrat: ' + esc(it.name) + '">×</button>',
            '</li>'
        ].join('');
    }

    function paintResult() {
        var out = host.querySelector('#jk-out');
        if (!out) return;
        if (!CATALOG.length) {
            out.innerHTML = '<div class="jk-empty"><b>Nabídku se nepodařilo načíst.</b><p>Zkuste stránku obnovit, nebo nám zavolejte na <a href="' + CFG.phoneHref + '">' + CFG.phone + '</a>, sestavíme to společně.</p></div>';
            return;
        }
        var t = total();
        var pp = S.n ? t / S.n : 0;
        var pct = S.budget ? t / S.budget * 100 : 0;
        var groups = [], cur = null;
        S.lines.forEach(function (l, i) {
            if (!cur || cur.kind !== l.kind) { cur = { kind: l.kind, html: '' }; groups.push(cur); }
            cur.html += lineHTML(l, i);
        });
        var msgs = [];
        var p = S.plan;
        if (p && p.shortfall) msgs.push('<p class="jk-msg jk-warn">Pro tento počet hostů je nejlevnější možná sestava za <b>' + kc(p.cost) + '</b>. Zvyšte rozpočet, snižte počet hostů, nebo nám zavolejte a poradíme.</p>');
        if (p && p.dropped.length) msgs.push('<p class="jk-msg">Aby se vešlo do rozpočtu, vynechali jsme: ' + p.dropped.map(function (k) { return esc(KINDS[k].label.toLowerCase()); }).join(', ') + '.</p>');
        if (p && !p.shortfall && pct < 78 && S.lines.length) msgs.push('<p class="jk-msg">Rozpočet jsme nevyčerpali (využito ' + Math.round(pct) + ' %). Můžete ho snížit, nebo zapnout další volby vlevo.</p>');
        if (S.napoje && S.lines.some(function (l) { return l.kind === 'napoje'; })) msgs.push('<p class="jk-msg">Nápoje obsahují alkohol a jsou určené pouze osobám starším 18 let.</p>');
        if (S.lines.some(function (l) { return /3 dny/.test(l.item.note); })) msgs.push('<p class="jk-msg">Některé položky je potřeba objednat alespoň 3 dny předem.</p>');

        out.innerHTML = [
            '<div class="jk-rh"><div><h3 class="jk-h3">Váš návrh</h3><p class="jk-sub">' + S.lines.length + ' položek pro ' + S.n + ' hostů</p></div>',
            '  <button type="button" class="jk-alt" data-act="shuffle">Jiná varianta</button></div>',
            S.lines.length ? groups.map(function (g) {
                return '<div class="jk-grp"><h4>' + esc(KINDS[g.kind].label) + '</h4><ul class="jk-ul">' + g.html + '</ul></div>';
            }).join('') : '<div class="jk-empty">Zatím tu nic není. Upravte parametry vlevo.</div>',
            '<div class="jk-sum">',
            '  <div class="jk-bar-bg" role="img" aria-label="Využití rozpočtu ' + Math.round(pct) + ' %"><i style="width:' + clamp(pct, 0, 100) + '%"' + (pct > 100 ? ' class="over"' : '') + '></i></div>',
            '  <div class="jk-tr"><span>Celkem</span><b id="jk-total">' + kc(t) + '</b></div>',
            '  <div class="jk-tr jk-tr2"><span>Na osobu</span><span>' + kc(pp) + '</span></div>',
            '  <div class="jk-tr jk-tr2"><span>Rozpočet</span><span>' + kc(S.budget) + (pct > 100 ? ' · o ' + kc(t - S.budget) + ' víc' : '') + '</span></div>',
            t >= CFG.freeDeliveryFrom ? '  <p class="jk-del">V Ostravě doprava zdarma.</p>' : '',
            msgs.join(''),
            S.report || '',
            '  <button type="button" class="jk-btn jk-btn-main" data-act="add"' + (!S.lines.length || S.busy ? ' disabled' : '') + '>' + (S.busy ? 'Přidávám do košíku…' : 'Přidat vše do košíku') + '</button>',
            '  <p class="jk-fine">Termín a čas doručení vyberete v košíku. Položky můžete v košíku ještě upravit. Složení a alergeny najdete u každého produktu. Chcete to probrat osobně? <a href="' + CFG.phoneHref + '">' + CFG.phone + '</a></p>',
            '</div>'
        ].join('');

        var bar = host.querySelector('#jk-bar');
        if (bar) {
            bar.hidden = !S.lines.length;
            host.querySelector('#jk-bar-t').textContent = kc(t);
        }
    }

    function recompute() {
        if (!CATALOG.length) { paintResult(); return; }
        S.plan = buildPlan({
            event: S.event, n: S.n, budget: S.budget, sladke: S.sladke, hlavni: S.hlavni,
            napoje: S.napoje, veg: S.veg, seed: S.seed
        });
        S.lines = S.plan.lines;
        S.report = '';
        paintResult();
    }

    var tmr = null;
    function schedule() { clearTimeout(tmr); tmr = setTimeout(recompute, 120); }

    // ─── Přidání do košíku ────────────────────────────────────────────────────

    function csrfToken() {
        var el = document.querySelector('input[name="__csrf__"]');
        if (el && el.value) return el.value;
        try { if (window.shoptet && shoptet.csrf && shoptet.csrf.token) return shoptet.csrf.token; } catch (e) {}
        return '';
    }

    function formFor(it) {
        if (it.form && it.form.querySelector('[name="productId"]')) return Promise.resolve(it.form);
        return fetchDoc(it.href).then(function (doc) {
            var f = doc.querySelector('form.pr-action') || doc.querySelector('form#product-detail-form') || doc.querySelector('form[action*="addCartItem"]');
            if (!f) throw new Error('formulář nenalezen');
            if (f.querySelector('select')) throw new Error('produkt má varianty');
            it.form = f;
            return f;
        });
    }

    function addOne(it, qty) {
        return formFor(it).then(function (form) {
            var fd = new FormData(form);
            fd.set('amount', String(qty));
            if (!fd.get('__csrf__')) { var t = csrfToken(); if (t) fd.set('__csrf__', t); }
            var action = form.getAttribute('action') || CFG.addUrl;
            return fetch(abs(action), {
                method: 'POST', body: fd, credentials: 'same-origin',
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json, text/javascript, */*; q=0.01' }
            }).then(function (r) {
                return r.text().then(function (body) {
                    log('addCartItem', it.name, r.status, body.slice(0, 160));
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    try {
                        var j = JSON.parse(body);
                        if (j && typeof j.code !== 'undefined' && String(j.code) !== '200' && String(j.code) !== '0') throw new Error(j.message || ('kód ' + j.code));
                    } catch (e) { if (e instanceof SyntaxError) return; throw e; }
                });
            });
        });
    }

    function addAll() {
        if (S.busy || !S.lines.length) return;
        S.busy = true; S.report = '';
        var items = S.lines.slice();
        var done = 0, failed = [];
        paintResult();
        var btns = host.querySelectorAll('[data-act="add"]');

        function progress() {
            Array.prototype.forEach.call(btns, function (b) { b.textContent = 'Přidávám ' + done + ' z ' + items.length + '…'; });
        }
        progress();

        var chain = Promise.resolve();
        items.forEach(function (l) {
            chain = chain.then(function () {
                return addOne(l.item, l.qty).catch(function (e) { log('chyba', l.item.name, e); failed.push({ l: l, why: e && e.message }); })
                    .then(function () { done++; progress(); });
            });
        });

        chain.then(function () {
            // ověřit skutečný obsah košíku
            return fetch(CFG.cartUrl, { credentials: 'same-origin' }).then(function (r) { return r.text(); }).catch(function () { return ''; });
        }).then(function (cartHtml) {
            if (cartHtml) {
                items.forEach(function (l) {
                    var already = failed.some(function (f) { return f.l === l; });
                    if (!already && cartHtml.indexOf(l.item.path) === -1) failed.push({ l: l, why: 'nenalezeno v košíku' });
                });
            }
            S.busy = false;
            if (!failed.length) {
                S.report = '<p class="jk-msg jk-ok">Hotovo, přesměrovávám do košíku…</p>';
                paintResult();
                setTimeout(function () { location.href = CFG.cartUrl; }, 500);
                return;
            }
            S.report = '<div class="jk-msg jk-warn"><b>Nepodařilo se přidat ' + failed.length + ' z ' + items.length + ' položek.</b> Přidejte je prosím ručně:<ul>' +
                failed.map(function (f) { return '<li><a href="' + esc(f.l.item.href) + '" target="_blank" rel="noopener">' + esc(f.l.item.name) + '</a> (' + f.l.qty + '×)</li>'; }).join('') +
                '</ul><a class="jk-link" href="' + CFG.cartUrl + '">Pokračovat do košíku</a></div>';
            paintResult();
        });
    }

    // ─── Události ─────────────────────────────────────────────────────────────

    function syncInputs() {
        var n = host.querySelector('#jk-n'), nr = host.querySelector('#jk-nr'), b = host.querySelector('#jk-b'), br = host.querySelector('#jk-br');
        if (n && document.activeElement !== n) n.value = S.n;
        if (nr) nr.value = clamp(S.n, 5, 100);
        if (b && document.activeElement !== b) b.value = S.budget;
        if (br) br.value = clamp(S.budget, 1000, 60000);
        var big = host.querySelector('#jk-bignote');
        if (big) big.hidden = S.n <= 100;
        budgetHint();
    }

    function autoBudget() {
        if (!S.budgetTouched) S.budget = Math.max(1000, recommended());
    }

    function bind() {
        host.addEventListener('change', function (e) {
            var t = e.target;
            if (t.name === 'jk-event') { S.event = t.value; setEventDefaults(); S.seed = 0; autoBudget();
                ['sladke', 'hlavni', 'napoje'].forEach(function (k) { host.querySelector('#jk-' + k).checked = S[k]; }); syncInputs(); schedule(); }
            else if (t.id === 'jk-sladke' || t.id === 'jk-hlavni' || t.id === 'jk-napoje' || t.id === 'jk-veg') { S[t.id.slice(3)] = t.checked; S.seed = 0; schedule(); }
        });
        host.addEventListener('input', function (e) {
            var t = e.target;
            if (t.id === 'jk-n' || t.id === 'jk-nr') {
                var v = parseInt(t.value, 10);
                if (!isFinite(v)) return;
                S.n = clamp(v, 1, CFG.maxGuests); S.seed = 0; autoBudget(); syncInputs(); schedule();
            } else if (t.id === 'jk-b' || t.id === 'jk-br') {
                var b = parseInt(t.value, 10);
                if (!isFinite(b)) return;
                S.budget = clamp(b, 500, 500000); S.budgetTouched = true; S.seed = 0; syncInputs(); schedule();
            }
        });
        host.addEventListener('blur', function (e) {
            if (e.target.id === 'jk-n') { S.n = clamp(parseInt(e.target.value, 10) || 5, 5, CFG.maxGuests); syncInputs(); schedule(); }
        }, true);
        host.addEventListener('click', function (e) {
            var b = e.target.closest('[data-act]');
            if (!b) return;
            var act = b.getAttribute('data-act'), i = parseInt(b.getAttribute('data-i'), 10);
            if (act === 'n-' || act === 'n+') { S.n = clamp(S.n + (act === 'n+' ? 1 : -1), 5, CFG.maxGuests); S.seed = 0; autoBudget(); syncInputs(); schedule(); }
            else if (act === 'shuffle') { S.seed++; recompute(); }
            else if (act === 'q+') { S.lines[i].qty++; S.report = ''; paintResult(); }
            else if (act === 'q-') { S.lines[i].qty = Math.max(1, S.lines[i].qty - 1); S.report = ''; paintResult(); }
            else if (act === 'rm') { S.lines.splice(i, 1); S.report = ''; paintResult(); }
            else if (act === 'add') { addAll(); }
        });
        // lepkavá lišta na mobilu: schovat, když je vidět hlavní tlačítko
        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (en) {
                var bar = host.querySelector('#jk-bar');
                if (!bar) return;
                bar.classList.toggle('is-hid', en.some(function (x) { return x.isIntersecting; }));
            });
            new MutationObserver(function () {
                var m = host.querySelector('.jk-btn-main');
                if (m && m !== io._t) { if (io._t) io.unobserve(io._t); io._t = m; io.observe(m); }
            }).observe(host, { childList: true, subtree: true });
        }
    }

    // ─── Styly ────────────────────────────────────────────────────────────────

    function injectStyles() {
        if (document.getElementById('jk-style')) return;
        var s = document.createElement('style');
        s.id = 'jk-style';
        s.textContent = [
            '.jk-root{--p:#4C1536;--p2:#6a1e4b;--g:#DFC15E;--gd:#c39a32;--c:#F7EAC4;--m:#6b5a61;--l:#efe4eb;--t:#faf4f7;font-family:inherit;color:var(--p);box-sizing:border-box;margin:8px 0 40px}',
            '.jk-root *,.jk-root *::before,.jk-root *::after{box-sizing:border-box}',
            '.jk-root a{text-decoration:none}',
            '.jk-root .jk-h{margin:0;padding:0;border:0;text-transform:none;font-family:inherit;font-size:34px;font-weight:800;line-height:1.1;letter-spacing:-.015em;color:var(--p)}',
            '.jk-root .jk-p{margin:10px 0 0;max-width:68ch;font-size:15.5px;line-height:1.6;color:var(--m)}',
            '.jk-intro{margin:0 0 22px}',
            '.jk-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:22px;align-items:start}',
            '.jk-form{display:flex;flex-direction:column;gap:14px}',

            /* karty formuláře */
            '.jk-card{margin:0;padding:20px 22px 22px;border:1px solid var(--l);border-radius:18px;background:#fff;box-shadow:0 6px 18px rgba(76,21,54,.06)}',
            '.jk-card legend{float:left;width:100%;display:flex;align-items:center;gap:10px;margin:0 0 14px;padding:0;font-size:17px;font-weight:800;color:var(--p)}',
            '.jk-card legend+*{clear:both}',
            '.jk-card legend i{flex:0 0 28px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:var(--c);color:#8a6a14;font-style:normal;font-size:14px;font-weight:800}',
            '.jk-chips{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
            '.jk-chip{position:relative;display:block;cursor:pointer}',
            '.jk-chip input{position:absolute;opacity:0;inset:0;margin:0;cursor:pointer}',
            '.jk-chip span{display:block;height:100%;padding:12px 14px;border:1.5px solid #e3d3dc;border-radius:13px;background:#fff;transition:border-color .2s ease,background .2s ease,box-shadow .2s ease}',
            '.jk-chip b{display:block;font-size:15px;font-weight:800;color:var(--p)}',
            '.jk-chip small{display:block;margin-top:3px;font-size:12px;line-height:1.35;color:var(--m)}',
            '.jk-chip input:checked+span{border-color:var(--p);background:var(--t);box-shadow:0 0 0 3px rgba(223,193,94,.45)}',
            '.jk-chip input:focus-visible+span{outline:3px solid var(--g);outline-offset:2px}',
            '.jk-row{display:flex;align-items:center;gap:10px}',
            '.jk-step{width:44px;height:44px;flex:0 0 44px;padding:0;border:1.5px solid #e3d3dc;border-radius:50%;background:#fff;color:var(--p);font-size:22px;line-height:1;cursor:pointer;transition:background .2s ease,color .2s ease}',
            '.jk-step:hover{background:var(--p);color:#fff;border-color:var(--p)}',
            '.jk-root .jk-num{width:92px;height:44px;margin:0;padding:0 10px;text-align:center;font:inherit;font-size:22px;font-weight:800;color:var(--p);border:1.5px solid #e3d3dc;border-radius:11px;background:#fff;-moz-appearance:textfield}',
            '.jk-root .jk-num-b{width:140px;text-align:right}',
            '.jk-num::-webkit-outer-spin-button,.jk-num::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}',
            '.jk-unit{font-size:14px;color:var(--m)}',
            '.jk-range{display:block;width:100%;margin:16px 0 0;accent-color:var(--p);cursor:pointer}',
            '.jk-note{margin:10px 0 0;font-size:13px;line-height:1.5;color:var(--m)}',
            '.jk-note b{color:var(--p)}',
            '.jk-note a{color:var(--p);font-weight:700}',
            '.jk-togs{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
            '.jk-tog{position:relative;display:block;cursor:pointer}',
            '.jk-tog input{position:absolute;opacity:0;inset:0;margin:0;cursor:pointer}',
            '.jk-tog span{display:flex;align-items:center;gap:10px;height:100%;padding:11px 14px;border:1.5px solid #e3d3dc;border-radius:13px;background:#fff;font-size:14px;font-weight:700;color:var(--p);transition:border-color .2s ease,background .2s ease}',
            '.jk-tog span::before{content:"";flex:0 0 20px;width:20px;height:20px;border:2px solid #cdb9c5;border-radius:6px;background:#fff;transition:background .2s ease,border-color .2s ease}',
            '.jk-tog input:checked+span{border-color:var(--p);background:var(--t)}',
            '.jk-tog input:checked+span::before{background:var(--p) url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'><path d=\'M3.5 8.5l3 3 6-7\' fill=\'none\' stroke=\'%23DFC15E\' stroke-width=\'2.4\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/></svg>") center/14px no-repeat;border-color:var(--p)}',
            '.jk-tog input:focus-visible+span{outline:3px solid var(--g);outline-offset:2px}',

            /* výsledek */
            '.jk-res{position:sticky;top:96px;padding:22px;border:1px solid var(--l);border-radius:20px;background:linear-gradient(135deg,#fff,#fdf6fa);box-shadow:0 14px 34px rgba(76,21,54,.12)}',
            '.jk-rh{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin:0 0 6px}',
            '.jk-root .jk-h3{margin:0;padding:0;border:0;text-transform:none;font-family:inherit;font-size:24px;font-weight:800;line-height:1.15;color:var(--p)}',
            '.jk-sub{margin:3px 0 0;font-size:13.5px;color:var(--m)}',
            '.jk-alt{flex-shrink:0;padding:9px 14px;font:inherit;font-size:13.5px;font-weight:700;color:var(--p);background:#fff;border:1.5px solid #e3d3dc;border-radius:30px;cursor:pointer;transition:background .2s ease,color .2s ease}',
            '.jk-alt:hover{background:var(--p);color:#fff;border-color:var(--p)}',
            '.jk-grp h4{margin:16px 0 6px;padding:0;border:0;text-transform:none;font-family:inherit;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#8a6a14}',
            '.jk-ul{list-style:none;margin:0;padding:0}',
            '.jk-line{display:grid;grid-template-columns:56px minmax(0,1fr) auto auto 28px;align-items:center;gap:10px;margin:0;padding:10px 0;border-bottom:1px solid #f3e9ef}',
            '.jk-th{display:block;width:56px;height:56px;border-radius:12px;overflow:hidden;background:linear-gradient(135deg,#fdf6fa,#f3e6ee);display:flex;align-items:center;justify-content:center;color:var(--p);font-weight:800}',
            '.jk-th img{width:100%;height:100%;object-fit:cover;display:block}',
            '.jk-lt a{display:block;font-size:14px;font-weight:800;line-height:1.3;color:var(--p)!important}',
            '.jk-lt a:hover{color:var(--p2)!important}',
            '.jk-lt small{display:block;margin-top:2px;font-size:12px;line-height:1.35;color:var(--m)}',
            '.jk-q{display:flex;align-items:center;gap:2px;border:1.5px solid #e3d3dc;border-radius:30px;background:#fff}',
            '.jk-qb{width:30px;height:30px;padding:0;border:0;border-radius:50%;background:none;font-size:17px;line-height:1;color:var(--p);cursor:pointer}',
            '.jk-qb:hover{background:var(--c)}',
            '.jk-q output{min-width:24px;text-align:center;font-size:14px;font-weight:800;color:var(--p)}',
            '.jk-lp{min-width:74px;text-align:right;font-size:14px;font-weight:800;color:var(--p);white-space:nowrap}',
            '.jk-x{width:28px;height:28px;padding:0;border:0;border-radius:50%;background:none;font-size:20px;line-height:1;color:#a8929e;cursor:pointer}',
            '.jk-x:hover{background:var(--t);color:var(--p)}',
            '.jk-sum{margin-top:18px}',
            '.jk-bar-bg{height:8px;border-radius:8px;background:#eadde5;overflow:hidden}',
            '.jk-bar-bg i{display:block;height:100%;border-radius:8px;background:linear-gradient(90deg,var(--gd),var(--g));transition:width .3s ease}',
            '.jk-bar-bg i.over{background:var(--p2)}',
            '.jk-tr{display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin-top:10px;font-size:14px;color:var(--m)}',
            '.jk-tr b{font-size:28px;font-weight:800;letter-spacing:-.01em;color:var(--p)}',
            '.jk-tr span:first-child{font-weight:700;color:var(--p)}',
            '.jk-tr2{margin-top:4px;font-size:13.5px}',
            '.jk-del{margin:8px 0 0;font-size:13px;font-weight:700;color:#8a6a14}',
            '.jk-msg{margin:12px 0 0;padding:10px 13px;border-radius:12px;background:var(--t);border:1px solid #efe2ea;font-size:13px;line-height:1.5;color:var(--m)}',
            '.jk-msg b{color:var(--p)}',
            '.jk-warn{background:#fff6e0;border-color:#ecd9a0;color:#6b4e08}',
            '.jk-warn ul{margin:6px 0 8px;padding-left:18px}',
            '.jk-warn a{color:var(--p);font-weight:700;text-decoration:underline!important}',
            '.jk-ok{background:#eef7ee;border-color:#cfe5cf;color:#2d5a2d;font-weight:700}',
            '.jk-link{font-weight:700}',
            '.jk-btn{display:inline-flex;align-items:center;justify-content:center;padding:13px 22px;font:inherit;font-size:16px;font-weight:800;color:#fff;background:var(--p);border:0;border-radius:12px;cursor:pointer;transition:background .2s ease,transform .1s ease}',
            '.jk-btn:hover:not(:disabled){background:var(--p2)}',
            '.jk-btn:active:not(:disabled){transform:translateY(1px)}',
            '.jk-btn:disabled{opacity:.6;cursor:default}',
            '.jk-btn-main{width:100%;margin-top:16px;padding:16px 22px;font-size:17px;box-shadow:0 10px 22px rgba(76,21,54,.25)}',
            '.jk-fine{margin:12px 0 0;font-size:12px;line-height:1.5;color:var(--m)}',
            '.jk-fine a{color:var(--p);font-weight:700}',
            '.jk-empty{padding:26px 8px;text-align:center;font-size:14px;line-height:1.55;color:var(--m)}',
            '.jk-empty a{color:var(--p);font-weight:700}',
            '.jk-load{display:flex;align-items:center;justify-content:center;gap:12px;padding:40px 8px;font-size:14.5px;font-weight:700;color:var(--m)}',
            '.jk-spin{width:22px;height:22px;border:3px solid #eadde5;border-top-color:var(--p);border-radius:50%;animation:jkspin .8s linear infinite}',
            '@keyframes jkspin{to{transform:rotate(360deg)}}',
            '.jk-root :focus-visible{outline:3px solid var(--g);outline-offset:2px}',

            /* lepkavá lišta na mobilu */
            '.jk-bar{display:none}',

            '@media (max-width:991px){.jk-grid{grid-template-columns:1fr}.jk-res{position:static}}',
            '@media (max-width:767px){',
            '  .jk-root .jk-h{font-size:27px}',
            '  .jk-card{padding:16px 16px 18px}',
            '  .jk-chips,.jk-togs{grid-template-columns:1fr}',
            '  .jk-res{padding:16px}',
            '  .jk-line{grid-template-columns:48px minmax(0,1fr) auto;grid-template-areas:"th lt x" "th q lp";row-gap:6px}',
            '  .jk-th{grid-area:th;width:48px;height:48px}',
            '  .jk-lt{grid-area:lt}',
            '  .jk-q{grid-area:q;justify-self:start}',
            '  .jk-lp{grid-area:lp;align-self:center}',
            '  .jk-x{grid-area:x;align-self:start}',
            '  .jk-bar{position:fixed;left:0;right:0;bottom:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px calc(10px + env(safe-area-inset-bottom,0px));background:#fff;border-top:1px solid var(--l);box-shadow:0 -10px 28px rgba(76,21,54,.14);transition:transform .25s ease}',
            '  .jk-bar[hidden]{display:none}',
            '  .jk-bar.is-hid{transform:translateY(110%)}',
            '  .jk-bar small{display:block;font-size:12px;color:var(--m)}',
            '  .jk-bar b{display:block;font-size:20px;font-weight:800;color:var(--p)}',
            '  .jk-bar .jk-btn{padding:12px 18px;font-size:15px}',
            '}',
            '@media (prefers-reduced-motion:reduce){.jk-spin{animation-duration:2s}.jk-bar,.jk-bar-bg i{transition:none}}'
        ].join('');
        document.head.appendChild(s);
    }

    // ─── Start ────────────────────────────────────────────────────────────────

    function init() {
        window.__jojoKonfV1 = { plan: buildPlan, state: S, catalog: function () { return CATALOG; }, recompute: recompute };
        injectStyles();
        shell();
        bind();
        autoBudget();
        syncInputs();
        loadCatalog().then(function () { recompute(); })
            .catch(function (e) { console.warn('[jojo catering] načtení nabídky selhalo', e); CATALOG = []; paintResult(); });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

})();
