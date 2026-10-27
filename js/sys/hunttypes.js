/* VAYRATHEN — js/sys/hunttypes.js — (v150) hold the attack button to choose WHICH KINDS of monster to fight
   Holding the attack button used to open a list of single monsters: tap one, it became the target. Now the list is the
   kinds of monster around you (bosses first, then by how many are near), each with its level and how many are near:
   · tick as many kinds as you like (✓) — attacks, the auto lock and Auto then go only for those kinds; a monster that
     attacks you is still fought back;
   · 🎯 on a row still targets the closest one of that kind right away;
   · "ตีทุกชนิด" clears the choice. The choice is kept with the character; a small number on the attack button shows
     how many kinds are chosen.
   And the attack button itself is dressed up: a gold medallion with a kanok-patterned ring and a deep glow. */
'use strict';

const HUNT = {sel:() => new Set((S && S.hunt) || [])};
const huntOn = () => !!(S && S.hunt && S.hunt.length);
const huntOk = m => !huntOn() || (m && S.hunt.includes(m.type));
/* the choice steers every target picker; monsters attacking you are still answered */
{ const _tl = tlkList; tlkList = function(){ const r = _tl.apply(this, arguments); if (!huntOn()) return r; return r.filter(m => huntOk(m) || m.target === P); }; }
{ const _pt = pickTarget; pickTarget = function(){ if (!huntOn()) return _pt.apply(this, arguments);
    const th = typeof threats === 'function' ? threats().filter(m => !BOT.skip.has(m)) : []; if (th.length) return th.sort(tgtCmp)[0];
    return mobs.filter(m => botOk(m) && huntOk(m) && dist(m, P) < BOT_CFG.seek).sort(tgtCmp)[0] || null; }; }
{ const _ne = nearestEnemy; nearestEnemy = function(range){ if (!huntOn()) return _ne.apply(this, arguments);
    let best = null, bd = range; for (const m of mobs){ if (m.dead || m.vanish || !huntOk(m)) continue; const d = dist(m, P); if (d < bd){ bd = d; best = m; } } return best || mobs.find(m => !m.dead && m.target === P && dist(m, P) < range) || null; }; }

/* the list: kinds, not single monsters */
function huntKinds(){
  const by = new Map();
  for (const m of mobs){ if (!tlkOk(m) || m.def.npc || dist(m, P) > TPK_RANGE) continue;
    const k = by.get(m.type) || {type:m.type, def:m.def, n:0, d:1e9, boss:!!m.def.boss}; k.n++; k.d = Math.min(k.d, dist(m, P)); by.set(m.type, k); }
  for (const t of (S.hunt || [])) if (!by.has(t) && MOB[t]) by.set(t, {type:t, def:MOB[t], n:0, d:1e9, boss:!!MOB[t].boss});
  return [...by.values()].sort((a, b) => (b.boss - a.boss) || (b.n - a.n) || a.d - b.d).slice(0, 14);
}
tpkRender = function(){
  const d = tpkEl(), sel = HUNT.sel(), ks = huntKinds(); TPK.kinds = ks; TPK.list = [];
  const rows = ks.map((k, i) => `<div class="hk-row${sel.has(k.type) ? ' on' : ''}${k.boss ? ' boss' : ''}">
      <button class="hk-tog" data-ht="${escH(k.type)}" aria-pressed="${sel.has(k.type)}"><i>${sel.has(k.type) ? '✓' : ''}</i><span class="hk-n">${k.boss ? '♛ ' : ''}${escH(nm(k.def))}</span>
        <span class="hk-lv">Lv.${k.def.lvl || k.def.lv || '?'}</span><span class="hk-c">${k.n ? `×${k.n}` : L('ไม่อยู่ใกล้', 'none near')}</span></button>
      <button class="hk-go" data-hgo="${escH(k.type)}" ${k.n ? '' : 'disabled'} aria-label="${L('เล็งตัวที่ใกล้สุด', 'Target the closest')}">🎯</button></div>`).join('');
  d.innerHTML = `<div class="tpk-h"><b>${L('เลือกชนิดมอนที่จะตี', 'Kinds to fight')} <small>${L('เลือกได้หลายชนิด', 'pick several')}</small></b><button class="tpk-x" data-x aria-label="${L('ปิด', 'Close')}">✕</button></div>
    ${rows || `<p class="tpk-empty">${L('ไม่มีมอนสเตอร์ใกล้ ๆ', 'No monsters nearby')}</p>`}
    <div class="hk-foot"><button class="hk-all" data-hall>${L('ตีทุกชนิด', 'Fight every kind')}</button><button class="hk-ok" data-x>${L('ตกลง', 'Done')}${sel.size ? ` · ${sel.size}` : ''}</button></div>`;
};
tpkRefresh = function(){ const now = huntKinds(); if (now.length !== (TPK.kinds || []).length || now.some((k, i) => k.type !== TPK.kinds[i].type || k.n !== TPK.kinds[i].n)) tpkRender(); };
function huntBadge(){ const b = document.querySelector('[data-mo="atk"]'); if (!b) return; const n = (S && S.hunt || []).length; if (n) b.dataset.hunt = n; else delete b.dataset.hunt; }
document.addEventListener('pointerup', e => {
  const t = e.target.closest && e.target.closest('#tpick [data-ht],#tpick [data-hgo],#tpick [data-hall]'); if (!t) return;
  e.stopPropagation(); TPK.t = T;   // a touch keeps the list open
  if (t.dataset.ht){ const s = HUNT.sel(); if (s.has(t.dataset.ht)) s.delete(t.dataset.ht); else s.add(t.dataset.ht); S.hunt = [...s]; }
  else if (t.dataset.hall != null){ S.hunt = []; }
  else if (t.dataset.hgo){ const m = mobs.filter(x => tlkOk(x) && x.type === t.dataset.hgo).sort((a, b) => dist(a, P) - dist(b, P))[0];
    if (m){ tlkSet(m, true); TLK.hard = true; P.tapped = m; P.target = m; TLK.flash = T; tpkClose(); toast(L(`เป้าหมาย: ${nm(m.def)}`, `Target: ${m.def.en || nm(m.def)}`)); return; } }
  if (P.target && !huntOk(P.target) && !(P.target.target === P)){ P.target = null; if (typeof tlkSet === 'function') tlkSet(null); }
  huntBadge(); tpkRender(); dirty = true; if (typeof save === 'function') save();
}, true);
if (typeof renderMoba === 'function'){ const _rm = renderMoba; renderMoba = function(){ const r = _rm.apply(this, arguments); huntBadge(); return r; }; }
setTimeout(huntBadge, 800);

{ const st = document.createElement('style'); st.textContent = `
#tpick .tpk-h small{font-weight:600;font-size:11px;color:#8a7a5a;margin-left:4px}
#tpick .hk-row{display:flex;gap:4px;margin:3px 0}
#tpick .hk-tog{flex:1;display:grid;grid-template-columns:24px 1fr auto auto;align-items:center;gap:6px;text-align:left;border:1.5px solid #eadcb8;background:#fff;border-radius:10px;padding:6px 8px;font:inherit;color:#1c1712;min-height:40px}
#tpick .hk-tog i{width:20px;height:20px;border-radius:6px;border:2px solid #c9a24a;display:grid;place-items:center;font-style:normal;font-weight:900;color:#fff;background:#fff}
#tpick .hk-row.on .hk-tog{border-color:#c9962e;background:#fff4d6}#tpick .hk-row.on .hk-tog i{background:linear-gradient(#f2c450,#c9922a);border-color:#a8781c}
#tpick .hk-row.boss .hk-n{color:#8a5a00;font-weight:800}#tpick .hk-n{font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#tpick .hk-lv,#tpick .hk-c{font-size:12px;color:#5a4a30}#tpick .hk-go{width:44px;border:1.5px solid #eadcb8;background:#fff8e6;border-radius:10px;font-size:18px}
#tpick .hk-go:disabled{opacity:.35}
#tpick .hk-foot{display:flex;gap:6px;margin-top:6px}#tpick .hk-foot button{flex:1;min-height:38px;border-radius:10px;font:inherit;font-weight:800;border:1.5px solid #d9b45a}
#tpick .hk-all{background:#f6efe0;color:#5a3a12}#tpick .hk-ok{background:linear-gradient(#ffe39a,#f2b93a);color:#3a2206}
/* the attack button: a gold medallion */
html body #ui.ui .mo.atk{background:radial-gradient(circle at 50% 38%,#fff6d2 0%,#ffd76a 34%,#e6a22a 68%,#a8650f 100%)!important;
  border:3px solid #7a4a08!important;box-shadow:0 0 0 3px #f6d27a,0 0 0 6px #8a5a10,0 6px 14px rgba(70,40,0,.45),inset 0 -6px 12px rgba(120,60,0,.45),inset 0 6px 10px rgba(255,255,230,.7)!important}
html body #ui.ui .mo.atk::before{content:'';position:absolute;inset:-11px;border-radius:50%;pointer-events:none;
  background:repeating-conic-gradient(from 0deg,#f7d77a 0deg 7deg,#a8650f 7deg 9deg,#ffeaa8 9deg 15deg,#a8650f 15deg 17deg,#f7d77a 17deg 22.5deg);
  -webkit-mask:radial-gradient(circle,transparent 0 calc(50% - 9px),#000 calc(50% - 8px) calc(50% - 2px),transparent calc(50% - 1px));mask:radial-gradient(circle,transparent 0 calc(50% - 9px),#000 calc(50% - 8px) calc(50% - 2px),transparent calc(50% - 1px));
  filter:drop-shadow(0 1px 1px rgba(80,40,0,.5))}
html body #ui.ui .mo.atk svg{filter:drop-shadow(0 2px 0 #7a4a08) drop-shadow(0 0 4px rgba(255,240,180,.9));color:#fffdf2!important;stroke:#fffdf2}
html body #ui.ui .mo.atk:active{transform:scale(.95)}
html body #ui.ui .mo.atk[data-hunt]::after{content:attr(data-hunt);position:absolute;top:-4px;right:-4px;min-width:24px;height:24px;border-radius:12px;padding:0 6px;
  background:linear-gradient(#e2403a,#a8201a);color:#fff;font:800 13px/24px Sarabun,system-ui,sans-serif;text-align:center;border:2px solid #fff3d0;box-shadow:0 2px 4px rgba(0,0,0,.3);z-index:3}`;
  document.head.appendChild(st); }
