/* (v56) target frame: a smaller card with a level badge, coloured element / size / race chips, an element-tinted frame
   and a jewelled HP bar. Everything is still (no blinking); the card always sits in the middle of the screen. */
const TF_EC = {neutral:'#8a8478',earth:'#a2682a',water:'#1f74c9',fire:'#d8401f',wind:'#1f9a6a',holy:'#c9971a',shadow:'#6b3fb0',poison:'#7a9a1a'};
{ const _ut = updTarget;
  updTarget = function(){ const m = P.target, box = el('target'), fresh = m && !m.dead && box && box._tf !== m;
    const r = _ut.apply(this, arguments);
    if (!fresh) { if (!m || m.dead) box && (box._tf = null); return r; }
    box._tf = m; const d = m.def, ec = TF_EC[d.elem] || TF_EC.neutral;
    box.style.setProperty('--ec', ec);
    el('tName').innerHTML = `<span class="tflv">Lv ${d.lvl}</span><span class="tfnm">${escH(nm(d))}</span>`;
    el('tMeta').innerHTML = [[elemName(d.elem), ec, '◆'], [L(SIZE_TH[d.size], SIZE_EN[d.size]), '#5a6b85', '⬍'], [L(RACE_TH[d.race], RACE_EN[d.race]), '#8a4a2a', '✦']]
      .map(([t, c, i]) => `<span class="tfc" style="--c:${c}"><em>${i}</em>${escH(t)}</span>`).join('');
    const em = el('tEm'), v = parseInt(em.textContent.replace(/\D+/g, ''), 10) || 100;
    em.className = 'em ' + (v > 100 ? 'up' : v < 100 ? 'dn' : 'eq'); em.style.color = '';
    return r; }; }
{ const st = document.createElement('style');
  st.textContent = `
  html body #ui.ui #target{width:236px !important;min-width:0 !important;padding:6px 9px 7px 12px !important;border-radius:14px !important;
    background:linear-gradient(180deg,#fffef8 0%,#fff4dc 100%) padding-box,linear-gradient(120deg,var(--ec,#f5b52e) 0%,#ffcf4a 35%,#ff7a59 60%,#c55cf0 85%,var(--ec,#3fa2f0) 100%) border-box !important;
    box-shadow:0 0 0 1px rgba(255,255,255,.9),0 3px 0 rgba(90,40,0,.22),0 6px 16px rgba(0,0,0,.18),0 0 18px color-mix(in srgb,var(--ec,#f5b52e) 45%,transparent) !important}
  html body #ui.ui #target[data-mid="1"]{left:50% !important;right:auto !important;transform:translateX(-50%) !important}
  html body #ui.ui #target::before{content:'';position:absolute;left:3px;top:6px;bottom:6px;width:4px;border-radius:3px;opacity:1;
    background:linear-gradient(180deg,#fff,var(--ec,#f5b52e) 40%,color-mix(in srgb,var(--ec,#f5b52e) 60%,#000)) !important}
  html body #ui.ui #target::after{content:'';position:absolute;left:12px;right:12px;top:3px;height:42%;border-radius:10px 10px 40% 40%;pointer-events:none;background:linear-gradient(180deg,rgba(255,255,255,.6),rgba(255,255,255,0))}
  html body #ui.ui #target .tn{align-items:center !important;gap:6px !important}
  html body #ui.ui #target #tName{display:flex;align-items:center;gap:5px;min-width:0;font:800 13px/1.2 Sarabun,sans-serif !important;color:#141414 !important}
  html body #ui.ui #target .tflv{flex:none;font:800 10.5px/1 Sarabun,sans-serif;color:#fff;padding:3px 6px;border-radius:8px;
    background:linear-gradient(180deg,color-mix(in srgb,var(--ec,#f5b52e) 70%,#fff),color-mix(in srgb,var(--ec,#f5b52e) 75%,#000));box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 1px 2px rgba(0,0,0,.3);text-shadow:0 1px 0 rgba(0,0,0,.35)}
  html body #ui.ui #target .tfnm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  html body #ui.ui #target .em{flex:none;font:800 10px/1 Sarabun,sans-serif !important;padding:3px 6px;border-radius:8px;border:1.5px solid;text-shadow:none !important}
  html body #ui.ui #target .em.up{color:#0d5a34 !important;background:#d9f7e6;border-color:#2fae6a}
  html body #ui.ui #target .em.dn{color:#8a1a14 !important;background:#ffe1dc;border-color:#e0523f}
  html body #ui.ui #target .em.eq{color:#3a3530 !important;background:#f1ebe0;border-color:#b9ad98}
  html body #ui.ui #target #tMeta{display:flex !important;gap:4px;flex-wrap:wrap;margin:4px 0 5px !important}
  html body #ui.ui #target .tfc{display:inline-flex;align-items:center;gap:3px;font:700 10.5px/1.25 Sarabun,sans-serif;color:#141414;padding:1px 6px 1px 4px;border-radius:7px;
    background:color-mix(in srgb,var(--c) 14%,#fff);border:1.5px solid color-mix(in srgb,var(--c) 70%,#fff)}
  html body #ui.ui #target .tfc em{font-style:normal;font-size:9px;color:var(--c)}
  html body #ui.ui #target .bar{height:9px !important;border-radius:6px !important;background:linear-gradient(180deg,#5a3a2a,#2a1a12) !important;box-shadow:inset 0 1px 2px rgba(0,0,0,.5),0 0 0 1.5px #fff,0 0 0 3px color-mix(in srgb,var(--ec,#f5b52e) 55%,#fff) !important;overflow:hidden}
  html body #ui.ui #target .bar i:not(.ghost){background:
    repeating-linear-gradient(115deg,rgba(255,255,255,.18) 0 6px,rgba(255,255,255,0) 6px 12px),
    linear-gradient(180deg,#ffd6cc 0%,#ff6a5c 40%,#d61f3c 75%,#9a0f28 100%) !important;box-shadow:inset 0 1px 0 rgba(255,255,255,.75),0 0 8px rgba(255,90,80,.55) !important}
  html body #ui.ui #target .bar i.ghost{background:#ffd27a !important}
  html body #ui.ui #target.boss{background:linear-gradient(180deg,#fffaf0 0%,#f6e6ff 100%) padding-box,linear-gradient(120deg,#ffcf4a 0%,#ff5a5a 30%,#a24ae0 60%,#ffcf4a 100%) border-box !important;
    box-shadow:0 0 0 1px #fff,0 3px 0 rgba(80,20,110,.3),0 6px 18px rgba(0,0,0,.2),0 0 24px rgba(162,74,224,.45) !important}
  html body #ui.ui #target.boss{width:270px !important}
  html body #ui.ui #target.boss .tflv{background:linear-gradient(180deg,#ffdb6a,#b06a00)}
  html body #ui.ui #target.boss .tfnm::before{content:'👑 '}
  @media (max-width:700px){html body #ui.ui #target{width:212px !important}}`;
  document.head.appendChild(st); }
