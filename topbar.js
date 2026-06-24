/* === JoJo Catering — Horní lišta s uzávěrkou objednávek === */
(function () {
  var style = document.createElement('style');
  style.textContent = `
    #joj-topbar{
      background:#4C1536;color:#fff;
      padding:10px 16px;
      display:flex;align-items:center;justify-content:center;gap:8px;
      font-family:var(--template-font),"Source Sans 3",sans-serif;
      font-size:14px;line-height:1.3;
      position:relative;z-index:99999;
      box-shadow:0 2px 8px rgba(76,21,54,.25);}
    .joj-dot{width:8px;height:8px;border-radius:50%;background:#4ade80;
      display:inline-block;flex-shrink:0;
      animation:joj-pulse 1.4s ease-in-out infinite;}
    @keyframes joj-pulse{0%,100%{opacity:1;}50%{opacity:.2;}}
    #joj-topbar strong{color:#DFC15E;font-weight:700;}
    #joj-topbar .joj-sep{opacity:.4;margin:0 4px;}
    @media(max-width:480px){#joj-topbar{font-size:12px;padding:9px 12px;}}
  `;
  document.head.appendChild(style);

  var bar = document.createElement('div');
  bar.id = 'joj-topbar';

  var target = document.body.firstElementChild;
  document.body.insertBefore(bar, target);

  function update() {
    var now = new Date();
    var mins = now.getHours() * 60 + now.getMinutes();
    var cutoff = 13 * 60;

    if (mins < cutoff) {
      var rem = cutoff - mins;
      var rh = Math.floor(rem / 60);
      var rm = rem % 60;
      var cas = rh > 0 ? '<strong>' + rh + ' h ' + rm + ' min</strong>' : '<strong>' + rm + ' min</strong>';
      bar.innerHTML = '<span class="joj-dot"></span> 🚚 Objednejte do <strong>13:00</strong> — doručíme již <strong>zítra</strong><span class="joj-sep">|</span>zbývá ' + cas;
    } else {
      bar.innerHTML = '<span class="joj-dot"></span> 🚚 Objednejte nyní — doručíme <strong>pozítří</strong><span class="joj-sep">|</span>uzávěrka zítra ve <strong>13:00</strong>';
    }
  }

  update();
  setInterval(update, 60000);
})();
