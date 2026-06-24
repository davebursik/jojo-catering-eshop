/* === JoJo Catering — Plovoucí tlačítko „Zavolat" === */
(function () {
  var style = document.createElement('style');
  style.textContent = `
    #joj-call{position:fixed;right:16px;bottom:80px;z-index:899;
      background:#4C1536;color:#fff;border-radius:50%;
      padding:15px;display:flex;align-items:center;
      cursor:pointer;box-shadow:0 4px 20px rgba(76,21,54,.4);
      text-decoration:none;transition:background .2s;}
    #joj-call:hover{background:#3a0f29;}
    #joj-call:visited{color:#fff;}
    @media(min-width:768px){#joj-call{display:none!important;}}
  `;
  document.head.appendChild(style);

  var btn = document.createElement('a');
  btn.id = 'joj-call';
  btn.href = 'tel:+420776003155';
  btn.setAttribute('aria-label', 'Zavolat');
  btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>';
  document.body.appendChild(btn);
})();
