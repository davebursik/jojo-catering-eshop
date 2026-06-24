(function () {
  if (window.innerWidth < 768) return;

  var PRIMARY = '#4C1536';

  var s = document.createElement('style');
  s.textContent = [
    '#joj-tb{background:' + PRIMARY + ';color:#fff;padding:8px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;font-family:var(--template-font),"Source Sans 3",sans-serif;font-size:14px;white-space:nowrap;box-shadow:0 2px 6px rgba(76,21,54,.2);}',
    '.joj-d{width:8px;height:8px;border-radius:50%;background:#4ade80;display:inline-block;flex-shrink:0;animation:jojp 1.4s ease-in-out infinite;}',
    '@keyframes jojp{0%,100%{opacity:1}50%{opacity:.2}}',
    '#joj-tb strong{color:#DFC15E;font-weight:700;}',
    '#joj-tb .sep{opacity:.4;margin:0 8px;}',
    '#joj-deliv-btn{background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.28);color:#fff;padding:5px 14px;border-radius:20px;cursor:pointer;font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px;white-space:nowrap;transition:background .15s;font-family:inherit;line-height:1.4;}',
    '#joj-deliv-btn:hover{background:rgba(255,255,255,.24);}',
    '#jojo-delivery-panel{display:none;background:#fff;padding:20px 0 18px;box-shadow:0 8px 24px rgba(0,0,0,.12);border-bottom:2px solid ' + PRIMARY + ';}',
  ].join('');
  document.head.appendChild(s);

  // Lišta
  var bar = document.createElement('div');
  bar.id = 'joj-tb';
  document.body.insertBefore(bar, document.body.firstChild);

  var barLeft = document.createElement('div');
  barLeft.style.cssText = 'display:flex;align-items:center;gap:8px;';

  var barBtn = document.createElement('button');
  barBtn.id = 'joj-deliv-btn';
  barBtn.innerHTML = '📍 Doručíme k vám? <span id="joj-chv">▾</span>';

  bar.appendChild(barLeft);
  bar.appendChild(barBtn);

  // Panel pod lištou
  var panel = document.createElement('div');
  panel.id = 'jojo-delivery-panel';

  var panelInner = document.createElement('div');
  panelInner.style.cssText = 'max-width:640px;margin:0 auto;padding:0 20px;';

  var panelTitle = document.createElement('div');
  panelTitle.style.cssText = 'font-size:15px;font-weight:700;color:' + PRIMARY + ';margin-bottom:12px;';
  panelTitle.textContent = 'Zadejte adresu doručení';

  var widgetSlot = document.createElement('div');
  widgetSlot.id = 'jojo-topbar-widget';

  panelInner.appendChild(panelTitle);
  panelInner.appendChild(widgetSlot);
  panel.appendChild(panelInner);
  bar.insertAdjacentElement('afterend', panel);

  // Toggle panelu
  var panelOpen = false;
  barBtn.addEventListener('click', function () {
    panelOpen = !panelOpen;
    panel.style.display = panelOpen ? 'block' : 'none';
    document.getElementById('joj-chv').textContent = panelOpen ? '▴' : '▾';
    if (panelOpen) {
      document.dispatchEvent(new CustomEvent('jojo:panel-open'));
    }
  });

  document.addEventListener('click', function (e) {
    if (panelOpen && !bar.contains(e.target) && !panel.contains(e.target)) {
      panelOpen = false;
      panel.style.display = 'none';
      document.getElementById('joj-chv').textContent = '▾';
    }
  });

  // Časovač
  function tick() {
    var now = new Date();
    var m   = now.getHours() * 60 + now.getMinutes();
    var rem = 13 * 60 - m;
    barLeft.innerHTML = rem > 0
      ? '<span class="joj-d"></span><span>🚚 Objednejte do <strong>13:00</strong> — doručíme již <strong>zítra</strong><span class="sep">|</span>zbývá <strong>' + (rem >= 60 ? Math.floor(rem / 60) + ' h ' + (rem % 60) + ' min' : rem + ' min') + '</strong></span>'
      : '<span class="joj-d"></span><span>🚚 Doručíme <strong>pozítří</strong><span class="sep">|</span>uzávěrka zítra ve <strong>13:00</strong></span>';
  }

  tick();
  setInterval(tick, 60000);
})();
