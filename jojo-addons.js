/* === JoJo Catering — Eshop doplňky === */

/* --- Sticky mobilní lišta „Do košíku" na detailu produktu --- */
(function () {
  var css = `
    #joj-sticky{position:fixed;left:0;right:0;bottom:0;z-index:900;
      transform:translateY(115%);transition:transform .25s ease;
      display:flex;align-items:center;gap:8px;
      padding:10px 12px;padding-bottom:calc(10px + env(safe-area-inset-bottom));
      background:#fff;border-top:1px solid #ece3d6;box-shadow:0 -6px 22px rgba(76,21,54,.14);
      font-family:var(--template-font),"Source Sans 3",sans-serif;}
    #joj-sticky.joj-show{transform:translateY(0);}
    .joj-sb-info{display:flex;flex-direction:column;line-height:1.15;min-width:0;}
    .joj-sb-name{font-size:11px;color:#857c87;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:34vw;}
    .joj-sb-price{font-family:var(--template-headings-font),"Exo 2",sans-serif;font-weight:700;font-size:17px;color:#4C1536;white-space:nowrap;}
    .joj-sb-qty{display:flex;align-items:center;border:1px solid #e0d8cb;border-radius:9px;overflow:hidden;margin-left:auto;}
    .joj-sb-qty button{width:32px;height:38px;border:0;background:#f7f1e8;color:#4C1536;font-size:19px;line-height:1;cursor:pointer;}
    .joj-sb-qty span{min-width:24px;text-align:center;font-weight:600;font-size:14px;color:#3d3340;}
    .joj-sb-add{background:#4C1536;color:#fff;border:0;border-radius:10px;cursor:pointer;
      font-family:var(--template-headings-font),"Exo 2",sans-serif;font-weight:700;font-size:15px;padding:12px 16px;white-space:nowrap;}
    .joj-sb-add:active{background:#3a0f29;}
    @media(min-width:768px){#joj-sticky{display:none!important;}}
  `;
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function init() {
    if (!document.body.classList.contains('type-product')) return;
    if (document.getElementById('joj-sticky')) return;
    var form = document.querySelector('form[action="/action/Cart/addCartItem/"]');
    if (!form) return;
    var realBtn = form.querySelector('[data-testid="buttonAddToCart"]') || form.querySelector('button[type="submit"]');
    var amtInput = form.querySelector('input[name="amount"]');
    if (!realBtn) return;
    var priceEl = document.querySelector('[data-testid="productCardPrice"]');
    var price = priceEl ? priceEl.textContent.trim().replace(/\s+/g, ' ') : '';
    var nameEl = document.querySelector('h1');
    var name = nameEl ? nameEl.textContent.trim() : '';
    var bar = document.createElement('div');
    bar.id = 'joj-sticky';
    bar.innerHTML =
      '<div class="joj-sb-info"><span class="joj-sb-name">' + name + '</span><span class="joj-sb-price">' + price + '</span></div>' +
      '<div class="joj-sb-qty"><button type="button" aria-label="Méně">−</button><span>1</span><button type="button" aria-label="Více">+</button></div>' +
      '<button type="button" class="joj-sb-add">Do košíku</button>';
    document.body.appendChild(bar);
    var qBtns = bar.querySelectorAll('.joj-sb-qty button');
    var qSpan = bar.querySelector('.joj-sb-qty span');
    function getQ() { return parseInt(qSpan.textContent, 10) || 1; }
    function setQ(v) {
      v = Math.max(1, v);
      qSpan.textContent = v;
      if (amtInput) { amtInput.value = v; amtInput.dispatchEvent(new Event('change', { bubbles: true })); }
    }
    if (amtInput) { var s = parseInt(amtInput.value, 10); if (s > 1) setQ(s); }
    qBtns[0].addEventListener('click', function () { setQ(getQ() - 1); });
    qBtns[1].addEventListener('click', function () { setQ(getQ() + 1); });
    bar.querySelector('.joj-sb-add').addEventListener('click', function () {
      if (amtInput) amtInput.value = getQ();
      realBtn.click();
    });
    function onScroll() {
      var r = realBtn.getBoundingClientRect();
      var visible = (r.top < window.innerHeight - 40 && r.bottom > 0);
      bar.classList.toggle('joj-show', !visible);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
