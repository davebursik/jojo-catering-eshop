/* === JoJo Catering — Lišta uzávěrky objednávek === */
(function () {
  var style = document.createElement('style');
  style.textContent = `
    #joj-topbar{
      background:#4C1536;color:#fff;
      padding:10px 16px;
      display:flex;align-items:center;justify-content:center;gap:8px;
      font-family:var(--template-font),"Source Sans 3",sans-serif;
      font-size:14px;line-height:1;white-space:nowrap;
      box-shadow:0 2px 6px rgba(76,21,54,.2);}
    .joj-dot{width:8px;height:8px;border-radius:50%;background:#4ade80;
      display:inline-block;flex-shrink:0;
      animation:joj-pulse 1.4s ease-in-out infinite;}
    @keyframes joj-pulse{0%,100%{opacity:1;}50%{opacity:.2;}}
    #joj-topbar strong{color:#DFC15E;font-weight:700;}
    #joj-topbar .joj-sep{opacity:.4;margin:0 6px;}
    @media(max-width:600px){#joj-topbar{font-size:12px;padding:9px 10px;}}
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
      var cas = Math.floor(rem / 60) > 0
        ? Math.floor(rem / 60) + ' h ' + (rem % 60) + ' min'
        : (rem % 60) + ' min';
      bar.innerHTML =
        '<span class="joj-dot"></span>' +
        '<span>🚚 Objednejte do <strong>13:00</strong> — doručíme již <strong>zítra</strong>' +
        '<span class="joj-sep">|</span>zbývá <strong>' + cas + '</strong></span>';
    } else {
      bar.innerHTML =
        '<span class="joj-dot"></span>' +
        '<span>🚚 Doručíme <strong>pozítří</strong>' +
        '<span class="joj-sep">|</span>uzávěrka zítra ve <strong>13:00</strong></span>';
    }
  }

  update();
  setInterval(update, 60000);

  setTimeout(function () {
    if (window.innerWidth >= 768) return;
    var fixedEls = [];
    document.querySelectorAll('body > *, body > * > *').forEach(function (el) {
      if (el === bar) return;
      var cs = window.getComputedStyle(el);
      if (cs.position === 'fixed' && cs.top === '0px') fixedEls.push(el);
    });
    if (!fixedEls.length) return;

    var origPadding = parseInt(window.getComputedStyle(document.body).paddingTop) || 0;

    function adjustHeader() {
      var barBottom = Math.max(0, bar.getBoundingClientRect().bottom);
      fixedEls.forEach(function (el) { el.style.top = barBottom + 'px'; });
      document.body.style.paddingTop = (origPadding + barBottom) + 'px';
    }

    adjustHeader();
    window.addEventListener('scroll', adjustHeader, { passive: true });
  }, 400);
})();
