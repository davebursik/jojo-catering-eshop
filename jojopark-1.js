/*!
 * Jojo Park eshop – vlastní úpravy pro Shoptet
 * 1) Banner na úvodní stránce (HTML + CSS, bez obrázku, responzivní)
 * 2) Volba počtu kusů (− 1 +) u produktů ve výpisu i v detailu
 */
(function () {
  'use strict';

  var VOUCHERS_URL = '/darkove-poukazy/';

  /* ---------- CSS ---------- */
  var css = `
  /* ===== Banner ===== */
  .jj-banner{position:relative;overflow:hidden;margin:0 0 32px;border-radius:20px;
    background:linear-gradient(135deg,#6a9be8 0%,#5b8de0 55%,#7fb0f0 100%);
    color:#fff;font-family:inherit;box-shadow:0 8px 24px rgba(30,60,120,.25)}
  .jj-banner *{box-sizing:border-box}
  .jj-banner__flake{position:absolute;color:rgba(255,255,255,.22);font-size:46px;line-height:1;pointer-events:none;user-select:none}
  .jj-banner__ribbon{position:absolute;top:22px;left:-52px;width:220px;padding:6px 0;background:#d61c14;
    color:#fff;text-align:center;font-weight:700;font-size:13px;transform:rotate(-35deg);box-shadow:0 2px 6px rgba(0,0,0,.25);z-index:2}
  .jj-banner__inner{display:flex;align-items:center;justify-content:space-between;gap:32px;
    padding:48px 48px 40px 80px;position:relative;z-index:1}
  .jj-banner__text{flex:1 1 52%;min-width:0}
  .jj-banner__title{margin:0 0 12px;font-size:clamp(30px,4.6vw,56px);line-height:1.05;font-weight:800;
    letter-spacing:.5px;text-transform:uppercase;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.12)}
  .jj-banner__lead{margin:0 0 22px;font-size:clamp(16px,1.8vw,20px);line-height:1.45;font-style:italic;font-weight:600;color:#fff;max-width:520px}
  .jj-banner__cta{display:inline-block;padding:14px 30px;border-radius:999px;background:#8dba1a;color:#fff!important;
    font-weight:800;font-size:18px;text-decoration:none!important;box-shadow:0 4px 0 #5f8110;transition:transform .15s,box-shadow .15s}
  .jj-banner__cta:hover{transform:translateY(2px);box-shadow:0 2px 0 #5f8110}
  .jj-banner__from{display:block;margin-top:12px;font-size:14px;opacity:.9}
  .jj-banner__art{flex:1 1 44%;position:relative;min-height:230px;max-width:470px}
  .jj-ticket{position:absolute;width:62%;border-radius:10px;overflow:hidden;background:#8dba1a;color:#fff;
    box-shadow:0 8px 18px rgba(0,0,0,.28);padding:12px 14px 34px;font-weight:800;line-height:1.05}
  .jj-ticket b{display:block;font-size:clamp(17px,2vw,24px)}
  .jj-ticket small{position:absolute;left:0;right:0;bottom:0;padding:6px 14px;background:#00a9c9;font-size:12px;font-weight:700}
  .jj-ticket--a{top:0;left:0;background:#fff;color:#0b7c8f;transform:rotate(-7deg)}
  .jj-ticket--b{top:34px;right:0;transform:rotate(5deg);z-index:1}
  .jj-ticket--c{bottom:0;left:12%;background:#6f7173;transform:rotate(-2deg);z-index:2}
  .jj-ticket--c small{background:#8dba1a}
  .jj-faces{position:absolute;right:6%;bottom:2px;display:flex;gap:6px;z-index:3}
  .jj-face{position:relative;width:54px;height:54px;border-radius:50%;box-shadow:inset -5px -5px 0 rgba(0,0,0,.12),0 3px 6px rgba(0,0,0,.25)}
  .jj-face::before{content:"";position:absolute;top:15px;left:12px;width:30px;height:12px;
    background:radial-gradient(circle,#fff 0 4px,transparent 4.5px) 0 0/16px 12px repeat-x}
  .jj-face::after{content:"";position:absolute;left:16px;bottom:11px;width:22px;height:10px;
    border:3px solid #3a2200;border-top:0;border-radius:0 0 22px 22px}
  .jj-face--g{background:#8dba1a}.jj-face--o{background:#f39200}.jj-face--p{background:#e6338a}
  @media (max-width:768px){
    .jj-banner{border-radius:14px}
    .jj-banner__inner{flex-direction:column;align-items:flex-start;padding:64px 22px 26px}
    .jj-banner__art{width:100%;max-width:none;min-height:200px}
    .jj-ticket{width:58%}
  }

  /* ===== Počet kusů ===== */
  .jj-qty{display:inline-flex;align-items:stretch;border:1px solid #c9d2dc;border-radius:8px;overflow:hidden;background:#fff;margin:0 8px 8px 0;vertical-align:middle}
  .jj-qty button{width:34px;border:0;background:#eef3f8;color:#00829b;font-size:20px;font-weight:700;cursor:pointer;line-height:1;padding:0}
  .jj-qty button:hover{background:#dbe7f2}
  .jj-qty input{width:46px;border:0!important;text-align:center;font-weight:700;font-size:16px;padding:6px 0!important;margin:0!important;
    box-shadow:none!important;background:#fff!important;-moz-appearance:textfield}
  .jj-qty input::-webkit-outer-spin-button,.jj-qty input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
  .jj-qty-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:6px;margin-top:8px}
  `;

  function addStyle() {
    var s = document.createElement('style');
    s.id = 'jj-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ---------- 1) BANNER ---------- */
  function buildBanner() {
    if (document.getElementById('jj-banner')) return;
    var isHome = document.body.classList.contains('in-index') || location.pathname === '/';
    if (!isHome) return;

    var el = document.createElement('section');
    el.id = 'jj-banner';
    el.className = 'jj-banner';
    el.innerHTML =
      '<span class="jj-banner__flake" style="top:10%;right:44%">❄</span>' +
      '<span class="jj-banner__flake" style="bottom:8%;left:46%;font-size:34px">❄</span>' +
      '<span class="jj-banner__flake" style="top:14%;right:4%;font-size:60px">❄</span>' +
      '<div class="jj-banner__ribbon">Vánoční inspirace</div>' +
      '<div class="jj-banner__inner">' +
        '<div class="jj-banner__text">' +
          '<h2 class="jj-banner__title">Dárek pro děti<br>i dospělé</h2>' +
          '<p class="jj-banner__lead">Celodenní vstup do našeho rodinného centra ocení všichni, kteří chtějí prožít se svými dětmi spoustu zábavy…</p>' +
          '<a class="jj-banner__cta" href="' + VOUCHERS_URL + '">Vybrat dárkový poukaz</a>' +
          '<span class="jj-banner__from">Poukazy od 80 Kč · platnost na celodenní vstup</span>' +
        '</div>' +
        '<div class="jj-banner__art" aria-hidden="true">' +
          '<div class="jj-ticket jj-ticket--a"><b>Dárkový<br>poukaz</b><small>Po–Pá · dětský vstup</small></div>' +
          '<div class="jj-ticket jj-ticket--b"><b>Dárkový<br>poukaz</b><small>So · Ne · svátky</small></div>' +
          '<div class="jj-ticket jj-ticket--c"><b>Rodinná vstupenka<br>2+2 · 1+2</b><small>celodenní vstup</small></div>' +
          '<div class="jj-faces"><i class="jj-face jj-face--g"></i><i class="jj-face jj-face--o"></i><i class="jj-face jj-face--p"></i></div>' +
        '</div>' +
      '</div>';

    var targets = ['.homepage-box', '#content .content-wrapper-in', '#content-wrapper', '#content', 'main'];
    for (var i = 0; i < targets.length; i++) {
      var t = document.querySelector(targets[i]);
      if (t) { t.insertBefore(el, t.firstChild); return; }
    }
  }

  /* ---------- 2) POČET KUSŮ ---------- */
  function clampQty(v) {
    v = parseInt(v, 10);
    return isNaN(v) || v < 1 ? 1 : (v > 99 ? 99 : v);
  }

  function makeStepper(input) {
    var wrap = document.createElement('span');
    wrap.className = 'jj-qty';
    var minus = document.createElement('button');
    minus.type = 'button'; minus.textContent = '−'; minus.setAttribute('aria-label', 'Méně');
    var plus = document.createElement('button');
    plus.type = 'button'; plus.textContent = '+'; plus.setAttribute('aria-label', 'Více');
    minus.onclick = function () { input.value = clampQty((+input.value || 1) - 1); };
    plus.onclick = function () { input.value = clampQty((+input.value || 1) + 1); };
    input.addEventListener('change', function () { input.value = clampQty(input.value); });
    wrap.appendChild(minus); wrap.appendChild(input); wrap.appendChild(plus);
    return wrap;
  }

  function enhanceForm(form) {
    if (form.dataset.jjQty) return;
    var btn = form.querySelector('.add-to-cart-button, button[type="submit"], input[type="submit"]');
    if (!btn) return;
    form.dataset.jjQty = '1';

    var input = form.querySelector('input[name="amount"]');
    if (input && input.type !== 'hidden' && input.closest('.quantity, .amount')) {
      // Shoptet už počet nabízí – jen sjednotíme vzhled, pokud není
      return;
    }
    if (!input) {
      input = document.createElement('input');
      input.name = 'amount';
    }
    input.type = 'number';
    input.min = '1'; input.max = '99'; input.value = '1';
    input.inputMode = 'numeric';
    input.setAttribute('aria-label', 'Počet kusů');

    var stepper = makeStepper(input);
    var row = document.createElement('div');
    row.className = 'jj-qty-row';
    btn.parentNode.insertBefore(row, btn);
    row.appendChild(stepper);
    row.appendChild(btn);
  }

  function enhanceQuantities(root) {
    var forms = (root || document).querySelectorAll(
      '.product form.pr-action, .products .product form, .p-detail-inner form.pr-action, form#product-detail-form'
    );
    Array.prototype.forEach.call(forms, enhanceForm);
  }

  /* ---------- start ---------- */
  function init() {
    if (!document.getElementById('jj-style')) addStyle();
    buildBanner();
    enhanceQuantities();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Shoptet dotahuje produkty AJAXem (filtry, „načíst další“) → znovu projdeme
  document.addEventListener('ShoptetDOMPageContentLoaded', init);
  document.addEventListener('ShoptetDOMContentLoaded', init);
})();
