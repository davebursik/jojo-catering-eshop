(function () {
    'use strict';

    if (!document.body.classList.contains('in-index')) return;
    if (window.__jojoReviewsV1) return;
    window.__jojoReviewsV1 = true;

    // ═══════════════════════════════════════════════════════════════════════════
    //  JOJO CATERING – RECENZE NA HOMEPAGE v1
    //
    //  Načte hodnocení ze stránky /hodnoceni-obchodu/ (stejná doména), vybere
    //  nejnovější s textem a vykreslí je jako posuvný pás karet vedle souhrnu
    //  „5,0 z 5". Nové recenze se tak objeví samy.
    //  Původní blok „Poslední hodnocení" ze šablony se skryje a tento nastoupí
    //  na jeho místo. Když se načtení nepovede, zobrazí se záložní kopie.
    //
    //  Zápatí:  <script src=".../recenze-v1.js" defer></script>
    // ═══════════════════════════════════════════════════════════════════════════

    var CFG = {
        url: '/hodnoceni-obchodu/',
        max: 8,              // kolik recenzí ukázat
        minLen: 35,          // kratší komentáře („Vše ok") se přeskočí
        maxLen: 420,         // delší se zkrátí
        cacheMinutes: 30,
        title: 'Co o nás říkají zákazníci',
        sub: 'Skutečná hodnocení z našeho e-shopu.'
    };

    // Záloha, kdyby se stránka s hodnocením nepodařilo načíst.
    var FALLBACK = {
        avg: '5,0', count: 51, five: 51,
        reviews: [
            { name: 'Ivana Vidlářová', date: '30.10.2026', text: 'Všechno bylo perfektní, stačilo dát na stůl. Moc děkujeme a objednáme znovu' },
            { name: 'Marketa Kleinedlerova', date: '7.9.2026', text: 'Catering byl naprosto fantastický! Všechno bylo čerstvé, krásně připravené a chuťově opravdu výborné. Velmi oceňuji i nádherné servírování a celkovou prezentaci, která udělala skvělý dojem. Všichni si moc pochutnali a určitě můžu jen doporučit.' },
            { name: 'Marcela Motlochová', date: '26.8.2026', text: 'S cateringovou firmou jsem byla velmi spokojená. Oceňuji především profesionální přístup, příjemnou komunikaci, ochotu a celkovou organizaci. Vše proběhlo podle domluvy a catering byl velmi dobře připravený. Jídlo bylo chutné, servis příjemný a celý průběh akce bez problémů.' },
            { name: 'Karel Nenička', date: '28.4.2026', text: 'Výborná domluva, flexibilita, vše perfektně zabaleno a dodáno i s termoboxy a přepravkami pro snadnou přepravu, zapůjčení servírovacích tácků a misek za symbolickou cenu, milé úsměvy všech, s kterými jsme jednali. Když to shrnu, tak dokonalý servis a určitě bychom příště neměnili.' },
            { name: 'Barbora Nedabýlková', date: '2.4.2026', text: 'Opakovaně objednáváme na různé firemní příležitosti a vždy jsme maximálně spokojení. Jídlo úžasné jak na oko, tak i chuťově, domluva vždy úžasná' },
            { name: 'Katka Rehanková', date: '23.1.2026', text: 'Poctivá rodinná firma. Jsem nesmírně ráda, že jsem si vybrala na narozeninový catering právě tuto firmu. Všichni hosté se doslova olizovali už za ušima a chválili nejen chuť, ale i styl servírování.' }
        ]
    };

    var MONTHS = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];

    // ─── Pomocné ──────────────────────────────────────────────────────────────

    function esc(s) {
        return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function txt(el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; }
    function layoutBox(el) { return el.matches('.container,.content-wrapper,.content-wrapper-in,#content,body'); }

    function fmtDate(d) {
        var m = String(d).match(/(\d{1,2})\.\s?(\d{1,2})\.\s?(\d{4})/);
        if (!m) return d;
        return parseInt(m[1], 10) + '. ' + MONTHS[parseInt(m[2], 10) - 1] + ' ' + m[3];
    }
    function initials(name) {
        var p = name.split(/\s+/).filter(Boolean);
        if (!p.length) return '?';
        return (p[0].charAt(0) + (p.length > 1 ? p[p.length - 1].charAt(0) : '')).toUpperCase();
    }
    function clean(t) {
        t = t.replace(/\s+/g, ' ').trim();
        if (t.length > CFG.maxLen) t = t.slice(0, CFG.maxLen).replace(/\s+\S*$/, '') + '…';
        return t;
    }

    // ─── Načtení a čtení hodnocení ────────────────────────────────────────────

    var MARK = 'Hodnocení obchodu je';

    function parseReviews(doc) {
        var all = doc.body.querySelectorAll('*');
        var leaves = [];
        for (var i = 0; i < all.length; i++) {
            var el = all[i];
            if (el.textContent.indexOf(MARK) === -1) continue;
            var deeper = false;
            for (var c = 0; c < el.children.length; c++) {
                if (el.children[c].textContent.indexOf(MARK) !== -1) { deeper = true; break; }
            }
            if (!deeper) leaves.push(el);
        }
        var out = [], seen = [];
        leaves.forEach(function (leaf) {
            var card = leaf;
            while (card.parentElement && card.parentElement !== doc.body) {
                var n = 0;
                for (var k = 0; k < leaves.length; k++) if (card.parentElement.contains(leaves[k])) n++;
                if (n > 1) break;
                card = card.parentElement;
            }
            if (seen.indexOf(card) !== -1) return;
            seen.push(card);
            var t = card.textContent.replace(/\s+/g, ' ').trim();
            var m = t.match(/Avatar autora\s*(.+?)\s*Hodnocení obchodu je\s*(\d)\s*z\s*5\s*hvězdiček\.?\s*(\d{1,2}\.\s?\d{1,2}\.\s?\d{4})\s*(.*)$/);
            if (!m) return;
            out.push({ name: m[1].trim(), stars: parseInt(m[2], 10), date: m[3].replace(/\s/g, ''), text: m[4].trim() });
        });
        return out;
    }

    function parseSummary(doc) {
        var t = doc.body.textContent.replace(/\s+/g, ' ');
        var s = t.match(/Průměrné hodnocení obchodu je\s*([\d.,]+)\s*z\s*5\s*hvězdiček\.?\s*(\d+)\s*hodnocení/i);
        var d = t.match(/5\s*(\d+)\s*x\s*4\s*(\d+)\s*x\s*3\s*(\d+)\s*x\s*2\s*(\d+)\s*x\s*1\s*(\d+)\s*x/);
        return {
            avg: s ? s[1].replace('.', ',') : '',
            count: s ? parseInt(s[2], 10) : 0,
            five: d ? parseInt(d[1], 10) : 0
        };
    }

    function load(cb) {
        var key = 'jr-v1';
        try {
            var c = JSON.parse(sessionStorage.getItem(key) || 'null');
            if (c && Date.now() - c.t < CFG.cacheMinutes * 60000) return cb(c.d, true);
        } catch (e) {}
        fetch(CFG.url, { credentials: 'same-origin' })
            .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
            .then(function (html) {
                var doc = new DOMParser().parseFromString(html, 'text/html');
                var sum = parseSummary(doc);
                var list = parseReviews(doc)
                    .filter(function (r) { return r.stars >= 4 && r.text.length >= CFG.minLen; })
                    .slice(0, CFG.max);
                if (!sum.avg || !list.length) return cb(null);
                var data = { avg: sum.avg, count: sum.count, five: sum.five, reviews: list };
                try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), d: data })); } catch (e) {}
                cb(data);
            })
            .catch(function () { cb(null); });
    }

    // ─── Vykreslení ───────────────────────────────────────────────────────────

    function stars(n) { return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n); }

    function cardHTML(r) {
        return [
            '<article class="jr-card">',
            '  <div class="jr-q" aria-hidden="true">“</div>',
            '  <div class="jr-cstars" role="img" aria-label="Hodnocení ' + (r.stars || 5) + ' z 5">' + stars(r.stars || 5) + '</div>',
            '  <p class="jr-text">' + esc(clean(r.text)) + '</p>',
            '  <button type="button" class="jr-more" hidden>Číst více</button>',
            '  <footer class="jr-by">',
            '    <span class="jr-av" aria-hidden="true">' + esc(initials(r.name)) + '</span>',
            '    <span><b>' + esc(r.name) + '</b><time>' + esc(fmtDate(r.date)) + '</time></span>',
            '  </footer>',
            '</article>'
        ].join('');
    }

    function fiveLine(d) {
        if (!d.count || !d.five) return '';
        if (d.five >= d.count) return 'Všech ' + d.count + ' hodnocení má 5 hvězdiček';
        return Math.round(d.five / d.count * 100) + ' % hodnocení má 5 hvězdiček';
    }

    function innerHTML(d) {
        var count = d.count || d.reviews.length;
        return [
            '<div class="jr-head">',
            '  <h2 class="jr-title">' + esc(CFG.title) + '</h2>',
            '  <p class="jr-sub">' + esc(CFG.sub) + '</p>',
            '</div>',
            '<div class="jr-layout">',
            '  <aside class="jr-sum" aria-label="Souhrn hodnocení">',
            '    <div class="jr-score">' + esc(d.avg) + '</div>',
            '    <div class="jr-stars" role="img" aria-label="Průměrné hodnocení ' + esc(d.avg) + ' z 5">★★★★★</div>',
            '    <div class="jr-count">' + count + ' hodnocení zákazníků</div>',
            fiveLine(d) ? '    <div class="jr-five">' + esc(fiveLine(d)) + '</div>' : '',
            '    <a class="jr-btn" href="' + CFG.url + '">Číst všechna hodnocení</a>',
            '    <a class="jr-btn2" href="' + CFG.url + '">Napsat hodnocení</a>',
            '  </aside>',
            '  <div class="jr-main">',
            '    <div class="jr-nav"><button type="button" class="jr-arrow jr-prev" aria-label="Předchozí hodnocení">←</button><button type="button" class="jr-arrow jr-next" aria-label="Další hodnocení">→</button></div>',
            '    <div class="jr-track" role="region" tabindex="0" aria-label="Hodnocení zákazníků">' + d.reviews.map(cardHTML).join('') + '</div>',
            '  </div>',
            '</div>'
        ].join('');
    }

    var section = null;

    function wire() {
        var track = section.querySelector('.jr-track');
        var prev = section.querySelector('.jr-prev');
        var next = section.querySelector('.jr-next');
        function update() {
            var max = track.scrollWidth - track.clientWidth;
            prev.disabled = track.scrollLeft <= 4;
            next.disabled = track.scrollLeft >= max - 4;
        }
        function step(dir) { track.scrollBy({ left: dir * Math.max(260, track.clientWidth * 0.8), behavior: 'smooth' }); }
        prev.addEventListener('click', function () { step(-1); });
        next.addEventListener('click', function () { step(1); });
        track.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        update();

        // „Číst více" jen u karet, kde se text opravdu ořízl
        requestAnimationFrame(function () {
            Array.prototype.forEach.call(track.querySelectorAll('.jr-card'), function (card) {
                var t = card.querySelector('.jr-text');
                var b = card.querySelector('.jr-more');
                if (t.scrollHeight > t.clientHeight + 2) {
                    b.hidden = false;
                    b.addEventListener('click', function () {
                        var open = card.classList.toggle('is-open');
                        b.textContent = open ? 'Skrýt' : 'Číst více';
                        setTimeout(update, 50);
                    });
                }
            });
            update();
        });
    }

    function paint(d) {
        section.innerHTML = innerHTML(d);
        wire();
    }

    // ─── Umístění na stránku ──────────────────────────────────────────────────

    function findOriginal() {
        var els = document.querySelectorAll('h1,h2,h3,h4,h5,h6,div,span,p,strong');
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            if (el.children.length || el.closest('.jr-root')) continue;
            if (/^poslední hodnocení$/i.test(txt(el))) {
                var u = el;
                while (u.parentElement && !layoutBox(u.parentElement) &&
                       u.parentElement.querySelectorAll('h1,h2,h3,h4,h5,h6,.jj-sec-title,.homepage-group-title,.jh-root').length <= 1 &&
                       !/nové články|proč právě jojo/i.test(u.parentElement.textContent)) {
                    u = u.parentElement;
                }
                return u;
            }
        }
        return null;
    }

    function place() {
        if (section.parentNode) return true;
        var orig = findOriginal();
        if (orig) {
            orig.insertAdjacentElement('beforebegin', section);
            orig.classList.add('jr-orig');
            return true;
        }
        var anchor = document.querySelector('.jh-root');
        if (anchor) { anchor.insertAdjacentElement('afterend', section); return true; }
        return false;
    }

    function placeFallback() {
        if (section.parentNode) return;
        var host = document.querySelector('#content .container') || document.getElementById('content') || document.body;
        host.appendChild(section);
    }

    // ─── Styly ────────────────────────────────────────────────────────────────

    function injectStyles() {
        if (document.getElementById('jr-style')) return;
        var s = document.createElement('style');
        s.id = 'jr-style';
        s.textContent = [
            'body.in-index{--jr-plum:#4C1536;--jr-plum2:#6a1e4b;--jr-gold:#DFC15E;--jr-gold-d:#c39a32;--jr-cream:#F7EAC4;--jr-mute:#6b5a61;--jr-line:#efe4eb;--jr-tint:#faf4f7}',
            '.jr-orig{display:none!important}',
            '.jr-root{margin:46px 0 0;font-family:inherit;color:var(--jr-plum);box-sizing:border-box}',
            '.jr-root *,.jr-root *::before,.jr-root *::after{box-sizing:border-box}',
            '.jr-root a{text-decoration:none}',
            '.jr-root .jr-title{margin:0;padding:0;border:0;background:none;text-transform:none;text-align:left;font-family:inherit;font-size:27px;font-weight:800;line-height:1.12;letter-spacing:-.01em;color:var(--jr-plum)}',
            '.jr-root .jr-sub{margin:6px 0 0;padding:0;font-size:14px;line-height:1.5;color:var(--jr-mute)}',
            '.jr-head{margin:0 0 18px}',
            '.jr-layout{display:grid;grid-template-columns:290px minmax(0,1fr);gap:20px;align-items:stretch}',

            /* souhrn */
            '.jr-sum{display:flex;flex-direction:column;align-items:flex-start;padding:28px 26px;border-radius:20px;color:#fff;background:linear-gradient(145deg,var(--jr-plum),var(--jr-plum2));box-shadow:0 14px 34px rgba(76,21,54,.22)}',
            '.jr-score{font-size:68px;font-weight:800;line-height:1;letter-spacing:-.03em;color:var(--jr-gold)}',
            '.jr-stars{margin:8px 0 10px;font-size:22px;letter-spacing:3px;color:var(--jr-gold)}',
            '.jr-count{font-size:15px;font-weight:700;color:#fff}',
            '.jr-five{margin:4px 0 0;font-size:13px;line-height:1.45;color:rgba(255,255,255,.78)}',
            '.jr-btn,.jr-btn2{display:inline-flex;align-items:center;justify-content:center;width:100%;margin:0;font-size:14.5px;font-weight:700;line-height:1.2;border-radius:11px;padding:12px 18px;text-align:center;transition:background .2s ease,color .2s ease,border-color .2s ease}',
            '.jr-btn{margin-top:auto;background:var(--jr-gold);color:var(--jr-plum)!important;border:2px solid var(--jr-gold)}',
            '.jr-btn:hover{background:#ead487;border-color:#ead487}',
            '.jr-btn2{margin-top:10px;background:transparent;color:#fff!important;border:2px solid rgba(255,255,255,.35)}',
            '.jr-btn2:hover{background:rgba(255,255,255,.12);border-color:#fff}',
            '.jr-sum .jr-five+.jr-btn{margin-top:26px}',

            /* pás recenzí */
            '.jr-main{min-width:0;display:flex;flex-direction:column}',
            '.jr-nav{display:flex;justify-content:flex-end;gap:8px;margin:0 0 10px}',
            '.jr-arrow{width:40px;height:40px;padding:0;border-radius:50%;border:1.5px solid #e3d3dc;background:#fff;color:var(--jr-plum);font-size:18px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s ease,color .2s ease}',
            '.jr-arrow:hover:not(:disabled){background:var(--jr-plum);color:#fff;border-color:var(--jr-plum)}',
            '.jr-arrow:disabled{opacity:.35;cursor:default}',
            '.jr-track{flex:1;display:flex;align-items:stretch;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;padding:6px 2px 16px;margin:0 -2px;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}',
            '.jr-track::-webkit-scrollbar{display:none}',
            '.jr-track:focus-visible{outline:3px solid var(--jr-gold);outline-offset:2px;border-radius:12px}',

            /* karta */
            '.jr-card{position:relative;flex:0 0 330px;scroll-snap-align:start;display:flex;flex-direction:column;padding:22px 22px 18px;background:#fff;border:1px solid var(--jr-line);border-radius:18px;box-shadow:0 6px 18px rgba(76,21,54,.06);transition:transform .2s ease,box-shadow .2s ease}',
            '@media (pointer:fine){.jr-card:hover{transform:translateY(-4px);box-shadow:0 14px 28px rgba(76,21,54,.14)}}',
            '.jr-q{position:absolute;top:6px;right:18px;font-family:Georgia,serif;font-size:76px;line-height:1;color:var(--jr-cream);pointer-events:none}',
            '.jr-cstars{position:relative;margin:0 0 12px;font-size:16px;letter-spacing:2px;color:var(--jr-gold-d)}',
            '.jr-text{position:relative;margin:0 0 6px;font-size:14.5px;line-height:1.6;color:#4a3a41;display:-webkit-box;-webkit-line-clamp:7;-webkit-box-orient:vertical;overflow:hidden}',
            '.jr-card.is-open .jr-text{-webkit-line-clamp:unset;display:block;overflow:visible}',
            '.jr-more{align-self:flex-start;margin:0 0 6px;padding:0;border:0;background:none;font:inherit;font-size:13px;font-weight:700;color:var(--jr-plum);text-decoration:underline;text-underline-offset:3px;cursor:pointer}',
            '.jr-more[hidden]{display:none}',
            '.jr-by{margin-top:auto;display:flex;align-items:center;gap:11px;padding-top:14px;border-top:1px solid #f3e9ef}',
            '.jr-av{flex:0 0 40px;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:var(--jr-cream);color:#8a6a14;font-size:14px;font-weight:800}',
            '.jr-by b{display:block;font-size:14px;font-weight:800;line-height:1.2;color:var(--jr-plum)}',
            '.jr-by time{display:block;margin-top:2px;font-size:12px;color:var(--jr-mute)}',
            '.jr-root a:focus-visible,.jr-root button:focus-visible{outline:3px solid var(--jr-gold);outline-offset:3px}',

            /* tablet + mobil */
            '@media (max-width:991px){.jr-layout{grid-template-columns:1fr}.jr-sum{flex-direction:row;flex-wrap:wrap;align-items:center;column-gap:22px;padding:22px}.jr-score{font-size:56px}.jr-stars{margin:0}.jr-count{flex-basis:100%;margin-top:8px}.jr-five{flex-basis:100%}.jr-btn,.jr-btn2{width:auto;flex:1 1 200px;margin-top:14px!important}.jr-sum .jr-five+.jr-btn{margin-top:14px}}',
            '@media (max-width:767px){',
            '  .jr-root{margin-top:34px}',
            '  .jr-root .jr-title{font-size:22px}',
            '  .jr-root .jr-sub{font-size:13px}',
            '  .jr-nav{display:none}',
            '  .jr-sum{padding:20px}',
            '  .jr-score{font-size:50px}',
            '  .jr-track{gap:12px}',
            '  .jr-card{flex-basis:82vw;max-width:340px;padding:20px 18px 16px}',
            '  .jr-btn,.jr-btn2{flex-basis:100%}',
            '}',
            '@media (prefers-reduced-motion:reduce){.jr-track{scroll-behavior:auto}.jr-card{transition:none}}'
        ].join('');
        document.head.appendChild(s);
    }

    // ─── Spuštění ─────────────────────────────────────────────────────────────

    function init() {
        injectStyles();
        section = document.createElement('section');
        section.className = 'jr-root';
        section.setAttribute('aria-label', 'Hodnocení zákazníků');

        paint(FALLBACK);
        if (!place()) {
            // blok ze šablony nebo hlavní skript ještě nejsou – chvíli počkat
            var tries = 0;
            var iv = setInterval(function () {
                tries++;
                if (place()) { clearInterval(iv); }
                else if (tries > 20) { clearInterval(iv); placeFallback(); }
            }, 150);
        }

        load(function (data) {
            if (data) paint(data);
            console.log('[jojo recenze]', data ? 'živá data' : 'záloha', (data || FALLBACK).reviews.length);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
