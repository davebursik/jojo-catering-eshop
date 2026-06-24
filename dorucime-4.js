(function () {
  if (window.innerWidth < 768) return;

  var PRIMARY = '#4C1536';
  var GOLD    = '#DFC15E';

  var s = document.createElement('style');
  s.textContent = [
    '#joj-tb{background:' + PRIMARY + ';color:rgba(255,255,255,.9);padding:5px 20px;display:flex;align-items:center;justify-content:center;gap:0;font-family:var(--template-font),"Source Sans 3",sans-serif;font-size:12px;letter-spacing:.01em;white-space:nowrap;}',
    '.joj-d{width:6px;height:6px;border-radius:50%;background:#4ade80;display:inline-block;flex-shrink:0;animation:jojp 1.4s ease-in-out infinite;margin-right:7px;vertical-align:middle;}',
    '@keyframes jojp{0%,100%{opacity:1}50%{opacity:.2}}',
    '#joj-tb strong{color:' + GOLD + ';font-weight:700;}',
    '#joj-tb .sep{opacity:.25;margin:0 10px;font-size:14px;}',
    '#joj-deliv-btn{background:transparent;border:1px solid rgba(255,255,255,.3);color:rgba(255,255,255,.85);padding:3px 11px;border-radius:20px;cursor:pointer;font-size:11px;font-weight:600;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;transition:all .15s;font-family:inherit;margin-left:14px;letter-spacing:.01em;}',
    '#joj-deliv-btn:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.5);color:#fff;}',
    '#jojo-delivery-panel{display:none;background:#fff;padding:22px 0 20px;box-shadow:0 8px 28px rgba(0,0,0,.13);border-bottom:2px solid ' + PRIMARY + ';position:relative;}',
    '#joj-panel-close{position:absolute;top:10px;right:18px;background:none;border:none;cursor:pointer;font-size:18px;color:#aaa;line-height:1;padding:4px 6px;border-radius:4px;}',
    '#joj-panel-close:hover{color:#444;background:#f5f5f5;}',
  ].join('');
  document.head.appendChild(s);

  var bar = document.createElement('div');
  bar.id = 'joj-tb';
  document.body.insertBefore(bar, document.body.firstChild);

  var barText = document.createElement('span');
  barText.id = 'joj-time';

  var barBtn = document.createElement('button');
  barBtn.id = 'joj-deliv-btn';
  barBtn.innerHTML = '📍 Přidat adresu doručení <span id="joj-chv">▾</span>';

  bar.appendChild(barText);
  bar.appendChild(barBtn);

  // Panel
  var panel = document.createElement('div');
  panel.id = 'jojo-delivery-panel';

  var closeBtn = document.createElement('button');
  closeBtn.id = 'joj-panel-close';
  closeBtn.innerHTML = '✕';
  closeBtn.title = 'Zavřít';

  var panelInner = document.createElement('div');
  panelInner.style.cssText = 'max-width:560px;margin:0 auto;padding:0 20px;';

  var panelTitle = document.createElement('div');
  panelTitle.style.cssText = 'font-size:16px;font-weight:800;color:' + PRIMARY + ';margin-bottom:14px;';
  panelTitle.textContent = 'Doručujeme i k vám?';

  var widgetSlot = document.createElement('div');
  widgetSlot.id = 'jojo-topbar-widget';

  panelInner.appendChild(panelTitle);
  panelInner.appendChild(widgetSlot);
  panel.appendChild(closeBtn);
  panel.appendChild(panelInner);
  bar.insertAdjacentElement('afterend', panel);

  var panelOpen = false;

  function openPanel() {
    panelOpen = true;
    panel.style.display = 'block';
    document.getElementById('joj-chv').textContent = '▴';
    document.dispatchEvent(new CustomEvent('jojo:panel-open'));
  }

  function closePanel() {
    panelOpen = false;
    panel.style.display = 'none';
    document.getElementById('joj-chv').textContent = '▾';
  }

  barBtn.addEventListener('click', function () {
    panelOpen ? closePanel() : openPanel();
  });

  closeBtn.addEventListener('click', closePanel);

  function tick() {
    var now = new Date();
    var m   = now.getHours() * 60 + now.getMinutes();
    var rem = 13 * 60 - m;
    barText.innerHTML = rem > 0
      ? '<span class="joj-d"></span>Objednejte do <strong>13:00</strong> – objednávku doručíme již <strong>zítra</strong><span class="sep">|</span>zbývá <strong>' + (rem >= 60 ? Math.floor(rem / 60) + ' h ' + (rem % 60) + ' min' : rem + ' min') + '</strong>'
      : '<span class="joj-d"></span>Doručíme <strong>pozítří</strong><span class="sep">|</span>uzávěrka objednávek zítra ve <strong>13:00</strong>';
  }

  tick();
  setInterval(tick, 60000);
})();
