/* === JoJo Catering — Horní lišta s uzávěrkou objednávek === */
(function () {
  var style = document.createElement('style');
  style.textContent = `
    #joj-topbar{background:#4C1536;color:#fff;text-align:center;
      padding:9px 16px;display:flex;align-items:center;
      justify-content:center;gap:8px;
      font-family:var(--template-font),"Source Sans 3",sans-serif;font-size:14px;}
    .joj-dot{width:9px;height:9px;border-radius:50%;background:#4ade80;
      display:inline-block;flex-shrink:0;
      animation:joj-pulse 1.4s ease-in-out infinite;}
    @keyframes joj-pulse{0%,100%{opacity:1;}50%{opacity:.25;}}
    #joj-topbar strong{color:#DFC15E;}
  `;
  document.head.appendChild(style);

  var bar = document.createElement('div');
  bar.id = 'joj-topbar';
  document.body.insertBefore(bar, document.body.firstChild);

  function update() {
    var now = new Date();
    var mins = now.getHours() * 60 + now.getMinutes();
    var cutoff = 13 * 60;

    if (mins < cutoff) {
      var rem = cutoff - mins;
      var rh = Math.floor(rem / 60);
      var rm = rem % 60;
      var cas = rh > 0 ? rh + ' h ' + rm + ' min' : rm + ' min';
      bar.innerHTML = '<span class="joj-dot"></span> Objednejte do <strong>13:00</strong> a doručíme již <strong>zítra</strong> — zbývá ' + cas + '.';
    } else {
      bar.innerHTML = '<span class="joj-dot"></span> Objednávejte nyní — doručíme <strong>pozítří</strong>. Uzávěrka zítra ve <strong>13:00</strong>.';
    }
  }

  update();
  setInterval(update, 60000);
})();
