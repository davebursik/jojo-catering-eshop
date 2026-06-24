(function () {
  if (window.innerWidth < 768) return;

  var s = document.createElement('style');
  s.textContent = '#joj-tb{background:#4C1536;color:#fff;padding:10px 16px;display:flex;align-items:center;justify-content:center;gap:8px;font-family:var(--template-font),"Source Sans 3",sans-serif;font-size:14px;white-space:nowrap;box-shadow:0 2px 6px rgba(76,21,54,.2)}.joj-d{width:8px;height:8px;border-radius:50%;background:#4ade80;display:inline-block;flex-shrink:0;animation:jojp 1.4s ease-in-out infinite}@keyframes jojp{0%,100%{opacity:1}50%{opacity:.2}}#joj-tb strong{color:#DFC15E;font-weight:700}#joj-tb .sep{opacity:.4;margin:0 6px}';
  document.head.appendChild(s);

  var bar = document.createElement('div');
  bar.id = 'joj-tb';
  document.body.insertBefore(bar, document.body.firstChild);

  function tick() {
    var now = new Date();
    var m = now.getHours() * 60 + now.getMinutes();
    var rem = 13 * 60 - m;
    bar.innerHTML = rem > 0
      ? '<span class="joj-d"></span><span>🚚 Objednejte do <strong>13:00</strong> — doručíme již <strong>zítra</strong><span class="sep">|</span>zbývá <strong>' + (rem >= 60 ? Math.floor(rem/60) + ' h ' + rem%60 + ' min' : rem + ' min') + '</strong></span>'
      : '<span class="joj-d"></span><span>🚚 Doručíme <strong>pozítří</strong><span class="sep">|</span>uzávěrka zítra ve <strong>13:00</strong></span>';
  }

  tick();
  setInterval(tick, 60000);
})();
