/* === JoJo Catering — Horní lišta s uzávěrkou objednávek === */
(function () {
  var style = document.createElement('style');
  style.textContent = `
    #joj-topbar{
      position:fixed;top:0;left:0;right:0;z-index:99999;
      background:#4C1536;color:#fff;
      padding:10px 16px;
      display:flex;align-items:center;justify-content:center;gap:8px;
      font-family:var(--template-font),"Source Sans 3",sans-serif;
      font-size:14px;line-height:1.3;
      box-shadow:0 2px 8px rgba(76,21,54,.25);}
    .joj-dot{width:8px;height:8px;border-radius:50%;background:#4ade80;
      display:inline-block;flex-shrink:0;
      animation:joj-pulse 1.4s ease-in-out infinite;}
    @keyframes joj-pulse{0%,100%{opacity:1;}50%{opacity:.2;}}
    #joj-topbar strong{color:#DFC15E;font-weight:700;}
    #joj-topbar .joj-sep{opacity:.4;margin:0 4px;}
    @media(max-width:480px){#joj-topbar{font-size:12px;padding:8px 12px;}}
  `;
  document.head.appendChild(style);

  var bar = document.createElement('div');
  bar.id = 'joj-topbar';
  document.body.appendChild(bar);

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

  // Posuň obsah stránky dolů o výšku lišty
  setTimeout(function () {
    var h = bar.offsetHeight;
    var pageHeader = document.querySelector('header, #header, .header');
    if (pageHeader) {
      var pos = window.getComputedStyle(pageHeader).position;
      if (pos === 'fixed' || pos === 'sticky') {
        pageHeader.style.top = h + 'px';
      }
    }
    document.body.style.paddingTop = (parseInt(document.body.style.paddingTop || 0) + h) + 'px';
  }, 200);
})();
