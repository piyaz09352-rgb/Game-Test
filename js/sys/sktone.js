/* (v56) every skill gets its own bright jewel colour, in the hotbar, the touch buttons and the skill tree alike:
   the element's colour when it has one, otherwise a colour for what it does (heal pink, buff gold, passive teal,
   strike orange, area red, ranged blue, summon violet, trick purple). The picture stays white on top. */
const SK_TONE = {fire:['#ff5a1f', '#8a1c00'], water:['#1fa2ff', '#0a3f8a'], wind:['#1fd17a', '#086b3c'], earth:['#e08a2a', '#6b3a08'],
  holy:['#ffc81f', '#8a5a00'], shadow:['#9a4bff', '#3a1080'], poison:['#7ccf2a', '#2f6b08'],
  heal:['#ff4f9a', '#8a0f48'], buff:['#ffb21f', '#8a4a00'], passive:['#17b8b0', '#0a5552'], strike:['#ff7a2a', '#8a2a00'], area:['#ff3f4f', '#8a0a1a'],
  ranged:['#3a86ff', '#0f347f'], summon:['#c94bff', '#5a0f8a'], trick:['#7a5cf0', '#2f1a80'], move:['#21c4e0', '#0a5a6a']};
function skTone(id){
  const s = SKILLS[id]; if (!s) return SK_TONE.buff;
  if (s.elem && SK_TONE[s.elem] && s.elem !== 'neutral') return SK_TONE[s.elem];
  const t = s.type || '';
  if (t === 'passive') return SK_TONE.passive;
  if (/heal|restore|bond/.test(t) || s.heal) return SK_TONE.heal;
  if (/buff|command/.test(t)) return SK_TONE.buff;
  if (/summon|conjure|petcall/.test(t)) return SK_TONE.summon;
  if (/aoe|field|line/.test(t)) return SK_TONE.area;
  if (/bolt|ranged|stone|trap/.test(t)) return SK_TONE.ranged;
  if (/debuff|steal/.test(t)) return SK_TONE.trick;
  if (/dash|blink|backstep/.test(t)) return SK_TONE.move;
  return SK_TONE.strike;
}
const skPaint = (e, id) => { if (!e || !id) return; const [c, d] = skTone(id); e.style.setProperty('--ec', c); e.style.setProperty('--ed', d); e.classList.add('skj'); };
function skPaintAll(){
  for (const b of document.querySelectorAll('#hotbar .hk[data-hot]')){ const h = hotbarDef()[+b.dataset.hot]; if (h && h.k === 'skill') skPaint(b, h.id); }
  for (const b of document.querySelectorAll('.mo.sk[data-id]')) skPaint(b, b.dataset.id);
  for (const n of document.querySelectorAll('#pane-skill .skn[data-node]')) skPaint(n, n.dataset.node);
  const d = document.querySelector('#pane-skill .skdetail'); if (d && typeof SKSEL !== 'undefined') skPaint(d, SKSEL);
}
{ const _rh = renderHotbar; renderHotbar = function(){ const r = _rh.apply(this, arguments); skPaintAll(); return r; }; }
{ const _rs = renderSkills; renderSkills = function(){ const r = _rs.apply(this, arguments); skPaintAll(); return r; }; }
{ const _rm = renderMoba; renderMoba = function(){ const r = _rm.apply(this, arguments); skPaintAll(); return r; }; }
{ const st = document.createElement('style');
  st.textContent = `
  html body #ui.ui .hk.ico.skj{background:radial-gradient(circle at 50% 34%,#fff 0%,var(--ec) 42%,var(--ed) 100%) !important;
    box-shadow:inset 0 0 0 2px rgba(255,255,255,.75),0 0 0 1.5px var(--ed),0 3px 0 var(--ed),0 0 10px color-mix(in srgb,var(--ec) 55%,transparent) !important}
  /* skill tree nodes: the same jewel tile with the picture, the name on a deep ribbon and the level in a light pill */
  html body #pane-skill .skn.skj .sknb{background:linear-gradient(180deg,#fffdf6,#fff1d6) !important;border:2px solid color-mix(in srgb,var(--ec) 70%,#fff) !important;border-radius:14px !important;
    box-shadow:0 3px 0 color-mix(in srgb,var(--ed) 55%,#d9b56a),0 0 10px color-mix(in srgb,var(--ec) 30%,transparent) !important}
  html body #pane-skill .skn.skj .ski{width:44px !important;height:44px !important;border-radius:12px !important;display:grid !important;place-items:center;
    background:radial-gradient(circle at 50% 34%,#fff 0%,var(--ec) 45%,var(--ed) 100%) !important;
    box-shadow:inset 0 0 0 2px rgba(255,255,255,.75),0 0 0 1.5px var(--ed),0 2px 0 var(--ed),0 0 8px color-mix(in srgb,var(--ec) 55%,transparent) !important}
  html body #pane-skill .skj .ski svg > rect{display:none}
  html body #pane-skill .skj .ski svg g{filter:drop-shadow(0 0 1.5px var(--ed)) drop-shadow(0 1px 0 var(--ed)) !important}
  html body #pane-skill .skj .ski svg{filter:saturate(1.5) contrast(1.15) drop-shadow(0 0 2px #fff) !important;width:34px;height:34px}
  html body #pane-skill .skn.skj .sknb b{display:inline-block;margin-top:3px;padding:1px 7px;border-radius:6px;color:#fff !important;-webkit-text-fill-color:#fff !important;font-weight:800 !important;
    background:linear-gradient(180deg,color-mix(in srgb,var(--ed) 80%,var(--ec)),var(--ed)) !important;text-shadow:0 1px 0 rgba(0,0,0,.35) !important;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  html body #pane-skill .skn.skj .sknb .ct{color:#141414 !important;font-weight:800;background:#fff;border:1.5px solid color-mix(in srgb,var(--ec) 60%,#fff);border-radius:8px;padding:0 6px}
  html body #pane-skill .skn.skj.sel .sknb{border-color:var(--ed) !important;box-shadow:0 0 0 3px #fff,0 0 0 5px var(--ec),0 0 16px color-mix(in srgb,var(--ec) 60%,transparent) !important}
  html body #pane-skill .skn.skj.lock .ski{filter:grayscale(.75) brightness(.95)}
  html body #pane-skill .skn.skj.lock .sknb{opacity:.75}
  html body #pane-skill .skn.skj.pas .ski{border-radius:50% !important}
  html body #pane-skill .skdetail.skj{border:2px solid color-mix(in srgb,var(--ec) 60%,#fff) !important;background:linear-gradient(180deg,#fffdf6,color-mix(in srgb,var(--ec) 10%,#fff)) !important}
  html body #pane-skill .skdetail.skj > .ski{width:52px !important;height:52px !important;border-radius:14px !important;display:grid !important;place-items:center;
    background:radial-gradient(circle at 50% 34%,#fff 0%,var(--ec) 45%,var(--ed) 100%) !important;box-shadow:inset 0 0 0 2px rgba(255,255,255,.75),0 0 0 1.5px var(--ed),0 3px 0 var(--ed) !important}
  html body #pane-skill .skdetail.skj.pas > .ski{border-radius:50% !important}
  html body #pane-skill .skdetail.skj .nm > b{color:var(--ed) !important;-webkit-text-fill-color:var(--ed) !important}`;
  document.head.appendChild(st); }
